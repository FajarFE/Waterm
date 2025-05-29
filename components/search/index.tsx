'use client';
import { useState, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from '../ui/input';

export const SearchComponent = () => {
  const [value, setValue] = useState(''); // Added useState

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value; // Storing the new value
    setValue(newValue); // Updating the state with the new value
    router.push(pathname + '?' + createQueryString('search', newValue)); // Fixing the syntax here
  };

  return (
    <div className="w-full h-auto text-xl pr-[200px]">
      <Input
        className="text-xl font-bold"
        onChange={handleSearch}
        placeholder="Cari Mobil Disini"
        value={value}
      />
    </div>
  );
};
