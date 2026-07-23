"use client";

import { createTelcoOperator } from "@/actions/telco-operator/telcoOperatorActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import InputField from "@/components/form/InputField";
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

interface ConfigItemForm {
  key: string;
  label: string;
  type: "string" | "number" | "boolean";
  value: string;
  required: boolean;
}

interface FormValues {
  name: string;
  code: string;
  country: string;
  evinaEnabled: boolean;
  telcoParameterValues?: string;
  variant: "STANDARD" | "EVINA" | "CG_CALLBACK";
  pinLocation: "TELCO_PAGE" | "OUR_PAGE";
  configs: ConfigItemForm[];
  is_active: boolean;
}

const defaultConfig: ConfigItemForm = {
  key: "",
  label: "",
  type: "string",
  value: "",
  required: false,
};

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
      evinaEnabled: false,
      telcoParameterValues: "",
      variant: "STANDARD",
      pinLocation: "TELCO_PAGE",
      configs: [],
      is_active: true,
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
        ...cfg,
        value:
          cfg.type === "number"
            ? Number(cfg.value)
            : cfg.type === "boolean"
              ? cfg.value === "true"
              : cfg.value,
      }));

      const res = await createTelcoOperator({
        name: values.name.trim(),
        code: values.code.trim(),
        country: values.country.trim(),
        evinaEnabled: values.evinaEnabled,
        telcoParameterValues: values.telcoParameterValues?.trim() || "",
        variant: values.variant,
        pinLocation: values.pinLocation,
        configs,
        is_active: values.is_active,
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
                  placeholder="e.g. Banglalink"
                  required
                />
                <InputField
                  type="text"
                  label="Code"
                  name="code"
                  placeholder="e.g. BL"
                  required
                />
              </div>

              <InputField
                type="text"
                label="Country"
                name="country"
                placeholder="e.g. Bangladesh"
                required
              />

              <InputField
                type="text"
                label="Telco Parameter Value"
                name="telcoParameterValues"
                placeholder="e.g. BD-BL"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-dm-sans font-medium block">
                    Variant <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={methods.control}
                    name="variant"
                    rules={{ required: "Variant is required" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full h-11">
                          <SelectValue placeholder="Select variant" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STANDARD">Standard</SelectItem>
                          <SelectItem value="EVINA">EVINA</SelectItem>
                          <SelectItem value="CG_CALLBACK">
                            CG Callback
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-dm-sans font-medium block">
                    PIN Location <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    control={methods.control}
                    name="pinLocation"
                    rules={{ required: "PIN location is required" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full h-11">
                          <SelectValue placeholder="Select PIN location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TELCO_PAGE">Telco Page</SelectItem>
                          <SelectItem value="OUR_PAGE">Our Page</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-md">
                  <Label className="text-sm font-dm-sans font-medium block">
                    EVINA Enabled
                  </Label>
                  <Controller
                    control={methods.control}
                    name="evinaEnabled"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-md">
                  <Label className="text-sm font-dm-sans font-medium block">
                    Active
                  </Label>
                  <Controller
                    control={methods.control}
                    name="is_active"
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
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
                    onClick={() => append({ ...defaultConfig })}
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
                        label="Key"
                        name={`configs.${index}.key`}
                        placeholder="e.g. userTelcoServiceId"
                        required
                      />
                      <InputField
                        type="text"
                        label="Label"
                        name={`configs.${index}.label`}
                        placeholder="e.g. Service ID"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
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
