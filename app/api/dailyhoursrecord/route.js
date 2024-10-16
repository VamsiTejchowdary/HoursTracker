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

export async function PUT(req) {
    try {
      const { email, date, clockIn, isClockedIn, clockOut, isClockedOut , totalDayHours } = await req.json();
  
      // Connect to MongoDB
      await connectMongoDB();
      //console.log(email, date, clockIn, isClockedIn, clockOut, isClockedOut , totalDayHours);
      // Find the document by email and update it
      const upadteHours = await DailyHoursRecord.findOneAndUpdate(
        { email, date },  // Find the document by email
        { $set: { clockIn, isClockedIn, clockOut, isClockedOut , totalDayHours } }, // Fields to update
        { new: true, runValidators: true }  // Options to return the updated document and validate
      );
  
      // If no document is found, return a 404 response
      if (!upadteHours) {
        return NextResponse.json(
          { message: "User not found." },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { message: "User clocked in successfully.", upadteHours },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error while clocking in:", error);
      return NextResponse.json(
        { message: "An error occurred while while clocking in." },
        { status: 500 }
      );
    }
  }

  export async function GET(req) {
    try {
      const { searchParams } = new URL(req.url); 
      const email = searchParams.get('email');
      const date = searchParams.get('date');
      await connectMongoDB();
      const dailyHourRecord = await DailyHoursRecord.findOne({
        email,
        date,  
    })
      return NextResponse.json({ dailyHourRecord }, 
      { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { message: "An error occurred while registering the user." },
        { status: 500 }
      );
    }
  }