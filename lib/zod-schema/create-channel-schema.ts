import { z } from "zod";

export const createChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required"),
  description: z.string().min(1, "Channel description is required"),
  doctorName: z.string().min(1, "Doctor name is required"),
  doctorEmail: z.string().email("Invalid email address"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  totalSlots: z.number().min(1, "Total slots must be at least 1"),
  state: z.enum(["active", "inactive"], {
    message: "State is required",
  }),
  roomNumber: z.number().min(1, "Room number is required"),
  estimateWaitingTime: z.number().min(1, "Estimated waiting time is required"),
  remainingSlots: z.number().min(0, "Remaining slots cannot be negative"),
  currentNumber: z.number().min(0, "Current number cannot be negative"),
});
