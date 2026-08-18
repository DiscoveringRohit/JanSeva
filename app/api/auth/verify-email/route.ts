import { NextRequest, NextResponse } from "next/server";
import { userStore } from "@/lib/auth/user-store";
import { emailService } from "@/lib/email/email-service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Verification token parameter is missing." },
      { status: 400 }
    );
  }

  const result = userStore.verifyEmailToken(token);

  if (result.status === "success" && result.email) {
    const stored = userStore.findUserByIdentifier(result.email);
    return NextResponse.json({
      success: true,
      message: result.message || "Email address verified successfully!",
      user: stored?.profile,
    });
  }

  if (result.status === "expired") {
    return NextResponse.json(
      {
        success: false,
        expired: true,
        message: result.message || "Verification link has expired (24-hour limit). Please request a new verification email.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: result.message || "Invalid or expired email verification token.",
    },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, action } = body;

    // Resend Verification Email Action
    if (action === "resend" || (!token && email)) {
      if (!email || !email.includes("@")) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid registered email address." },
          { status: 400 }
        );
      }

      const user = userStore.findUserByIdentifier(email);
      if (!user) {
        // Return generic message for security
        return NextResponse.json({
          success: true,
          message: `If an unverified account exists for ${email}, a new verification email has been dispatched.`,
        });
      }

      if (user.profile.emailVerified) {
        return NextResponse.json({
          success: true,
          alreadyVerified: true,
          message: "Your email address is already verified. You can sign in immediately.",
        });
      }

      const newToken = userStore.createVerificationToken(email);
      const emailResult = await emailService.sendVerificationEmail(
        email,
        newToken,
        user.profile.name
      );

      return NextResponse.json({
        success: true,
        emailDelivery: emailResult,
        message: emailResult.configured
          ? `A new verification email has been sent to ${email}. Please check your inbox.`
          : `A new verification token has been generated for ${email}. Please verify via the link in your email.`,
      });
    }

    // Token-based Verification
    if (token) {
      const result = userStore.verifyEmailToken(token);

      if (result.status === "success" && result.email) {
        const stored = userStore.findUserByIdentifier(result.email);
        return NextResponse.json({
          success: true,
          message: result.message || "Email address verified successfully!",
          user: stored?.profile,
        });
      }

      if (result.status === "expired") {
        return NextResponse.json(
          {
            success: false,
            expired: true,
            message: result.message || "Verification link has expired (24-hour limit). Please request a new verification email.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: result.message || "Invalid or expired email verification token.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Verification token or action is required." },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Unable to process verification request." },
      { status: 500 }
    );
  }
}
