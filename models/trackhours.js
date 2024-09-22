import mongoose, { Schema, models } from "mongoose";

const trackHoursSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    lastentry: {
      type: Date,
      default: Date.now,
      required: true,
    },
    hours: {
      type: Number,
      default: 0,
      required: true,
    },
    lastmonthhours: {
        type: Number,
        default: 0,
        required: true,
      },
  },
  { timestamps: true }
);

const Tracker = models.Tracker || mongoose.model("Tracker", trackHoursSchema);
export default Tracker;