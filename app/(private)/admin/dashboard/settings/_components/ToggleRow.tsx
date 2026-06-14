import { Switch } from "@/components/ui/switch";
import { Controller } from "react-hook-form";

export default function ToggleRow({
  name,
  control,
  title,
  description,
}: {
  name: string;
  control: any;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground max-w-sm">{description}</p>
      </div>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Switch checked={field.value} onCheckedChange={field.onChange} />
        )}
      />
    </div>
  );
}
