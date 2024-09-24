import { connectMongoDB } from "@/lib/mongodb";
import Tracker from "@/models/trackhours";
import { NextResponse } from "next/server";


export async function POST(req) {
  try {
    const { email, lastentry,hours,lastmonthhours } = await req.json();
    await connectMongoDB();
    await Tracker.create({ email, lastentry,hours,lastmonthhours });

    return NextResponse.json({ message: "User hours updated." }, 
    { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while registering the user." },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url); 
    const email = searchParams.get('email');
    await connectMongoDB();
    const trackhours = await Tracker.findOne( {email} );
    return NextResponse.json({ trackhours }, 
    { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred while registering the user." },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { email, lastentry, hours, lastmonthhours } = await req.json();

    // Connect to MongoDB
    await connectMongoDB();

    // Find the document by email and update it
    const updatedTracker = await Tracker.findOneAndUpdate(
      { email },  // Find the document by email
      { $set: { lastentry, hours, lastmonthhours } }, // Fields to update
      { new: true, runValidators: true }  // Options to return the updated document and validate
    );

    // If no document is found, return a 404 response
    if (!updatedTracker) {
      return NextResponse.json(
        { message: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "User hours updated successfully.", updatedTracker },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user hours:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the user hours." },
      { status: 500 }
    );
  }
}