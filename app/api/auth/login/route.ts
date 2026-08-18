import { NextRequest, NextResponse } from "next/server";
import { userStore } from "@/lib/auth/user-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password, role = "citizen" } = body;

    if (!identifier || !identifier.trim()) {
      return NextResponse.json({
        success: false,
        message: "Please enter your email or mobile number.",
        errors: { identifier: "Email or mobile number is required" },
      }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({
        success: false,
        message: "Please enter your password.",
        errors: { password: "Password is required" },
      }, { status: 400 });
    }

    const storedUser = userStore.findUserByIdentifier(identifier);

    if (!storedUser) {
      return NextResponse.json({
        success: false,
        message: "Invalid credentials. Please check your email/mobile or password.",
      }, { status: 401 });
    }

    // Role-based authorization check
    if (role === "officer") {
      if (storedUser.profile.role !== "officer") {
        return NextResponse.json({
          success: false,
          message: "Account is not authorized for Ward Officer / Staff access. Please sign in as Resident Citizen.",
        }, { status: 403 });
      }

      if (storedUser.profile.status === "pending_approval") {
        return NextResponse.json({
          success: false,
          pendingApproval: true,
          message: "Your officer account is currently pending verification and approval by municipal authority.",
        }, { status: 403 });
      }
    }

    // Password verification
    if (storedUser.passwordHash !== password) {
      return NextResponse.json({
        success: false,
        message: "Invalid credentials. Please check your password.",
      }, { status: 401 });
    }

    // Email verification check for email logins
    if (identifier.includes("@") && storedUser.profile.emailVerified === false) {
      return NextResponse.json({
        success: false,
        requiresVerification: true,
        message: "Please verify your email address before signing in.",
        user: storedUser.profile,
      }, { status: 403 });
    }

    const token = `janseva_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: storedUser.profile,
      token,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Unable to connect to JanSeva authentication server. Please try again.",
    }, { status: 500 });
  }
}
