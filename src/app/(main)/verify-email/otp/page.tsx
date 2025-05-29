import VerifyEmailOTPForm from '@/components/otp-verify-email-form';

export default function Page() {
  return (
    <div className=" dark:bg-black h-auto dark:bg-dot-white">
      <div className=" md:grid-cols-2 lg:grid-cols-2 w-full lg:grid py-20 flex container mx-auto">
        <div className="hidden lg:flex md:flex"></div>
        <div className=" w-full col-span-1 backdrop-blur-xs bg-opacity-40  rounded-xl p-5 md:px-0 lg:px-24 md:py-0 lg:py-10">
          <VerifyEmailOTPForm />
        </div>
      </div>
    </div>
  );
}
