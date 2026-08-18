import { NextRequest, NextResponse } from "next/server";
import { userStore, StoredUser } from "@/lib/auth/user-store";
import { ExtendedUserProfile } from "@/lib/auth/auth-types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, avatar, googleId = `google_${Date.now()}` } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({
        success: false,
        message: "Google sign-in was unsuccessful. Valid email is required.",
      }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if account already exists with this email or googleId
    let existingUser = userStore.findUserByIdentifier(normalizedEmail);
    if (!existingUser) {
      existingUser = userStore.findUserByGoogleId(googleId);
    }

    if (existingUser) {
      // Account linking: update Google ID & mark email as verified
      existingUser.profile.googleId = googleId;
      existingUser.profile.emailVerified = true;
      if (avatar && !existingUser.profile.avatar) {
        existingUser.profile.avatar = avatar;
      }

      const token = `janseva_token_google_${Date.now()}`;

      // Check if user is missing city/ward (e.g. if created via google before setting profile)
      if (!existingUser.profile.city || !existingUser.profile.ward) {
        return NextResponse.json({
          success: true,
          needsProfileCompletion: true,
          user: existingUser.profile,
          token,
          message: "Google identity linked. Please select your city and ward to complete your profile.",
        });
      }

      return NextResponse.json({
        success: true,
        user: existingUser.profile,
        token,
        message: "Google sign-in successful. Welcome back!",
      });
    }

    // New User via Google OAuth
    const newUserProfile: ExtendedUserProfile = {
      id: `JS-CIT-${Math.floor(10000 + Math.random() * 90000)}`,
      name: name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      phone: "",
      avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
      city: "",
      ward: "",
      wardNumber: 0,
      role: "citizen",
      status: "active",
      emailVerified: true, // Google identity is pre-verified
      googleId,
      karmaXP: 150,
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
          id: "badge-google-welcome",
          name: "Verified Google Citizen",
          icon: "🌟",
          description: "Joined JanSeva via Google identity",
          unlockedAt: new Date().toISOString(),
        },
      ],
    };

    const stored: StoredUser = {
      profile: newUserProfile,
      passwordHash: `google_oauth_no_pwd_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    userStore.createUser(stored);

    const token = `janseva_token_google_${Date.now()}`;

    // Return needsProfileCompletion: true so user picks City & Ward
    return NextResponse.json({
      success: true,
      needsProfileCompletion: true,
      user: newUserProfile,
      token,
      message: "Google identity verified. Please complete your city and ward selection.",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Google sign-in was unsuccessful. Please try again.",
    }, { status: 500 });
  }
}
