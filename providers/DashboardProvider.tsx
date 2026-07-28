"use client";
import DashboardLoader from "@/app/(private)/admin/dashboard/_components/DashboardLoader";
import { disconnectSocket, initSocket } from "@/lib/socket-client";
import useAdminProfile from "@/store/useAdminProfile";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function DashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const { fetchAdminData, adminData, isLoading, error, isSuccess } =
    useAdminProfile();
  const [mainLoading, setMainLoading] = useState(true);
  const token = session?.token;

  const userId = adminData?._id || "";

  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (sessionStatus === "unauthenticated") {
      disconnectSocket();
      setMainLoading(false);
      return;
    }

    if (token && !adminData) {
      fetchAdminData(token);
    }
  }, [fetchAdminData, token, adminData, sessionStatus]);

  useEffect(() => {
    if (isSuccess && adminData) {
      setMainLoading(false);
      initSocket(userId, token);
    }

    if (error) {
      setMainLoading(false);
    }
  }, [isSuccess, adminData, error, token]);

  if (mainLoading || sessionStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <DashboardLoader />
      </div>
    );
  }

  return <>{children}</>;
}
