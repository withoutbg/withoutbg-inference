"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  OPEN_MODEL_SECTION_COLUMNS,
  type ProductLinkItem,
  type ProductLinkSection,
} from "@/lib/product-links";
import { ProductLinkIcon } from "@/components/ui/ProductLinkIcon";
import { cn } from "@/lib/utils";
import {
  shellNavTrigger,
  shellNavTriggerOpen,
  shellNavDropdown,
  shellNavDropdownColumnDivider,
  shellNavDropdownItem,
  shellNavDropdownItemSimple,
  shellNavDropdownDivider,
  shellNavDropdownSectionLabel,
} from "@/lib/shell-styles";

function isExternalLink(item: ProductLinkItem): boolean {
  if (item.external === false) return false;
  if (!item.href) return false;
  return item.external ?? /^https?:\/\//.test(item.href);
}

function MenuItemRow({
  item,
  onNavigate,
}: {
  item: ProductLinkItem;
  onNavigate: () => void;
}) {
  const labelClass = item.highlight
    ? "font-semibold text-purple-600 dark:text-purple-400"
    : undefined;

  if (item.simple) {
    return (
      <a
        role="menuitem"
        href={item.href ?? "#"}
        {...(isExternalLink(item)
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        onClick={onNavigate}
        className={shellNavDropdownItemSimple}
      >
        <span className={labelClass}>{item.label}</span>
      </a>
    );
  }

  const content = (
    <>
      <ProductLinkIcon item={item} />
      <span className="flex items-center gap-2 whitespace-nowrap">
        <span className={labelClass}>{item.label}</span>
        {item.current && (
          <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
            This App
          </span>
        )}
      </span>
    </>
  );

  if (!item.href) {
    return (
      <div
        role="menuitem"
        aria-current="page"
        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400"
      >
        {content}
      </div>
    );
  }

  return (
    <a
      role="menuitem"
      href={item.href}
      {...(isExternalLink(item)
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      onClick={onNavigate}
      className={cn(shellNavDropdownItem, "items-center")}
    >
      {content}
    </a>
  );
}

function renderSections(
  sections: ProductLinkSection[],
  onNavigate: () => void
) {
  return sections.map((section, sectionIndex) => (
    <div key={section.label}>
      {sectionIndex > 0 && <div className={shellNavDropdownDivider} />}
      <div className={shellNavDropdownSectionLabel}>{section.label}</div>
      {section.items.map((item) => (
        <MenuItemRow key={item.label} item={item} onNavigate={onNavigate} />
      ))}
    </div>
  ));
}

export function OpenModelsMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(shellNavTrigger, open && shellNavTriggerOpen)}
      >
        Open-Weights Model
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 flex-shrink-0 transition-transform duration-150",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(shellNavDropdown, "flex w-max flex-row")}
        >
          {OPEN_MODEL_SECTION_COLUMNS.map((column, columnIndex) => (
            <div
              key={columnIndex}
              className={cn(
                "min-w-[280px] py-1",
                columnIndex > 0 && shellNavDropdownColumnDivider
              )}
            >
              {renderSections(column, close)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
