import * as z from "zod";

export const UserProfileSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  name: z.string().min(1, "Name is required").max(100, "Too long"),
  mobilenumber: z
    .string()
    .min(1, "Mobile number is required")
    .max(15, "Mobile number too long")
    .optional()
    .or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  dateofbirth: z.string().optional().or(z.literal("")),
  address: z.string().max(200, "Address too long").optional().or(z.literal("")),
  profilePicture: z
    .string()
    .min(1, "Profile picture is required")
    .url("Profile picture must be a valid url")
    .optional()
    .or(z.literal("")),
  age: z.preprocess((v) => {
    if (v === null || v === undefined || v === "") return undefined;
    return Number(v);
  }, z.number().int().nonnegative().optional()),
  username: z
    .string()
    .max(50, "Username too long")
    .optional()
    .or(z.literal("")),
});

export const DoctorProfileSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  name: z.string().min(1, "Name is required").max(100, "Too long"),
  specialization: z
    .string()
    .min(1, "Specialization required")
    .optional()
    .or(z.literal("")),
  medicalregno: z
    .string()
    .min(1, "Medical reg no required")
    .optional()
    .or(z.literal("")),
  phoneNumber: z
    .string()
    .max(15, "Phone too long")
    .optional()
    .or(z.literal("")),
  address: z.string().max(200, "Address too long").optional().or(z.literal("")),
  workplace: z
    .string()
    .max(200, "Workplace too long")
    .optional()
    .or(z.literal("")),
  bio: z.string().max(1000, "Bio too long").optional().or(z.literal("")),
  profilePicture: z
    .string()
    .min(1, "Profile picture is required")
    .url("Profile picture must be a valid url")
    .optional()
    .or(z.literal("")),
});
