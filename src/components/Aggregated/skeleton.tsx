'use client';

export function FilterSkeleton() {
  return (
    <div className="p-4 flex justify-center items-center shadow-md rounded-lg mb-6 animate-pulse">
      <div className="grid grid-cols-3 gap-4 w-full">
        <div className="space-y-2">
          <div className="h-4 w-20 bg-gray-300 rounded" />
          <div className="h-10 w-full bg-gray-300 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-300 rounded" />
          <div className="h-10 w-full bg-gray-300 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-300 rounded" />
          <div className="h-10 w-full bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
}

export function ChartSkeleton({ className }: { className: string }) {
  return (
    <div
      className={`${className} bg-white rounded-lg shadow-md p-4 h-[450px] flex flex-col animate-pulse`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="h-6 bg-gray-300 rounded w-1/2" />
        <div className="flex flex-col items-end w-1/4">
          <div className="h-8 bg-gray-300 rounded w-full mb-1" />
          <div className="h-4 bg-gray-300 rounded w-3/4" />
        </div>
      </div>
      <div className="flex-grow bg-gray-200 rounded" />
    </div>
  );
}
