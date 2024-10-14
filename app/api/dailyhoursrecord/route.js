import { connectMongoDB } from "@/lib/mongodb";
import DailyHoursRecord from "@/models/dailyhourrecord";
import { NextResponse } from "next/server";


export async function POST(req) {
  try {
    const {  email, date, clockIn, clockOut, isClockedIn, isClockedOut, totalDayHours } = await req.json();
    await connectMongoDB();
    await DailyHoursRecord.create({ email, date, clockIn, clockOut, isClockedIn, isClockedOut, totalDayHours });

    return NextResponse.json({ message: "Record registered." }, 
    { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while creating the daily hours record." },
      { status: 500 }
    );
  }
}