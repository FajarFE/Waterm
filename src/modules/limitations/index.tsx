import { Limitation } from '@/components/limitations';
import { TableData } from '@/components/tableData';
import { CategoryFish } from '@prisma/client';

export const LimitationsPage = (props: {
  emailVerified: Date | null;
  data?: {
    id: string;
    name: string;
    category: CategoryFish;
    maxPh: number;
    minPh: number;
    maxTemperature: number;
    minTemperature: number;
    maxTurbidity: number;
    minTurbidity: number;
  }[];
  userId: string;
}) => {
  return (
    <div className="flex flex-col md:p-5 lg:p-20 w-full gap-5">
      <div className="flex flex-row  justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Limitations</h1>
        </div>
        <Limitation editLimitId="input-data-limitation" />
      </div>
      <div className="p-5 border-2 rounded-lg shadow-xl">
        <TableData {...props} />
      </div>
    </div>
  );
};
