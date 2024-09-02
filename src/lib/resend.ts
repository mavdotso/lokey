import { Resend } from 'resend';

export const resend = new Resend(process.env.AUTH_RESEND_KEY);
