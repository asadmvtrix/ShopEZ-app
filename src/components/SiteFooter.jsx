import { Link as RouterLink } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import BrandMark from "./BrandMark";
import PageContainer from "./PageContainer";
import { useCatalog } from "../context/CatalogProvider";
import { POLICIES } from "../config/store";

export default function SiteFooter() {
  const { categories } = useCatalog();

  return (
    <footer className="mt-8 border-t border-border bg-card py-10">
      <PageContainer>
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="max-w-[280px]">
            <div className="flex items-center gap-2 text-primary">
              <BrandMark className="size-[26px]" />
              <span className="text-[0.9375rem] font-semibold">ShopEZ</span>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Computer hardware, peripherals and audio gear, shipped from verified suppliers.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Shop
            </h2>
            <ul className="flex flex-col space-y-1.5">
              {categories.slice(0, 5).map((category) => (
                <li key={category}>
                  <RouterLink
                    to={`/browse?category=${encodeURIComponent(category)}`}
                    className="text-sm text-foreground hover:underline"
                  >
                    {category}
                  </RouterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Buying from us
            </h2>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm text-muted-foreground">{POLICIES.shipping}</p>
              <p className="text-sm text-muted-foreground">{POLICIES.returns}</p>
              <p className="text-sm text-muted-foreground">{POLICIES.warranty}</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} ShopEZ. All rights reserved.
        </p>
      </PageContainer>
    </footer>
  );
}
