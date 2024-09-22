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