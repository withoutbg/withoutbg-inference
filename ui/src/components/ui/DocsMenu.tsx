"use client";

import { DOCS_SECTION_COLUMNS } from "@/lib/product-links";
import { ProductNavMenu } from "@/components/ui/ProductNavMenu";

export function DocsMenu() {
  return (
    <ProductNavMenu label="Docs" sectionColumns={DOCS_SECTION_COLUMNS} />
  );
}
