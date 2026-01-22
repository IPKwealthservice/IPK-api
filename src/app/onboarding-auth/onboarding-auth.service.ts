// src/app/onboarding-auth/onboarding-auth.service.ts
import { Injectable } from "@nestjs/common";

/**
 * NOTE:
 * - This is OTP MOCK logic
 * - Replace with SMS provider later
 */
@Injectable()
export class OnboardingAuthService {
  private otpStore = new Map<string, string>();

  async sendOtp(mobile: string) {
    const otp = "1234"; // 🔥 mock OTP (replace later)

    this.otpStore.set(mobile, otp);

    console.log(`📲 OTP sent to ${mobile}: ${otp}`);

    return {
      success: true,
      message: "OTP sent successfully",
      otp, // return for dev/test until SMS provider is wired
    };
  }

  async verifyOtp(mobile: string, otp: string) {
    const storedOtp = this.otpStore.get(mobile);

    if (!storedOtp) {
      return {
        success: false,
        message: "OTP expired or not found",
      };
    }

    if (storedOtp !== otp) {
      return {
        success: false,
        message: "Invalid OTP",
      };
    }

    this.otpStore.delete(mobile);

    return {
      success: true,
      message: "OTP verified successfully",
    };
  }
}
