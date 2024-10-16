import mongoose, { Schema, models } from "mongoose";

const dailyHoursRecord = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: false,
    },
    clockIn: {
       type: String,
       default: "11:30",  // Default time as 9 AM in HH:mm:ss format
       required: false,
    },
    clockOut: {
       type: String,  
       default: "17:30", 
       required: false,
    },
    isClockedIn: {
        type: Boolean,
        default:0,
        required: false,
    },
    isClockedOut:{
        type: Boolean,
        default:0,
        required: false,
    },
    totalDayHours: {
        type: Number,
        default: 0,
      },
  },
  { timestamps: true }
);

const DailyRecord = models.DailyRecord || mongoose.model("DailyRecord", dailyHoursRecord);
export default DailyRecord;