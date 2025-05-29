'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@skripsi/components';
import { useState } from 'react';
import { IoIosArrowDropdown } from 'react-icons/io';

export const ExpendedComponents = (props: {
  id: string;
  minPh: number;
  maxPh: number;
  minTemperature: number;
  maxTemperature: number;
  detailId: string;
  minTurbidity: number;
  maxTurbidity: number;
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (rowIdentifier: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowIdentifier]: !prev[rowIdentifier],
    }));
  };

  return (
    <>
      <TableRow>
        <TableCell
          onClick={() => {
            toggleRow(props.id);
          }}
          colSpan={5}
          className="border-b-2 border-gray-200 dark:border-gray-700"
        >
          <div
            id={props.detailId}
            className="flex justify-center items-center w-full"
          >
            {!expandedRows[props.id] ? (
              <IoIosArrowDropdown className="w-8 h-8 text-black" />
            ) : (
              <IoIosArrowDropdown className="w-8 h-8 text-black rotate-180" />
            )}
          </div>
        </TableCell>
      </TableRow>
      {expandedRows[props.id] && (
        <TableRow>
          <TableCell
            colSpan={5}
            className="border-b-2 border-gray-200 dark:border-gray-700"
          >
            <div className="py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <div className="flex justify-center items-center lg:w-[150px] md:text-xs lg:text-lg md:w-[20px]">
                        Min Ph
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex justify-center items-center lg:w-[150px] md:text-xs lg:text-lg md:w-[20px]">
                        Max Ph
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex justify-center items-center lg:w-[150px] md:text-xs lg:text-lg md:w-[20px]">
                        Min Temperature
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex justify-center items-center lg:w-[150px] md:text-xs lg:text-lg md:w-[20px]">
                        Max Temperature
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex justify-center items-center lg:w-[150px] md:text-xs lg:text-lg md:w-[20px]">
                        Min Turbidity
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex justify-center items-center lg:w-[150px] md:text-xs lg:text-lg md:w-[20px]">
                        Max Turbidity
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    key={`${props.id}-details`}
                    className="bg-gray-50 dark:bg-gray-800"
                  >
                    <TableCell className="p-4">
                      <div className="flex justify-center items-center lg:w-[150px] md:text-xs lg:text-lg md:w-[20px]">
                        {props.minPh}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex justify-center items-center lg:w-[150px] md:text-xs lg:text-lg md:w-[20px]">
                        {props.maxPh}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex justify-center items-center lg:w-[150px] md:text-xs lg:text-lg md:w-[20px]">
                        {props.minTemperature}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex justify-center items-center lg:w-[150px] md:text-xs lg:text-lg md:w-[20px]">
                        {props.maxTemperature}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex justify-center items-center lg:w-[150px] md:text-xs lg:text-lg md:w-[20px]">
                        {props.minTurbidity}
                      </div>
                    </TableCell>
                    <TableCell className="p-4">
                      <div className="flex justify-center items-center lg:w-[150px] md:text-xs lg:text-lg md:w-[20px]">
                        {props.maxTurbidity}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
