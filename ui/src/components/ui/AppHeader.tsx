"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ApiModelMenu } from "@/components/ui/ApiModelMenu";
import { OpenModelsMenu } from "@/components/ui/OpenModelsMenu";
import { GitHubStarButton } from "@/components/conversion/GitHubStarButton";
import { SUPPORT_URL } from "@/lib/product-links";
import { shellNavTrigger } from "@/lib/shell-styles";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const logoSrc = mounted && resolvedTheme === "dark"
    ? "/images/logo-light.png"
    : "/images/logo.png";

  return (
    <header className="sticky top-0 z-50 bg-wbg-chrome text-gray-900 dark:text-gray-100">
      <div className="flex h-12 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center flex-shrink-0">
              <Image
                src={logoSrc}
                alt="withoutBG logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              withoutBG
            </span>
          </div>
          <nav aria-label="Product navigation" className="flex items-center gap-1">
            <OpenModelsMenu />
            <ApiModelMenu />
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              shellNavTrigger,
              "font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            )}
          >
            <Heart className="h-3.5 w-3.5" aria-hidden />
            Donate
          </a>
          <GitHubStarButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
