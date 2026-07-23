"use client";

import { createMetaChannel, updateMetaChannel } from "@/actions/whatsapp/metaActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { ImSpinner9 } from "react-icons/im";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  channel?: {
    _id: string;
    name: string;
    phoneNumberId: string;
    accessToken?: string;
    webhookSecret?: string;
  } | null;
}

export default function MetaChannelFormModal({
  open,
  onOpenChange,
  onSuccess,
  channel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [showToken, setShowToken] = useState(false);

  const isEditing = !!channel;

  useEffect(() => {
    if (open) {
      if (channel) {
        setName(channel.name);
        setPhoneNumberId(channel.phoneNumberId);
        setAccessToken(channel.accessToken || "");
      } else {
        setName("");
        setPhoneNumberId("");
        setAccessToken("");
      }
      setShowToken(false);
    }
  }, [open, channel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phoneNumberId.trim() || (!isEditing && !accessToken.trim())) {
      ToastMessage.error({ title: "Please fill all required fields" });
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        const data: any = { name: name.trim(), phoneNumberId: phoneNumberId.trim() };
        if (accessToken.trim()) data.accessToken = accessToken.trim();
        const res = await updateMetaChannel(channel!._id, data);
        if (res?.status) {
          ToastMessage.success({ title: "Channel updated" });
          onSuccess();
          onOpenChange(false);
        } else {
          ToastMessage.error({ title: res?.message || "Failed to update" });
        }
      } else {
        const res = await createMetaChannel({
          name: name.trim(),
          phoneNumberId: phoneNumberId.trim(),
          accessToken: accessToken.trim(),
        });
        if (res?.status) {
          ToastMessage.success({ title: "Channel created" });
          onSuccess();
          onOpenChange(false);
        } else {
          ToastMessage.error({ title: res?.message || "Failed to create" });
        }
      }
    } catch {
      ToastMessage.error({ title: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Meta Channel" : "Add Meta Channel"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <MessageCircle className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <p className="font-medium">Meta WhatsApp Cloud API</p>
                <p>
                  Enter your WhatsApp Business Account phone number ID and a
                  permanent access token from Meta Developer Portal.
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Channel Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="e.g. Main WhatsApp Business"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Phone Number ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="e.g. 1007696238914099"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Access Token {!isEditing && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pr-8"
                  placeholder={isEditing ? "Leave blank to keep current" : "Permanent access token"}
                  required={!isEditing}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Generate from Meta Developer Portal &gt; WhatsApp &gt; Configuration &gt; Permanent Access Token
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
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
              {isEditing ? "Save Changes" : "Add Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
