import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Boxes,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  CreditCard,
  Download,
  EllipsisVertical,
  Eye,
  FileText,
  Globe2,
  Grid3X3,
  Handshake,
  Home,
  LayoutDashboard,
  LayoutGrid,
  LayoutList,
  Layers,
  Lock,
  Mail,
  MapPin,
  Moon,
  Navigation,
  PackageCheck,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  ShoppingCart,
  Sofa,
  Store,
  Sun,
  Timer,
  TrendingUp,
  Truck,
  UserPlus,
  Warehouse,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { Header } from "./components/Header";
import { CroppedImage } from "./components/CroppedImage";
import { ChatLauncher, Footer, SectionHeading } from "./components/LayoutParts";
import { ProductCard } from "./components/ProductCard";
import { categories, crop, products, vendors } from "./data/catalog";
import { formatPrice, navigate, sortProducts } from "./utils";

const routeMap = {
  "/": "home",
  "/shop": "shop",
  "/furniture": "furniture",
  "/wooden-gifts": "gifts",
  "/cart": "cart",
  "/delivery": "delivery",
  "/payment": "payment",
  "/chatbot": "chatbot",
  "/seller": "seller",
  "/supplier": "supplier",
  "/supplier/purchase-orders/po-8921": "supplierPurchaseOrder",
  "/supplier/materials": "supplierMaterials",
  "/supplier/shipments": "supplierShipments",
  "/supplier/shipments/new": "supplierNewShipment",
  "/supplier/vendors": "supplierVendors",
  "/supplier/notifications": "supplierNotifications",
  "/supplier/profile": "supplierProfile",
  "/login": "login",
  "/forgot-password": "forgotPassword",
  "/profile": "profile",
};

export default function App() {
  const [path, setPath] = useState(window.location.pathname.replace(/\/$/, "") || "/");
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("woodverse-theme") || (path === "/" ? "dark" : "light");
    } catch {
      return path === "/" ? "dark" : "light";
    }
  });
  const [cart, setCart] = useState([
    { ...products[0], quantity: 1 },
    { ...products[1], quantity: 1 },
  ]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem("woodverse-authenticated") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = () => setPath(window.location.pathname.replace(/\/$/, "") || "/");
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("woodverse-theme", theme);
    } catch {}
  }, [theme]);

  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    try {
      localStorage.setItem("woodverse-authenticated", "true");
    } catch {}
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.removeItem("woodverse-authenticated");
    } catch {}
    navigate("/");
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const page = routeMap[path] || "home";
  const isAuthPage = page === "login" || page === "forgotPassword";
  const isStandalonePage = page === "supplier" || page === "supplierPurchaseOrder" || page === "supplierMaterials" || page === "supplierShipments" || page === "supplierNewShipment" || page === "supplierVendors" || page === "supplierNotifications" || page === "supplierProfile";

  return (
    <div className={theme === "dark" ? "min-h-screen bg-[#191d1c] text-stone-100" : "min-h-screen bg-paper text-ink"}>
      {!isAuthPage && !isStandalonePage && <Header path={path} theme={theme} cartCount={cartCount} isLoggedIn={isLoggedIn} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />}
      {page === "home" && <HomePage addToCart={(item) => addToCart(item, setCart)} />}
      {page === "shop" && <CatalogPage title="Explore All WoodVerse Collections" subtitle="Browse furniture, wooden gifts, and timber products from verified Sri Lankan vendors." items={products} addToCart={(item) => addToCart(item, setCart)} />}
      {page === "furniture" && <CategoryPage type="furniture" addToCart={(item) => addToCart(item, setCart)} />}
      {page === "gifts" && <CategoryPage type="gift" addToCart={(item) => addToCart(item, setCart)} />}
      {page === "cart" && <CartPage cart={cart} setCart={setCart} />}
      {page === "delivery" && <DeliveryPage />}
      {page === "payment" && <PaymentPage />}
      {page === "chatbot" && <ChatbotPage />}
      {page === "seller" && <SellerPage />}
      {page === "supplier" && <SupplierDashboardPage theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />}
      {page === "supplierPurchaseOrder" && <SupplierPurchaseOrderPage theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />}
      {page === "supplierMaterials" && <SupplierMaterialsPage theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />}
      {page === "supplierShipments" && <SupplierShipmentsPage theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />}
      {page === "supplierNewShipment" && <SupplierNewShipmentPage theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />}
      {page === "supplierVendors" && <SupplierVendorsPage theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />}
      {page === "supplierNotifications" && <SupplierNotificationsPage theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />}
      {page === "supplierProfile" && <SupplierProfilePage theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />}
      {page === "profile" && <ProfilePage isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
      {page === "login" && <LoginPage onAuthSuccess={handleAuthSuccess} />}
      {page === "forgotPassword" && <ForgotPasswordPage />}
      {page !== "chatbot" && !isAuthPage && !isStandalonePage && <ChatLauncher />}
    </div>
  );
}

function addToCart(product, setCart) {
  if (product.stockType === "out") return;
  setCart((items) => {
    const existing = items.find((item) => item.id === product.id);
    if (existing) {
      return items.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    }
    return [...items, { ...product, quantity: 1 }];
  });
}

function HomePage({ addToCart }) {
  return (
    <>
      <main className="relative overflow-hidden bg-paper text-ink dark:bg-[#191d1c] dark:text-stone-100">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,253,249,.96)_0%,rgba(255,253,249,.86)_34%,rgba(255,253,249,.52)_60%,rgba(255,253,249,.18)_100%),linear-gradient(180deg,rgba(255,253,249,.08)_0%,rgba(255,253,249,.72)_100%),url('/assets/home-hero.png')] bg-cover bg-center dark:bg-[linear-gradient(90deg,rgba(25,29,28,.96)_0%,rgba(25,29,28,.84)_36%,rgba(25,29,28,.54)_62%,rgba(25,29,28,.22)_100%),linear-gradient(180deg,rgba(25,29,28,.1)_0%,rgba(25,29,28,.86)_100%),url('/assets/home-hero.png')]" />
        <section className="page-shell relative z-10 grid min-h-[calc(100svh-56px)] grid-cols-[minmax(0,1fr)_minmax(240px,320px)] items-center gap-10 py-10 lg:min-h-[calc(100vh-56px)] max-lg:grid-cols-1">
          <div className="min-w-0 max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border border-slate-400 bg-white/75 px-5 py-2 text-base font-extrabold uppercase text-slate-800 shadow-sm backdrop-blur dark:border-stone-500/80 dark:bg-white/10 dark:text-stone-200 sm:text-lg">Indoor Plant Showroom</p>
            <h1 className="mb-8 break-words text-6xl font-semibold leading-[1.02] text-slate-900 dark:text-stone-100 sm:text-7xl lg:text-8xl">Bring Natural Calm Into Your Home</h1>
            <p className="max-w-3xl break-words text-2xl leading-relaxed text-slate-800 dark:text-stone-200 sm:text-3xl">Style handcrafted wooden furniture with lush indoor plants, curated for warm Sri Lankan interiors and sustainable living spaces.</p>
          </div>
          <div className="grid gap-3 justify-self-end rounded-lg border border-white/60 bg-white/72 p-3 shadow-soft backdrop-blur-md dark:border-white/10 dark:bg-[#191d1c]/72 max-lg:w-full max-lg:max-w-xl max-lg:justify-self-start">
            <button onClick={() => document.querySelector("#featured")?.scrollIntoView({ behavior: "smooth" })} className="group flex min-h-16 min-w-0 items-center justify-between gap-4 rounded-md bg-forest px-5 text-left font-bold text-white transition hover:bg-moss">
              <span className="min-w-0 break-words">Explore Living Collections</span>
              <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
            </button>
            <button onClick={() => navigate("/shop")} className="group flex min-h-16 min-w-0 items-center justify-between gap-4 rounded-md border border-forest/25 bg-white/95 px-5 text-left font-bold text-forest transition hover:border-forest dark:bg-[#202624]/95 dark:text-emerald-200">
              <span className="min-w-0 break-words">Browse Products</span>
              <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
            </button>
          </div>
        </section>
      </main>
      <section className="page-shell py-8">
        <SectionHeading title="Browse by Category" subtitle="Explore specialized furniture segments" action={<button onClick={() => navigate("/shop")} className="inline-flex items-center gap-1 text-forest">View All <ArrowRight className="h-4 w-4" /></button>} />
        <div className="grid auto-rows-[220px] grid-cols-2 gap-5 sm:auto-rows-[240px] lg:auto-rows-[292px] lg:gap-6 max-sm:grid-cols-1">
          {categories.map((category, index) => (
            <button key={category.title} onClick={() => navigate(category.href)} className={`category-tile ${index === 0 ? "row-span-2 max-lg:col-span-2 max-lg:row-span-1 max-sm:col-span-1" : ""}`}>
              <CroppedImage crop={category.crop} src={category.image} label={category.title} />
              <div className="category-copy">
                <span>{category.title}</span>
                <small>{category.subtitle}</small>
              </div>
            </button>
          ))}
        </div>
      </section>
      <ProductSection id="featured" title="Featured Products" items={products.slice(0, 4)} addToCart={addToCart} columns="grid-cols-4" />
      <VendorBand />
      <Footer />
    </>
  );
}

function ProductSection({ id, title, subtitle, items, addToCart, columns = "grid-cols-3" }) {
  return (
    <section id={id} className="page-shell py-8">
      <SectionHeading title={title} subtitle={subtitle} />
      <div className={`grid gap-6 ${columns} max-lg:grid-cols-2 max-sm:grid-cols-1`}>
        {items.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}
      </div>
    </section>
  );
}

function VendorBand() {
  return (
    <section className="bg-[#cbd8dc] py-16 dark:bg-[#253530]">
      <div className="page-shell">
        <SectionHeading title="Verified Vendors" subtitle="Supporting Sri Lankan master craftsmen" />
        <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
          {vendors.map((vendor) => (
            <article key={vendor.name} className="grid min-h-40 grid-cols-[76px_minmax(0,1fr)] items-center gap-7 rounded-lg bg-white p-8 shadow-sm dark:bg-[#202624] max-sm:grid-cols-1 max-sm:gap-4 max-sm:p-6">
              <div className="grid h-14 w-20 place-items-center rounded-lg bg-blue-50 font-extrabold text-forest dark:bg-slate-800 dark:text-emerald-200">{vendor.initials}</div>
              <div className="min-w-0">
                <h3 className="break-words font-semibold leading-snug text-slate-700 dark:text-stone-100">{vendor.name}</h3>
                <p className="break-words text-slate-700 before:text-amber-500 before:content-['★_'] dark:text-stone-300">{vendor.rating}</p>
                <p className="break-words leading-snug text-slate-500 dark:text-stone-400">{vendor.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CatalogPage({ title, subtitle, items, addToCart }) {
  const [sort, setSort] = useState("featured");
  const sorted = useMemo(() => sortProducts(items, sort), [items, sort]);

  return (
    <>
      <CatalogHero title={title} subtitle={subtitle} eyebrow="Marketplace Catalog" />
      <section className="page-shell grid grid-cols-[240px_minmax(0,1fr)] gap-8 pb-16 max-lg:grid-cols-1">
        <FilterPanel title="Category" first={["Dining Tables", "Beds & Bedroom", "Living", "Workspace", "Wooden Gifts"]} secondTitle="Material" second={["Solid Teak", "Mahogany", "Jackwood", "Bamboo"]} />
        <div>
          <CatalogToolbar title="All Collections" subtitle={`Showing ${items.length} curated products`} sort={sort} setSort={setSort} />
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4 max-sm:grid-cols-1">
            {categories.map((category) => (
              <button key={category.title} onClick={() => navigate(category.href)} className="category-strip-card">
                <CroppedImage crop={category.crop} src={category.image} label={category.title} />
                <span>{category.title.replace(" Tables", "")}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {sorted.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

function CategoryPage({ type, addToCart }) {
  const gift = type === "gift";
  const [sort, setSort] = useState("featured");
  const items = products.filter((item) => item.category === type);
  const sorted = useMemo(() => sortProducts(items, sort), [items, sort]);
  const title = gift ? "Handcrafted Wooden Gifts for Every Occasion" : "Furniture for Dining, Rest, Living, and Work";
  const subtitle = gift
    ? "Discover carved boxes, desk accessories, keepsakes, and small decor made by Sri Lankan artisans."
    : "Explore durable teak, mahogany, walnut, and bamboo furniture from verified WoodVerse vendors.";

  return (
    <>
      <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(260px,340px)] items-center gap-10 py-14 lg:gap-16 max-lg:grid-cols-1">
        <div className="min-w-0">
          <BackHome />
          <p className="eyebrow">{gift ? "Wooden Gift Collection" : "Sri Lankan Furniture"}</p>
          <h1 className="max-w-3xl break-words text-4xl font-bold leading-tight text-slate-800 dark:text-stone-100 sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl break-words text-lg leading-relaxed text-slate-600 dark:text-stone-300">{subtitle}</p>
        </div>
        <div className="overflow-hidden rounded-[72px_72px_36px_36px] shadow-soft dark:shadow-dark">
          <div className="h-[clamp(240px,52vw,350px)]"><CroppedImage src={gift ? "/assets/site-hero.png" : "/assets/furniture-hero.png"} label={title} /></div>
        </div>
      </section>
      <section className="page-shell grid grid-cols-2 gap-5 pb-8 lg:grid-cols-4 max-sm:grid-cols-1">
        {(gift ? ["Keepsakes", "Desk Gifts", "Home Decor", "Gift Sets"] : ["Dining", "Bedroom", "Living", "Workspace"]).map((label, index) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#202624]">
            <span className="text-sm font-extrabold text-forest dark:text-emerald-200">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 break-words text-lg font-semibold leading-snug">{label}</h3>
            <p className="mt-1 break-words leading-snug text-slate-500 dark:text-stone-400">{gift ? "Gift-ready artisan products" : "Room-ready wooden furniture"}</p>
          </div>
        ))}
      </section>
      <section className="page-shell grid grid-cols-[240px_minmax(0,1fr)] gap-8 pb-16 max-lg:grid-cols-1">
        <FilterPanel title={gift ? "Gift Type" : "Room"} first={gift ? ["Keepsakes", "Desk Gifts", "Home Decor", "Gift Sets"] : ["Dining", "Bedroom", "Living", "Workspace"]} secondTitle="Material" second={gift ? ["Jackwood", "Mahogany", "Teak Offcuts", "Bamboo"] : ["Solid Teak", "Mahogany", "Walnut", "Bamboo"]} />
        <div>
          <CatalogToolbar title={gift ? "Wooden Gift Products" : "Furniture Collections"} subtitle={`Showing ${items.length} products`} sort={sort} setSort={setSort} />
          <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {sorted.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}
          </div>
        </div>
      </section>
      <VendorBand />
      <Footer />
    </>
  );
}

function CatalogHero({ title, subtitle, eyebrow }) {
  return (
    <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(260px,340px)] items-end gap-10 py-14 lg:gap-16 max-lg:grid-cols-1">
      <div className="min-w-0">
        <BackHome />
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="max-w-4xl break-words text-4xl font-bold leading-tight text-slate-800 dark:text-stone-100 sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl break-words text-lg leading-relaxed text-slate-600 dark:text-stone-300">{subtitle}</p>
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 rounded-lg border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-[#202624]">
        <strong className="text-2xl text-forest dark:text-emerald-200">128</strong><span className="self-center break-words text-slate-500 dark:text-stone-400">listed items</span>
        <strong className="text-2xl text-forest dark:text-emerald-200">24</strong><span className="self-center break-words text-slate-500 dark:text-stone-400">verified vendors</span>
        <strong className="text-2xl text-forest dark:text-emerald-200">6</strong><span className="self-center break-words text-slate-500 dark:text-stone-400">material families</span>
      </div>
    </section>
  );
}

function BackHome() {
  return <button onClick={() => navigate("/")} className="mb-6 flex w-fit items-center gap-2 font-semibold leading-none text-forest dark:text-emerald-200"><ArrowLeft className="h-4 w-4 shrink-0" /> <span>Home</span></button>;
}

function FilterPanel({ title, first, secondTitle, second }) {
  return (
    <aside className="sticky top-20 self-start rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#202624] max-lg:static">
      <FilterGroup title={title} items={first} />
      <FilterGroup title={secondTitle} items={second} />
      <FilterGroup title="Availability" items={["Available now", "Include low stock", "All products"]} radio />
    </aside>
  );
}

function FilterGroup({ title, items, radio = false }) {
  return (
    <div className="border-b border-slate-200 py-5 first:pt-0 last:border-b-0 dark:border-slate-700">
      <h2 className="mb-3 text-sm font-bold text-slate-700 dark:text-stone-100">{title}</h2>
      <div className="grid gap-2">
        {items.map((item, index) => <label key={item} className="flex min-w-0 items-start gap-2 break-words leading-snug text-slate-500 dark:text-stone-400"><input type={radio ? "radio" : "checkbox"} name={title} defaultChecked={index < 2} className="mt-0.5 shrink-0 accent-forest" /> <span className="min-w-0">{item}</span></label>)}
      </div>
    </div>
  );
}

function CatalogToolbar({ title, subtitle, sort, setSort }) {
  return (
    <div className="mb-5 flex min-w-0 items-center justify-between gap-5 max-sm:flex-col max-sm:items-start">
      <div className="min-w-0"><h2 className="break-words text-2xl font-bold leading-tight">{title}</h2><p className="break-words text-slate-500 dark:text-stone-400">{subtitle}</p></div>
      <div className="flex flex-wrap gap-2 max-sm:w-full">
        {["featured", "newest", "price"].map((key) => (
          <button key={key} onClick={() => setSort(key)} className={`min-w-0 rounded-full border px-4 py-2 capitalize leading-tight max-sm:flex-1 ${sort === key ? "border-forest bg-forest text-white" : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-[#202624] dark:text-stone-300"}`}>{key}</button>
        ))}
      </div>
    </div>
  );
}

function CartPage({ cart, setCart }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const updateQty = (id, delta) => setCart((items) => items.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));

  return (
    <>
      <CheckoutHero title="Your Cart" subtitle="Review your selected timber products before placing the order." active="Cart" back="/shop" />
      <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(280px,340px)] gap-8 pb-16 max-lg:grid-cols-1">
        <div className="grid gap-6">
          <Panel title="Order Items" subtitle={`${cart.length} items from verified vendors`} action={<button onClick={() => setCart([])} className="font-bold text-forest">Clear Cart</button>}>
            {cart.map((item) => (
              <article key={item.id} className="grid grid-cols-[150px_minmax(0,1fr)_auto] items-center gap-5 border-t border-slate-200 py-5 dark:border-slate-700 max-sm:grid-cols-[96px_minmax(0,1fr)]">
                <div className="h-32 overflow-hidden rounded-lg bg-slate-200"><ProductCardMedia product={item} /></div>
                <div className="min-w-0">
                  <h3 className="break-words font-semibold leading-snug">{item.name}</h3>
                  <p className="break-words text-sm uppercase leading-snug text-slate-500 dark:text-stone-400">Vendor: {item.vendor}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button onClick={() => updateQty(item.id, -1)} className="qty-btn">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="qty-btn">+</button>
                  </div>
                </div>
                <div className="grid justify-items-end gap-4 max-sm:col-span-2 max-sm:justify-items-start">
                  <strong className="break-words leading-tight text-forest dark:text-emerald-200">{formatPrice(item.price * item.quantity)}</strong>
                  <button onClick={() => setCart((items) => items.filter((row) => row.id !== item.id))} className="rounded-full border border-rose-200 p-2 text-rose-500"><X className="h-4 w-4" /></button>
                </div>
              </article>
            ))}
          </Panel>
        </div>
        <OrderSummary subtotal={subtotal} cta="Proceed to Checkout" next="/delivery" />
      </section>
      <Footer />
    </>
  );
}

function ProductCardMedia({ product }) {
  if (product.crop) return <CroppedImage crop={product.crop} label={product.name} />;
  return <div className="h-full bg-gradient-to-br from-wood to-slate-300" />;
}

function CheckoutHero({ title, subtitle, active, back }) {
  const steps = ["Cart", "Delivery", "Payment"];
  const links = { Cart: "/cart", Delivery: "/delivery", Payment: "/payment" };
  const activeIndex = steps.indexOf(active);
  return (
    <section className="page-shell grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 py-14 max-lg:grid-cols-1">
      <div className="min-w-0"><button onClick={() => navigate(back)} className="mb-6 inline-flex items-center gap-2 font-semibold text-forest dark:text-emerald-200"><ArrowLeft className="h-4 w-4 shrink-0" /> Back</button><p className="eyebrow">Secure Checkout</p><h1 className="break-words text-4xl font-bold leading-tight sm:text-5xl">{title}</h1><p className="mt-4 max-w-2xl break-words text-lg leading-relaxed text-slate-500 dark:text-stone-400">{subtitle}</p></div>
      <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-[#202624]">
        {steps.map((step, index) => <button key={step} onClick={() => navigate(links[step])} className={`min-w-0 rounded-full px-4 py-2 text-sm font-bold leading-tight ${index <= activeIndex ? "bg-forest text-white" : "text-slate-500 dark:text-stone-400"}`}>{step}</button>)}
      </div>
    </section>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-[#202624]">
      <div className="mb-6 flex min-w-0 justify-between gap-5 max-sm:flex-col"><div className="min-w-0"><h2 className="break-words text-2xl font-bold leading-tight">{title}</h2>{subtitle && <p className="break-words text-slate-500 dark:text-stone-400">{subtitle}</p>}</div>{action && <div className="shrink-0">{action}</div>}</div>
      {children}
    </section>
  );
}

function OrderSummary({ subtotal, cta, next }) {
  const delivery = subtotal ? 7500 : 0;
  const assurance = subtotal ? 3500 : 0;
  return (
    <aside className="sticky top-20 self-start rounded-lg border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-[#202624] max-lg:static">
      <h2 className="text-2xl font-bold">Order Summary</h2>
      {[["Subtotal", subtotal], ["Delivery", delivery], ["Platform assurance", assurance]].map(([label, value]) => <div key={label} className="flex min-w-0 justify-between gap-4 border-b border-slate-200 py-4 dark:border-slate-700"><span className="min-w-0 break-words text-slate-500 dark:text-stone-400">{label}</span><strong className="shrink-0">{formatPrice(value)}</strong></div>)}
      <div className="flex min-w-0 justify-between gap-4 py-6 text-lg font-bold"><span>Total</span><strong className="shrink-0 text-forest dark:text-emerald-200">{formatPrice(subtotal + delivery + assurance)}</strong></div>
      <button onClick={() => navigate(next)} className="grid min-h-14 w-full place-items-center rounded-md bg-forest font-bold text-white">{cta}</button>
      <p className="mt-4 text-sm text-slate-500 dark:text-stone-400">Payments are held until vendor stock and delivery readiness are confirmed.</p>
    </aside>
  );
}

function DeliveryPage() {
  return (
    <>
      <CheckoutHero title="Delivery Details" subtitle="Confirm receiving address, delivery window, and handling instructions." active="Delivery" back="/cart" />
      <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(280px,340px)] gap-8 pb-16 max-lg:grid-cols-1">
        <Panel title="Shipping Address" subtitle="Large furniture needs an accessible delivery entrance."><CheckoutGrid /></Panel>
        <OrderSummary subtotal={357500} cta="Continue to Payment" next="/payment" />
      </section>
    </>
  );
}

function PaymentPage() {
  return (
    <>
      <CheckoutHero title="Payment" subtitle="Choose a payment method. WoodVerse holds payment until vendors confirm readiness." active="Payment" back="/delivery" />
      <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(280px,340px)] gap-8 pb-16 max-lg:grid-cols-1">
        <div className="grid gap-6"><Panel title="Payment Method" subtitle="Select how you want to complete this order."><PaymentOptions /></Panel><Panel title="Card Details" subtitle="Use test information for this prototype."><CheckoutGrid payment /></Panel></div>
        <OrderSummary subtotal={357500} cta="Pay LKR 368,500" next="/payment" />
      </section>
    </>
  );
}

function CheckoutGrid({ payment = false }) {
  const fields = payment ? ["Card number", "Name on card", "Expiry", "CVC"] : ["Full name", "Phone number", "Street address", "District"];
  return <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">{fields.map((field) => <label key={field} className="grid min-w-0 gap-2 break-words font-bold leading-snug text-slate-600 dark:text-stone-300">{field}<input className="min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-3 outline-none dark:border-slate-700 dark:bg-[#1d2422]" placeholder={field} /></label>)}</div>;
}

function PaymentOptions() {
  return <div className="grid gap-3">{["Credit or debit card", "Bank transfer", "Cash on delivery deposit"].map((item, index) => <label key={item} className="flex min-w-0 items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 leading-snug dark:border-slate-700 dark:bg-[#1d2422]"><input type="radio" name="payment" defaultChecked={index === 0} className="mt-1 shrink-0 accent-forest" /><CreditCard className="h-5 w-5 shrink-0 text-forest" /><span className="min-w-0 break-words">{item}</span></label>)}</div>;
}

function ChatbotPage() {
  const [messages, setMessages] = useState([
    ["assistant", "Ayubowan! How can I help you with your furniture order today?"],
    ["user", "I'd like to check the shipping cost for Kandy."],
    ["assistant", "Delivery to Kandy for the Maharaja Bed Frame is LKR 4,500. Would you like me to add this to your quote?"],
  ]);
  const [input, setInput] = useState("");
  const send = (text) => {
    if (!text.trim()) return;
    setMessages((rows) => [...rows, ["user", text], ["assistant", "I can help with product search, delivery estimates, payment options, vendor contact, and order tracking."]]);
    setInput("");
  };
  return (
    <main className="page-shell grid min-h-[calc(100svh-56px)] grid-cols-[230px_minmax(0,1fr)_260px] gap-6 py-7 lg:min-h-[calc(100vh-56px)] max-lg:grid-cols-1">
      <aside className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#202624] max-sm:hidden"><h1 className="break-words text-xl font-bold leading-tight text-forest dark:text-emerald-200">WoodVerse Assistant</h1><button onClick={() => setMessages(messages.slice(0, 1))} className="mt-8 flex w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-forest px-3 py-3 font-bold leading-tight text-white"><Plus className="h-5 w-5 shrink-0" /> <span className="min-w-0 break-words">New Chat</span></button></aside>
      <section className="grid overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#202624]">
        <header className="flex min-w-0 items-center justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-700"><h2 className="min-w-0 break-words text-xl font-bold leading-tight text-forest dark:text-emerald-200">WoodVerse Assistant</h2><button className="shrink-0" onClick={() => navigate("/")}><X /></button></header>
        <div className="grid gap-4 bg-[#fffdf9] p-6 dark:bg-[#1d2422]">
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">{["Track My Order", "Find Teak Furniture", "Check Production", "Help with Payment"].map((prompt) => <button onClick={() => send(prompt)} key={prompt} className="flex min-w-0 items-start gap-2 rounded-lg border border-emerald-200 p-4 text-left font-bold leading-snug text-forest dark:border-emerald-900 dark:text-emerald-200"><Search className="h-5 w-5 shrink-0" /><span className="min-w-0 break-words">{prompt}</span></button>)}</div>
          {messages.map(([role, text], index) => <article key={index} className={`max-w-[92%] min-w-0 sm:max-w-[78%] ${role === "user" ? "justify-self-end" : ""}`}><p className={`break-words rounded-lg p-4 leading-relaxed ${role === "user" ? "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-stone-100" : "bg-moss text-emerald-50"}`}>{text}</p><time className="text-xs text-slate-500 dark:text-stone-400">10:02 AM</time></article>)}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); send(input); }} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-slate-200 p-5 dark:border-slate-700"><input value={input} onChange={(event) => setInput(event.target.value)} className="min-w-0 rounded-lg bg-blue-50 px-4 outline-none dark:bg-[#1d2422]" placeholder="Type your message..." /><button className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-forest text-white"><Send className="h-5 w-5" /></button></form>
      </section>
      <aside className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#202624] max-lg:hidden"><h2 className="text-xl font-bold">Active Order</h2><div className="mt-5 overflow-hidden rounded-lg"><CroppedImage crop={crop.bed} src="/assets/bedroom-soft-neutral.png" label="Active order" className="h-40" /></div><button onClick={() => navigate("/cart")} className="mt-6 w-full rounded-md bg-forest py-3 font-bold text-white">Open Cart</button></aside>
    </main>
  );
}

function LoginPage({ onAuthSuccess }) {
  const accountTypes = [
    { id: "customer", label: "Customer", icon: UserRound },
    { id: "vendor", label: "Vendor", icon: Store },
    { id: "supplier", label: "Supplier", icon: Warehouse },
  ];
  const [accountType, setAccountType] = useState(accountTypes[0].id);
  const [authMode, setAuthMode] = useState("signin");
  const isRegister = authMode === "register";

  return (
    <AuthShell>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (isRegister) {
              setAuthMode("signin");
              return;
            }
            onAuthSuccess();
            navigate("/");
          }}
          className="flex min-h-[760px] flex-col px-16 py-16 max-lg:min-h-0 max-sm:px-7 max-sm:py-10"
        >
          <button type="button" onClick={() => navigate("/")} className="flex w-fit min-w-0 items-center gap-3 text-left">
            <Sofa className="h-9 w-9 shrink-0 text-[#164f40]" strokeWidth={2.4} />
            <span className="break-words text-[34px] font-extrabold leading-none text-[#164f40] max-sm:text-3xl">WoodVerse</span>
          </button>

          <div className="mt-9">
            <h1 className="break-words text-[34px] font-extrabold leading-tight tracking-normal text-[#151d28] max-sm:text-3xl">{isRegister ? "Create Your Account" : "Welcome Back"}</h1>
            <p className="mt-2 break-words text-base leading-relaxed text-[#4b514f]">
              {isRegister ? "Create an account to save locally crafted furniture and manage orders." : "Sign in to continue exploring locally crafted furniture."}
            </p>
          </div>

          {isRegister ? (
            <>
              <fieldset className="mt-9">
                <legend className="mb-4 text-sm font-bold text-[#3e4744]">Create account as</legend>
                <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
                  {accountTypes.map((item) => {
                    const Icon = item.icon;
                    const selected = accountType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAccountType(item.id)}
                        className={`grid min-h-[86px] min-w-0 place-items-center content-center gap-2 rounded-md border px-3 text-center transition ${
                          selected ? "border-[#164f40] bg-[#edf6ef] text-[#164f40]" : "border-[#c9d4cf] bg-white text-[#4b514f] hover:border-[#164f40]"
                        }`}
                        aria-pressed={selected}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="break-words text-sm font-bold leading-tight">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-11 grid grid-cols-2 gap-x-5 gap-y-5 max-sm:grid-cols-1">
                <AuthField label="First Name" placeholder="First name" autoComplete="given-name" />
                <AuthField label="Last Name" placeholder="Last name" autoComplete="family-name" />
                <AuthField label="Email Address" placeholder="name@company.com" type="email" autoComplete="email" icon={Mail} className="sm:col-span-2" />
                <AuthField label="Password" placeholder="••••••••" type="password" autoComplete="new-password" icon={Lock} />
                <AuthField label="Confirm Password" placeholder="••••••••" type="password" autoComplete="new-password" icon={Lock} />
              </div>

              <label className="mt-6 flex min-w-0 items-start gap-3 text-sm leading-relaxed text-[#4b514f]">
                <input required type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 rounded border-[#d0d8d3] accent-[#164f40]" />
                <span className="min-w-0 break-words">
                  I agree to the <button type="button" className="text-[#8b5633]">Terms and Conditions</button> and the <button type="button" className="text-[#8b5633]">Privacy Policy</button>.
                </span>
              </label>
            </>
          ) : (
            <>
              <div className="mt-11 grid gap-7">
                <AuthField label="Email Address" placeholder="name@company.com" type="email" autoComplete="email" icon={Mail} />
                <AuthField label="Password" placeholder="••••••••" type="password" autoComplete="current-password" icon={Lock} trailingIcon={Eye} labelAction={<button type="button" onClick={() => navigate("/forgot-password")} className="font-semibold text-[#164f40]">Forgot Password?</button>} />
              </div>

              <div className="mt-6 flex min-w-0 items-center justify-between gap-4 text-sm max-sm:flex-col max-sm:items-start">
                <label className="flex min-w-0 items-start gap-3 leading-relaxed text-[#4b514f]">
                  <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 rounded border-[#d0d8d3] accent-[#164f40]" />
                  <span className="min-w-0 break-words">Remember this device for 30 days</span>
                </label>
              </div>
            </>
          )}

          <button className="mt-9 inline-flex min-h-[68px] w-full min-w-0 items-center justify-center gap-3 rounded-md bg-[#164f40] px-4 text-base font-bold text-white shadow-sm">
            <span>{isRegister ? "Create Account" : "Sign In"}</span>
            <ArrowRight className="h-6 w-6 shrink-0" />
          </button>

          <div className="my-9 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 text-xs font-semibold uppercase text-[#6c736f]">
            <span className="h-px bg-[#ecece8]" />
            <span>or</span>
            <span className="h-px bg-[#ecece8]" />
          </div>

          <button
            type="button"
            onClick={() => setAuthMode(isRegister ? "signin" : "register")}
            className="min-h-[70px] rounded-md border border-[#8b5633] bg-white px-4 font-bold text-[#8b5633]"
          >
            {isRegister ? "Sign In Instead" : "Create New Account"}
          </button>

          <p className="mt-auto pt-16 text-xs font-semibold leading-snug tracking-wide text-[#7b827e] max-lg:pt-10">
            © 2024 WoodVerse Sri Lanka. Built for sustainable timber craftsmanship.
          </p>
        </form>
    </AuthShell>
  );
}

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <AuthShell>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
        className="flex min-h-[760px] flex-col px-16 py-16 max-lg:min-h-0 max-sm:px-7 max-sm:py-10"
      >
        <button type="button" onClick={() => navigate("/")} className="flex w-fit min-w-0 items-center gap-3 text-left">
          <Sofa className="h-9 w-9 shrink-0 text-[#164f40]" strokeWidth={2.4} />
          <span className="break-words text-[34px] font-extrabold leading-none text-[#164f40] max-sm:text-3xl">WoodVerse</span>
        </button>

        <div className="mt-9">
          <h1 className="break-words text-[34px] font-extrabold leading-tight tracking-normal text-[#151d28] max-sm:text-3xl">Forgot Password?</h1>
          <p className="mt-2 break-words text-base leading-relaxed text-[#4b514f]">
            Enter your email address and we will send reset instructions for your WoodVerse account.
          </p>
        </div>

        <div className="mt-11 grid gap-7">
          <AuthField label="Email Address" placeholder="name@company.com" type="email" autoComplete="email" icon={Mail} />
        </div>

        {sent && (
          <div className="mt-6 rounded-md border border-[#b9d8c8] bg-[#edf6ef] p-4 text-sm font-semibold leading-relaxed text-[#164f40]">
            Password reset instructions have been sent to your email address.
          </div>
        )}

        <button className="mt-9 inline-flex min-h-[68px] w-full min-w-0 items-center justify-center gap-3 rounded-md bg-[#164f40] px-4 text-base font-bold text-white shadow-sm">
          <span>Send Reset Link</span>
          <ArrowRight className="h-6 w-6 shrink-0" />
        </button>

        <div className="my-9 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 text-xs font-semibold uppercase text-[#6c736f]">
          <span className="h-px bg-[#ecece8]" />
          <span>or</span>
          <span className="h-px bg-[#ecece8]" />
        </div>

        <button type="button" onClick={() => navigate("/login")} className="min-h-[70px] rounded-md border border-[#8b5633] bg-white px-4 font-bold text-[#8b5633]">
          Back to Sign In
        </button>

        <p className="mt-auto pt-16 text-xs font-semibold leading-snug tracking-wide text-[#7b827e] max-lg:pt-10">
          © 2024 WoodVerse Sri Lanka. Built for sustainable timber craftsmanship.
        </p>
      </form>
    </AuthShell>
  );
}

function AuthShell({ children }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f1e8] px-5 py-10 text-[#151d28]">
      <section className="grid w-full max-w-[1150px] grid-cols-[minmax(360px,520px)_minmax(0,1fr)] overflow-hidden rounded-xl border border-[#e4e1da] bg-white shadow-[0_2px_10px_rgba(32,30,25,0.14)] max-lg:max-w-[620px] max-lg:grid-cols-1">
        {children}
        <aside className="relative min-h-[760px] overflow-hidden bg-[#203b31] max-lg:hidden">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,27,22,0.04),rgba(10,27,22,0.58)),url('/assets/auth-plant-table.png')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,41,32,0.1),rgba(12,41,32,0.32))]" />
          <article className="absolute bottom-6 left-6 right-6 grid grid-cols-[minmax(0,1fr)_80px] gap-6 rounded-xl bg-white/88 p-6 shadow-xl backdrop-blur max-xl:grid-cols-1">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-[#164f40]">Masterpiece Series</p>
              <h2 className="break-words text-xl font-extrabold leading-tight text-[#151d28]">Sustainable Teak Living Set</h2>
              <p className="mt-2 line-clamp-2 break-words text-sm leading-relaxed text-[#4b514f]">Handcrafted in Moratuwa using Grade-A reclaimed timber. A perfect blend of heritage and contemporary comfort.</p>
            </div>
            <div className="grid min-h-16 place-items-center rounded-md bg-[#164f40] px-4 text-center font-extrabold text-white">
              <span className="text-xs">LKR</span>
              <strong className="text-2xl leading-none">185k</strong>
            </div>
          </article>
        </aside>
      </section>
    </main>
  );
}

function AuthField({ label, placeholder, type = "text", autoComplete, icon: Icon, trailingIcon: TrailingIcon, labelAction, className = "" }) {
  return (
    <label className={`grid min-w-0 gap-2 text-sm font-bold text-[#3e4744] ${className}`}>
      <span className="flex min-w-0 items-center justify-between gap-4">
        <span className="min-w-0 break-words">{label}</span>
        {labelAction}
      </span>
      <span className="flex min-h-[50px] min-w-0 items-center gap-4 rounded-md border border-[#c9d4cf] bg-[#eaf3ff] px-5 focus-within:border-[#164f40]">
        {Icon && <Icon className="h-5 w-5 shrink-0 text-[#b4beb9]" />}
        <input
          type={type}
          required
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent text-base text-[#151d28] outline-none placeholder:text-[#697482]"
          placeholder={placeholder}
        />
        {TrailingIcon && <TrailingIcon className="h-5 w-5 shrink-0 text-[#b4beb9]" />}
      </span>
    </label>
  );
}

function ProfilePage({ isLoggedIn, onLogout }) {
  const defaultProfile = {
    fullName: "WoodVerse Customer",
    email: "customer@woodverse.lk",
    phone: "+94 77 245 9012",
    city: "Colombo, Sri Lanka",
    notes: "Call before delivery. Prefer weekend drop-offs.",
  };
  const [profileInfo, setProfileInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-profile-info")) || defaultProfile;
    } catch {
      return defaultProfile;
    }
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [paymentPreferences, setPaymentPreferences] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-payment-preferences")) || {
        defaultMethod: "card",
        saveForCheckout: true,
      };
    } catch {
      return {
        defaultMethod: "card",
        saveForCheckout: true,
      };
    }
  });
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [deliveryAddresses, setDeliveryAddresses] = useState([
    {
      id: "home",
      label: "Home",
      status: "Default",
      name: "WoodVerse Customer",
      line: "42 Lake View Road, Colombo 05",
      details: "Colombo, Western Province 00500",
      phone: "+94 77 245 9012",
    },
    {
      id: "workshop",
      label: "Workshop",
      status: "Backup",
      name: "Urban Log Studio",
      line: "18 Timber Lane, Moratuwa",
      details: "Moratuwa, Western Province 10400",
      phone: "+94 71 882 4410",
    },
  ]);

  const saveDeliveryAddress = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const city = formData.get("city").trim();
    const postalCode = formData.get("postalCode").trim();
    const savedAddress = {
      id: editingAddress?.id || `address-${Date.now()}`,
      label: formData.get("label").trim(),
      status: editingAddress?.status || "New",
      name: formData.get("name").trim(),
      line: formData.get("line").trim(),
      details: postalCode ? `${city} ${postalCode}` : city,
      phone: formData.get("phone").trim(),
    };
    setDeliveryAddresses((addresses) => editingAddress
      ? addresses.map((address) => (address.id === editingAddress.id ? savedAddress : address))
      : [...addresses, savedAddress]);
    event.currentTarget.reset();
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const useDeliveryAddress = (id) => {
    setDeliveryAddresses((addresses) => addresses.map((address) => ({
      ...address,
      status: address.id === id ? "Default" : address.status === "Default" ? "Backup" : address.status,
    })));
  };

  const editDeliveryAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const closeDeliveryAddressForm = () => {
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const saveProfileInfo = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextProfileInfo = {
      fullName: formData.get("fullName").trim(),
      email: formData.get("email").trim(),
      phone: formData.get("phone").trim(),
      city: formData.get("city").trim(),
      notes: formData.get("notes").trim(),
    };
    setProfileInfo(nextProfileInfo);
    setProfileSaved(true);
    try {
      localStorage.setItem("woodverse-profile-info", JSON.stringify(nextProfileInfo));
    } catch {}
  };

  const updatePaymentPreference = (nextPreferences) => {
    setPaymentPreferences(nextPreferences);
    setPaymentSaved(true);
    try {
      localStorage.setItem("woodverse-payment-preferences", JSON.stringify(nextPreferences));
    } catch {}
  };

  const selectPaymentMethod = (methodId) => {
    updatePaymentPreference({
      ...paymentPreferences,
      defaultMethod: methodId,
    });
  };

  const toggleSavedPayment = () => {
    updatePaymentPreference({
      ...paymentPreferences,
      saveForCheckout: !paymentPreferences.saveForCheckout,
    });
  };

  if (!isLoggedIn) {
    return (
      <>
        <section className="page-shell grid min-h-[calc(100svh-56px)] place-items-center py-14 text-center">
          <div className="max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-700 dark:bg-[#202624]">
            <UserRound className="mx-auto h-10 w-10 text-forest dark:text-emerald-200" />
            <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-stone-100">Sign in to view your profile</h1>
            <p className="mt-3 leading-relaxed text-slate-500 dark:text-stone-400">Your WoodVerse profile appears here after login.</p>
            <button onClick={() => navigate("/login")} className="mt-6 rounded-md bg-forest px-6 py-3 font-bold text-white">Login</button>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <section className="page-shell grid grid-cols-[minmax(0,1fr)_320px] gap-8 py-14 max-lg:grid-cols-1">
        <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-700 dark:bg-[#202624]">
          <div className="flex min-w-0 items-center gap-5 max-sm:flex-col max-sm:items-start">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-forest text-2xl font-extrabold text-white">WV</span>
            <div className="min-w-0">
              <p className="eyebrow mb-3">My Profile</p>
              <h1 className="break-words text-3xl font-bold leading-tight text-slate-800 dark:text-stone-100">{profileInfo.fullName}</h1>
              <p className="mt-2 break-words text-slate-500 dark:text-stone-400">{profileInfo.email}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            {[
              ["Active orders", "2"],
              ["Saved items", "8"],
              ["Support tickets", "1"],
            ].map(([label, value]) => (
              <article key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-[#1d2422]">
                <strong className="text-2xl text-forest dark:text-emerald-200">{value}</strong>
                <p className="mt-2 break-words text-sm font-bold text-slate-600 dark:text-stone-300">{label}</p>
              </article>
            ))}
          </div>

          <section className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-700">
            <div className="mb-6 flex min-w-0 items-start justify-between gap-5 max-sm:flex-col">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold leading-tight text-slate-800 dark:text-stone-100">Personal Information</h2>
                <p className="mt-1 break-words leading-snug text-slate-500 dark:text-stone-400">Manage the contact details used for orders, delivery updates, and support.</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold uppercase text-forest dark:border-emerald-900 dark:bg-[#1d2422] dark:text-emerald-200">Verified</span>
            </div>

            <form key={JSON.stringify(profileInfo)} onSubmit={saveProfileInfo} onChange={() => setProfileSaved(false)} className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
              <ProfileField label="Full name" name="fullName" defaultValue={profileInfo.fullName} icon={UserRound} />
              <ProfileField label="Email address" name="email" defaultValue={profileInfo.email} type="email" icon={Mail} />
              <ProfileField label="Phone number" name="phone" defaultValue={profileInfo.phone} type="tel" icon={Phone} />
              <ProfileField label="City / District" name="city" defaultValue={profileInfo.city} icon={MapPin} />
              <label className="grid min-w-0 gap-2 sm:col-span-2">
                <span className="text-sm font-bold text-slate-700 dark:text-stone-100">Delivery notes</span>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={profileInfo.notes}
                  className="min-w-0 resize-none rounded-md border border-slate-200 bg-blue-50 px-4 py-3 leading-relaxed text-slate-700 outline-none focus:border-forest dark:border-slate-700 dark:bg-[#1d2422] dark:text-stone-100"
                />
              </label>
              <div className="flex min-w-0 items-center justify-end gap-3 sm:col-span-2 max-sm:flex-col">
                {profileSaved && <p className="mr-auto break-words text-sm font-bold text-forest dark:text-emerald-200 max-sm:w-full">Personal information saved.</p>}
                <button type="reset" className="min-h-11 rounded-md border border-slate-200 px-5 font-bold text-slate-600 dark:border-slate-700 dark:text-stone-300 max-sm:w-full">Cancel</button>
                <button type="submit" className="min-h-11 rounded-md bg-forest px-5 font-bold text-white max-sm:w-full">Save Changes</button>
              </div>
            </form>
          </section>

          <section className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-700">
            <div className="mb-6 flex min-w-0 items-start justify-between gap-5 max-sm:flex-col">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold leading-tight text-slate-800 dark:text-stone-100">Delivery Addresses</h2>
                <p className="mt-1 break-words leading-snug text-slate-500 dark:text-stone-400">Choose where WoodVerse orders should be delivered and keep backup addresses ready.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setShowAddressForm((visible) => !visible);
                }}
                className="inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-md bg-forest px-4 font-bold leading-tight text-white max-sm:w-full"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span className="min-w-0 break-words">{showAddressForm && !editingAddress ? "Close Form" : "Add Address"}</span>
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={saveDeliveryAddress} className="mb-5 grid grid-cols-2 gap-4 rounded-lg border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-[#1d2422] max-sm:grid-cols-1">
                <div className="min-w-0 sm:col-span-2">
                  <h3 className="break-words text-lg font-bold leading-tight text-slate-800 dark:text-stone-100">{editingAddress ? "Edit Address" : "Add Address"}</h3>
                  <p className="mt-1 break-words text-sm leading-snug text-slate-500 dark:text-stone-400">{editingAddress ? "Update the selected delivery address." : "Add a new delivery location to your profile."}</p>
                </div>
                <AddressField label="Address label" name="label" placeholder="Home, Office, Workshop" defaultValue={editingAddress?.label} />
                <AddressField label="Recipient name" name="name" placeholder="Full name" defaultValue={editingAddress?.name} />
                <AddressField label="Street address" name="line" placeholder="Street, building, apartment" defaultValue={editingAddress?.line} className="sm:col-span-2" />
                <AddressField label="City / District" name="city" placeholder="Colombo, Western Province" defaultValue={editingAddress?.details} />
                <AddressField label="Postal code" name="postalCode" placeholder="00500" required={false} />
                <AddressField label="Phone number" name="phone" placeholder="+94 77 000 0000" type="tel" defaultValue={editingAddress?.phone} className="sm:col-span-2" />
                <div className="flex justify-end gap-3 sm:col-span-2 max-sm:flex-col">
                  <button type="button" onClick={closeDeliveryAddressForm} className="min-h-10 rounded-md border border-slate-200 bg-white px-4 font-bold text-slate-600 dark:border-slate-700 dark:bg-[#202624] dark:text-stone-300">Cancel</button>
                  <button type="submit" className="min-h-10 rounded-md bg-forest px-4 font-bold text-white">{editingAddress ? "Update Address" : "Save Address"}</button>
                </div>
              </form>
            )}

            <div className="grid gap-4">
              {deliveryAddresses.map((address) => (
                <article key={address.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-[#1d2422] max-sm:grid-cols-1">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-forest shadow-sm dark:bg-[#202624] dark:text-emerald-200">
                    <Home className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h3 className="break-words font-bold leading-tight text-slate-800 dark:text-stone-100">{address.label}</h3>
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-extrabold uppercase text-slate-500 dark:border-slate-700 dark:bg-[#202624] dark:text-stone-400">{address.status}</span>
                    </div>
                    <p className="mt-2 break-words font-semibold leading-snug text-slate-700 dark:text-stone-200">{address.name}</p>
                    <p className="mt-1 break-words leading-snug text-slate-500 dark:text-stone-400">{address.line}</p>
                    <p className="break-words leading-snug text-slate-500 dark:text-stone-400">{address.details}</p>
                    <p className="mt-2 break-words text-sm font-bold leading-snug text-forest dark:text-emerald-200">{address.phone}</p>
                  </div>
                  <div className="flex shrink-0 items-start gap-2 max-sm:w-full">
                    <button type="button" onClick={() => editDeliveryAddress(address)} className="min-h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 dark:border-slate-700 dark:bg-[#202624] dark:text-stone-300 max-sm:flex-1">Edit</button>
                    <button type="button" onClick={() => useDeliveryAddress(address.id)} disabled={address.status === "Default"} className="min-h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-forest disabled:cursor-default disabled:text-slate-400 dark:border-slate-700 dark:bg-[#202624] dark:text-emerald-200 dark:disabled:text-stone-500 max-sm:flex-1">{address.status === "Default" ? "Using" : "Use"}</button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-700">
            <div className="mb-6 flex min-w-0 items-start justify-between gap-5 max-sm:flex-col">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold leading-tight text-slate-800 dark:text-stone-100">Payment Preferences</h2>
                <p className="mt-1 break-words leading-snug text-slate-500 dark:text-stone-400">Choose the default payment method used during checkout.</p>
              </div>
              {paymentSaved && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold uppercase text-forest dark:border-emerald-900 dark:bg-[#1d2422] dark:text-emerald-200">Saved</span>}
            </div>

            <div className="grid gap-4">
              {[
                { id: "card", title: "Credit or debit card", detail: "Visa ending 4821", helper: "Fastest checkout option" },
                { id: "bank", title: "Bank transfer", detail: "Manual confirmation", helper: "Best for large furniture orders" },
                { id: "cod", title: "Cash on delivery deposit", detail: "Pay deposit at delivery handoff", helper: "Available in selected districts" },
              ].map((method) => {
                const active = paymentPreferences.defaultMethod === method.id;
                return (
                  <article key={method.id} className={`grid grid-cols-[auto_minmax(0,1fr)_auto] gap-4 rounded-lg border p-5 dark:bg-[#1d2422] max-sm:grid-cols-1 ${active ? "border-forest bg-emerald-50/70 dark:border-emerald-700" : "border-slate-200 bg-slate-50 dark:border-slate-700"}`}>
                    <span className={`grid h-11 w-11 place-items-center rounded-full shadow-sm ${active ? "bg-forest text-white" : "bg-white text-forest dark:bg-[#202624] dark:text-emerald-200"}`}>
                      <CreditCard className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="break-words font-bold leading-tight text-slate-800 dark:text-stone-100">{method.title}</h3>
                        {active && <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[11px] font-extrabold uppercase text-forest dark:border-emerald-900 dark:bg-[#202624] dark:text-emerald-200">Default</span>}
                      </div>
                      <p className="mt-2 break-words font-semibold leading-snug text-slate-700 dark:text-stone-200">{method.detail}</p>
                      <p className="mt-1 break-words leading-snug text-slate-500 dark:text-stone-400">{method.helper}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectPaymentMethod(method.id)}
                      disabled={active}
                      className="min-h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-forest disabled:cursor-default disabled:text-slate-400 dark:border-slate-700 dark:bg-[#202624] dark:text-emerald-200 dark:disabled:text-stone-500 max-sm:w-full"
                    >
                      {active ? "Using" : "Use"}
                    </button>
                  </article>
                );
              })}
            </div>

            <label className="mt-5 flex min-w-0 items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#1d2422]">
              <input type="checkbox" checked={paymentPreferences.saveForCheckout} onChange={toggleSavedPayment} className="mt-1 shrink-0 accent-forest" />
              <span className="min-w-0">
                <span className="block break-words font-bold leading-snug text-slate-700 dark:text-stone-100">Remember payment preference for checkout</span>
                <span className="mt-1 block break-words text-sm leading-snug text-slate-500 dark:text-stone-400">WoodVerse will preselect this method when you place your next order.</span>
              </span>
            </label>
          </section>

          <section className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-700">
            <div className="mb-6 flex min-w-0 items-start justify-between gap-5 max-sm:flex-col">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold leading-tight text-slate-800 dark:text-stone-100">Order History</h2>
                <p className="mt-1 break-words leading-snug text-slate-500 dark:text-stone-400">Review recent WoodVerse orders, delivery status, and order totals.</p>
              </div>
              <button onClick={() => navigate("/shop")} className="inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 font-bold leading-tight text-forest dark:border-slate-700 dark:bg-[#202624] dark:text-emerald-200 max-sm:w-full">
                <span className="min-w-0 break-words">Shop Again</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            </div>

            <div className="grid gap-4">
              {[
                {
                  id: "WV-10482",
                  date: "Jul 24, 2026",
                  status: "In production",
                  statusTone: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900",
                  items: ["Walnut Task Table", "Teak Desk Tray"],
                  total: 87000,
                  delivery: "Estimated Aug 2, 2026",
                  payment: "Credit or debit card",
                },
                {
                  id: "WV-10391",
                  date: "Jul 18, 2026",
                  status: "Delivered",
                  statusTone: "bg-emerald-50 text-forest border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900",
                  items: ["Housewarming Gift Set", "Bamboo Coaster Set"],
                  total: 28800,
                  delivery: "Delivered Jul 21, 2026",
                  payment: "Bank transfer",
                },
                {
                  id: "WV-10277",
                  date: "Jun 30, 2026",
                  status: "Cancelled",
                  statusTone: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900",
                  items: ["Heritage Sideboard"],
                  total: 112500,
                  delivery: "Cancelled before dispatch",
                  payment: "Cash on delivery deposit",
                },
              ].map((order) => {
                const expanded = expandedOrder === order.id;
                return (
                  <article key={order.id} className="rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-[#1d2422]">
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-4 max-sm:grid-cols-1">
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-forest shadow-sm dark:bg-[#202624] dark:text-emerald-200">
                        <PackageCheck className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h3 className="break-words font-bold leading-tight text-slate-800 dark:text-stone-100">{order.id}</h3>
                          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-extrabold uppercase ${order.statusTone}`}>{order.status}</span>
                        </div>
                        <p className="mt-2 break-words text-sm font-semibold leading-snug text-slate-500 dark:text-stone-400">{order.date}</p>
                        <p className="mt-1 break-words leading-snug text-slate-700 dark:text-stone-200">{order.items.join(", ")}</p>
                      </div>
                      <div className="grid justify-items-end gap-2 max-sm:justify-items-stretch">
                        <strong className="break-words text-right text-lg leading-tight text-forest dark:text-emerald-200 max-sm:text-left">{formatPrice(order.total)}</strong>
                        <button type="button" onClick={() => setExpandedOrder(expanded ? null : order.id)} className="min-h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-forest dark:border-slate-700 dark:bg-[#202624] dark:text-emerald-200">
                          {expanded ? "Hide Details" : "View Details"}
                        </button>
                      </div>
                    </div>
                    {expanded && (
                      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-200 pt-5 dark:border-slate-700 max-sm:grid-cols-1">
                        <OrderDetail label="Delivery" value={order.delivery} />
                        <OrderDetail label="Payment" value={order.payment} />
                        <OrderDetail label="Items" value={`${order.items.length} product${order.items.length === 1 ? "" : "s"}`} />
                        <div className="flex gap-2 sm:col-span-3 max-sm:flex-col">
                          <button type="button" className="min-h-10 rounded-md bg-forest px-4 font-bold text-white">Track Order</button>
                          <button type="button" className="min-h-10 rounded-md border border-slate-200 bg-white px-4 font-bold text-slate-600 dark:border-slate-700 dark:bg-[#202624] dark:text-stone-300">Download Invoice</button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-[#202624]">
          <h2 className="text-xl font-bold text-slate-800 dark:text-stone-100">Account Actions</h2>
          <button onClick={() => navigate("/cart")} className="mt-5 w-full rounded-md border border-slate-200 px-4 py-3 font-bold text-forest dark:border-slate-700 dark:text-emerald-200">View Cart</button>
          <button onClick={() => navigate("/shop")} className="mt-3 w-full rounded-md border border-slate-200 px-4 py-3 font-bold text-forest dark:border-slate-700 dark:text-emerald-200">Continue Shopping</button>
          <button onClick={onLogout} className="mt-3 w-full rounded-md bg-forest px-4 py-3 font-bold text-white">Logout</button>
        </aside>
      </section>
      <Footer />
    </>
  );
}

function AddressField({ label, name, placeholder, type = "text", defaultValue = "", required = true, className = "" }) {
  return (
    <label className={`grid min-w-0 gap-2 ${className}`}>
      <span className="text-sm font-bold text-slate-700 dark:text-stone-100">{label}</span>
      <input
        required={required}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="min-h-11 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-slate-700 outline-none focus:border-forest dark:border-slate-700 dark:bg-[#202624] dark:text-stone-100"
      />
    </label>
  );
}

function OrderDetail({ label, value }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-[#202624]">
      <p className="text-xs font-extrabold uppercase text-slate-400 dark:text-stone-500">{label}</p>
      <p className="mt-1 break-words text-sm font-bold leading-snug text-slate-700 dark:text-stone-200">{value}</p>
    </div>
  );
}

function ProfileField({ label, name, defaultValue, type = "text", icon: Icon }) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-bold text-slate-700 dark:text-stone-100">{label}</span>
      <span className="flex min-h-12 min-w-0 items-center gap-3 rounded-md border border-slate-200 bg-blue-50 px-4 focus-within:border-forest dark:border-slate-700 dark:bg-[#1d2422]">
        <Icon className="h-5 w-5 shrink-0 text-slate-400 dark:text-stone-500" />
        <input
          required
          name={name}
          type={type}
          defaultValue={defaultValue}
          className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none dark:text-stone-100"
        />
      </span>
    </label>
  );
}

function SupplierSidebar({ active, onUnavailable }) {
  const navItems = [
    [LayoutDashboard, "Dashboard", "/supplier"],
    [ClipboardList, "Purchase Orders", "/supplier/purchase-orders/po-8921"],
    [Boxes, "Materials", "/supplier/materials"],
    [Truck, "Shipments", "/supplier/shipments"],
    [Handshake, "Vendors", "/supplier/vendors"],
    [Bell, "Notifications", "/supplier/notifications"],
    [UserRound, "Profile", "/supplier/profile"],
  ];

  return (
    <aside className="relative min-h-screen border-r border-[#5b513f] bg-[#332a1a] text-[#e3d8c8] lg:sticky lg:top-0 lg:h-screen">
      <div className="px-5 pb-8 pt-4">
        <button onClick={() => navigate("/supplier")} className="text-left">
          <strong className="block text-[18px] font-extrabold leading-tight text-[#6ff4db]">WoodVerse</strong>
          <span className="text-[13px] uppercase tracking-[0.22em] text-[#d8c9b5]">Supplier Portal</span>
        </button>
      </div>

      <nav className="grid gap-2 px-1 text-[16px] font-extrabold">
        {navItems.map(([Icon, label, href]) => {
          const selected = active === label;
          return (
            <button
              key={label}
              onClick={() => (href ? navigate(href) : onUnavailable?.(label))}
              aria-current={selected ? "page" : undefined}
              className={`relative flex min-h-12 min-w-0 items-center gap-4 px-6 text-left transition ${
                selected
                  ? "bg-[#2d2616] text-[#6ff4db] after:absolute after:right-0 after:top-0 after:h-full after:w-1 after:bg-[#48d6ba]"
                  : "text-[#d8c9b5] hover:bg-[#2d2616] hover:text-[#6ff4db]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2.2} />
              <span className="min-w-0 break-words">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#5b513f] px-3 py-4 lg:absolute lg:bottom-0 lg:left-0 lg:right-0">
        <button
          onClick={() => navigate("/supplier/shipments/new")}
          className="mb-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-md bg-[#00614d] px-4 text-[16px] font-extrabold text-white shadow-sm transition hover:bg-[#08715c]"
        >
          <Plus className="h-5 w-5" />
          New Shipment
        </button>
        <button onClick={() => onUnavailable?.("Support")} className="flex min-h-10 items-center gap-3 px-3 text-[15px] text-[#c8bba8] transition hover:text-[#6ff4db]">
          <CircleHelp className="h-4 w-4" />
          Support
        </button>
        <button onClick={() => onUnavailable?.("Settings")} className="flex min-h-10 items-center gap-3 px-3 text-[15px] text-[#c8bba8] transition hover:text-[#6ff4db]">
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}

function SupplierDashboardPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState("Inventory synchronized 12 minutes ago.");
  const deliveries = [
    { date: "Oct 25, 09:00", customer: "Arpico Interiors", material: "Mahogany", badge: "bg-[#cfe6c7] text-[#28513c]", volume: "450 m3" },
    { date: "Oct 25, 14:30", customer: "Ceylinco Homes", material: "Satinwood", badge: "bg-[#bfe9dc] text-[#195b4b]", volume: "120 m3" },
    { date: "Oct 26, 11:00", customer: "Royal Furniture", material: "Teak Grade-A", badge: "bg-[#ffd8bd] text-[#87512f]", volume: "2,100 m3" },
  ];
  const notifications = [
    { icon: ShoppingCart, tone: "bg-[#bcefd9] text-[#115745]", title: "Silva Woodworks placed PO #8930 for Grade-A Teak.", time: "2 minutes ago" },
    { icon: AlertTriangle, tone: "bg-[#fbecd5] text-[#b06c2e]", title: "Shipment #LV-721 is delayed due to weather in Galle.", time: "45 minutes ago" },
    { icon: ClipboardList, tone: "bg-[#dce9f5] text-[#3f729a]", title: "Monthly Compliance Certificate for Logging Rights is now verified.", time: "3 hours ago" },
    { icon: CheckCircle2, tone: "bg-[#d6e9dd] text-[#2f6757]", title: "Payment of LKR 840,000 settled for PO #8812.", time: "Yesterday" },
  ];

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Dashboard" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} onNewShipment={() => setNotice("New shipment draft opened.")} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search orders, materials, or shipments..." />
            </label>
            <div className="flex shrink-0 items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Language">
                <Globe2 className="h-5 w-5" />
              </button>
              <button
                onClick={onToggleTheme}
                className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Apps">
                <Grid3X3 className="h-5 w-5" />
              </button>
              <span className="hidden h-8 w-px bg-[#cfd4cf] dark:bg-white/10 sm:block" />
              <div className="hidden text-right sm:block">
                <p className="font-extrabold leading-tight text-[#222621] dark:text-stone-100">Lumbini Timber Co.</p>
                <p className="text-sm text-[#5d675f] dark:text-stone-400">Verified Supplier</p>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-full border-2 border-[#b8c7bd] bg-[linear-gradient(135deg,#f2d3ba,#7b4a30)] text-sm font-extrabold text-white dark:border-emerald-200/40">
                LT
              </div>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-8 px-6 py-9 xl:px-10">
            <div className="flex min-w-0 items-start justify-between gap-5 max-md:grid">
              <div className="min-w-0">
                <p className="text-lg text-[#2f6757] dark:text-emerald-200">Good morning, Lumbini Timber</p>
                <h1 className="mt-1 break-words text-xl leading-snug text-[#39433f] dark:text-stone-200">Here's your operational overview for today, October 24th.</h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setNotice("Reports are ready for download.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#8b5633] bg-[#fbf8f1] px-4 font-semibold text-[#8b5633] dark:border-amber-500/60 dark:bg-[#202b28] dark:text-amber-200">
                  <Download className="h-4 w-4" />
                  Download Reports
                </button>
                <button onClick={() => setNotice("Inventory update saved for Grade-A Teak and Mahogany.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#115745] px-4 font-semibold text-white">
                  <RefreshCw className="h-4 w-4" />
                  Update Inventory
                </button>
              </div>
            </div>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="grid grid-cols-4 gap-6 max-xl:grid-cols-2 max-sm:grid-cols-1">
              <SupplierMetricCard icon={ShoppingCart} title="New POs Today" value="12" helper="+8%" helperClass="text-[#2f8b55]" />
              <SupplierMetricCard icon={ClipboardList} title="Pending Orders" value="48" helper="Review Required" tone="bg-[#ffd9c4] text-[#915531]" helperClass="text-[#e28a1d]" />
              <SupplierMetricCard icon={Truck} title="Active Shipments" value="08" helper="In Transit" tone="bg-[#d9ecd8] text-[#2f6757]" />
              <SupplierMetricCard icon={Wallet} title="Monthly Revenue" value="LKR 4.2M" dark />
            </section>

            <section className="grid grid-cols-[minmax(0,1fr)_300px] gap-8 max-xl:grid-cols-1">
              <div className="grid gap-6">
                <article className="overflow-hidden rounded-lg border border-[#cbd2cd] bg-[#fbf8f1] shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="flex min-h-14 items-center justify-between gap-4 border-b border-[#d9d7cf] px-6 dark:border-white/10">
                    <h2 className="text-lg font-semibold text-[#2f6757] dark:text-emerald-200">Upcoming Deliveries</h2>
                    <button className="font-semibold text-[#115745] dark:text-emerald-200">View Calendar</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left">
                      <thead className="bg-white/55 text-sm text-[#39433f] dark:bg-white/5 dark:text-stone-300">
                        <tr>
                          {["Date", "Customer", "Material", "Volume", "Action"].map((head) => (
                            <th key={head} className="px-6 py-4 font-extrabold">{head}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {deliveries.map((delivery) => (
                          <tr key={`${delivery.customer}-${delivery.date}`} className="border-t border-[#dedbd3] dark:border-white/10">
                            <td className="px-6 py-5 font-medium">{delivery.date}</td>
                            <td className="px-6 py-5 font-extrabold text-[#202621] dark:text-stone-100">{delivery.customer}</td>
                            <td className="px-6 py-5"><span className={`rounded px-2 py-1 text-[11px] font-extrabold uppercase ${delivery.badge}`}>{delivery.material}</span></td>
                            <td className="px-6 py-5 font-medium">{delivery.volume}</td>
                            <td className="px-6 py-5"><button onClick={() => setNotice(`Manifest opened for ${delivery.customer}.`)} className="font-semibold text-[#8b5633] dark:text-amber-200">Manifest</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={() => setNotice("Loaded 12 more scheduled deliveries.")} className="min-h-14 w-full border-t border-[#dedbd3] font-medium text-[#4d5651] dark:border-white/10 dark:text-stone-300">Load 12 more deliveries</button>
                </article>

                <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
                  <article className="grid min-h-52 grid-cols-[116px_minmax(0,1fr)] items-center gap-7 rounded-lg border border-[#cbd2cd] bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#18211f] max-sm:grid-cols-1">
                    <div className="grid h-24 w-24 place-items-center rounded-full border-[8px] border-[#115745] text-2xl font-extrabold text-[#115745] dark:border-emerald-300 dark:text-emerald-200">75%</div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#202621] dark:text-stone-100">Inventory Capacity</h3>
                      <p className="mt-2 leading-relaxed text-[#4d5651] dark:text-stone-300">Storage Yard A is reaching full capacity (4,200/5,000 m3).</p>
                      <button onClick={() => setNotice("Yard management view opened.")} className="mt-3 inline-flex items-center gap-1 font-semibold text-[#115745] dark:text-emerald-200">Manage Yard <ArrowRight className="h-4 w-4" /></button>
                    </div>
                  </article>

                  <article className="grid min-h-52 grid-cols-[70px_minmax(0,1fr)] items-center gap-8 rounded-lg border border-[#cbd2cd] bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#18211f] max-sm:grid-cols-1">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-[#fbefe7] text-[#8b5633] dark:bg-amber-950/40 dark:text-amber-200"><TrendingUp className="h-7 w-7" /></span>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[#202621] dark:text-stone-100">Teak Price Spike</h3>
                      <p className="mt-2 leading-relaxed text-[#4d5651] dark:text-stone-300">Global market prices for Grade-A Teak rose by 14% this week.</p>
                      <button onClick={() => setNotice("Market analysis opened for Grade-A Teak.")} className="mt-3 inline-flex items-center gap-1 font-semibold text-[#115745] dark:text-emerald-200">Market Analysis <ArrowRight className="h-4 w-4" /></button>
                    </div>
                  </article>
                </div>
              </div>

              <aside className="grid h-fit gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-semibold text-[#2f6757] dark:text-emerald-200">Recent Notifications</h2>
                    <span className="rounded-full bg-[#d94d58] px-2 py-1 text-[10px] font-extrabold uppercase text-white">3 New</span>
                  </div>
                  <div className="grid gap-5">
                    {notifications.map((item) => {
                      const Icon = item.icon;
                      return (
                        <article key={item.title} className="grid grid-cols-[40px_minmax(0,1fr)] gap-4">
                          <span className={`grid h-10 w-10 place-items-center rounded-full ${item.tone}`}><Icon className="h-5 w-5" /></span>
                          <div className="min-w-0">
                            <h3 className="break-words font-semibold leading-snug text-[#202621] dark:text-stone-100">{item.title}</h3>
                            <p className="mt-1 text-sm text-[#68716c] dark:text-stone-400">{item.time}</p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  <button onClick={() => setNotice("All activity opened.")} className="mt-6 min-h-12 w-full border-t border-[#d9d7cf] pt-4 font-semibold text-[#2f6757] dark:border-white/10 dark:text-emerald-200">View All Activity</button>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-[#e9e5dc] p-6 shadow-sm dark:border-white/10 dark:bg-[#202b28]">
                  <h2 className="mb-5 font-extrabold uppercase text-[#39433f] dark:text-stone-100">Yard Status</h2>
                  <SupplierProgress label="Galle Main Yard" value="88% Full" percent="88%" />
                  <SupplierProgress label="Matara Transit Hub" value="32% Full" percent="32%" />
                  <div className="mt-6 border-t border-[#c7c8c1] pt-6 dark:border-white/10">
                    <h3 className="mb-4 font-extrabold uppercase text-[#39433f] dark:text-stone-100">Logistics Partners</h3>
                    <div className="flex -space-x-2">
                      {["LK", "TR", "EX"].map((initials) => (
                        <span key={initials} className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#e9e5dc] bg-white text-xs font-extrabold text-[#115745] dark:border-[#202b28] dark:bg-[#18211f] dark:text-emerald-200">{initials}</span>
                      ))}
                      <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#e9e5dc] bg-[#f5f1e8] text-sm font-bold text-[#5b655f] dark:border-[#202b28] dark:bg-[#151d1b] dark:text-stone-300">+4</span>
                    </div>
                  </div>
                </article>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function SupplierPurchaseOrderPage({ theme, onToggleTheme }) {
  const [orderStatus, setOrderStatus] = useState("In Review");
  const [notice, setNotice] = useState("Purchase order PO-8921 is ready for review.");
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState([
    {
      author: "Sarah Wickrama (Inventory)",
      time: "Oct 24, 10:15 AM",
      text: "Checked current stock levels at Gampaha depot. We can fulfill the full 150m3 by the requested date without affecting other POs.",
    },
  ]);
  const timeline = [
    { label: "Order Received", detail: "Oct 24, 09:42 AM", icon: CheckCircle2, done: true },
    { label: "Accepted", detail: orderStatus === "Accepted" || orderStatus === "Processing" ? "Confirmed" : "Pending", icon: ClipboardList, done: orderStatus === "Accepted" || orderStatus === "Processing" },
    { label: "Processing", detail: orderStatus === "Processing" ? "Active" : "", icon: Building2, done: orderStatus === "Processing" },
    { label: "Shipped", detail: "", icon: Truck, done: false },
  ];

  const postNote = () => {
    if (!noteInput.trim()) return;
    setNotes((items) => [
      ...items,
      {
        author: "John Doe (Logistics Mgr)",
        time: "Just now",
        text: noteInput.trim(),
      },
    ]);
    setNoteInput("");
    setNotice("Internal note posted to PO-8921.");
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Purchase Orders" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} onNewShipment={() => setNotice("Shipment draft created for PO-8921.")} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-8">
            <div className="hidden min-w-0 items-center gap-2 text-sm font-medium text-[#39433f] dark:text-stone-300 md:flex">
              <button onClick={() => navigate("/supplier")} className="hover:text-[#115745] dark:hover:text-emerald-200">Purchase Orders</button>
              <ChevronRight className="h-4 w-4 shrink-0" />
              <strong className="text-[#202621] dark:text-stone-100">PO-8921</strong>
            </div>
            <label className="ml-auto flex h-11 w-full max-w-[260px] min-w-0 items-center rounded-full bg-[#f4f0e8] px-3 text-[#7a8480] dark:bg-[#202b28] dark:text-stone-400 max-md:max-w-none">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search orders..." />
            </label>
            <div className="flex shrink-0 items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Language">
                <Globe2 className="h-5 w-5" />
              </button>
              <button
                onClick={onToggleTheme}
                className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Apps">
                <Grid3X3 className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-8 px-6 py-9 xl:px-8">
            <section className="flex min-w-0 items-start justify-between gap-5 max-md:grid">
              <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <h1 className="break-words text-3xl font-extrabold leading-tight text-[#202621] dark:text-stone-100">Order PO-8921</h1>
                  <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${orderStatus === "Rejected" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200" : orderStatus === "Accepted" || orderStatus === "Processing" ? "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200" : "bg-[#ffd4b5] text-[#87512f] dark:bg-amber-950/50 dark:text-amber-200"}`}>{orderStatus}</span>
                </div>
                <p className="mt-2 text-lg text-[#4d5651] dark:text-stone-300">Created on Oct 24, 2023 - 09:42 AM</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => { setOrderStatus("Rejected"); setNotice("PO-8921 has been marked for rejection review."); }} className="min-h-11 rounded-md border border-[#9ca39e] bg-white px-5 font-bold text-[#39433f] dark:border-white/15 dark:bg-[#202b28] dark:text-stone-100">Reject Order</button>
                <button onClick={() => { setOrderStatus("Accepted"); setNotice("PO-8921 accepted. Create shipment when stock is allocated."); }} className="min-h-11 rounded-md bg-[#115745] px-6 font-bold text-white">Accept Order</button>
              </div>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="rounded-lg border border-[#cbd2cd] bg-[#fbf8f1] p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
              <div className="relative grid grid-cols-4 gap-4 max-sm:grid-cols-2">
                <span className="absolute left-[12%] right-[12%] top-5 hidden h-px bg-[#c8d1ca] dark:bg-white/10 sm:block" />
                {timeline.map((step) => {
                  const Icon = step.icon;
                  return (
                    <article key={step.label} className="relative z-10 grid justify-items-center gap-2 text-center">
                      <span className={`grid h-11 w-11 place-items-center rounded-full border-4 ${step.done ? "border-[#c2d5cc] bg-[#2f8b55] text-white dark:border-emerald-900 dark:bg-emerald-500" : "border-[#eee9df] bg-[#e5e2da] text-[#747d78] dark:border-[#18211f] dark:bg-[#2a3532] dark:text-stone-400"}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <strong className={`text-sm ${step.done ? "text-[#115745] dark:text-emerald-200" : "text-[#717a75] dark:text-stone-400"}`}>{step.label}</strong>
                      {step.detail && <span className="text-xs text-[#68716c] dark:text-stone-400">{step.detail}</span>}
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-[minmax(0,1fr)_304px] gap-6 max-xl:grid-cols-1">
              <div className="grid gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="mb-6 flex items-center gap-2 border-b border-[#dedbd3] pb-5 dark:border-white/10">
                    <Layers className="h-5 w-5 text-[#115745] dark:text-emerald-200" />
                    <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">Timber Specifications</h2>
                  </div>

                  <div className="grid grid-cols-[96px_minmax(0,1fr)_130px_130px] gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
                    <img className="h-24 w-24 rounded-md border border-[#d8d7d0] object-cover dark:border-white/10" src="/assets/product-walnut-task-table.png" alt="Grade-A teak grain" />
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold uppercase tracking-wide text-[#4d5651] dark:text-stone-400">Wood Type & Grade</p>
                      <h3 className="mt-2 text-3xl font-extrabold leading-tight text-[#202621] dark:text-stone-100">Grade-A Teak</h3>
                      <p className="mt-2 leading-relaxed text-[#4d5651] dark:text-stone-300">FSC Certified, Sustainably Harvested</p>
                    </div>
                    <SpecBox label="Total Volume" value="150 m3" />
                    <SpecBox label="Moisture Content" value="< 12%" />
                  </div>

                  <div className="mt-6 overflow-hidden rounded-md border border-[#cbd2cd] dark:border-white/10">
                    <div className="grid grid-cols-[1.2fr_.7fr_.8fr_.8fr] bg-[#e9e5dc] text-sm font-extrabold uppercase text-[#4d5651] dark:bg-[#202b28] dark:text-stone-300 max-sm:hidden">
                      <span className="px-4 py-4">Description</span>
                      <span className="px-4 py-4">Dimensions (cm)</span>
                      <span className="px-4 py-4 text-right">Unit Price</span>
                      <span className="px-4 py-4 text-right">Subtotal</span>
                    </div>
                    <div className="grid grid-cols-[1.2fr_.7fr_.8fr_.8fr] items-center bg-white text-lg dark:bg-[#18211f] max-sm:grid-cols-1">
                      <span className="px-4 py-6 font-medium text-[#202621] dark:text-stone-100">Raw Teak Planks (Standard)</span>
                      <span className="px-4 py-6">240 x 15 x 5</span>
                      <span className="px-4 py-6 text-right max-sm:text-left">LKR 42,500 / m3</span>
                      <strong className="px-4 py-6 text-right text-[#202621] dark:text-stone-100 max-sm:text-left">LKR 6,375,000</strong>
                    </div>
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 bg-[#f1eee7] px-4 py-7 dark:bg-[#202b28]">
                      <strong className="justify-self-end text-lg dark:text-stone-200">Grand Total</strong>
                      <strong className="text-right text-2xl leading-tight text-[#115745] dark:text-emerald-200">LKR<br />6,375,000</strong>
                    </div>
                  </div>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#115745] dark:text-emerald-200" />
                      <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">Internal Notes</h2>
                    </div>
                    <button onClick={() => setNotice("Note composer focused for PO-8921.")} className="font-semibold text-[#115745] dark:text-emerald-200">Add Note</button>
                  </div>
                  <div className="grid gap-4">
                    {notes.map((note, index) => (
                      <article key={`${note.author}-${index}`} className="border-l-4 border-[#115745] bg-[#f4f0e8] p-5 dark:bg-[#202b28]">
                        <div className="flex justify-between gap-4 max-sm:grid">
                          <strong className="text-[#202621] dark:text-stone-100">{note.author}</strong>
                          <span className="text-sm text-[#68716c] dark:text-stone-400">{note.time}</span>
                        </div>
                        <p className="mt-3 leading-relaxed text-[#4d5651] dark:text-stone-300">{note.text}</p>
                      </article>
                    ))}
                    <div className="rounded-md border border-[#cbd2cd] bg-white p-4 dark:border-white/10 dark:bg-[#111816]">
                      <textarea value={noteInput} onChange={(event) => setNoteInput(event.target.value)} rows={3} className="w-full resize-none bg-transparent text-[#39433f] outline-none placeholder:text-[#8c958f] dark:text-stone-100 dark:placeholder:text-stone-500" placeholder="Write a note to your team..." />
                      <div className="mt-3 flex justify-end">
                        <button onClick={postNote} className="min-h-9 rounded-md bg-[#115745] px-4 text-sm font-bold text-white">Post Note</button>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <aside className="grid h-fit gap-6">
                <OrderSideCard icon={CalendarCheck} title="Delivery Schedule">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-[#4d5651] dark:text-stone-400">Required Delivery Date</p>
                  <div className="mt-3 flex items-center gap-2 text-[#115745] dark:text-emerald-200">
                    <CalendarCheck className="h-5 w-5" />
                    <strong className="text-3xl leading-tight">Nov 15, 2023</strong>
                  </div>
                  <p className="mt-2 text-sm text-[#d58a1b]">21 days remaining</p>
                  <div className="mt-6 border-t border-[#dedbd3] pt-5 dark:border-white/10">
                    <p className="text-xs font-extrabold uppercase tracking-wide text-[#4d5651] dark:text-stone-400">Delivery Location</p>
                    <div className="mt-3 grid grid-cols-[22px_minmax(0,1fr)] gap-2">
                      <MapPin className="h-5 w-5 text-[#68716c] dark:text-stone-400" />
                      <p className="leading-relaxed"><strong className="block text-[#202621] dark:text-stone-100">Manufacturing Hub B</strong>No. 45, Industrial Zone Phase 2, Kandy Road, Malwana, Sri Lanka</p>
                    </div>
                  </div>
                </OrderSideCard>

                <OrderSideCard icon={Building2} title="Customer Details">
                  <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-md bg-[#ffd8bd] text-xl font-extrabold text-[#202621]">S</span>
                    <div>
                      <strong className="block text-[#202621] dark:text-stone-100">Silva Woodworks PLC</strong>
                      <span className="text-xs uppercase text-[#68716c] dark:text-stone-400">Customer ID: CUST-0492</span>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 border-t border-[#dedbd3] pt-5 text-sm dark:border-white/10">
                    <ContactRow icon={UserRound} text="Amara Silva (Procurement)" />
                    <ContactRow icon={Mail} text="amara@silvawoodworks.lk" />
                    <ContactRow icon={Phone} text="+94 11 234 5678" />
                  </div>
                </OrderSideCard>

                <button onClick={() => { setOrderStatus("Processing"); setNotice("PO-8921 moved to processing."); }} className="flex min-h-14 items-center justify-between gap-4 rounded-lg border border-[#cbd2cd] bg-white px-5 font-extrabold text-[#202621] shadow-sm dark:border-white/10 dark:bg-[#18211f] dark:text-stone-100">
                  <span className="inline-flex items-center gap-3"><FileText className="h-5 w-5 text-[#115745] dark:text-emerald-200" /> Mark as Processing</span>
                  <ChevronRight className="h-5 w-5 text-[#68716c]" />
                </button>
                <button onClick={() => setNotice("Shipment draft created for PO-8921.")} className="flex min-h-14 items-center justify-between gap-4 rounded-lg bg-[#115745] px-5 font-extrabold text-white shadow-soft">
                  <span className="inline-flex items-center gap-3"><Truck className="h-5 w-5" /> Create Shipment</span>
                  <Plus className="h-5 w-5" />
                </button>
                <button onClick={() => { setOrderStatus("Rejected"); setNotice("Cancellation request prepared for PO-8921."); }} className="inline-flex min-h-12 items-center justify-center gap-2 font-bold text-[#d94d58]">
                  <X className="h-5 w-5" />
                  Request Cancellation
                </button>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function SupplierVendorsPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState("Vendor network loaded with 42 active marketplace partners.");
  const [showMap, setShowMap] = useState(false);
  const vendorsList = [
    {
      name: "Lanka Teak Estates",
      location: "Colombo, LK",
      email: "saman.p@lankateak.lk",
      phone: "+94 11 234 5678",
      materials: ["Teak", "Mahogany", "Nedun"],
      status: "Preferred",
      statusClass: "bg-[#3f835d] text-white",
      initials: "LT",
    },
    {
      name: "Heritage Brassworks",
      location: "Moratuwa, LK",
      email: "orders@heritagebrass.com",
      phone: "+94 11 888 2233",
      materials: ["Brass Hardware", "Copper Inlays"],
      status: "Active",
      statusClass: "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200",
      initials: "HB",
    },
    {
      name: "EcoGloss Finishes",
      location: "Kandy, LK",
      email: "hello@ecogloss.com",
      phone: "+94 81 555 4444",
      materials: ["Varnish", "Natural Oils"],
      status: "Inactive",
      statusClass: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200",
      initials: "EG",
    },
    {
      name: "Royal Jackwood Supplies",
      location: "Galle, LK",
      email: "contact@royaljackwood.lk",
      phone: "+94 91 111 2222",
      materials: ["Jack Wood", "Mara Wood"],
      status: "Preferred",
      statusClass: "bg-[#3f835d] text-white",
      initials: "RJ",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Vendors" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} onNewShipment={() => setNotice("New shipment draft opened from Vendors.")} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search vendors, materials, or regions..." />
            </label>
            <div className="flex shrink-0 items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Language">
                <Globe2 className="h-5 w-5" />
              </button>
              <button
                onClick={onToggleTheme}
                className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Apps">
                <Grid3X3 className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="grid grid-cols-[minmax(0,1fr)_auto] gap-6 max-lg:grid-cols-1">
              <div className="min-w-0">
                <p className="mb-2 text-sm font-semibold text-[#4d5651] dark:text-stone-400">Dashboard <ChevronRight className="inline h-4 w-4" /> <strong className="text-[#115745] dark:text-emerald-200">Vendor Directory</strong></p>
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">Vendor Directory</h1>
                <p className="mt-2 max-w-3xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Manage your supply chain network, track material availability, and maintain vendor relationships for artisanal wood production.</p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <button onClick={() => setNotice("Vendor CSV export started.")} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-[#e3ded5] px-5 font-bold text-[#115745] dark:bg-[#202b28] dark:text-emerald-200">
                  <Download className="h-5 w-5" />
                  Export CSV
                </button>
                <button onClick={() => setNotice("Vendor onboarding form opened.")} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-md bg-[#115745] px-5 font-bold text-white shadow-sm">
                  <UserPlus className="h-5 w-5" />
                  Onboard Vendor
                </button>
              </div>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="grid grid-cols-[minmax(0,1fr)_220px] gap-6 max-lg:grid-cols-1">
              <div className="grid grid-cols-3 gap-4 rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f] max-md:grid-cols-1">
                <FilterSelect label="Filter by Material" value="All Timber & Hardware" />
                <FilterSelect label="Supplier Status" value="All" segmented />
                <FilterSelect label="Location" value="All Regions" icon={MapPin} />
              </div>
              <article className="rounded-lg bg-[#2f6757] p-6 text-white shadow-soft">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white/60">Network Strength</p>
                <strong className="mt-4 block text-3xl">42 Suppliers</strong>
                <p className="mt-5 text-sm text-white/75">12 Preferred Partners</p>
              </article>
            </section>

            <section className="overflow-hidden rounded-lg border border-[#cbd2cd] bg-white shadow-sm dark:border-white/10 dark:bg-[#18211f]">
              <div className="grid grid-cols-[1.2fr_1.35fr_1.35fr_.8fr_1fr] bg-[#e9e5dc] text-sm font-extrabold uppercase tracking-wide text-[#39433f] dark:bg-[#202b28] dark:text-stone-300 max-lg:hidden">
                {["Supplier & Info", "Contact Details", "Materials Supplied", "Status", "Actions"].map((heading) => (
                  <span key={heading} className="px-6 py-5">{heading}</span>
                ))}
              </div>
              <div className="divide-y divide-[#e2dfd7] dark:divide-white/10">
                {vendorsList.map((vendor) => (
                  <article key={vendor.name} className="grid grid-cols-[1.2fr_1.35fr_1.35fr_.8fr_1fr] items-center gap-4 px-6 py-5 max-lg:grid-cols-1">
                    <div className="grid grid-cols-[44px_minmax(0,1fr)] items-center gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-md bg-[#e9e5dc] text-sm font-extrabold text-[#115745] dark:bg-[#202b28] dark:text-emerald-200">{vendor.initials}</span>
                      <div className="min-w-0">
                        <h2 className="break-words text-lg font-extrabold leading-tight text-[#115745] dark:text-emerald-200">{vendor.name}</h2>
                        <p className="mt-1 flex items-center gap-1 text-sm text-[#4d5651] dark:text-stone-400"><MapPin className="h-3.5 w-3.5" /> {vendor.location}</p>
                      </div>
                    </div>
                    <div className="min-w-0 text-[#202621] dark:text-stone-200">
                      <p className="break-words">{vendor.email}</p>
                      <p className="mt-1 text-sm text-[#68716c] dark:text-stone-400">{vendor.phone}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {vendor.materials.map((material) => (
                        <span key={material} className="rounded bg-[#d8eccf] px-2 py-1 text-xs font-extrabold uppercase text-[#28513c] dark:bg-emerald-950/40 dark:text-emerald-200">{material}</span>
                      ))}
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-sm font-extrabold ${vendor.statusClass}`}>{vendor.status}</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setNotice(`${vendor.name} profile opened.`)} className="grid h-9 w-9 place-items-center rounded-md text-[#115745] hover:bg-[#f4f0e8] dark:text-emerald-200 dark:hover:bg-[#202b28]" aria-label={`View ${vendor.name}`}>
                        <Eye className="h-5 w-5" />
                      </button>
                      <button onClick={() => setNotice(`Message thread opened for ${vendor.name}.`)} className="grid h-9 w-9 place-items-center rounded-md text-[#115745] hover:bg-[#f4f0e8] dark:text-emerald-200 dark:hover:bg-[#202b28]" aria-label={`Message ${vendor.name}`}>
                        <Send className="h-5 w-5" />
                      </button>
                      <button onClick={() => setNotice(`Purchase order draft created for ${vendor.name}.`)} disabled={vendor.status === "Inactive"} className="min-h-11 rounded-md bg-[#8b5633] px-4 text-sm font-extrabold text-white disabled:bg-[#aeb8b1] disabled:text-[#52605a]">
                        Create PO
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <div className="flex min-w-0 items-center justify-between gap-4 border-t border-[#e2dfd7] px-6 py-4 text-sm dark:border-white/10 max-sm:flex-col max-sm:items-start">
                <p>Showing 1-4 of 42 suppliers</p>
                <div className="flex gap-2">
                  {["1", "2", "3", "...", "11"].map((page, index) => (
                    <button key={`${page}-${index}`} className={`grid h-9 min-w-9 place-items-center rounded-md px-2 font-bold ${index === 0 ? "bg-[#115745] text-white" : "border border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#202b28]"}`}>{page}</button>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-[.9fr_1.1fr] gap-6 max-lg:grid-cols-1">
              <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                <div className="mb-5 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-[#115745] dark:text-emerald-200" />
                  <h2 className="text-xl font-semibold text-[#115745] dark:text-emerald-200">Pending Onboarding</h2>
                </div>
                <div className="grid gap-4">
                  {[
                    ["Southern Hardwoods", "Vetting stage: Compliance", "border-[#e7a12a]"],
                    ["Fine Grain Textiles", "Vetting stage: Site Visit", "border-sky-500"],
                  ].map(([name, detail, border]) => (
                    <article key={name} className={`rounded-md border-l-4 ${border} bg-[#fbf8f1] p-4 dark:bg-[#202b28]`}>
                      <div className="flex justify-between gap-4">
                        <span>
                          <strong className="block text-[#202621] dark:text-stone-100">{name}</strong>
                          <span className="text-sm text-[#68716c] dark:text-stone-400">{detail}</span>
                        </span>
                        <button onClick={() => setNotice(`${name} onboarding review opened.`)} className="font-bold text-[#115745] dark:text-emerald-200">Review</button>
                      </div>
                    </article>
                  ))}
                </div>
              </article>
              <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-[#115745] dark:text-emerald-200">Regional Distribution</h2>
                  <button
                    onClick={() => {
                      setShowMap((visible) => !visible);
                      setNotice(showMap ? "Regional vendor map minimized." : "Regional vendor map opened.");
                    }}
                    className="font-bold text-[#115745] dark:text-emerald-200"
                  >
                    {showMap ? "Hide Map" : "View Map"}
                  </button>
                </div>
                <RegionalVendorMap expanded={showMap} />
                <div className="mt-6 grid grid-cols-3 divide-x divide-[#d3d0c8] text-center dark:divide-white/10">
                  {[
                    ["18", "Colombo Region"],
                    ["14", "Southern Hub"],
                    ["10", "Central Highlands"],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <strong className="text-3xl text-[#115745] dark:text-emerald-200">{value}</strong>
                      <p className="text-xs uppercase text-[#68716c] dark:text-stone-400">{label}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterSelect({ label, value, segmented = false, icon: Icon }) {
  return (
    <div>
      <p className="mb-2 text-xs font-extrabold uppercase text-[#4d5651] dark:text-stone-400">{label}</p>
      {segmented ? (
        <div className="grid min-h-10 grid-cols-3 rounded-md border border-[#cbd2cd] bg-[#f4f0e8] p-1 text-sm font-bold dark:border-white/10 dark:bg-[#202b28]">
          {["All", "Preferred", "Active"].map((item, index) => (
            <button key={item} className={`rounded ${index === 0 ? "bg-white text-[#115745] dark:bg-[#18211f] dark:text-emerald-200" : "text-[#4d5651] dark:text-stone-300"}`}>{item}</button>
          ))}
        </div>
      ) : (
        <button className="flex min-h-10 w-full items-center justify-between gap-3 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-3 text-left dark:border-white/10 dark:bg-[#202b28]">
          <span className="min-w-0 break-words">{value}</span>
          {Icon ? <Icon className="h-5 w-5 shrink-0 text-[#115745] dark:text-emerald-200" /> : <ChevronRight className="h-5 w-5 shrink-0 rotate-90 text-[#68716c]" />}
        </button>
      )}
    </div>
  );
}

function RegionalVendorMap({ expanded }) {
  const regions = [
    { name: "Colombo", detail: "18 suppliers", top: "45%", left: "52%", tone: "bg-[#115745]" },
    { name: "Galle", detail: "10 suppliers", top: "76%", left: "39%", tone: "bg-[#8b5633]" },
    { name: "Kandy", detail: "10 suppliers", top: "33%", left: "63%", tone: "bg-[#2f6757]" },
    { name: "Matara", detail: "4 suppliers", top: "82%", left: "48%", tone: "bg-[#d58a1b]" },
  ];

  return (
    <div className={`relative overflow-hidden rounded-md border border-[#d5d1c9] bg-[#eee9df] transition-all dark:border-white/10 dark:bg-[#202b28] ${expanded ? "min-h-[360px]" : "min-h-[160px]"}`}>
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(17,87,69,.12),transparent_42%),radial-gradient(circle_at_48%_46%,rgba(17,87,69,.18),transparent_22%),radial-gradient(circle_at_38%_76%,rgba(139,86,51,.16),transparent_18%)]" />
      <svg className="absolute inset-0 h-full w-full text-[#bdb6aa] dark:text-white/10" viewBox="0 0 480 300" aria-hidden="true">
        <path d="M225 22 C275 54 300 92 290 132 C322 166 305 218 267 262 C231 291 174 260 164 210 C122 182 128 119 172 91 C177 58 193 35 225 22Z" fill="currentColor" />
        <path d="M250 90 C226 132 219 173 190 229" fill="none" stroke="rgba(17,87,69,.38)" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 10" />
        <path d="M250 90 C276 128 263 170 232 235" fill="none" stroke="rgba(139,86,51,.35)" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 8" />
      </svg>
      <div className="absolute left-5 top-5 rounded-md bg-white/85 px-3 py-2 shadow-sm backdrop-blur dark:bg-[#111816]/85">
        <p className="text-xs font-extrabold uppercase tracking-wide text-[#68716c] dark:text-stone-400">Sri Lanka Vendor Map</p>
        <p className="text-sm font-bold text-[#115745] dark:text-emerald-200">42 connected suppliers</p>
      </div>
      {regions.map((region) => (
        <button
          key={region.name}
          className="absolute grid -translate-x-1/2 -translate-y-1/2 justify-items-center gap-1 text-center"
          style={{ top: region.top, left: region.left }}
          title={`${region.name}: ${region.detail}`}
        >
          <span className={`grid h-9 w-9 place-items-center rounded-full border-4 border-white text-white shadow-lg dark:border-[#202b28] ${region.tone}`}>
            <MapPin className="h-4 w-4" />
          </span>
          {expanded && (
            <span className="rounded bg-white/90 px-2 py-1 text-xs font-extrabold text-[#202621] shadow-sm dark:bg-[#111816]/90 dark:text-stone-100">
              {region.name}
              <span className="block font-semibold text-[#68716c] dark:text-stone-400">{region.detail}</span>
            </span>
          )}
        </button>
      ))}
      {expanded && (
        <div className="absolute bottom-4 left-4 right-4 grid grid-cols-4 gap-3 max-sm:grid-cols-2">
          {regions.map((region) => (
            <div key={region.name} className="rounded-md bg-white/86 p-3 shadow-sm backdrop-blur dark:bg-[#111816]/86">
              <span className={`mb-2 block h-1.5 rounded-full ${region.tone}`} />
              <strong className="block text-[#202621] dark:text-stone-100">{region.name}</strong>
              <span className="text-sm text-[#68716c] dark:text-stone-400">{region.detail}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SupplierMaterialsPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState("Material catalog synced with marketplace inventory.");
  const [viewMode, setViewMode] = useState("grid");
  const materials = [
    {
      name: "Grade A Teak Log",
      grade: "Grade A",
      status: "In Stock",
      image: "/assets/product-walnut-task-table.png",
      price: "LKR 450,000 / m3",
      qty: "124.50 m3",
      percent: "82%",
      tone: "bg-[#3f835d] text-white",
    },
    {
      name: "Mahogany Planks",
      grade: "Grade B",
      status: "Low Stock",
      image: "/assets/product-wooden-tray.png",
      price: "LKR 380,000 / m3",
      qty: "12.20 m3",
      percent: "22%",
      tone: "bg-[#e7a12a] text-[#202621]",
    },
    {
      name: "Satinwood Slabs",
      grade: "Prime",
      status: "In Stock",
      image: "/assets/product-modular-shelf-unit.png",
      price: "LKR 520,000 / m3",
      qty: "45.00 m3",
      percent: "58%",
      tone: "bg-[#3f835d] text-white",
    },
    {
      name: "Premium Rosewood",
      grade: "Grade A",
      status: "In Stock",
      image: "/assets/product-carved-gift-box.png",
      price: "LKR 610,000 / m3",
      qty: "88.25 m3",
      percent: "74%",
      tone: "bg-[#3f835d] text-white",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Materials" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} onNewShipment={() => setNotice("New shipment draft opened from Materials.")} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search catalog by species or grade..." />
            </label>
            <div className="flex shrink-0 items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Language">
                <Globe2 className="h-5 w-5" />
              </button>
              <button
                onClick={onToggleTheme}
                className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Apps">
                <Grid3X3 className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="flex min-w-0 items-start justify-between gap-5 max-md:grid">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">Timber Inventory</h1>
                <p className="mt-2 max-w-2xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Manage your raw material stock and pricing for the marketplace.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setNotice("Bulk price update workspace opened.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#8b5633] bg-[#fbf8f1] px-4 font-bold text-[#8b5633] dark:border-amber-500/60 dark:bg-[#202b28] dark:text-amber-200">
                  <SlidersHorizontal className="h-4 w-4" />
                  Bulk Update Prices
                </button>
                <button onClick={() => setNotice("New material form opened.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#115745] px-5 font-bold text-white shadow-sm">
                  <Plus className="h-5 w-5" />
                  Add New Material
                </button>
              </div>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-lg border border-[#cbd2cd] bg-[#fbf8f1] p-4 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
              <div className="flex flex-wrap gap-3">
                {["All Materials", "Species: Teak", "Status: Low Stock"].map((filter, index) => (
                  <button key={filter} onClick={() => setNotice(`${filter} filter selected.`)} className={`min-h-9 rounded-full border px-4 text-sm font-semibold ${index === 0 ? "border-[#115745] text-[#115745] dark:border-emerald-200 dark:text-emerald-200" : "border-[#cbd2cd] bg-[#e9e5dc] text-[#4d5651] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-300"}`}>
                    {filter}
                  </button>
                ))}
              </div>
              <div className="flex rounded-md bg-[#e9e5dc] p-1 dark:bg-[#202b28]">
                <button onClick={() => setViewMode("grid")} className={`grid h-10 w-10 place-items-center rounded-md ${viewMode === "grid" ? "bg-[#2f6757] text-white" : "text-[#4d5651] dark:text-stone-300"}`} aria-label="Grid view">
                  <LayoutGrid className="h-5 w-5" />
                </button>
                <button onClick={() => setViewMode("list")} className={`grid h-10 w-10 place-items-center rounded-md ${viewMode === "list" ? "bg-[#2f6757] text-white" : "text-[#4d5651] dark:text-stone-300"}`} aria-label="List view">
                  <LayoutList className="h-5 w-5" />
                </button>
              </div>
            </section>

            <section className={viewMode === "grid" ? "grid grid-cols-3 gap-6 max-xl:grid-cols-2 max-sm:grid-cols-1" : "grid gap-4"}>
              {materials.map((material) => (
                <MaterialCard key={material.name} material={material} viewMode={viewMode} onEdit={() => setNotice(`${material.name} editor opened.`)} onUpdate={() => setNotice(`${material.name} stock update saved.`)} />
              ))}
            </section>

            <section className="grid grid-cols-3 gap-6 max-xl:grid-cols-1">
              <article className="relative overflow-hidden rounded-lg bg-[#2f6757] p-7 text-white shadow-soft">
                <Wallet className="absolute bottom-5 right-6 h-10 w-10 rounded-full bg-white/14 p-2 text-white/80" />
                <p className="text-sm font-semibold text-white/75">Total Inventory Value</p>
                <strong className="mt-3 block text-4xl leading-tight">LKR 142.5M</strong>
                <p className="mt-3 text-sm font-bold">+12% from last month</p>
              </article>
              <article className="rounded-lg border border-[#cbd2cd] bg-white p-7 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                <div className="mb-6 flex justify-between gap-4">
                  <p className="font-semibold text-[#68716c] dark:text-stone-400">Low Stock Alerts</p>
                  <span className="rounded bg-rose-100 px-2 py-1 text-xs font-extrabold uppercase text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">Critical</span>
                </div>
                <strong className="text-3xl text-[#d94d58]">3 Materials</strong>
                <p className="mt-2 leading-relaxed text-[#4d5651] dark:text-stone-300">Requires immediate update to avoid stockout.</p>
              </article>
              <article className="relative overflow-hidden rounded-lg bg-[#ffc090] p-7 text-[#7b4b2d] shadow-sm dark:bg-[#6a452f] dark:text-amber-100">
                <Truck className="absolute bottom-6 right-6 h-10 w-10 text-[#7b4b2d]/35 dark:text-amber-100/30" />
                <p className="font-semibold">Pending Shipments</p>
                <strong className="mt-6 block text-4xl leading-tight">1,240 m3</strong>
                <p className="mt-2">Awaiting logistics pickup</p>
              </article>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function MaterialCard({ material, viewMode, onEdit, onUpdate }) {
  const list = viewMode === "list";
  return (
    <article className={`overflow-hidden rounded-lg border border-[#cbd2cd] bg-white shadow-sm dark:border-white/10 dark:bg-[#18211f] ${list ? "grid grid-cols-[180px_minmax(0,1fr)_auto] items-center max-md:grid-cols-1" : ""}`}>
      <div className={`relative overflow-hidden bg-[#e9e5dc] ${list ? "h-36 md:h-full" : "h-48"}`}>
        <img src={material.image} alt={material.name} className="h-full w-full object-cover" />
        <span className={`absolute left-3 top-3 rounded px-2 py-1 text-xs font-extrabold uppercase ${material.tone}`}>{material.status}</span>
        <span className="absolute bottom-3 right-3 rounded-md bg-white px-3 py-2 text-sm font-extrabold text-[#115745] shadow-sm dark:bg-[#202b28] dark:text-emerald-200">{material.grade}</span>
      </div>
      <div className="min-w-0 p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="break-words text-2xl font-extrabold leading-tight text-[#202621] dark:text-stone-100">{material.name}</h2>
          <button onClick={onEdit} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#68716c] hover:bg-[#f4f0e8] dark:text-stone-400 dark:hover:bg-[#202b28]" aria-label={`More actions for ${material.name}`}>
            <EllipsisVertical className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-3">
          <div className="flex justify-between gap-4">
            <span className="text-[#68716c] dark:text-stone-400">Unit Price</span>
            <strong className="text-[#8b5633] dark:text-amber-200">{material.price}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#68716c] dark:text-stone-400">Available Qty</span>
            <strong className={material.status === "Low Stock" ? "text-[#d58a1b]" : "text-[#202621] dark:text-stone-100"}>{material.qty}</strong>
          </div>
          <div className="h-1.5 rounded-full bg-[#e2dfd7] dark:bg-white/10">
            <span className={`block h-full rounded-full ${material.status === "Low Stock" ? "bg-[#d58a1b]" : "bg-[#3f835d]"}`} style={{ width: material.percent }} />
          </div>
        </div>
      </div>
      <div className={`grid gap-2 p-5 ${list ? "min-w-44" : "grid-cols-2 border-t border-[#edf0ed] dark:border-white/10"}`}>
        <button onClick={onEdit} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#cbd2cd] bg-white px-4 font-semibold text-[#39433f] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
          <Pencil className="h-4 w-4" />
          Edit
        </button>
        <button onClick={onUpdate} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[#cbd2cd] bg-white px-4 font-semibold text-[#39433f] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
          <RefreshCw className="h-4 w-4" />
          Update
        </button>
      </div>
    </article>
  );
}

function SupplierShipmentsPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState("Shipment board synced with logistics partners.");
  const [selectedShipment, setSelectedShipment] = useState("LV-721");
  const shipments = [
    {
      id: "LV-721",
      po: "PO-8921",
      customer: "Silva Woodworks PLC",
      route: "Galle Main Yard to Malwana Hub",
      load: "150 m3 Grade-A Teak",
      status: "Delayed",
      statusClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
      eta: "Nov 15, 08:30",
      driver: "Ruwan Logistics",
      progress: "62%",
    },
    {
      id: "LV-718",
      po: "PO-8890",
      customer: "Arpico Interiors",
      route: "Matara Transit Hub to Colombo",
      load: "80 m3 Mahogany",
      status: "In Transit",
      statusClass: "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200",
      eta: "Oct 25, 14:00",
      driver: "Lanka Freight",
      progress: "78%",
    },
    {
      id: "LV-716",
      po: "PO-8874",
      customer: "Royal Furniture",
      route: "Kandy Logging Yard to Moratuwa",
      load: "45 m3 Satinwood",
      status: "Scheduled",
      statusClass: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200",
      eta: "Oct 26, 09:15",
      driver: "Pending dispatch",
      progress: "18%",
    },
  ];
  const selected = shipments.find((shipment) => shipment.id === selectedShipment) || shipments[0];

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Shipments" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} onNewShipment={() => setNotice("New shipment form opened.")} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search shipment ID, customer, or destination..." />
            </label>
            <div className="flex shrink-0 items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Language">
                <Globe2 className="h-5 w-5" />
              </button>
              <button
                onClick={onToggleTheme}
                className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Apps">
                <Grid3X3 className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="flex min-w-0 items-start justify-between gap-5 max-md:grid">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">Shipment Management</h1>
                <p className="mt-2 max-w-2xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Track timber dispatch, delivery timing, logistics partners, and route exceptions.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setNotice("Route calendar opened.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#8b5633] bg-[#fbf8f1] px-4 font-bold text-[#8b5633] dark:border-amber-500/60 dark:bg-[#202b28] dark:text-amber-200">
                  <CalendarCheck className="h-4 w-4" />
                  Route Calendar
                </button>
                <button onClick={() => setNotice("New shipment form opened.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#115745] px-5 font-bold text-white shadow-sm">
                  <Plus className="h-5 w-5" />
                  Create Shipment
                </button>
              </div>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="grid grid-cols-4 gap-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
              <ShipmentSummaryCard icon={Truck} label="Active Shipments" value="08" helper="3 arriving today" />
              <ShipmentSummaryCard icon={Timer} label="Delayed Loads" value="02" helper="Needs dispatch review" warning />
              <ShipmentSummaryCard icon={Navigation} label="In Transit" value="05" helper="Across 4 routes" />
              <ShipmentSummaryCard icon={CheckCircle2} label="Delivered This Week" value="17" helper="+11% weekly" />
            </section>

            <section className="grid grid-cols-[minmax(0,1fr)_320px] gap-6 max-xl:grid-cols-1">
              <div className="grid gap-5">
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-lg border border-[#cbd2cd] bg-[#fbf8f1] p-4 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="flex flex-wrap gap-3">
                    {["All Shipments", "Status: In Transit", "Partner: Lanka Freight"].map((filter, index) => (
                      <button key={filter} onClick={() => setNotice(`${filter} filter selected.`)} className={`min-h-9 rounded-full border px-4 text-sm font-semibold ${index === 0 ? "border-[#115745] text-[#115745] dark:border-emerald-200 dark:text-emerald-200" : "border-[#cbd2cd] bg-[#e9e5dc] text-[#4d5651] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-300"}`}>
                        {filter}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setNotice("Dispatch report downloaded.")} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#cbd2cd] bg-white px-4 font-semibold dark:border-white/10 dark:bg-[#202b28]">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>

                <div className="grid gap-4">
                  {shipments.map((shipment) => (
                    <article key={shipment.id} className={`rounded-lg border p-5 shadow-sm transition ${selectedShipment === shipment.id ? "border-[#115745] bg-emerald-50/50 dark:border-emerald-300 dark:bg-emerald-950/10" : "border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#18211f]"}`}>
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 max-sm:grid-cols-1">
                        <div className="min-w-0">
                          <div className="flex min-w-0 flex-wrap items-center gap-3">
                            <button onClick={() => setSelectedShipment(shipment.id)} className="break-words text-xl font-extrabold leading-tight text-[#202621] dark:text-stone-100">{shipment.id}</button>
                            <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${shipment.statusClass}`}>{shipment.status}</span>
                          </div>
                          <p className="mt-2 break-words font-semibold text-[#115745] dark:text-emerald-200">{shipment.po} - {shipment.customer}</p>
                          <p className="mt-2 break-words text-[#4d5651] dark:text-stone-300">{shipment.route}</p>
                        </div>
                        <div className="grid justify-items-end gap-2 max-sm:justify-items-start">
                          <span className="text-sm font-bold text-[#68716c] dark:text-stone-400">ETA</span>
                          <strong className="text-lg text-[#202621] dark:text-stone-100">{shipment.eta}</strong>
                        </div>
                      </div>
                      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_180px] items-center gap-5 max-sm:grid-cols-1">
                        <div>
                          <div className="mb-2 flex justify-between gap-4 text-sm">
                            <span className="font-semibold text-[#4d5651] dark:text-stone-300">{shipment.load}</span>
                            <span className="font-bold text-[#115745] dark:text-emerald-200">{shipment.progress}</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#e2dfd7] dark:bg-white/10">
                            <span className="block h-full rounded-full bg-[#115745] dark:bg-emerald-300" style={{ width: shipment.progress }} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedShipment(shipment.id); setNotice(`Tracking ${shipment.id}.`); }} className="min-h-10 flex-1 rounded-md border border-[#cbd2cd] bg-white px-3 font-semibold dark:border-white/10 dark:bg-[#202b28]">Track</button>
                          <button onClick={() => setNotice(`Manifest opened for ${shipment.id}.`)} className="min-h-10 flex-1 rounded-md bg-[#115745] px-3 font-semibold text-white">Manifest</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="grid h-fit gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="mb-5 flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-[#115745] dark:text-emerald-200" />
                    <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">Live Tracking</h2>
                  </div>
                  <div className="rounded-lg bg-[#e9e5dc] p-5 dark:bg-[#202b28]">
                    <p className="text-sm font-extrabold uppercase tracking-wide text-[#68716c] dark:text-stone-400">Selected Shipment</p>
                    <strong className="mt-2 block text-3xl text-[#115745] dark:text-emerald-200">{selected.id}</strong>
                    <p className="mt-3 leading-relaxed text-[#4d5651] dark:text-stone-300">{selected.route}</p>
                  </div>
                  <div className="mt-5 grid gap-4">
                    {[
                      ["Dispatch confirmed", "Galle Main Yard", true],
                      ["Loaded and sealed", selected.load, true],
                      ["In transit", selected.driver, selected.status !== "Scheduled"],
                      ["Customer handoff", selected.eta, false],
                    ].map(([label, detail, done], index) => (
                      <article key={label} className="grid grid-cols-[34px_minmax(0,1fr)] gap-3">
                        <span className={`grid h-8 w-8 place-items-center rounded-full ${done ? "bg-[#115745] text-white dark:bg-emerald-500" : "bg-[#e2dfd7] text-[#68716c] dark:bg-[#2a3532] dark:text-stone-400"}`}>{done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}</span>
                        <span className="min-w-0">
                          <strong className="block break-words text-[#202621] dark:text-stone-100">{label}</strong>
                          <span className="text-sm text-[#68716c] dark:text-stone-400">{detail}</span>
                        </span>
                      </article>
                    ))}
                  </div>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-[#e9e5dc] p-6 shadow-sm dark:border-white/10 dark:bg-[#202b28]">
                  <h2 className="mb-5 font-extrabold uppercase text-[#39433f] dark:text-stone-100">Logistics Capacity</h2>
                  <SupplierProgress label="Lanka Freight" value="76% used" percent="76%" />
                  <SupplierProgress label="Ruwan Logistics" value="91% used" percent="91%" />
                  <SupplierProgress label="Express Timber" value="38% used" percent="38%" />
                </article>

                <button onClick={() => setNotice("Delay escalation sent to logistics coordinator.")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 font-bold text-amber-700 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-200">
                  <AlertTriangle className="h-5 w-5" />
                  Escalate Delay
                </button>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function ShipmentSummaryCard({ icon: Icon, label, value, helper, warning = false }) {
  return (
    <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
      <div className="flex items-center gap-4">
        <span className={`grid h-12 w-12 place-items-center rounded-full ${warning ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" : "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200"}`}>
          <Icon className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[#68716c] dark:text-stone-400">{label}</span>
          <strong className="text-3xl leading-tight text-[#202621] dark:text-stone-100">{value}</strong>
        </span>
      </div>
      <p className="mt-4 text-sm font-semibold text-[#4d5651] dark:text-stone-300">{helper}</p>
    </article>
  );
}

function SupplierNewShipmentPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState("Create a shipment draft and assign it to an active purchase order.");
  const [created, setCreated] = useState(false);

  const createShipment = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setCreated(true);
    setNotice(`Shipment draft ${formData.get("shipmentId")} created for ${formData.get("purchaseOrder")}.`);
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Shipments" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
            <div className="hidden min-w-0 items-center gap-2 text-sm font-medium text-[#39433f] dark:text-stone-300 md:flex">
              <button onClick={() => navigate("/supplier/shipments")} className="hover:text-[#115745] dark:hover:text-emerald-200">Shipments</button>
              <ChevronRight className="h-4 w-4 shrink-0" />
              <strong className="text-[#202621] dark:text-stone-100">New Shipment</strong>
            </div>
            <label className="ml-auto flex h-11 w-full max-w-[360px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400 max-md:max-w-none">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search purchase order..." />
            </label>
            <div className="flex shrink-0 items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Language">
                <Globe2 className="h-5 w-5" />
              </button>
              <button
                onClick={onToggleTheme}
                className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="flex min-w-0 items-start justify-between gap-5 max-md:grid">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">New Shipment</h1>
                <p className="mt-2 max-w-2xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Create a logistics draft, allocate timber volume, assign pickup and delivery points, and prepare the manifest.</p>
              </div>
              <button onClick={() => navigate("/supplier/shipments")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#8b5633] bg-[#fbf8f1] px-4 font-bold text-[#8b5633] dark:border-amber-500/60 dark:bg-[#202b28] dark:text-amber-200">
                <ArrowLeft className="h-4 w-4" />
                Back to Shipments
              </button>
            </section>

            <div className={`rounded-md border px-4 py-3 text-sm font-semibold shadow-sm ${created ? "border-emerald-200 bg-emerald-50 text-[#115745] dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200" : "border-[#cbd7cf] bg-white/65 text-[#115745] dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200"}`}>
              {notice}
            </div>

            <form onSubmit={createShipment} className="grid grid-cols-[minmax(0,1fr)_320px] gap-6 max-xl:grid-cols-1">
              <div className="grid gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="mb-5 text-2xl font-extrabold text-[#202621] dark:text-stone-100">Shipment Details</h2>
                  <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                    <SupplierProfileField label="Shipment ID" name="shipmentId" defaultValue="LV-724" />
                    <SupplierProfileField label="Purchase order" name="purchaseOrder" defaultValue="PO-8921" />
                    <SupplierProfileField label="Customer" name="customer" defaultValue="Silva Woodworks PLC" />
                    <SupplierProfileField label="Material load" name="materialLoad" defaultValue="150 m3 Grade-A Teak" />
                    <SupplierProfileField label="Pickup yard" name="pickupYard" defaultValue="Galle Main Yard" />
                    <SupplierProfileField label="Delivery hub" name="deliveryHub" defaultValue="Manufacturing Hub B, Malwana" />
                    <SupplierProfileField label="Pickup date" name="pickupDate" type="date" defaultValue="2026-08-01" />
                    <SupplierProfileField label="Delivery ETA" name="deliveryEta" type="date" defaultValue="2026-08-03" />
                  </div>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="mb-5 text-2xl font-extrabold text-[#202621] dark:text-stone-100">Logistics Assignment</h2>
                  <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                    <label className="grid min-w-0 gap-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Logistics partner</span>
                      <select name="partner" className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                        <option>Ruwan Logistics</option>
                        <option>Lanka Freight</option>
                        <option>Express Timber</option>
                      </select>
                    </label>
                    <SupplierProfileField label="Vehicle / container" name="vehicle" defaultValue="TRK-GA-2148" />
                    <label className="grid min-w-0 gap-2 sm:col-span-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Handling instructions</span>
                      <textarea name="instructions" rows={4} defaultValue="Seal teak bundle after moisture check. Call receiving manager 30 minutes before arrival." className="min-w-0 resize-none rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 py-3 outline-none focus:border-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100" />
                    </label>
                  </div>
                </article>
              </div>

              <aside className="grid h-fit gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="text-xl font-extrabold text-[#115745] dark:text-emerald-200">Manifest Preview</h2>
                  <div className="mt-5 grid gap-3 text-sm">
                    <ProfileInfoRow label="Load" value="150 m3" />
                    <ProfileInfoRow label="Route" value="Galle to Malwana" />
                    <ProfileInfoRow label="Priority" value="High" />
                    <ProfileInfoRow label="Insurance" value="Required" />
                  </div>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-[#e9e5dc] p-6 shadow-sm dark:border-white/10 dark:bg-[#202b28]">
                  <h2 className="mb-5 font-extrabold uppercase text-[#39433f] dark:text-stone-100">Readiness</h2>
                  <SupplierProgress label="Inventory allocated" value="100%" percent="100%" />
                  <SupplierProgress label="Partner capacity" value="76%" percent="76%" />
                  <SupplierProgress label="Documents" value="60%" percent="60%" />
                </article>

                <button type="submit" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#115745] px-5 font-extrabold text-white shadow-soft">
                  <Truck className="h-5 w-5" />
                  Create Shipment Draft
                </button>
                <button type="button" onClick={() => setNotice("Manifest downloaded for draft shipment.")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#cbd2cd] bg-white px-5 font-bold text-[#115745] dark:border-white/10 dark:bg-[#18211f] dark:text-emerald-200">
                  <Download className="h-5 w-5" />
                  Download Manifest
                </button>
              </aside>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function SpecBox({ label, value }) {
  return (
    <div className="grid min-h-24 content-center rounded-md border border-[#e1dfd7] bg-[#f4f0e8] p-4 dark:border-white/10 dark:bg-[#202b28]">
      <span className="text-xs font-extrabold uppercase tracking-wide text-[#4d5651] dark:text-stone-400">{label}</span>
      <strong className="mt-2 text-2xl leading-tight text-[#202621] dark:text-stone-100">{value}</strong>
    </div>
  );
}

function OrderSideCard({ icon: Icon, title, children }) {
  return (
    <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
      <div className="mb-6 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#115745] dark:text-emerald-200" />
        <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">{title}</h2>
      </div>
      <div className="text-[#4d5651] dark:text-stone-300">{children}</div>
    </article>
  );
}

function ContactRow({ icon: Icon, text }) {
  return (
    <p className="flex min-w-0 items-center gap-3 text-[#4d5651] dark:text-stone-300">
      <Icon className="h-4 w-4 shrink-0 text-[#68716c] dark:text-stone-400" />
      <span className="min-w-0 break-words">{text}</span>
    </p>
  );
}

function SupplierNotificationsPage({ theme, onToggleTheme }) {
  const [notice, setNotice] = useState("Notifications synced. 6 unread items need attention.");
  const [activeFilter, setActiveFilter] = useState("All");
  const [readIds, setReadIds] = useState([]);
  const notifications = [
    {
      id: "nt-1",
      type: "Purchase Order",
      title: "Silva Woodworks placed PO #8930 for Grade-A Teak",
      detail: "Review requested quantity, delivery date, and pricing before 5:00 PM.",
      time: "2 minutes ago",
      icon: ShoppingCart,
      tone: "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200",
      priority: "High",
    },
    {
      id: "nt-2",
      type: "Shipment",
      title: "Shipment #LV-721 delayed due to weather in Galle",
      detail: "Logistics partner recommends rerouting through Matara Transit Hub.",
      time: "45 minutes ago",
      icon: Truck,
      tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
      priority: "Critical",
    },
    {
      id: "nt-3",
      type: "Compliance",
      title: "Monthly logging-rights certificate verified",
      detail: "Your July compliance certificate is approved and attached to supplier records.",
      time: "3 hours ago",
      icon: ClipboardList,
      tone: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200",
      priority: "Normal",
    },
    {
      id: "nt-4",
      type: "Payment",
      title: "Payment of LKR 840,000 settled for PO #8812",
      detail: "Funds are available in the supplier wallet after delivery confirmation.",
      time: "Yesterday",
      icon: Wallet,
      tone: "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200",
      priority: "Normal",
    },
    {
      id: "nt-5",
      type: "Materials",
      title: "Mahogany Planks reached low-stock threshold",
      detail: "Available quantity is now 12.20 m3. Update availability or pause new POs.",
      time: "Yesterday",
      icon: Boxes,
      tone: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200",
      priority: "High",
    },
  ];
  const filtered = activeFilter === "All" ? notifications : notifications.filter((item) => item.type === activeFilter || item.priority === activeFilter);
  const unreadCount = notifications.length - readIds.length;

  const markRead = (id) => {
    setReadIds((items) => items.includes(id) ? items : [...items, id]);
    setNotice("Notification marked as read.");
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Notifications" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} onNewShipment={() => setNotice("New shipment draft opened from Notifications.")} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search notifications..." />
            </label>
            <div className="flex shrink-0 items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Language">
                <Globe2 className="h-5 w-5" />
              </button>
              <button
                onClick={onToggleTheme}
                className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="relative grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Unread notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#d94d58]" />}
              </button>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="flex min-w-0 items-start justify-between gap-5 max-md:grid">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">Notifications</h1>
                <p className="mt-2 max-w-2xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Monitor purchase orders, shipment exceptions, compliance approvals, payment updates, and stock alerts.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => { setReadIds(notifications.map((item) => item.id)); setNotice("All notifications marked as read."); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#8b5633] bg-[#fbf8f1] px-4 font-bold text-[#8b5633] dark:border-amber-500/60 dark:bg-[#202b28] dark:text-amber-200">
                  <CheckCircle2 className="h-4 w-4" />
                  Mark All Read
                </button>
                <button onClick={() => setNotice("Notification preferences opened.")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#115745] px-5 font-bold text-white shadow-sm">
                  <Settings className="h-5 w-5" />
                  Preferences
                </button>
              </div>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="grid grid-cols-4 gap-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
              <NotificationStat icon={Bell} label="Unread" value={String(unreadCount).padStart(2, "0")} />
              <NotificationStat icon={AlertTriangle} label="Critical" value="01" warning />
              <NotificationStat icon={Truck} label="Shipment Alerts" value="02" />
              <NotificationStat icon={ClipboardList} label="PO Updates" value="03" />
            </section>

            <section className="grid grid-cols-[minmax(0,1fr)_300px] gap-6 max-xl:grid-cols-1">
              <div className="grid gap-5">
                <div className="flex flex-wrap gap-3 rounded-lg border border-[#cbd2cd] bg-[#fbf8f1] p-4 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  {["All", "Critical", "Purchase Order", "Shipment", "Materials", "Payment"].map((filter) => (
                    <button key={filter} onClick={() => setActiveFilter(filter)} className={`min-h-9 rounded-full border px-4 text-sm font-semibold ${activeFilter === filter ? "border-[#115745] bg-white text-[#115745] dark:border-emerald-200 dark:bg-[#202b28] dark:text-emerald-200" : "border-[#cbd2cd] bg-[#e9e5dc] text-[#4d5651] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-300"}`}>
                      {filter}
                    </button>
                  ))}
                </div>

                <div className="grid gap-4">
                  {filtered.map((item) => {
                    const Icon = item.icon;
                    const read = readIds.includes(item.id);
                    return (
                      <article key={item.id} className={`grid grid-cols-[52px_minmax(0,1fr)_auto] gap-4 rounded-lg border p-5 shadow-sm max-sm:grid-cols-1 ${read ? "border-[#d8d6cf] bg-white/70 opacity-75 dark:border-white/10 dark:bg-[#18211f]/70" : "border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#18211f]"}`}>
                        <span className={`grid h-12 w-12 place-items-center rounded-full ${item.tone}`}>
                          <Icon className="h-6 w-6" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[#f4f0e8] px-2 py-1 text-xs font-extrabold uppercase text-[#68716c] dark:bg-[#202b28] dark:text-stone-400">{item.type}</span>
                            <span className={`rounded-full px-2 py-1 text-xs font-extrabold uppercase ${item.priority === "Critical" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200" : item.priority === "High" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" : "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200"}`}>{item.priority}</span>
                            {read && <span className="text-xs font-bold text-[#68716c] dark:text-stone-400">Read</span>}
                          </div>
                          <h2 className="mt-3 break-words text-xl font-extrabold leading-tight text-[#202621] dark:text-stone-100">{item.title}</h2>
                          <p className="mt-2 break-words leading-relaxed text-[#4d5651] dark:text-stone-300">{item.detail}</p>
                          <p className="mt-3 text-sm font-semibold text-[#68716c] dark:text-stone-400">{item.time}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <button onClick={() => markRead(item.id)} disabled={read} className="min-h-10 rounded-md border border-[#cbd2cd] bg-white px-3 text-sm font-bold text-[#115745] disabled:text-[#9aa39e] dark:border-white/10 dark:bg-[#202b28] dark:text-emerald-200 dark:disabled:text-stone-500">
                            {read ? "Read" : "Mark Read"}
                          </button>
                          <button onClick={() => setNotice(`${item.type} details opened.`)} className="grid h-10 w-10 place-items-center rounded-md bg-[#115745] text-white" aria-label={`Open ${item.type}`}>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <aside className="grid h-fit gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="text-xl font-extrabold text-[#115745] dark:text-emerald-200">Alert Channels</h2>
                  <div className="mt-5 grid gap-3">
                    {[
                      ["Email digest", "Enabled"],
                      ["Shipment SMS alerts", "Enabled"],
                      ["Low stock alerts", "Immediate"],
                      ["Payment updates", "Daily"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-4 rounded-md bg-[#f4f0e8] p-3 dark:bg-[#202b28]">
                        <span className="font-semibold text-[#4d5651] dark:text-stone-300">{label}</span>
                        <strong className="text-[#115745] dark:text-emerald-200">{value}</strong>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-[#e9e5dc] p-6 shadow-sm dark:border-white/10 dark:bg-[#202b28]">
                  <h2 className="mb-5 font-extrabold uppercase text-[#39433f] dark:text-stone-100">Response SLA</h2>
                  <SupplierProgress label="Critical alerts" value="18 min avg" percent="72%" />
                  <SupplierProgress label="PO reviews" value="2.4 hrs avg" percent="54%" />
                  <SupplierProgress label="Compliance tasks" value="1 day avg" percent="42%" />
                </article>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function NotificationStat({ icon: Icon, label, value, warning = false }) {
  return (
    <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
      <div className="flex items-center gap-4">
        <span className={`grid h-12 w-12 place-items-center rounded-full ${warning ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" : "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200"}`}>
          <Icon className="h-6 w-6" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-[#68716c] dark:text-stone-400">{label}</span>
          <strong className="text-3xl leading-tight text-[#202621] dark:text-stone-100">{value}</strong>
        </span>
      </div>
    </article>
  );
}

function SupplierProfilePage({ theme, onToggleTheme }) {
  const defaultProfile = {
    companyName: "Lumbini Timber Co.",
    registration: "PV-20491",
    email: "operations@lumbinitimber.lk",
    phone: "+94 11 245 8891",
    address: "No. 18, Galle Main Yard, Galle, Sri Lanka",
    manager: "John Doe",
    managerRole: "Logistics Manager",
  };
  const [notice, setNotice] = useState("Supplier profile loaded.");
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("woodverse-supplier-profile")) || defaultProfile;
    } catch {
      return defaultProfile;
    }
  });
  const [saved, setSaved] = useState(false);

  const saveSupplierProfile = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextProfile = {
      companyName: formData.get("companyName").trim(),
      registration: formData.get("registration").trim(),
      email: formData.get("email").trim(),
      phone: formData.get("phone").trim(),
      address: formData.get("address").trim(),
      manager: formData.get("manager").trim(),
      managerRole: formData.get("managerRole").trim(),
    };
    setProfile(nextProfile);
    setSaved(true);
    setNotice("Supplier profile changes saved.");
    try {
      localStorage.setItem("woodverse-supplier-profile", JSON.stringify(nextProfile));
    } catch {}
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Profile" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} onNewShipment={() => setNotice("New shipment draft opened from Profile.")} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/92 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/92 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search profile settings..." />
            </label>
            <div className="flex shrink-0 items-center gap-3">
              <button className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Language">
                <Globe2 className="h-5 w-5" />
              </button>
              <button
                onClick={onToggleTheme}
                className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Apps">
                <Grid3X3 className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1040px] gap-7 px-6 py-9 xl:px-10">
            <section className="grid grid-cols-[minmax(0,1fr)_300px] gap-6 max-lg:grid-cols-1">
              <div className="min-w-0">
                <h1 className="break-words text-4xl font-extrabold leading-tight text-[#115745] dark:text-emerald-200">Supplier Profile</h1>
                <p className="mt-2 max-w-3xl text-lg leading-relaxed text-[#4d5651] dark:text-stone-300">Manage your business identity, compliance credentials, payout preferences, and operating locations.</p>
              </div>
              <article className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-4 rounded-lg bg-[#2f6757] p-5 text-white shadow-soft">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white/16 text-xl font-extrabold">LT</span>
                <span className="min-w-0">
                  <strong className="block break-words text-xl leading-tight">{profile.companyName}</strong>
                  <span className="text-sm text-white/70">Verified Supplier</span>
                </span>
              </article>
            </section>

            <div className="rounded-md border border-[#cbd7cf] bg-white/65 px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm dark:border-emerald-300/20 dark:bg-[#202b28] dark:text-emerald-200">
              {notice}
            </div>

            <section className="grid grid-cols-4 gap-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
              <SupplierProfileStat icon={CheckCircle2} label="Verification" value="Approved" />
              <SupplierProfileStat icon={Boxes} label="Materials Listed" value="24" />
              <SupplierProfileStat icon={Truck} label="Yards" value="03" />
              <SupplierProfileStat icon={Wallet} label="Payout Status" value="Active" />
            </section>

            <section className="grid grid-cols-[minmax(0,1fr)_320px] gap-6 max-xl:grid-cols-1">
              <div className="grid gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="mb-6 flex items-center justify-between gap-4 max-sm:grid">
                    <div>
                      <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">Business Information</h2>
                      <p className="mt-1 text-[#68716c] dark:text-stone-400">These details appear on orders, invoices, and supplier verification records.</p>
                    </div>
                    {saved && <span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold uppercase text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200">Saved</span>}
                  </div>

                  <form key={JSON.stringify(profile)} onSubmit={saveSupplierProfile} onChange={() => setSaved(false)} className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                    <SupplierProfileField label="Company name" name="companyName" defaultValue={profile.companyName} />
                    <SupplierProfileField label="Registration number" name="registration" defaultValue={profile.registration} />
                    <SupplierProfileField label="Business email" name="email" defaultValue={profile.email} type="email" />
                    <SupplierProfileField label="Business phone" name="phone" defaultValue={profile.phone} type="tel" />
                    <SupplierProfileField label="Primary manager" name="manager" defaultValue={profile.manager} />
                    <SupplierProfileField label="Manager role" name="managerRole" defaultValue={profile.managerRole} />
                    <label className="grid min-w-0 gap-2 sm:col-span-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Registered address</span>
                      <textarea name="address" rows={3} defaultValue={profile.address} className="min-w-0 resize-none rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 py-3 outline-none focus:border-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100" />
                    </label>
                    <div className="flex justify-end gap-3 sm:col-span-2 max-sm:flex-col">
                      <button type="reset" className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold text-[#39433f] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">Cancel</button>
                      <button type="submit" className="min-h-11 rounded-md bg-[#115745] px-5 font-bold text-white">Save Changes</button>
                    </div>
                  </form>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-extrabold text-[#202621] dark:text-stone-100">Operating Yards</h2>
                    <button onClick={() => setNotice("New operating yard form opened.")} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-[#115745] px-4 font-bold text-white"><Plus className="h-4 w-4" /> Add Yard</button>
                  </div>
                  <div className="grid gap-4">
                    {[
                      ["Galle Main Yard", "88% full", "Grade-A Teak, Jackwood", "Primary"],
                      ["Matara Transit Hub", "32% full", "Mahogany, Satinwood", "Transit"],
                      ["Kandy Logging Yard", "54% full", "Rosewood, Nedun", "Logging"],
                    ].map(([name, capacity, materials, status]) => (
                      <article key={name} className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-4 rounded-md bg-[#f4f0e8] p-4 dark:bg-[#202b28] max-sm:grid-cols-1">
                        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#115745] dark:bg-[#18211f] dark:text-emerald-200"><Warehouse className="h-5 w-5" /></span>
                        <span className="min-w-0">
                          <strong className="block break-words text-[#202621] dark:text-stone-100">{name}</strong>
                          <span className="text-sm text-[#68716c] dark:text-stone-400">{materials} - {capacity}</span>
                        </span>
                        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase text-[#115745] dark:bg-[#18211f] dark:text-emerald-200">{status}</span>
                      </article>
                    ))}
                  </div>
                </article>
              </div>

              <aside className="grid h-fit gap-6">
                <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                  <h2 className="text-xl font-extrabold text-[#115745] dark:text-emerald-200">Compliance</h2>
                  <div className="mt-5 grid gap-3">
                    {[
                      ["FSC Certification", "Verified", "Expires Dec 12, 2026"],
                      ["Logging Rights", "Verified", "Renewal due Aug 15, 2026"],
                      ["Insurance Policy", "Review", "Expires in 21 days"],
                    ].map(([name, status, detail]) => (
                      <article key={name} className="rounded-md border border-[#e2dfd7] p-4 dark:border-white/10">
                        <div className="flex justify-between gap-3">
                          <strong className="text-[#202621] dark:text-stone-100">{name}</strong>
                          <span className={`rounded-full px-2 py-1 text-xs font-extrabold uppercase ${status === "Review" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200" : "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200"}`}>{status}</span>
                        </div>
                        <p className="mt-2 text-sm text-[#68716c] dark:text-stone-400">{detail}</p>
                      </article>
                    ))}
                  </div>
                  <button onClick={() => setNotice("Document upload panel opened.")} className="mt-5 min-h-11 w-full rounded-md border border-[#cbd2cd] bg-white font-bold text-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-emerald-200">Upload Document</button>
                </article>

                <article className="rounded-lg border border-[#cbd2cd] bg-[#e9e5dc] p-6 shadow-sm dark:border-white/10 dark:bg-[#202b28]">
                  <h2 className="text-xl font-extrabold text-[#202621] dark:text-stone-100">Payout Preferences</h2>
                  <div className="mt-5 grid gap-3 text-sm">
                    <ProfileInfoRow label="Bank" value="Commercial Bank PLC" />
                    <ProfileInfoRow label="Account" value="**** 4821" />
                    <ProfileInfoRow label="Settlement" value="Weekly, Monday" />
                    <ProfileInfoRow label="Currency" value="LKR" />
                  </div>
                  <button onClick={() => setNotice("Payout preferences editor opened.")} className="mt-5 min-h-11 w-full rounded-md bg-[#115745] font-bold text-white">Edit Payouts</button>
                </article>
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function SupplierProfileField({ label, name, defaultValue, type = "text" }) {
  return (
    <label className="grid min-w-0 gap-2">
      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">{label}</span>
      <input required name={name} type={type} defaultValue={defaultValue} className="min-h-11 min-w-0 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none focus:border-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100" />
    </label>
  );
}

function SupplierProfileStat({ icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
      <div className="flex items-center gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200">
          <Icon className="h-6 w-6" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-[#68716c] dark:text-stone-400">{label}</span>
          <strong className="break-words text-2xl leading-tight text-[#202621] dark:text-stone-100">{value}</strong>
        </span>
      </div>
    </article>
  );
}

function ProfileInfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 rounded-md bg-white/70 p-3 dark:bg-[#18211f]">
      <span className="text-[#68716c] dark:text-stone-400">{label}</span>
      <strong className="text-right text-[#202621] dark:text-stone-100">{value}</strong>
    </div>
  );
}

function SupplierMetricCard({ icon: Icon, title, value, helper, helperClass = "text-[#39433f] dark:text-stone-300", tone = "bg-[#bcefd9] text-[#115745]", dark = false }) {
  return (
    <article className={`relative min-h-[158px] overflow-hidden rounded-lg border border-[#cbd2cd] p-6 shadow-sm dark:border-white/10 ${dark ? "bg-[#2f6757] text-white dark:bg-[#214d43]" : "bg-[#fbf8f1] text-[#39433f] dark:bg-[#18211f] dark:text-stone-100"}`}>
      {dark && <Warehouse className="absolute -bottom-8 -right-6 h-28 w-28 text-white/8" />}
      <div className="mb-5 flex items-start justify-between gap-4">
        <span className={`grid h-11 w-11 place-items-center rounded-md ${dark ? "bg-[#164f40] text-white" : tone}`}><Icon className="h-6 w-6" /></span>
        {helper && <span className={`max-w-[110px] text-right font-semibold leading-snug ${dark ? "text-white/80" : helperClass}`}>{helper}</span>}
      </div>
      <h2 className={`text-sm font-semibold uppercase tracking-[0.08em] ${dark ? "text-white/70" : "text-[#4b5651] dark:text-stone-400"}`}>{title}</h2>
      <p className={`mt-3 text-xl font-medium ${dark ? "text-white" : "text-[#115745] dark:text-emerald-200"}`}>{value}</p>
    </article>
  );
}

function SupplierProgress({ label, value, percent }) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex justify-between gap-3 text-xs font-extrabold text-[#202621] dark:text-stone-100">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-[#d7d3ca] dark:bg-white/10">
        <span className="block h-full rounded-full bg-[#115745] dark:bg-emerald-300" style={{ width: percent }} />
      </div>
    </div>
  );
}

function SellerPage() {
  return (
    <>
      <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(260px,360px)] items-center gap-10 py-14 lg:gap-16 max-lg:grid-cols-1">
        <div className="min-w-0"><BackHome /><p className="eyebrow">Seller Program</p><h1 className="break-words text-4xl font-bold leading-tight sm:text-5xl">Sell Furniture and Wooden Products on WoodVerse</h1><p className="mt-5 max-w-2xl break-words text-lg leading-relaxed text-slate-500 dark:text-stone-400">Join a marketplace built for Sri Lankan woodcraft, custom furniture requests, managed payments, and delivery coordination.</p></div>
        <div className="overflow-hidden rounded-lg bg-white shadow-soft dark:bg-[#202624]"><div className="h-64"><CroppedImage crop={crop.sideboard} label="Seller product" /></div><div className="p-6"><strong className="break-words text-forest dark:text-emerald-200">Vendor profile review</strong><p className="break-words leading-snug">Typical approval in 2-3 business days</p></div></div>
      </section>
      <section className="page-shell grid grid-cols-[.95fr_1.05fr] gap-8 pb-16 max-lg:grid-cols-1">
        <Panel title="What Sellers Get" subtitle="Tools for listing, quoting, and fulfilling custom wood products."><div className="grid gap-4">{["Verified Marketplace Profile", "Order and Quote Management", "Payment and Delivery Support"].map((item, index) => <article key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#1d2422]"><span className="font-extrabold text-forest dark:text-emerald-200">{String(index + 1).padStart(2, "0")}</span><h3 className="break-words font-bold leading-snug">{item}</h3><p className="break-words leading-snug text-slate-500 dark:text-stone-400">Showcase products and manage marketplace workflows.</p></article>)}</div></Panel>
        <Panel title="Seller Application" subtitle="Submit your workshop details for review."><CheckoutGrid /><button className="mt-6 w-full rounded-md bg-forest py-3 font-bold text-white">Submit Application</button></Panel>
      </section>
      <Footer />
    </>
  );
}
