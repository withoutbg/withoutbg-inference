"use client";

import { API_MODEL_SECTION_COLUMNS } from "@/lib/product-links";
import { ProductNavMenu } from "@/components/ui/ProductNavMenu";

export function ApiModelMenu() {
  return (
    <ProductNavMenu
      label="Pro Model"
      sectionColumns={API_MODEL_SECTION_COLUMNS}
    />
  );
}
