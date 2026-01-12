import * as z from "zod";

export const SignUpSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be at most 100 characters long"),
    email: z
      .string()
      .min(1, "Email is required")
      .max(100, "Email must be at most 100 characters long")
      .email("Invalid email format"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .max(100, "Password must be at most 100 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Confirm Password must be at least 6 characters long")
      .max(100, "Confirm Password must be at most 100 characters long"),
    age: z.number().min(0, "Age must be a positive number").optional(),
    gender: z.enum(["male", "female", "other"]).refine((val) => val !== "", {
      message: "Gender is required",
    }),
    username: z
      .string()
      .min(1, "Username is required")
      .max(50, "Username must be at most 50 characters long"),
    dateofbirth: z
      .string()
      .min(1, "Date of Birth is required")
      .max(10, "Date of Birth must be at most 10 characters long"),
    mobilenumber: z
      .string()
      .min(1, "Mobile Number is required")
      .max(10, "Mobile Number must be at most 10 characters long"),
    address: z
      .string()
      .min(1, "Address is required")
      .max(200, "Address must be at most 200 characters long"),
    profilePicture: z.string().min(1, "Profile Picture is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
