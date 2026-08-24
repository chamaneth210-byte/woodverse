import { Heart, Moon, Search, ShoppingCart, Sun, UserRound } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { navigate } from "../utils";

const links = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["Furniture", "/furniture"],
  ["Wooden gifts", "/wooden-gifts"],
];

export function Header({ path, theme, onToggleTheme, cartCount, isLoggedIn }) {
  return (
    <header className="sticky top-0 z-30 grid min-h-14 grid-cols-[auto_minmax(0,1fr)_minmax(180px,420px)_auto] items-center gap-5 border-b border-black/5 bg-paper/90 px-4 backdrop-blur dark:border-white/10 dark:bg-[#191d1c]/95 sm:px-6 lg:gap-7 lg:px-10 xl:px-12 max-lg:grid-cols-[minmax(0,1fr)_auto] max-lg:gap-x-5">
      <button onClick={() => navigate("/")} className="min-w-0 text-left text-forest dark:text-emerald-200">
        <BrandLogo imageClassName="h-8 w-8" textClassName="text-[17px] text-forest dark:text-emerald-200" />
      </button>

      <nav className="flex items-center justify-center gap-7 justify-self-center whitespace-nowrap text-[15px] text-slate-600 dark:text-stone-300 max-lg:order-3 max-lg:col-span-2 max-lg:w-full max-lg:justify-start max-lg:overflow-x-auto max-sm:gap-5">
        {links.map(([label, href]) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <button
              key={href}
              onClick={() => navigate(href)}
              className={`relative py-3 ${active ? "text-forest dark:text-emerald-200 after:absolute after:inset-x-0 after:bottom-1 after:h-0.5 after:bg-forest" : ""}`}
            >
              {label}
            </button>
          );
        })}
      </nav>

      <label className="flex h-10 w-full max-w-md min-w-0 items-center justify-self-end rounded-full border border-slate-200 bg-blue-50 px-3 text-slate-500 dark:border-slate-700 dark:bg-[#1d2422] max-lg:order-4 max-lg:col-span-2 max-lg:max-w-none">
        <Search className="h-5 w-5 shrink-0" />
        <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search timber, furniture, or vendors..." />
      </label>

      <div className="flex items-center gap-4 max-sm:gap-2">
        <button onClick={() => navigate(isLoggedIn ? "/profile" : "/login")} className="text-slate-600 dark:text-stone-300" aria-label="Wishlist">
          <Heart className="h-5 w-5" />
        </button>
        <button onClick={() => navigate("/cart")} className="relative text-slate-600 dark:text-stone-300" aria-label="Cart">
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-wood px-1 text-[10px] font-extrabold text-white">
            {cartCount}
          </span>
        </button>
        <button
          onClick={onToggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="inline-flex h-9 min-w-20 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-bold text-forest dark:border-slate-700 dark:bg-[#202624] dark:text-emerald-200 max-sm:min-w-9 max-sm:px-2"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span className="max-sm:hidden">{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
        <button
          onClick={() => navigate(isLoggedIn ? "/profile" : "/login")}
          aria-label={isLoggedIn ? "Open profile" : "Sign in"}
          className="inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:border-forest hover:text-forest dark:border-slate-700 dark:bg-[#202624] dark:text-stone-300 dark:hover:border-emerald-200 dark:hover:text-emerald-200 sm:min-w-24 sm:px-3"
        >
          <UserRound className="h-5 w-5 shrink-0" />
          <span className="max-sm:hidden">{isLoggedIn ? "Account" : "Sign in"}</span>
        </button>
      </div>
    </header>
  );
}
