import { SITE_URL } from "@/lib/product-links";
import { shellNavTrigger } from "@/lib/shell-styles";

export function ApiModelMenu() {
  return (
    <a
      href={SITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={shellNavTrigger}
    >
      API Model
    </a>
  );
}
