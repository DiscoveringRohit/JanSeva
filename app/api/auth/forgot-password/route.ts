import { NextRequest, NextResponse } from "next/server";
import { userStore } from "@/lib/auth/user-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, action = "request", token, newPassword } = body;

    if (action === "reset") {
      if (!token || !newPassword) {
        return NextResponse.json({
          success: false,
          message: "Reset token and new password are required.",
        }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({
          success: false,
          message: "New password must be at least 6 characters long.",
        }, { status: 400 });
      }

      const resetSuccess = userStore.resetPassword(token, newPassword);
      if (resetSuccess) {
        return NextResponse.json({
          success: true,
          message: "Password reset successful! You can now sign in with your new password.",
        });
      }

      return NextResponse.json({
        success: false,
        message: "Invalid or expired password reset link.",
      }, { status: 400 });
    }

    // Default action: Request Reset Link
    if (!identifier || !identifier.trim()) {
      return NextResponse.json({
        success: false,
        message: "Please enter your registered email address.",
      }, { status: 400 });
    }

    const user = userStore.findUserByIdentifier(identifier);
    if (!user) {
      // Security standard: generic message to prevent email enumeration, but confirm link sent
      return NextResponse.json({
        success: true,
        message: `If an account exists for ${identifier}, a password reset link has been sent.`,
      });
    }

    const resetToken = userStore.createResetToken(user.profile.email);

    return NextResponse.json({
      success: true,
      token: resetToken,
      message: `Password reset link has been sent to ${user.profile.email}. Please check your inbox.`,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Unable to process password reset request. Please try again.",
    }, { status: 500 });
  }
}
