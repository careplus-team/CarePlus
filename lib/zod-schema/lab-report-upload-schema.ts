import { title } from "process";
import z, { email } from "zod";

const labReportUpload = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  reportUrl: z.string().url("Lab Report must be uploaded"),
  email: z.string().email("Invalid email address"),
  name: z.string().min(3, "Patient name must be at least 3 characters long"),
});

export default labReportUpload;
