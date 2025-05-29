// Contoh sederhana: hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set timeout untuk memperbarui debounced value setelah delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Bersihkan timeout jika value berubah (artinya user masih mengetik/berinteraksi)
    // atau jika delay berubah, atau jika komponen unmount.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Hanya re-run effect jika value atau delay berubah

  return debouncedValue;
}
