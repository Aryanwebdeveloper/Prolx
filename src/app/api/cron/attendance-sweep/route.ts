import { NextResponse } from "next/server";
import { sweepOfflineAttendance } from "@/app/attendance-actions";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  // Optional: add a secret key check from environment variables
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await sweepOfflineAttendance();
    return NextResponse.json({ 
      success: true, 
      message: "Attendance sweep completed successfully", 
      result 
    });
  } catch (error: any) {
    console.error("Error in attendance sweep cron:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}
