import { lazy, Suspense, useEffect, useState } from "react";
import { Header } from "./components/Header";
import { ChatLauncher } from "./components/LayoutParts";
import { products as fallbackProducts } from "./data/catalog";
import { apiRequest, navigate } from "./utils";
import {
  CatalogPage,
  CartPage,
  CategoryPage,
  ChatbotPage,
  DeliveryPage,
  ForgotPasswordPage,
  HomePage,
  LoginPage,
  PaymentPage,
  ProductDetailsPage,
  ProfilePage,
  SellerPage,
} from "./pages/customer/index";

const lazyPage = (loader, exportName) => lazy(() => loader().then((module) => ({ default: module[exportName] })));

const AdminDashboardPage = lazyPage(() => import("./pages/admin/index"), "AdminDashboardPage");
const SupplierProfilePage = lazyPage(() => import("./pages/supplier/index"), "SupplierProfilePage");
const VendorCustomerOrdersPage = lazyPage(() => import("./pages/vendor/index"), "VendorCustomerOrdersPage");
const VendorDashboardPage = lazyPage(() => import("./pages/vendor/index"), "VendorDashboardPage");
const VendorHelpCenterPage = lazyPage(() => import("./pages/vendor/index"), "VendorHelpCenterPage");
const VendorInventoryPage = lazyPage(() => import("./pages/vendor/index"), "VendorInventoryPage");
const VendorProductionTrackingPage = lazyPage(() => import("./pages/vendor/index"), "VendorProductionTrackingPage");
const VendorProductsPage = lazyPage(() => import("./pages/vendor/index"), "VendorProductsPage");
const VendorProfilePage = lazyPage(() => import("./pages/vendor/index"), "VendorProfilePage");
const VendorPurchaseOrdersPage = lazyPage(() => import("./pages/vendor/index"), "VendorPurchaseOrdersPage");
const VendorQuotationsPage = lazyPage(() => import("./pages/vendor/index"), "VendorQuotationsPage");
const VendorSettingsPage = lazyPage(() => import("./pages/vendor/index"), "VendorSettingsPage");
const VendorShipmentsPage = lazyPage(() => import("./pages/vendor/index"), "VendorShipmentsPage");
const VendorSuppliersPage = lazyPage(() => import("./pages/vendor/index"), "VendorSuppliersPage");
const VendorWarehousesPage = lazyPage(() => import("./pages/vendor/index"), "VendorWarehousesPage");

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
  "/vendor-dashboard": "vendorDashboard",
  "/vendor/products": "vendorProducts",
  "/vendor/customer-orders": "vendorCustomerOrders",
  "/vendor/quotations": "vendorQuotations",
  "/vendor/production": "vendorProduction",
  "/vendor/suppliers": "vendorSuppliers",
  "/vendor/purchase-orders": "vendorPurchaseOrders",
  "/vendor/inventory": "vendorInventory",
  "/vendor/warehouses": "vendorWarehouses",
  "/vendor/shipments": "vendorShipments",
  "/vendor/profile": "vendorProfile",
  "/vendor/settings": "vendorSettings",
  "/vendor/help": "vendorHelp",
  "/supplier/profile": "supplierProfile",
  "/login": "login",
  "/forgot-password": "forgotPassword",
  "/profile": "profile",
  "/admin": "adminDashboard",
  "/admin-dashboard": "adminDashboard",
};

const standalonePages = new Set(["vendorDashboard", "vendorProducts", "vendorCustomerOrders", "vendorQuotations", "vendorProduction", "vendorSuppliers", "vendorPurchaseOrders", "vendorInventory", "vendorWarehouses", "vendorShipments", "vendorProfile", "vendorSettings", "vendorHelp", "supplierProfile", "adminDashboard"]);

export default function App() {
  const [path, setPath] = useState(window.location.pathname.replace(/\/$/, "") || "/");
  const [catalogProducts, setCatalogProducts] = useState(fallbackProducts);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("woodverse-theme") || (path === "/" ? "dark" : "light");
    } catch {
      return path === "/" ? "dark" : "light";
    }
  });
  const [cart, setCart] = useState([
    { ...fallbackProducts[0], quantity: 1 },
    { ...fallbackProducts[1], quantity: 1 },
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
    let cancelled = false;
    apiRequest("/api/catalog")
      .then(({ products = [] }) => {
        if (!cancelled && products.length) {
          setCatalogProducts(normalizeCatalogProducts(products));
        }
      })
      .catch(() => {
        if (!cancelled) setCatalogProducts(fallbackProducts);
      });
    return () => {
      cancelled = true;
    };
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
      localStorage.removeItem("woodverse-auth-token");
      localStorage.removeItem("woodverse-api-user");
    } catch {}
    navigate("/");
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const productMatch = path.match(/^\/products\/([^/]+)$/);
  const selectedProduct = productMatch ? catalogProducts.find((item) => item.id === productMatch[1]) : null;
  const page = productMatch ? "productDetails" : routeMap[path] || "home";
  const isAuthPage = page === "login" || page === "forgotPassword";
  const isStandalonePage = standalonePages.has(page);

  return (
    <div className={theme === "dark" ? "min-h-screen bg-[#191d1c] text-stone-100" : "min-h-screen bg-paper text-ink"}>
      {!isAuthPage && !isStandalonePage && page !== "home" && <Header path={path} theme={theme} cartCount={cartCount} isLoggedIn={isLoggedIn} onToggleTheme={toggleTheme} />}
      <Suspense fallback={<RouteLoading standalone={isStandalonePage} />}>
        {page === "home" && <HomePage addToCart={(item) => addToCart(item, setCart)} />}
        {page === "shop" && <CatalogPage title="Explore All WoodVerse Collections" subtitle="Browse furniture, wooden gifts, and timber products from verified Sri Lankan vendors." items={catalogProducts} addToCart={(item) => addToCart(item, setCart)} />}
        {page === "furniture" && <CategoryPage type="furniture" items={catalogProducts} addToCart={(item) => addToCart(item, setCart)} />}
        {page === "gifts" && <CategoryPage type="gift" items={catalogProducts} addToCart={(item) => addToCart(item, setCart)} />}
        {page === "productDetails" && <ProductDetailsPage product={selectedProduct} catalogItems={catalogProducts} addToCart={(item) => addToCart(item, setCart)} />}
        {page === "cart" && <CartPage cart={cart} setCart={setCart} />}
        {page === "delivery" && <DeliveryPage />}
        {page === "payment" && <PaymentPage cart={cart} setCart={setCart} catalogItems={catalogProducts} />}
        {page === "chatbot" && <ChatbotPage />}
        {page === "seller" && <SellerPage />}
        {page === "vendorDashboard" && <VendorDashboardPage />}
        {page === "vendorProducts" && <VendorProductsPage />}
        {page === "vendorCustomerOrders" && <VendorCustomerOrdersPage />}
        {page === "vendorQuotations" && <VendorQuotationsPage />}
        {page === "vendorProduction" && <VendorProductionTrackingPage />}
        {page === "vendorSuppliers" && <VendorSuppliersPage />}
        {page === "vendorPurchaseOrders" && <VendorPurchaseOrdersPage />}
        {page === "vendorInventory" && <VendorInventoryPage />}
        {page === "vendorWarehouses" && <VendorWarehousesPage />}
        {page === "vendorShipments" && <VendorShipmentsPage />}
        {page === "vendorProfile" && <VendorProfilePage />}
        {page === "vendorSettings" && <VendorSettingsPage />}
        {page === "vendorHelp" && <VendorHelpCenterPage />}
        {page === "supplierProfile" && <SupplierProfilePage theme={theme} onToggleTheme={toggleTheme} />}
        {page === "adminDashboard" && <AdminDashboardPage />}
        {page === "profile" && <ProfilePage isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
        {page === "login" && <LoginPage onAuthSuccess={handleAuthSuccess} />}
        {page === "forgotPassword" && <ForgotPasswordPage />}
      </Suspense>
      {page !== "chatbot" && !isAuthPage && !isStandalonePage && <ChatLauncher />}
    </div>
  );
}

function RouteLoading({ standalone }) {
  return (
    <div className={`grid place-items-center ${standalone ? "min-h-screen" : "min-h-[calc(100svh-80px)]"}`}>
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-emerald-100 border-t-[#1c614f]" aria-label="Loading" />
    </div>
  );
}

function normalizeCatalogProducts(apiProducts) {
  return apiProducts.map((product, index) => {
    const fallback = fallbackProducts.find((item) => item.name === product.name || item.id === product.id) || {};
    const quantityAvailable = Number(product.quantityAvailable ?? product.stock_quantity ?? 0);
    const stockType = product.stockType || (quantityAvailable === 0 ? "out" : quantityAvailable <= 4 ? "low" : "in");
    return {
      ...fallback,
      ...product,
      id: fallback.id || product.id,
      databaseId: product.id,
      name: product.name || fallback.name,
      vendor: product.vendor || product.vendor_name || fallback.vendor || "WoodVerse Vendor",
      description: product.description || fallback.description,
      price: Number(product.price ?? fallback.price ?? 0),
      stock: product.stock || (stockType === "out" ? "Out of Stock" : stockType === "low" ? `Low Stock (${quantityAvailable})` : "In Stock"),
      stockType,
      tags: fallback.tags || [product.material, product.category].filter(Boolean),
      image: product.image || product.imageUrl || product.image_url || fallback.image,
      category: product.category || fallback.category || "furniture",
      room: fallback.room || product.room || (product.category === "gift" ? "Gift Sets" : "Living"),
      featured: fallback.featured || index + 1,
      newest: fallback.newest || product.createdAt || product.created_at || new Date().toISOString(),
      quantityAvailable,
    };
  });
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
