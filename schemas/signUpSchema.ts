import * as z from "zod";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Enter a valid email" }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" }),
    passwordConfirmation: z
      .string()
      .min(1, { message: "Confirm Password is required" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Password do not match",
    path: ["passwordConfirmation"],
  });
