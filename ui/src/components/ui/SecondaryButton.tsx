import Link from "next/link";
import { ReactNode, ButtonHTMLAttributes, forwardRef } from "react";

interface SecondaryButtonLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  "aria-current"?: "page" | undefined;
  onClick?: never;
  disabled?: never;
}

interface SecondaryButtonClickProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {
  onClick: () => void | Promise<void>;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: never;
  "aria-current"?: never;
}

type SecondaryButtonProps = SecondaryButtonLinkProps | SecondaryButtonClickProps;

export const SecondaryButton = forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  (props, ref) => {
    const baseClasses =
      "inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800/30 dark:bg-gray-800 text-center whitespace-nowrap";

    if ("href" in props && props.href) {
      const { href, children, className = "", "aria-current": ariaCurrent } = props;
      const isExternal = href.startsWith("http://") || href.startsWith("https://");
      if (isExternal) {
        return (
          <a
            href={href}
            className={`${baseClasses} ${className}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-current={ariaCurrent}
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className={`${baseClasses} ${className}`} aria-current={ariaCurrent}>
          {children}
        </Link>
      );
    }

    const { onClick, children, className = "", disabled, ...buttonProps } = props;
    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${className}`}
        {...buttonProps}
      >
        {children}
      </button>
    );
  }
);

SecondaryButton.displayName = "SecondaryButton";
