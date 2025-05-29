import { CategoryFish } from '@prisma/client';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@skripsi/components';
import { Limitation } from '../limitations';
import { useLocale } from 'next-intl';
import { ButtonDelete } from './buttonDelete';
import { ExpendedComponents } from './expendedComponents';

export interface tableDataProps {
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
  emailVerified: Date | null;
  userId: string;
}

export const TableData = ({ ...props }: tableDataProps) => {
  const getLocale = useLocale();
  const locale = getLocale === 'id' ? 'id' : 'en';

  return (
    <>
      <Table id="table-limit">
        <TableCaption>A list of your recent batasan.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="flex justify-center items-center w-[100px]">
                Name
              </div>
            </TableHead>
            <TableHead>
              <div className="flex justify-center items-center w-[100px]">
                Category
              </div>
            </TableHead>
            <TableHead>
              <div className="flex justify-center items-center w-[100px]">
                Edit
              </div>
            </TableHead>
            <TableHead>
              <div className="flex justify-center items-center w-[100px]">
                Delete
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="w-full">
          {props.data &&
            props.data.map((data, id) => (
              <>
                <TableRow key={id + 1} className="border-none">
                  <TableCell className="font-medium dark:text-white">
                    <div className="flex justify-center items-center w-[100px]">
                      {data.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center items-center w-[100px]">
                      {data.category}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 lg:w-[100px]">
                    <div className="flex justify-center items-center w-[100px]">
                      <Limitation
                        editLimitId={`edit-limit-${id + 1}`}
                        id={data.id}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center items-center w-[100px]">
                      <ButtonDelete
                        userId={props.userId}
                        deleteId={`delete-limit-${id + 1}`}
                        emailVerified={props.emailVerified}
                        id={data.id}
                        locale={locale}
                      />
                    </div>
                  </TableCell>
                </TableRow>
                <ExpendedComponents
                  detailId={`detail-limit-${id + 1}`}
                  {...data}
                />
              </>
            ))}
        </TableBody>
      </Table>
    </>
  );
};
