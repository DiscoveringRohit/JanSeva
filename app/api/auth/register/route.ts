import { NextRequest, NextResponse } from "next/server";
import { userStore, StoredUser } from "@/lib/auth/user-store";
import { ExtendedUserProfile } from "@/lib/auth/auth-types";
import { emailService } from "@/lib/email/email-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      identifier,
      password,
      confirmPassword,
      city,
      ward,
      wardNumber = 42,
      role = "citizen",
      officialEmail,
      department,
    } = body;

    const errors: Record<string, string> = {};

    if (!fullName || !fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (role === "officer") {
      if (!officialEmail || !officialEmail.includes("@")) {
        errors.officialEmail = "Please enter a valid official municipal email address";
      }
      if (!identifier || !identifier.trim()) {
        errors.identifier = "Mobile number is required for official contact";
      }
    } else {
      if (!identifier || !identifier.trim()) {
        errors.identifier = "Email or mobile number is required";
      }
    }

    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!city || !city.trim()) {
      errors.city = "Please select your city";
    }

    if (!ward || !ward.trim()) {
      errors.ward = "Please select your ward";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please correct the highlighted errors.",
          errors,
        },
        { status: 400 }
      );
    }

    const emailOrPhone = role === "officer" ? officialEmail : identifier.trim();
    const existing = userStore.findUserByIdentifier(emailOrPhone);

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email/mobile number already exists.",
          errors: { identifier: "Account already registered" },
        },
        { status: 400 }
      );
    }

    const isEmail = emailOrPhone.includes("@");
    const formattedEmail = isEmail
      ? emailOrPhone
      : `${fullName.toLowerCase().replace(/\s+/g, ".")}@civic.in`;
    const formattedPhone = !isEmail ? emailOrPhone : (role === "officer" ? identifier : "");

    if (role === "officer") {
      const officerUser: ExtendedUserProfile = {
        id: `JS-OFF-${Math.floor(1000 + Math.random() * 9000)}`,
        name: fullName.trim(),
        email: officialEmail.trim(),
        officialEmail: officialEmail.trim(),
        phone: identifier.trim(),
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        city: city.trim(),
        ward: ward.trim(),
        wardNumber,
        department: department || "Municipal Administration",
        role: "officer",
        status: "pending_approval",
        emailVerified: false,
        karmaXP: 500,
        level: 1,
        levelTitle: "Junior Officer",
        verifiedCitizen: true,
        aadhaarLinked: true,
        stats: {
          issuesReported: 0,
          issuesResolved: 0,
          upvotesGiven: 0,
          verificationVotes: 0,
          civicImpactScore: 0,
        },
        badges: [],
      };

      const verificationToken = userStore.createVerificationToken(officialEmail);

      const stored: StoredUser = {
        profile: officerUser,
        passwordHash: password,
        verificationToken,
        createdAt: new Date().toISOString(),
      };

      userStore.createUser(stored);

      return NextResponse.json({
        success: true,
        pendingApproval: true,
        user: officerUser,
        message: "Officer account registered successfully. Pending verification and approval by municipal authority.",
      });
    }

    // Citizen Account
    const citizenUser: ExtendedUserProfile = {
      id: `JS-CIT-${Math.floor(10000 + Math.random() * 90000)}`,
      name: fullName.trim(),
      email: formattedEmail,
      phone: formattedPhone,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
      city: city.trim(),
      ward: ward.trim(),
      wardNumber,
      role: "citizen",
      status: "active",
      emailVerified: !isEmail, // Mobile registrations auto-verified, email registrations require verification
      karmaXP: 100,
      level: 1,
      levelTitle: "Active Citizen",
      verifiedCitizen: true,
      aadhaarLinked: false,
      stats: {
        issuesReported: 0,
        issuesResolved: 0,
        upvotesGiven: 0,
        verificationVotes: 0,
        civicImpactScore: 10,
      },
      badges: [
        {
          id: "badge-welcome",
          name: "Civic Pioneer",
          icon: "🌟",
          description: "Joined JanSeva community",
          unlockedAt: new Date().toISOString(),
        },
      ],
    };

    let verificationToken = "";
    let emailResult = null;
    if (isEmail) {
      verificationToken = userStore.createVerificationToken(formattedEmail);
      emailResult = await emailService.sendVerificationEmail(
        formattedEmail,
        verificationToken,
        fullName.trim()
      );
    }

    const stored: StoredUser = {
      profile: citizenUser,
      passwordHash: password,
      verificationToken,
      createdAt: new Date().toISOString(),
    };

    userStore.createUser(stored);

    if (isEmail) {
      return NextResponse.json({
        success: true,
        requiresVerification: true,
        user: citizenUser,
        verificationToken,
        emailDelivery: emailResult,
        message: emailResult?.configured
          ? `Registration successful. A verification email has been sent to ${formattedEmail}. Please check your inbox.`
          : `Registration successful. Verification token generated for ${formattedEmail}. Please verify via link or configure SMTP credentials.`,
      });
    }

    // Mobile registration
    const token = `janseva_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    return NextResponse.json({
      success: true,
      user: citizenUser,
      token,
      message: "Account created successfully!",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to complete registration. Please try again.",
      },
      { status: 500 }
    );
  }
}
