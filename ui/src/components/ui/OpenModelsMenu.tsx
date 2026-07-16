"use client";

import { OPEN_MODEL_SECTION_COLUMNS } from "@/lib/product-links";
import { ProductNavMenu } from "@/components/ui/ProductNavMenu";

export function OpenModelsMenu() {
  return (
    <ProductNavMenu
      label="Open Model"
      sectionColumns={OPEN_MODEL_SECTION_COLUMNS}
    />
  );
}
