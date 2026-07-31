import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { ChatLauncher } from "./components/LayoutParts";
import { products } from "./data/catalog";
import { navigate } from "./utils";
import { AdminDashboardPage } from "./pages/admin";
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
} from "./pages/customer";
import { VendorCustomerOrdersPage, VendorDashboardPage, VendorHelpCenterPage, VendorInventoryPage, VendorProductionTrackingPage, VendorProductsPage, VendorProfilePage, VendorPurchaseOrdersPage, VendorQuotationsPage, VendorSettingsPage, VendorShipmentsPage, VendorSuppliersPage, VendorWarehousesPage } from "./pages/vendor";
import { SupplierProfilePage } from "./pages/supplier";

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

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const productMatch = path.match(/^\/products\/([^/]+)$/);
  const selectedProduct = productMatch ? products.find((item) => item.id === productMatch[1]) : null;
  const page = productMatch ? "productDetails" : routeMap[path] || "home";
  const isAuthPage = page === "login" || page === "forgotPassword";
  const isStandalonePage = standalonePages.has(page);

  return (
    <div className={theme === "dark" ? "min-h-screen bg-[#191d1c] text-stone-100" : "min-h-screen bg-paper text-ink"}>
      {!isAuthPage && !isStandalonePage && page !== "home" && <Header path={path} theme={theme} cartCount={cartCount} isLoggedIn={isLoggedIn} onToggleTheme={toggleTheme} />}
      {page === "home" && <HomePage addToCart={(item) => addToCart(item, setCart)} />}
      {page === "shop" && <CatalogPage title="Explore All WoodVerse Collections" subtitle="Browse furniture, wooden gifts, and timber products from verified Sri Lankan vendors." items={products} addToCart={(item) => addToCart(item, setCart)} />}
      {page === "furniture" && <CategoryPage type="furniture" addToCart={(item) => addToCart(item, setCart)} />}
      {page === "gifts" && <CategoryPage type="gift" addToCart={(item) => addToCart(item, setCart)} />}
      {page === "productDetails" && <ProductDetailsPage product={selectedProduct} addToCart={(item) => addToCart(item, setCart)} />}
      {page === "cart" && <CartPage cart={cart} setCart={setCart} />}
      {page === "delivery" && <DeliveryPage />}
      {page === "payment" && <PaymentPage cart={cart} setCart={setCart} />}
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
