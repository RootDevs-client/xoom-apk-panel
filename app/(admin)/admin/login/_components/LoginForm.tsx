"use client";

import { handleLogin } from "@/actions/adminLogin/adminLoginActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import CustomButton from "@/components/form/CustomButton";
import InputField from "@/components/form/InputField";
import PasswordField from "@/components/form/PasswordField";
import { routes } from "@/config/routes";
import { Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { FormProvider, useForm } from "react-hook-form";

type LoginInputs = {
  email: string;
  password: string;
};

export default function LoginForm() {
  // Single unified form instance
  const methods = useForm<LoginInputs>({ mode: "onChange" });
  const {
    handleSubmit,

    formState: { isSubmitting },
  } = methods;

  //  Handle login
  const onSubmit = async (data: LoginInputs) => {
    const loadingToast = ToastMessage.loading({
      title: "Admin Login...",
    });

    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await handleLogin(formData);

      if (result?.error) {
        ToastMessage.error(
          { title: result.error || "login filed!" },
          { id: loadingToast },
        );
        return;
      }

      ToastMessage.success(
        {
          title: "Admin Login Successfully!",
        },
        { id: loadingToast },
      );
      // Trigger NextAuth sign-in on client
      const nextAuthRes: any = await signIn("credentials", {
        email: data.email,
        token: result.token,
        callbackUrl: routes.privateRoutes.admin.dashboard,
        // redirect: false,
      });

      if (nextAuthRes && "error" in nextAuthRes && nextAuthRes.error) {
        ToastMessage.error({ title: nextAuthRes.error }, { id: loadingToast });
        return;
      }

      // router.push(routes.privateRoutes.admin.dashboard);
    } catch (error: any) {
      ToastMessage.error(
        { title: "login filed , Try again!" },
        { id: loadingToast },
      );
    }
  };

  return (
    <div className="">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <InputField
            name="email"
            label="Email"
            type="email"
            placeholder="admin@demo.com"
            prefix={<Mail size={18} />}
            rules={{ required: "Required!" }}
          />

          {/* Password */}
          <PasswordField
            name="password"
            prefix={<Lock size={18} />}
            rules={{ required: "Required!" }}
          />

          {/* Submit */}
          <CustomButton
            type="submit"
            disabled={isSubmitting}
            className="w-full transition-colors cursor-pointer bg-[#0F172B] hover:bg-[#0F172B] rounded-lg"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </CustomButton>
        </form>
      </FormProvider>
    </div>
  );
}
