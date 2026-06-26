"use client";

import { ArrowUpRight } from "lucide-react";
import {
  API_MODEL_SECTIONS,
  OPEN_MODEL_SECTIONS,
  type ProductLinkItem,
} from "@/lib/product-links";
import { ProductLinkIcon } from "@/components/ui/ProductLinkIcon";

function ExternalPageIndicator() {
  return (
    <ArrowUpRight
      className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500"
      aria-hidden
    />
  );
}

function OpenModelItem({ item }: { item: ProductLinkItem }) {
  const labelClass = item.highlight
    ? "font-semibold text-purple-600 dark:text-purple-400"
    : "text-sm text-gray-700 dark:text-gray-300";

  if (item.simple) {
    return (
      <a
        href={item.href ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/60"
      >
        {item.label}
      </a>
    );
  }

  const body = (
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
        aria-current="page"
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 dark:text-gray-400"
      >
        {body}
      </div>
    );
  }

  return (
    <a
      href={item.href}
      {...(item.external === false
        ? {}
        : { target: "_blank", rel: "noopener noreferrer" })}
      className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
    >
      {body}
    </a>
  );
}

function ApiModelItem({ item }: { item: ProductLinkItem }) {
  if (item.simple) {
    return (
      <a
        href={item.href ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between gap-2 rounded-lg px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/60"
      >
        <span>{item.label}</span>
        <ExternalPageIndicator />
        <span className="sr-only"> (opens external page)</span>
      </a>
    );
  }

  return (
    <a
      href={item.href ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60"
    >
      <ProductLinkIcon item={item} />
      <span className="flex-1 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
        {item.label}
      </span>
      <ExternalPageIndicator />
      <span className="sr-only"> (opens external page)</span>
    </a>
  );
}

export function ProductLinks() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <section className="rounded-lg border border-gray-200 bg-wbg-surface dark:border-gray-800 dark:bg-wbg-chrome">
        <h2 className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 dark:border-gray-800 dark:text-gray-100">
          Open-Weights Model
        </h2>
        <div className="py-1">
          {OPEN_MODEL_SECTIONS.map((section, sectionIndex) => (
            <div key={section.label}>
              {sectionIndex > 0 && (
                <div className="mx-3 my-1 border-t border-gray-200 dark:border-gray-700" />
              )}
              <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {section.label}
              </div>
              {section.items.map((item) => (
                <OpenModelItem key={item.label} item={item} />
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-wbg-surface dark:border-gray-800 dark:bg-wbg-chrome">
        <h2 className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 dark:border-gray-800 dark:text-gray-100">
          API Model
        </h2>
        <div className="py-1">
          {API_MODEL_SECTIONS.map((section, sectionIndex) => (
            <div key={section.label}>
              {sectionIndex > 0 && (
                <div className="mx-3 my-1 border-t border-gray-200 dark:border-gray-700" />
              )}
              <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {section.label}
              </div>
              {section.items.map((item) => (
                <ApiModelItem key={item.label} item={item} />
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
