import { NextRequest, NextResponse } from "next/server";
import { userStore } from "@/lib/auth/user-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, city, ward, wardNumber = 42 } = body;

    if (!email || !city || !ward) {
      return NextResponse.json({
        success: false,
        message: "Email, City, and Ward are required to complete profile.",
      }, { status: 400 });
    }

    const updatedUser = userStore.updateUser(email, {
      city: city.trim(),
      ward: ward.trim(),
      wardNumber,
    });

    if (!updatedUser) {
      return NextResponse.json({
        success: false,
        message: "User profile not found.",
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: updatedUser.profile,
      message: "Profile updated successfully!",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Unable to update profile. Please try again.",
    }, { status: 500 });
  }
}
