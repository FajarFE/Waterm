import { createHmac } from 'crypto';

// Secret key for signing URLs - in production, use an environment variable
const SECRET_KEY =
  process.env.SIGNATURE_SECRET || 'your-secret-key-change-this';

/**
 * Generate a signed URL for password reset
 */
export function generateResetPasswordSignature(
  email: string,
  otp: string,
  expiresAt: Date,
): string {
  // Create the payload with all necessary data
  const payload = {
    email,
    otp,
    expiresAt: expiresAt.getTime(), // Convert to timestamp for easier handling
  };

  // Convert payload to string
  const payloadString = JSON.stringify(payload);

  // Create base64 encoded payload
  const encodedPayload = Buffer.from(payloadString).toString('base64');

  // Generate signature using HMAC
  const signature = createHmac('sha256', SECRET_KEY)
    .update(encodedPayload)
    .digest('hex');

  // Return the encoded payload and signature
  return `${encodedPayload}.${signature}`;
}

/**
 * Verify a reset password signature
 */
export function verifyResetPasswordSignature(signatureString: string): {
  valid: boolean;
  expired: boolean;
  email?: string;
  otp?: string;
  expiresTimestamp?: number;
} {
  try {
    // Split the signature string into payload and signature
    const [encodedPayload, signature] = signatureString.split('.');

    // If either part is missing, the signature is invalid
    if (!encodedPayload || !signature) {
      return { valid: false, expired: false };
    }

    // Verify the signature
    const expectedSignature = createHmac('sha256', SECRET_KEY)
      .update(encodedPayload)
      .digest('hex');

    // If signatures don't match, the URL has been tampered with
    if (signature !== expectedSignature) {
      return { valid: false, expired: false };
    }

    // Decode the payload
    const payloadString = Buffer.from(encodedPayload, 'base64').toString();
    const payload = JSON.parse(payloadString) as {
      email: string;
      otp: string;
      expiresAt: number;
    };

    // Check if the signature has expired
    const now = Date.now();
    if (now > payload.expiresAt) {
      return {
        valid: true,
        expired: true,
        email: payload.email,
        otp: payload.otp,
        expiresTimestamp: payload.expiresAt,
      };
    }

    // Signature is valid and not expired
    return {
      valid: true,
      expired: false,
      email: payload.email,
      otp: payload.otp,
      expiresTimestamp: payload.expiresAt,
    };
  } catch (error) {
    return { valid: false, expired: false };
  }
}

/**
 * Extract data from signature without verification (use only after verification)
 */
export function extractDataFromSignature(signatureString: string): {
  success: boolean;
  data?: {
    email: string;
    otp: string;
    expiresAt: number;
  };
} {
  try {
    // Split the signature string to get the encoded payload
    const [encodedPayload] = signatureString.split('.');

    // If the encoded payload is missing, return failure
    if (!encodedPayload) {
      return { success: false };
    }

    // Decode the payload
    const payloadString = Buffer.from(encodedPayload, 'base64').toString();
    const payload = JSON.parse(payloadString) as {
      email: string;
      otp: string;
      expiresAt: number;
    };

    return {
      success: true,
      data: payload,
    };
  } catch (error) {
    return { success: false };
  }
}
