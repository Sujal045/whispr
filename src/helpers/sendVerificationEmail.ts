import { resend } from "@/src/lib/resend";
import VerificationEmail from "@/emails/VerificationEmail";
import { ApiResponse } from "../types/ApiResponse";

export async function sendVerificationEmail (
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse>{
    try {
        const { data, error } = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Verification code | Whyspr',
            react: VerificationEmail({ username, otp: verifyCode}),
          });
          console.log(data)
          console.log("error", error)
        return {success: true, message: "Verification email sent successfully"}
    } catch (emailError) {
        console.error("Error sending verification email", emailError)
        return {success: false, message: "Failed to send verification email"}
    }
}
