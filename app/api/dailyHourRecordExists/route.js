import { connectMongoDB } from "@/lib/mongodb";
import DailyHoursRecord from "@/models/dailyhourrecord";
import { NextResponse } from "next/server";

export async function POST(req){
    try {
        await connectMongoDB();
        const { email, date } = await req.json(); // Expecting the date in 'YYYY-MM-DD' format
        
        const userRecord = await DailyHoursRecord.findOne({
            email,
            date,  
        }).select("_id");
        
        if (userRecord) {
            console.log("User record exists:", userRecord);
            return NextResponse.json({ exists: true, userRecord });
        } else {
            console.log("No record found.");
            return NextResponse.json({ exists: false });
        }
    }
    catch(error) {
        console.log(error);
    }
}