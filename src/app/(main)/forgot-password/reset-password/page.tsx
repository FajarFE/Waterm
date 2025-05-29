import ResetPasswordForm from '@/components/reset-password';

export default function Page() {
  return (
    <div className=" dark:bg-black h-[80vh] flex justify-center items-center dark:bg-dot-white">
      <div className=" md:grid-cols-2 lg:grid-cols-2 w-full md:grid lg:grid  flex container mx-auto ">
        <div className="col-span-1 hidden lg:flex md:flex"></div>
        <div className=" w-full col-span-1 backdrop-blur-xs bg-opacity-40  rounded-xl  p-5 md:p-0 lg:p-0">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}
