"use client";

import { CreditCard, Heart, Images, Play, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductLinkItem } from "@/lib/product-links";

const iconClass = (highlight?: boolean) =>
  cn(
    "h-4 w-4 flex-shrink-0",
    highlight
      ? "text-purple-600 dark:text-purple-400"
      : "text-gray-400 dark:text-gray-500"
  );

export function ProductLinkIcon({ item }: { item: ProductLinkItem }) {
  if (item.icon) {
    return <i className={`${item.icon} text-base leading-none`} aria-hidden />;
  }

  if (item.lucideIcon === "store") {
    return <Store className={iconClass(item.highlight)} aria-hidden />;
  }

  if (item.lucideIcon === "images") {
    return <Images className={iconClass(item.highlight)} aria-hidden />;
  }

  if (item.lucideIcon === "play") {
    return <Play className={iconClass(item.highlight)} aria-hidden />;
  }

  if (item.lucideIcon === "credit-card") {
    return <CreditCard className={iconClass(item.highlight)} aria-hidden />;
  }

  if (item.lucideIcon === "heart") {
    return <Heart className={iconClass(item.highlight)} aria-hidden />;
  }

  return null;
}
