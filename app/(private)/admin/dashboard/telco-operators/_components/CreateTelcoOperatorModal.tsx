"use client";

import { createTelcoOperator } from "@/actions/telco-operator/telcoOperatorActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import InputField from "@/components/form/InputField";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { ImSpinner9 } from "react-icons/im";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CgElementForm {
  label: string;
  id: string;
  type:
    | "button"
    | "checkbox"
    | "input"
    | "form"
    | "submit"
    | "link"
    | "div"
    | "custom";
  order: number;
}

interface FormValues {
  name: string;
  code: string;
  country: string;
  telcoParameterValues?: string;
  variant: "STANDARD" | "EVINA" | "CG_CALLBACK";
  configs: CgElementForm[];
  settings: {
    mode: "instant" | "hold" | "hold_until_admin_change";
    hold: {
      duration: number;
      unit: "minute" | "hour" | "day";
    };
  };
  isActive: boolean;
}

const defaultCgElement: CgElementForm = {
  label: "",
  id: "",
  type: "button",
  order: 1,
};

const cgElementTypes = [
  "button",
  "checkbox",
  "input",
  "form",
  "submit",
  "link",
  "div",
  "custom",
] as const;

export default function CreateTelcoOperatorModal({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const methods = useForm<FormValues>({
    defaultValues: {
      name: "",
      code: "",
      country: "",
      telcoParameterValues: "",
      variant: "STANDARD",
      configs: [],
      settings: {
        mode: "instant",
        hold: { duration: 0, unit: "minute" },
      },
      isActive: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "configs",
  });

  const handleSubmit = methods.handleSubmit(async (values) => {
    setLoading(true);
    setError("");
    const toastId = ToastMessage.loading({ title: "Creating operator..." });

    try {
      const configs = values.configs.map((cfg) => ({
        label: cfg.label.trim(),
        id: cfg.id.trim(),
        type: cfg.type,
        order: cfg.order,
      }));

      const res = await createTelcoOperator({
        name: values.name.trim(),
        code: values.code.trim(),
        country: values.country.trim(),
        telcoParameterValues: values.telcoParameterValues?.trim() || "",
        variant: values.variant,
        configs,
        settings: {
          mode: values.settings.mode,
          hold:
            values.settings.mode === "hold"
              ? {
                  duration: Number(values.settings.hold.duration) || 0,
                  unit: values.settings.hold.unit,
                }
              : undefined,
        },
        isActive: values.isActive,
      });

      if (res?.status) {
        ToastMessage.success(
          {
            title: res?.message || "Operator created successfully!",
          },
          { id: toastId },
        );
        methods.reset();
        onOpenChange(false);
        onSuccess();
      } else {
        setError(res?.message || "Failed to create operator");
        ToastMessage.error(
          {
            title: res?.message || "Failed to create operator",
          },
          { id: toastId },
        );
      }
    } catch {
      ToastMessage.error(
        {
          title: "Failed to create operator",
        },
        { id: toastId },
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Operator</DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  type="text"
                  label="Operator Name"
                  name="name"
                  placeholder="e.g. GP Bangladesh"
                  required
                />
                <InputField
                  type="text"
                  label="Code"
                  name="code"
                  placeholder="e.g. GP"
                  required
                />
              </div>

              <InputField
                type="text"
                label="Country"
                name="country"
                placeholder="e.g. BANGLADESH"
                required
              />

              <InputField
                type="text"
                label="Telco Parameter Value"
                name="telcoParameterValues"
                placeholder="e.g. param_value"
              />

              <div className="space-y-2">
                <Label className="text-sm font-dm-sans font-medium block">
                  Variant <span className="text-red-500">*</span>
                </Label>
                <Controller
                  control={methods.control}
                  name="variant"
                  rules={{ required: "Variant is required" }}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-11">
                        <SelectValue placeholder="Select variant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STANDARD">Standard</SelectItem>
                        <SelectItem value="EVINA">EVINA</SelectItem>
                        <SelectItem value="CG_CALLBACK">CG Callback</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-3 border rounded-md p-4">
                <Label className="text-sm font-dm-sans font-semibold block">
                  Settings
                </Label>

                <div className="space-y-2">
                  <Label className="text-sm font-dm-sans font-medium block">
                    Mode
                  </Label>
                  <Controller
                    control={methods.control}
                    name="settings.mode"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(val) => {
                          field.onChange(val);
                          if (val !== "hold") {
                            methods.setValue("settings.hold.duration", 0);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full h-11">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instant">Instant</SelectItem>
                          <SelectItem value="hold">Hold</SelectItem>
                          <SelectItem value="hold_until_admin_change">
                            Hold Until Admin Change
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {methods.watch("settings.mode") === "hold" && (
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      type="number"
                      label="Hold Duration"
                      name="settings.hold.duration"
                      placeholder="e.g. 30"
                    />
                    <div className="space-y-2">
                      <Label className="text-sm font-dm-sans font-medium block">
                        Hold Unit
                      </Label>
                      <Controller
                        control={methods.control}
                        name="settings.hold.unit"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full h-11">
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minute">Minute</SelectItem>
                              <SelectItem value="hour">Hour</SelectItem>
                              <SelectItem value="day">Day</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-md">
                <Label className="text-sm font-dm-sans font-medium block">
                  Active
                </Label>
                <Controller
                  control={methods.control}
                  name="isActive"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-dm-sans font-semibold block">
                    Configuration Fields
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ ...defaultCgElement })}
                    className="gap-1"
                  >
                    <Plus className="size-3" />
                    Add Config
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                    No configuration fields added yet.
                  </p>
                )}

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-md p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Config #{index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-600"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        type="text"
                        label="Label"
                        name={`configs.${index}.label`}
                        placeholder="e.g. Consent Button"
                        required
                      />
                      <InputField
                        type="text"
                        label="ID"
                        name={`configs.${index}.id`}
                        placeholder="e.g. consent_btn"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-dm-sans font-medium block">
                          Type
                        </Label>
                        <Controller
                          control={methods.control}
                          name={`configs.${index}.type`}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {cgElementTypes.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <InputField
                        type="number"
                        label="Order"
                        name={`configs.${index}.order`}
                        placeholder="e.g. 1"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="text-white cursor-pointer"
              >
                {loading && (
                  <ImSpinner9 className="mr-2 h-3 w-3 animate-spin" />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
