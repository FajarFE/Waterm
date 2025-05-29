import Link from 'next/link';

import { LuLayoutGrid } from 'react-icons/lu';
import { MdInsights } from 'react-icons/md';
import { usePathname } from 'next/navigation';
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@skripsi/libs';
import { IconType } from 'react-icons'; // Import IconType
import Image from 'next/image';

interface dataSidebarProps {
  link: string;
  name: string;
  icons?: string;
}

interface Menu {
  data: dataSidebarProps[];
  icon: string;
  name: string;
}

interface sidebarProps {
  title?: string;
  data: Menu[];
  isCollapsed?: boolean;

  className?: string;
}

const iconMap: Record<string, IconType> = {
  // Use IconType here
  MdInsights: MdInsights,
  LuLayoutGrid: LuLayoutGrid,
};

export const renderIcon = (iconName: string) => {
  const IconComponent = iconMap[iconName]; // Ambil ikon dari map
  return IconComponent ? <IconComponent size={20} /> : null;
};
export const SidebarDashboard = ({
  data,
  // className,
  isCollapsed,
}: // title,
sidebarProps) => {
  const pathname = usePathname();
  const splitPath = pathname?.split('/');
  const dashboardData = data.findIndex(
    (item) => item.name.toLowerCase() === splitPath?.[2]?.toLowerCase(),
  );

  // const currentMenuItem = splitPath[1];
  const menuItems = splitPath?.[1];
  const [indexMenu, setIndexMenu] = React.useState<string>(
    dashboardData.toString(),
  );

  const currentPath = splitPath?.[splitPath.length - 1];
  const handleClick = (index: string) => {
    if (index !== indexMenu) {
      setIndexMenu(index);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex items-center py-6',
          isCollapsed ? 'justify-center px-0' : 'px-6',
        )}
      >
        <div className="flex items-center">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="h-8 w-8"
            />
          </span>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ml-2 text-lg font-semibold"
            >
              Waterm
            </motion.span>
          )}
        </div>
      </div>

      <nav
        className={cn(
          'mt-4 flex-1 overflow-hidden',
          isCollapsed ? 'px-1' : 'px-3',
        )}
      >
        <div className="space-y-1">
          {data &&
            data.map((menu, index: number) => {
              return (
                <div
                  key={index}
                  className={`flex flex-col cursor-pointer justify-center w-full items-center `}
                >
                  <div
                    onClick={() => {
                      handleClick(index.toString());
                    }}
                    className={`${
                      !isCollapsed
                        ? `justify-start ${
                            menu.name.toLowerCase() ===
                              menuItems?.toLowerCase() ||
                            menu.name.toLowerCase() === 'dasbor'
                              ? 'bg-purple-500 px-4 py-4 md:py-4 lg:py-[10px] rounded-xl text-white'
                              : 'py-4 px-4'
                          }`
                        : 'justify-center'
                    } flex flex-row gap-5 w-[200px]  items-center`}
                  >
                    <div
                      className={` flex justify-center items-center rounded-xl  ${
                        isCollapsed
                          ? ` ${
                              menu.name.toLowerCase() ===
                                menuItems?.toLowerCase() ||
                              menu.name.toLowerCase() === 'dasbor'
                                ? 'hover:bg-purple-300 hover:text-white bg-purple-500 p-4 text-white '
                                : ' text-neutral-500 bg-transparent  hover:text-white hover:bg-purple-500 p-4'
                            }`
                          : 'bg-transparent'
                      }`}
                    >
                      {renderIcon(menu.icon)}
                    </div>
                    {!isCollapsed && (
                      <div className=" text-lg font-semibold">{menu.name}</div>
                    )}
                  </div>
                  {menu.name.toLowerCase() === menuItems?.toLowerCase() ||
                    (menu.name.toLowerCase() === 'dasbor' && (
                      <div
                        className={`w-full h-auto flex flex-col justify-start items-center relative ${
                          !isCollapsed ? 'relative right-16 ' : ''
                        }`}
                      >
                        <div
                          className={`bg-[#D9DBE9] ${
                            !isCollapsed
                              ? ' lg:left-[137px] md:left-[137px] h-[calc(100%-35px)]'
                              : `left-[75px] h-[calc(100%-30px)]`
                          }  absolute  w-[3px]`}
                        ></div>
                        <div
                          className={`relative flex ${
                            !isCollapsed
                              ? `md:left-[191px] lg:left-[201px] `
                              : ` md:left-[139px] lg:left-[139px]`
                          } pt-4 flex-col gap-5  h-full`}
                        >
                          <div
                            className={`h-auto  ${
                              !isCollapsed ? 'p-1' : ''
                            } flex flex-col gap-1 rounded-lg  w-full`}
                          >
                            {menu.data.map((data, index) => {
                              return (
                                <div
                                  key={index}
                                  className={`relative w-full  flex justify-start items-center ${
                                    isCollapsed
                                      ? 'right-[75px] top-1'
                                      : 'lg:right-[91.5px] md:right-[78.5px] -right-[117px] -top-[0px]'
                                  }`}
                                >
                                  <div
                                    className="rounded-bl-xl "
                                    style={{
                                      position: 'absolute',
                                      top: '5px',
                                      left: '-45px',
                                      width: '15px',
                                      height: '15px',
                                      borderLeft: '3px solid #D9DBE9', // Border di sisi kiri
                                      borderBottom: '3px solid #D9DBE9', //
                                    }}
                                  ></div>

                                  <Link
                                    className={` rounded-xl
    																flex flex-row gap-2
    																text-lg font-semibold
                                    md:py-[5px] md:px-[10px]

    																lg:py-[5px] items-center text-start ${
                                      !isCollapsed
                                        ? `lg:w-[150px] justify-start h-[40px]`
                                        : `lg:w-[40px] justify-center h-[40px]`
                                    }
    																no-underline hover:no-underline focus:no-underline
    																${
                                      !isCollapsed
                                        ? `${
                                            data.name.toLowerCase() ===
                                            currentPath
                                              ? `bg-purple-500 pointer-events-none text-white w-full hover:bg-purple-300 hover:text-white`
                                              : `text-[#D9DBE9] hover:text-[#D9DBE9]`
                                          } pl-3  relative right-8  `
                                        : ` ${
                                            data.name.toLowerCase() ===
                                            currentPath
                                              ? `bg-purple-500 pointer-events-none hover:bg-purple-300 text-white hover:text-white`
                                              : `text-[#D9DBE9] hover:text-[#D9DBE9]`
                                          } relative right-8 `
                                    }
    															`}
                                    href={data.link}
                                  >
                                    {!isCollapsed ? (
                                      <>
                                        {renderIcon(data.icons as string)}
                                        {data.name}
                                      </>
                                    ) : (
                                      renderIcon(data.icons as string)
                                    )}
                                  </Link>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              );
            })}
        </div>
      </nav>

      {!isCollapsed && (
        <div className="mt-auto border-t px-3 py-4">
          <div className="flex items-center rounded-md px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <span className="text-sm font-medium">JD</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">john@example.com</p>
            </div>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="mt-auto border-t py-4 flex justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <span className="text-sm font-medium">JD</span>
          </div>
        </div>
      )}
    </div>
  );
};
