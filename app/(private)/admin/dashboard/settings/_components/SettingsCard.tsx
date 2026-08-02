"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

interface SettingsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
}

export function SettingsCard({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
  noPadding = false,
  ...props
}: SettingsCardProps) {
  return (
    <div
      className={cn(
        "group/card overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-primary/5",
        className,
      )}
      {...props}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Icon className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-none tracking-tight text-foreground">
              {title}
            </h3>
            {description && (
              <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={cn(noPadding ? "" : "p-6")}>{children}</div>
    </div>
  );
}
