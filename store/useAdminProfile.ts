import { getAdminProfile } from "@/actions/adminProfile/adminProfileActions";
import { create } from "zustand";

interface AdminProfileState {
  adminData: any;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  fetchAdminData: (token: string) => Promise<void>;
  clearAdminData: () => void;
}
const useAdminProfile = create<AdminProfileState>((set) => ({
  adminData: null,
  isLoading: false,
  isSuccess: false,
  error: null,
  fetchAdminData: async (token: string) => {
    if (!token) return;
    set({ isLoading: true, error: null, isSuccess: false });

    try {
      const res = await getAdminProfile();
      if (!res.status) {
        set({
          isSuccess: false,
          isLoading: false,
          error: res.message || "Failed to fetch",
        });
        return;
      }

      set({ adminData: res?.data, isSuccess: true });
    } catch (error: any) {
      set({
        error: error.message || "Unknown error",
        isSuccess: false,
        isLoading: false,
      });
    }
  },
  clearAdminData: () => set({ adminData: null, error: null }),
}));

export default useAdminProfile;
