import { AES, enc } from 'crypto-js';

const SECRET_KEY = process.env.ENCRYPTION_SECRET || 'default_secret_key'; // Use environment variable for security

export async function decrypt(
  encryptedText: string,
): Promise<{ userId: string } | null> {
  try {
    const bytes = AES.decrypt(encryptedText, SECRET_KEY);
    const plaintext = bytes.toString(enc.Utf8);

    if (!plaintext) {
      return null;
    }

    return JSON.parse(plaintext);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}
