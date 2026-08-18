import { NextResponse } from "next/server";
import { CITIES_LIST } from "@/lib/data/cities-wards";

export async function GET() {
  return NextResponse.json({
    success: true,
    cities: CITIES_LIST,
  });
}
