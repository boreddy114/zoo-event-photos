import { NextResponse } from 'next/server';

global.photos = global.photos || [];

export async function GET() {
  try {
    return NextResponse.json({ success: true, photos: global.photos });
  } catch (error) {
    console.error("Photos Error:", error);
    return NextResponse.json({ success: false, error: "Failed to load photos" }, { status: 500 });
  }
}
