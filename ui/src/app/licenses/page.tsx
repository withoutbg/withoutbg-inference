import type { Metadata } from "next";
import Link from "next/link";
import { AppHeader } from "@/components/ui/AppHeader";
import { AppFooter } from "@/components/ui/AppFooter";
import { LICENSE_URL } from "@/lib/product-links";
import {
  INFERENCE_REPO_URL,
  THIRD_PARTY_NOTICES_URL,
  UPSTREAM_COMPONENTS,
} from "@/lib/reference-links";

export const metadata: Metadata = {
  title: "Third-party notices",
  description:
    "License and attribution for upstream models used in the withoutBG open weights ONNX graph.",
};

export default function LicensesPage() {
  const linkClassName =
    "font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100";

  return (
    <div className="min-h-screen bg-wbg-page flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <Link href="/" className={linkClassName}>
            Back to editor
          </Link>
        </p>

        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Third-party notices
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          The withoutBG open weights v3 distribution includes a compiled ONNX model
          that encapsulates upstream components. The product is licensed under the{" "}
          <a href={LICENSE_URL} className={linkClassName}>
            withoutBG open weights license
          </a>
          .
        </p>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Full notices file:{" "}
          <a href={THIRD_PARTY_NOTICES_URL} className={linkClassName}>
            THIRD_PARTY_NOTICES.md
          </a>
          {" · "}
          <a href={INFERENCE_REPO_URL} className={linkClassName}>
            Source repository
          </a>
        </p>

        <div className="mt-8 space-y-8">
          {UPSTREAM_COMPONENTS.map((component) => (
            <section key={component.name}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {component.name}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {component.license}
              </p>
              <ul className="mt-2 space-y-1" role="list">
                {component.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClassName}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
              {component.note ? (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {component.note}
                </p>
              ) : null}
            </section>
          ))}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
