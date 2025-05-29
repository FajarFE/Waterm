import ForgotPasswordForm from '@/components/forgot-password';
import Image from 'next/image';

export default function Page() {
  return (
    <div className="  dark:bg-black h-[80vh] dark:bg-dot-white flex justify-center items-center">
      <div className=" md:grid-cols-2 lg:grid-cols-2 w-full lg:grid  flex container mx-auto">
        <div className="hidden lg:flex md:flex w-full h-full rounded-2xl overflow-hidden">
          {/* <Image
            alt="forgot-password"
            width={800}
            height={800}
            src="/forgot-password.png"
          /> */}
        </div>
        <div className=" w-full col-span-1 h-auto backdrop-blur-xs bg-opacity-40  rounded-xl p-5 md:px-0 lg:px-24 md:py-0 ">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
