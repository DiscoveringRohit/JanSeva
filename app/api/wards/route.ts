import { NextRequest, NextResponse } from "next/server";
import { CITY_WARDS_MAP } from "@/lib/data/cities-wards";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get("city");

  if (!city) {
    return NextResponse.json(
      { success: false, message: "City parameter is required", wards: [] },
      { status: 400 }
    );
  }

  const wards = CITY_WARDS_MAP[city] || [];
  return NextResponse.json({
    success: true,
    city,
    wards,
  });
}
