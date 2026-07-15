"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBarProps) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-9 pr-8"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 size-6 hover:bg-transparent"
          onClick={() =>
            onChange({
              target: { value: "" },
            } as React.ChangeEvent<HTMLInputElement>)
          }
        >
          <X className="size-3" />
        </Button>
      )}
    </div>
  );
}
