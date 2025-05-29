import { Suspense } from 'react';
import RegisterPage from '../../../actions/modules/signup';

export default function Page() {
  return (
    <div className=" dark:bg-black h-auto dark:bg-dot-white">
      <div className=" md:grid-cols-2 lg:grid-cols-2 w-full md:grid lg:grid py-20 flex container mx-auto">
        <div className="col-span-1 hidden lg:flex md:flex"></div>
        <div className=" w-full col-span-1 backdrop-blur-xs bg-opacity-40  rounded-xl  p-5 md:px-0 lg:px-24 md:py-0 lg:py-10 ">
          <Suspense fallback={<div>Loading...</div>}>
            <RegisterPage />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
