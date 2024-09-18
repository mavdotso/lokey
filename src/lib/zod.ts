import { z } from 'zod';

export const FormSchema = z.object({
    email: z.string().describe('Email').email({ message: 'Invalid Email' }),
    password: z.string().describe('Password').min(1, 'Password is required'),
});

export const SignUpFormSchema = z
    .object({
        email: z.string().describe('Email').email({ message: 'Invalid Email' }),
        password: z.string().describe('Password').min(6, 'Password must be minimum 6 characters'),
        confirmPassword: z.string().describe('Confirm Password').min(6, 'Password must be minimum 6 characters'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match.",
        path: ['confirmPassword'],
    });

export const CreateSpaceFormSchema = z.object({
    spaceName: z.string().describe('Workspace Name').min(1, 'Workspace name must be min of 1 character'),
    logo: z.any(),
});

export const UploadBannerFormSchema = z.object({
    banner: z.string().describe('Banner Image'),
});

export const username = z
    .string()
    .min(3)
    .max(20)
    .toLowerCase()
    .trim()
    .regex(/^[a-zA-Z0-9]+$/, 'Username may only contain alphanumeric characters.');
