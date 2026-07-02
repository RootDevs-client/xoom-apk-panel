import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

import { InputHTMLAttributes } from "react";

export default function SearchBar({
  value,
  onChange,
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative min-w-50 max-w-100 flex-1">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search categories..."
        className="pl-9"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
