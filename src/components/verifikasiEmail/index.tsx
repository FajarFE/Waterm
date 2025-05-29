'use client';
import { sendOTPEmail } from '@/actions/verify-email';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation'; // Import useRouter
import { CgDanger } from 'react-icons/cg';
import { toast } from 'react-toastify';

export const VerifikasiEmailDashboard = ({
  className,
  button,
  email,
  t,
  locale,
}: {
  className: string;
  button: string;
  email: string;
  t: ReturnType<typeof useTranslations>;
  locale: 'id' | 'en';
}) => {
  const router = useRouter(); // Gunakan useRouter hook

  const handleSendOTP = async () => {
    try {
      const result = await sendOTPEmail({ email }, locale);
      if (!result.success) {
        toast.error(result.message);
      } else {
        router.push(`/verify-email/otp?email=${email}`); // Gunakan router.push untuk redirect
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while sending the OTP email.',
      );
    }
  };

  return (
    <div id="verified-email" className={`${className}`}>
      <div className="flex flex-row gap-5 justify-center items-center">
        <CgDanger size={30} />
        {t('emailVerification.warning')}
      </div>
      <span className={`${button} cursor-pointer`} onClick={handleSendOTP}>
        {t('emailVerification.verifyLink')}
      </span>
    </div>
  );
};
