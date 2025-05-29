'use server';

import {
  type ActionResetPasswordSchema,
  actionResetPasswordSchema,
  type ActionVerificationOTPSchema,
  actionVerificationOTPSchema,
  type SendOTPForgotPasswordSchema,
  sendOTPForgotPasswordSchema,
} from '@/types/forget-password';
import { ResponseAction } from '@/types/response-action';
import {
  sendOTPSchema,
  SendOTPSchema,
  verifyEmailSchema,
  VerifyEmailSchema,
} from '@/types/verify-email';
import {
  generateOTP,
  hashPassword,
  prisma,
  unstable_update,
} from '@skripsi/libs';
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from '@skripsi/libs/mail';
import {
  generateResetPasswordSignature,
  verifyResetPasswordSignature,
} from '@skripsi/libs/signature';
import { getTranslations } from 'next-intl/server';
import { revalidatePath } from 'next/cache';

export async function sendOTPEmail(
  data: SendOTPSchema,
  locale: 'id' | 'en',
): Promise<ResponseAction> {
  const t = await getTranslations({
    locale,
    namespace: 'otp',
  });
  const result = sendOTPSchema(t).safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((err) => err.message);

    return {
      code: 400,
      success: false,
      message: errors,
    };
  }

  try {
    // Find user with matching email and OTP
    const user = await prisma.user.findUnique({
      where: { email: result.data.email },
    });
    if (!user) {
      return {
        code: 404,
        success: false,
        message: 'User not found',
      };
    }

    if (user.emailVerified) {
      return {
        code: 409,
        success: false,
        message: 'Email already verified',
      };
    }

    // Generate new OTP and set expiry (10 minutes from now)
    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);

    // Update user with verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: otp,
        verificationExpiry: expiryTime,
      },
    });
    // Send verification email
    await sendVerificationEmail(result.data.email, otp);
    return {
      code: 200,
      success: true,
      message: 'Verification code sent. Please check your email.',
      url: '',
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        code: 500,
        success: false,
        message: 'Failed to send OTP email. Please try again.',
      };
    }
    return {
      code: 500,
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}

// Verify email with OTP
export async function verifyEmail(
  data: VerifyEmailSchema,
  locale: 'id' | 'en',
): Promise<ResponseAction> {
  const t = await getTranslations({
    locale,
    namespace: 'otp',
  });

  const result = verifyEmailSchema(t).safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((err) => err.message);
    return {
      code: 400,
      success: false,
      message: errors,
    };
  }

  try {
    // Find user with matching email
    const user = await prisma.user.findUnique({
      where: { email: result.data.email },
    });

    if (!user) {
      return {
        code: 404,
        success: false,
        message: 'User not found',
      };
    }

    // Check if OTP is expired
    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      return {
        code: 400,
        success: false,
        message: 'OTP has expired. Please request a new one.',
      };
    }

    // Check if OTP is correct
    if (user.verificationToken !== result.data.otp) {
      return {
        code: 400,
        success: false,
        message: 'Invalid OTP',
      };
    }

    const newEmailVerifiedDate = new Date();
    // Update user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: newEmailVerifiedDate,
        verificationToken: null,
        verificationExpiry: null,
      },
    });
    revalidatePath('/verify-email/otp');
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/monitoring');
    revalidatePath('/dashboard/limitations');
    try {
      await unstable_update({
        user: {
          emailVerified: newEmailVerifiedDate,
        },
      });
      console.log(
        'NextAuth session update triggered for emailVerified (using unstable_update).',
      );
    } catch (sessionUpdateError) {
      console.error(
        'Failed to update NextAuth session after email verification:',
        sessionUpdateError,
      );
    }
    return {
      code: 200,
      success: true,
      message: 'Email verified successfully',
    };
  } catch (error) {
    // Handle error (e.g., log it)
    console.error('Error verifying email:', error);
    if (error instanceof Error) {
      return {
        code: 500,
        success: false,
        message: 'Failed to verify email. Please try again.',
      };
    }
    return {
      code: 500,
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}

// Request password reset OTP
export async function verifyOTPForgotPassword(
  data: ActionVerificationOTPSchema,
  locale: 'id' | 'en',
): Promise<ResponseAction> {
  const t = await getTranslations({
    locale,
    namespace: 'otp',
  });
  const result = actionVerificationOTPSchema(t).safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((err) => err.message);

    return {
      code: 400,
      success: false,
      message: errors,
    };
  }

  const { email, otp, valid, expired } = await verifyResetPasswordSignature(
    result.data.signature,
  );

  if (!valid) {
    return {
      code: 400,
      success: false,
      message: 'Signature is not valid',
    };
  }
  if (valid && expired) {
    return {
      code: 400,
      success: false,
      message: 'Signature is expired',
    };
  }

  if (result.data.otp !== otp) {
    return {
      code: 400,
      success: false,
      message: 'OTP tidak otentik',
    };
  }

  try {
    // Check if user exists
    const user = await prisma.user.findFirst({
      where: {
        AND: [{ email: email }, { resetToken: result.data.otp }],
      },
    });

    if (!user) {
      return {
        code: 409,
        success: false,
        message: 'User not found. because your signature wrong',
      };
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    return {
      code: 200,
      success: true,
      message: 'Password reset code sent. Please check your email.',
      url: result.data.signature,
    };
  } catch (error) {
    // Handle error (e.g., log it)
    console.error('Error verifying OTP:', error);
    if (error instanceof Error) {
      return {
        code: 500,
        success: false,
        message: 'Failed to verify OTP. Please try again',
      };
    }
    return {
      code: 500,
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}

// Reset password with OTP
export async function resetPassword(
  data: ActionResetPasswordSchema,
  locale: 'id' | 'en',
): Promise<ResponseAction> {
  const t = await getTranslations({
    locale,
    nemespace: 'resetPassword',
  });
  const result = actionResetPasswordSchema(t).safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((err) => err.message);

    return {
      code: 400,
      success: false,
      message: errors,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: result.data.email,
      },
    });
    if (!user) {
      return {
        code: 400,
        success: false,
        message: 'user NOT FOUND',
      };
    }

    const hashedPassword = await hashPassword(result.data.password);
    if (user.password !== null) {
      if (hashedPassword !== user.password) {
        return {
          code: 409,
          success: false,
          message: 'Password not match',
        };
      }
    }

    await prisma.user.update({
      where: { email: result.data.email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return {
      code: 200,
      success: true,
      message: 'Change Password Successfully',
    };
  } catch (error) {
    // Handle error (e.g., log it)
    console.error('Error resetting password:', error);
    if (error instanceof Error) {
      return {
        code: 500,
        success: false,
        message: 'Failed to reset password. Please try again',
      };
    }
    return {
      code: 500,
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}

// Resend verification OTP
export async function sendOTPForgotPassword(
  data: SendOTPForgotPasswordSchema,
  locale: 'id' | 'en',
): Promise<ResponseAction> {
  const t = await getTranslations({
    locale: locale,
    namespace: 'otp',
  });
  const result = sendOTPForgotPasswordSchema(t).safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map((err) => err.message);

    return {
      code: 400,
      success: false,
      message: errors,
    };
  }
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: result.data.email },
    });
    if (!user) {
      return { code: 404, success: false, message: 'User not found' };
    }

    const otp = generateOTP();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
    const signature = await generateResetPasswordSignature(
      result.data.email,
      otp,
      expiryTime,
    );

    const resetUrl = `/forgot-password/otp?signature=${encodeURIComponent(
      signature,
    )}`;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: otp,
        resetTokenExpiry: expiryTime,
      },
    });

    // Send verification email
    await sendPasswordResetEmail(result.data.email, otp, resetUrl);

    return {
      code: 200,
      success: true,
      message: 'Verification code resent. Please check your email.',
      url: resetUrl,
    };
  } catch (error) {
    // Handle error (e.g., log it)
    console.error('Error resending verification code:', error);
    if (error instanceof Error) {
      return {
        code: 500,
        success: false,
        message: 'Failed to resend verification code. Please try again.',
      };
    }
    return {
      code: 500,
      success: false,
      message: 'An unexpected error occurred',
    };
  }
}
