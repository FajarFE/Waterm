'use client';
import { useRef, useEffect } from 'react';

interface CustomPopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function CustomPopover({
  trigger,
  children,
  isOpen,
  setIsOpen,
}: CustomPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsOpen]);

  return (
    <div className="relative inline-block ">
      <div
        className="flex justify-center items-center"
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
      </div>
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute z-10 lg:w-60 p-4 mt-2 bg-white border border-gray-200 rounded-md shadow-lg"
          style={{ top: '100%', left: '50%', transform: 'translateX(-50%)' }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
