import { AppHeader } from "@/components/ui/AppHeader";
import { AppFooter } from "@/components/ui/AppFooter";
import BackgroundRemovalEditor from "@/components/editor/BackgroundRemovalEditor";
import { LICENSE_URL, OSS_URL } from "@/lib/product-links";

export default function Home() {
  const linkClassName =
    "font-medium text-gray-700 underline underline-offset-2 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100";

  return (
    <div className="min-h-screen bg-wbg-page flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 text-balance">
            Remove image backgrounds
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Serving{" "}
            <a
              href={OSS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              withoutBG Open-Weights Model
            </a>
            :{" "}
            <a
              href={LICENSE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              License
            </a>
          </p>
          <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
            Upload up to 20 images at once. Each is processed automatically. Download individually or all at once as a ZIP.{" "}
            <span className="text-gray-400 dark:text-gray-500">Free and open source.</span>
          </p>
        </div>

        <BackgroundRemovalEditor />
      </main>

      <AppFooter />
    </div>
  );
}
