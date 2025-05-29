// interface dataSupport {
//   image: string;
//   title: string;
// }
// interface SupportProps {
//   children?: React.ReactNode;
//   data?: dataSupport;
// }

export const Support = () => {
  return (
    <div className="w-full max-w-[1920px] h-[200px] flex flex-col">
      <div className="grid grid-cols-5 flex-justify-center w-full h-full items-center">
        <div className="col-span-1  w-full h-full relative pt-5 flex justify-center items-center">
          <div className="div w-full h-full   border-b-2 border-slate-600 relative flex justify-center items-center "></div>
        </div>
        <div className="col-span-3  h-full w-full  border-x-2 border-t-2 border-slate-600 bg-slate-100 bg-opacity-15 backdrop-blur-2xl">
          awd
        </div>
        <div className="col-span-1  w-full h-full relative pt-5 flex justify-center items-center">
          <div className="div w-full h-full   border-b-2 border-slate-600 relative flex justify-center items-center "></div>
        </div>
      </div>
      {/* <div className="w-full h-[20%] border-y bg-slate-100 bg-opacity-45 backdrop-blur-md"></div> */}
      <div className="grid grid-cols-10 flex-justify-center w-full h-full items-center">
        <div className="col-span-4  w-full h-full relative pb-5  justify-center items-center grid grid-cols-12">
          <div className="col-span-6 w-full h-full bg-white">ada</div>
          <div className="col-span-6 w-full h-full border-t-2 border-slate-600 bg-white">
            dada
          </div>
        </div>
        <div className="col-span-2  h-full w-full relative z-20  border-x-2 border-b-2 border-slate-600 bg-slate-100 bg-opacity-25  backdrop-blur-2xl">
          awd
        </div>
        <div className="col-span-4  w-full h-full relative pb-5  justify-center items-center grid grid-cols-12">
          <div className="col-span-6 w-full h-full border-t-2 border-slate-600 bg-white">
            ada
          </div>
          <div className="col-span-6 w-full h-full bg-white">dada</div>
        </div>
      </div>
    </div>
  );
};
