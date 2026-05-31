import type { HTMLAttributes } from "react";
import { cn } from "@/shared/ui/cn";

type BadgeVariant = "default" | "outline" | "ok" | "warn" | "danger";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClassName: Record<BadgeVariant, string> = {
  default: "badge-default",
  outline: "badge-outline",
  ok: "badge-ok",
  warn: "badge-warn",
  danger: "badge-danger",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return <span className={cn("badge", variantClassName[variant], className)} {...props} />;
}