import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Menu as MenuIcon,
  Moon,
  Sun,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import BrandMark from "./BrandMark";
import CartBadge from "./CartBadge";
import PageContainer from "./PageContainer";
import { useAuth } from "../context/AuthProvider";
import { setFlash } from "../lib/flash";
import { useCart } from "../context/CartProvider";
import { useCatalog } from "../context/CatalogProvider";
import { useColorMode } from "../context/ColorModeProvider";

function categoryPath(category) {
  return `/browse?category=${encodeURIComponent(category)}`;
}

const iconBtn =
  "size-10 shrink-0 [&_svg:not([class*='size-'])]:size-5 sm:[&_svg:not([class*='size-'])]:size-6";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { categories } = useCatalog();
  const { mode, toggleMode } = useColorMode();
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  function handleLogout() {
    void logout()
      .then(() => {
        closeDrawer();
        setFlash("Signed out successfully.");
        navigate("/");
      })
      .catch(() => {
        closeDrawer();
        setFlash("Couldn’t sign out cleanly. Try again.", "error");
        navigate("/");
      });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <PageContainer className="px-2 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-0.5 sm:h-16 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className={cn(iconBtn, "md:hidden")}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <MenuIcon />
          </Button>

          <RouterLink
            to="/"
            className="mr-1 flex items-center gap-2 text-primary no-underline md:mr-4"
          >
            <BrandMark className="size-[26px] sm:size-[30px]" />
            <span className="text-base font-semibold tracking-tight sm:text-lg">
              ShopEZ
            </span>
          </RouterLink>

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
            <RouterLink
              to="/"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              Home
            </RouterLink>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" className="gap-1" />
                }
              >
                Categories
                <ChevronDown data-icon="inline-end" className="size-4 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-48">
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => navigate(categoryPath(category))}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <RouterLink
              to="/browse"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              All products
            </RouterLink>
          </nav>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="icon"
            className={iconBtn}
            onClick={toggleMode}
            aria-label="Toggle colour theme"
            title={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {mode === "dark" ? <Sun /> : <Moon />}
          </Button>

          <RouterLink
            to="/cart"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), iconBtn)}
            aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            title="Cart"
          >
            <CartBadge count={itemCount}>
              <ShoppingCart />
            </CartBadge>
          </RouterLink>

          {user ? (
            <div className="ml-0.5 flex items-center gap-0.5">
              <RouterLink
                to="/account"
                className={cn(buttonVariants({ variant: "ghost", size: "icon" }), iconBtn)}
                aria-label="Account settings"
                title={user.name || user.email}
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="size-[26px] rounded-full object-cover sm:size-[30px]"
                  />
                ) : (
                  <span className="flex size-[26px] items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground sm:size-[30px]">
                    {(user.name || user.email || "?").charAt(0).toUpperCase()}
                  </span>
                )}
              </RouterLink>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0"
                      aria-label="Account menu"
                    />
                  }
                >
                  <ChevronDown className="size-4 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="text-sm font-semibold text-foreground">
                      {user.name || "Your account"}
                    </div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      navigate("/account");
                    }}
                  >
                    Account settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <RouterLink
                to="/auth?mode=login"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  iconBtn,
                  "sm:hidden"
                )}
                aria-label="Sign in"
                title="Sign in"
              >
                <User />
              </RouterLink>
              <div className="ml-1 hidden items-center gap-2 sm:flex">
                <RouterLink
                  to="/auth?mode=login"
                  className={cn(buttonVariants({ variant: "ghost" }))}
                >
                  Sign in
                </RouterLink>
                <RouterLink
                  to="/auth?mode=signup"
                  className={cn(buttonVariants({ variant: "default" }))}
                >
                  Create account
                </RouterLink>
              </div>
            </>
          )}
        </div>
      </PageContainer>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[280px] gap-0 p-0 sm:max-w-[280px]"
        >
          <SheetHeader className="flex-row items-center justify-between space-y-0 p-4">
            <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="size-10"
              onClick={closeDrawer}
              aria-label="Close navigation menu"
            >
              <X />
            </Button>
          </SheetHeader>
          <Separator />
          <nav className="flex flex-col py-1" onClick={closeDrawer}>
            <RouterLink
              to="/"
              className="px-4 py-2.5 text-sm hover:bg-muted"
            >
              Home
            </RouterLink>
            <RouterLink
              to="/browse"
              className="px-4 py-2.5 text-sm hover:bg-muted"
            >
              All products
            </RouterLink>
            <RouterLink
              to="/cart"
              className="px-4 py-2.5 text-sm hover:bg-muted"
            >
              {itemCount > 0 ? `Cart (${itemCount})` : "Cart"}
            </RouterLink>
          </nav>
          <Separator />
          <div className="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground">
            Categories
          </div>
          <nav className="flex flex-col pb-2" onClick={closeDrawer}>
            {categories.map((category) => (
              <RouterLink
                key={category}
                to={categoryPath(category)}
                className="px-4 py-2.5 text-sm hover:bg-muted"
              >
                {category}
              </RouterLink>
            ))}
          </nav>
          <Separator />
          <div className="p-4">
            {user ? (
              <div className="flex flex-col gap-2">
                <p className="truncate text-sm font-semibold">
                  {user.name || "Your account"}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                <RouterLink
                  to="/account"
                  onClick={closeDrawer}
                  className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                >
                  Account settings
                </RouterLink>
                <Button onClick={handleLogout} className="w-full">
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <RouterLink
                  to="/auth?mode=login"
                  onClick={closeDrawer}
                  className={cn(buttonVariants({ variant: "outline" }), "w-full")}
                >
                  Sign in
                </RouterLink>
                <RouterLink
                  to="/auth?mode=signup"
                  onClick={closeDrawer}
                  className={cn(buttonVariants({ variant: "default" }), "w-full")}
                >
                  Create account
                </RouterLink>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
