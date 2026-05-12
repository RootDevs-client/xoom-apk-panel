"use client";

import { updateAdminPassword } from "@/actions/adminProfile/adminProfileActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import CustomButton from "@/components/form/CustomButton";
import PasswordField from "@/components/form/PasswordField";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

import { passwordChangeSchema } from "@/lib/validation-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ImSpinner9 } from "react-icons/im";
import * as z from "zod";

type PasswordFormValues = z.infer<typeof passwordChangeSchema>;

interface PasswordChangeModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function PasswordChangeModal({
  open,
  setOpen,
}: PasswordChangeModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session } = useSession();

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setLoading(true);
    const payload = {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    };
    const loadingToast = ToastMessage.loading({ title: "Password Change...." });
    try {
      const response = await updateAdminPassword(payload);

      if (!response.status) {
        ToastMessage.warning(
          { title: response?.message || "Old password is incorrect!" },
          { id: loadingToast },
        );
        return;
      }

      ToastMessage.success(
        { title: response?.message || "Password changed successfully!" },
        { id: loadingToast },
      );
      form.reset();
      setOpen(false);
    } catch (error: any) {
      // only real/unexpected errors reach here
      ToastMessage.error(
        { title: "Your session has expired!" },
        { id: loadingToast },
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Update Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new password
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <PasswordField
                name="oldPassword"
                label="Old Password"
                prefix={<Lock size={16} />}
              />
              <PasswordField
                name="newPassword"
                label="New Password"
                prefix={<Lock size={16} />}
              />
              <PasswordField
                name="confirmPassword"
                label="Confirm Password"
                prefix={<Lock size={16} />}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <CustomButton
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="border-red-500 text-red-500 rounded-lg hover:bg-transparent hover:border-red-500 hover:text-red-500"
                >
                  Cancel
                </CustomButton>
              </DialogClose>
              <CustomButton
                type="submit"
                // onClick={form.handleSubmit(onSubmit)}
                disabled={loading}
                className="rounded-lg"
              >
                {loading ? (
                  <span className="flex items-center">
                    Updating
                    <ImSpinner9 className="ml-2 transition-all animate-spin duration-300" />
                  </span>
                ) : (
                  "Update"
                )}
              </CustomButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
