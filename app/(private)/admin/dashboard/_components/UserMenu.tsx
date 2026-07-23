"use client";

import { ToastMessage } from "@/components/custom/ToastMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { routes } from "@/config/routes";
import useAdminProfile from "@/store/useAdminProfile";

import { ChevronDown, Lock, LogOut, SquarePen } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import EditProfileModal from "./EditProfileModal";
import PasswordChangeModal from "./PasswordChangeModal";

export default function UserMenu() {
  const { isLoading, adminData, clearAdminData } = useAdminProfile();
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  //   logout function
  const handleLogout = async () => {
    await signOut({
      redirect: false,
    });

    clearAdminData();
    ToastMessage.success({ title: "Logout Successfully!" });
    window.location.href = routes.publicRoutes.adminLogin;
  };

  return (
    <>
      {/* Password Modal */}
      <PasswordChangeModal open={modalOpen} setOpen={setModalOpen} />
      <EditProfileModal
        editModalOpen={editModalOpen}
        setEditModalOpen={setEditModalOpen}
      />
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-1.5 rounded-md text-sm font-medium focus:outline-none cursor-pointer ">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <span> {adminData?.name}</span>

            <ChevronDown
              className={`h-5 w-5 transform transition-transform duration-200 cursor-pointer ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="mt-3.5 w-60 rounded-sm border  p-2 "
        >
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {adminData?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {adminData?.email}
            </p>
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setEditModalOpen(true);
              setOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer rounded-lg! px-3 py-2 text-sm hover:text-white!"
          >
            <SquarePen className="h-4 w-4" />
            Edit Profile
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          {/* Change Password */}
          <DropdownMenuItem
            onClick={() => {
              setModalOpen(true);
              setOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer rounded-lg! px-3 py-2 text-sm hover:text-white!"
          >
            <Lock className="h-4 w-4" />
            Change Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild onClick={() => handleLogout()}>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-lg! cursor-pointer px-3 py-2 text-sm font-medium text-red-600 hover:text-white! "
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
