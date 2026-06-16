"use client";

import { Country } from "@/lib/evina/types";
import { useEffect, useRef } from "react";

interface CountryDropdownProps {
  countries: Country[];
  selected: Country;
  open: boolean;
  onSelect: (country: Country) => void;
  onClose: () => void;
}

export function CountryDropdown({
  countries,
  selected,
  open,
  onSelect,
  onClose,
}: CountryDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute top-[calc(100%+6px)] left-0 w-full bg-white rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      {countries.map((c) => (
        <div
          key={c.code}
          onClick={() => {
            onSelect(c);
            onClose();
          }}
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-colors ${
            c.code === selected.code ? "bg-red-50" : ""
          }`}
        >
          <span className="text-xl">{c.flag}</span>
          <div>
            <div className="text-sm font-medium text-gray-900">{c.name}</div>
            <div className="text-xs text-gray-400">+{c.dialCode}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
