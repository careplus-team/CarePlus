import { date, z } from "zod";

export const doctorRegistrationSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),

    gender: z.enum(["male", "female", "other"], {
      message: "Gender is required",
    }),
    medicalregno: z.string().min(1, "Medical Registration Number is required"),
    mobileNumber: z
      .string()
      .min(10, "Mobile Number must be at least 10 digits"),
    address: z.string().min(1, "Address is required"),
    dateOfBirth: z.string().min(1, "Date of Birth is required"),
    specialization: z.string().min(1, "Specialization is required"),
    currentWorkplace: z.string().min(1, "Current Workplace is required"),
    bio: z.string().min(1, "Bio is required"),
    profilePicture: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
