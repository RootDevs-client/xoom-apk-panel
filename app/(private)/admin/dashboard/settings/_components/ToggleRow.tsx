import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { LucideIcon } from "lucide-react";
import { Controller } from "react-hook-form";

export default function ToggleRow({
  name,
  control,
  title,
  description,
  icon: Icon,
  iconClassName,
}: {
  name: string;
  control: any;
  title: string;
  description: string;
  icon?: LucideIcon;
  iconClassName?: string;
}) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl px-2 py-4 transition-colors duration-200 hover:bg-muted/50 sm:px-3">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div
            className={cn(
              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
              iconClassName,
            )}
          >
            <Icon className="size-4" />
          </div>
        )}
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium leading-none text-foreground">
            {title}
          </p>
          <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
            className="shrink-0 data-[state=checked]:bg-primary"
          />
        )}
      />
    </div>
  );
}
