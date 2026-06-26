import Image from "next/image";
import {
  LICENSE_URL,
  OSS_URL,
  SITE_URL,
  SUPPORT_URL,
} from "@/lib/product-links";

export function AppFooter() {
  const currentYear = new Date().getFullYear();
  const linkClass =
    "hover:text-gray-900 dark:hover:text-white transition";

  return (
    <footer className="bg-wbg-chrome text-gray-700 dark:text-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <Image
                src="/images/logo.png"
                alt="withoutBG logo"
                width={36}
                height={36}
                className="object-contain"
                style={{ width: "auto", height: "auto" }}
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                withoutBG
              </span>
            </div>
            <p className="text-sm mb-2">
              Open-source background removal. Runs locally with no usage limits.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentYear} © withoutBG
            </p>
          </div>

          <nav aria-label="Footer legal links" className="col-span-1">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Links
            </h2>
            <ul className="space-y-2" role="list">
              <li>
                <a href={`${SITE_URL}/privacy`} className={linkClass}>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href={`${SITE_URL}/terms`} className={linkClass}>
                  Terms
                </a>
              </li>
              <li>
                <a href={`${SITE_URL}/about`} className={linkClass}>
                  About
                </a>
              </li>
              <li>
                <a href={`${SITE_URL}/imprint`} className={linkClass}>
                  Imprint
                </a>
              </li>
              <li>
                <a href={LICENSE_URL} className={linkClass}>
                  Open Model License
                </a>
              </li>
              <li>
                <a href="/licenses" className={linkClass}>
                  Third-party notices
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Footer resources" className="col-span-1">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Guides
            </h2>
            <ul className="space-y-2" role="list">
              <li>
                <a
                  href={OSS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  GitHub
                </a>
              </li>
              <li>
                <a href={`${SITE_URL}/docs`} className={linkClass}>
                  Documentation
                </a>
              </li>
              <li>
                <a href={`${SITE_URL}/tech`} className={linkClass}>
                  Tech
                </a>
              </li>
              <li>
                <a href={`${SITE_URL}/open-weights-model/mac-app`} className={linkClass}>
                  Mac App
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Footer support" className="col-span-1">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Support
            </h2>
            <ul className="space-y-2" role="list">
              <li>
                <a
                  href={SUPPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Donate
                </a>
              </li>
              <li>
                <a href={`${SITE_URL}/contact`} className={linkClass}>
                  Contact us
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
