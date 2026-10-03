import { Suspense, useEffect, useState } from "react";
import { Header } from "./components/Header";
import { ChatLauncher } from "./components/LayoutParts";
import { products as fallbackProducts } from "./data/catalog";
import {
  AdminDashboardPage,
  SupplierAppsPage,
  SupplierDashboardPage,
  SupplierMaterialsPage,
  SupplierNewShipmentPage,
  SupplierNotificationsPage,
  SupplierProfilePage,
  SupplierPurchaseOrderPage,
  SupplierSettingsPage,
  SupplierShipmentsPage,
  SupplierSupportPage,
  SupplierVendorsPage,
  VendorCustomerOrdersPage,
  VendorDashboardPage,
  VendorHelpCenterPage,
  VendorInventoryPage,
  VendorProductionTrackingPage,
  VendorProductsPage,
  VendorProfilePage,
  VendorPurchaseOrdersPage,
  VendorQuotationsPage,
  VendorSettingsPage,
  VendorShipmentsPage,
  VendorSuppliersPage,
  VendorWarehousesPage,
  authPages,
  pageRoles,
  resolvePage,
  standalonePages,
} from "./config/routes";
import { apiRequest, getSession, navigate, signOut } from "./utils";
import {
  CatalogPage,
  CartPage,
  CategoryPage,
  ChatbotPage,
  DeliveryPage,
  FeaturesPage,
  ForgotPasswordPage,
  HomePage,
  LoginPage,
  PaymentPage,
  ProductDetailsPage,
  ProfilePage,
  SellerPage,
} from "./pages/customer/index";

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
  // The session is re-read on every relevant change, so the UI cannot be logged in
  // without a token the server would also accept.
  const [session, setSession] = useState(() => getSession());
  const isLoggedIn = session !== null;

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
    const onUnauthorized = () => setSession(null);
    window.addEventListener("woodverse:unauthorized", onUnauthorized);
    window.addEventListener("storage", onUnauthorized);
    return () => {
      window.removeEventListener("woodverse:unauthorized", onUnauthorized);
      window.removeEventListener("storage", onUnauthorized);
    };
  }, []);

  // The session is cached in state, so it has to be re-read on every navigation. Without
  // this a sign out that happened anywhere else, such as a portal page calling signOut(),
  // left the guard in App still believing the visitor was signed in.
  useEffect(() => {
    setSession(getSession());
  }, [path]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("woodverse-theme", theme);
    } catch {}
  }, [theme]);

  const handleAuthSuccess = () => {
    setSession(getSession());
  };

  const handleLogout = () => {
    signOut();
    setSession(null);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const productMatch = path.match(/^\/products\/([^/]+)$/);
  const selectedProduct = productMatch ? catalogProducts.find((item) => item.id === productMatch[1]) : null;
  const page = productMatch ? "productDetails" : resolvePage(path);
  const isAuthPage = authPages.has(page);
  const isStandalonePage = standalonePages.has(page);

  const allowedRoles = pageRoles[page];
  const isBlocked = Boolean(allowedRoles && (!session || !allowedRoles.includes(session.role)));

  // Redirect in an effect so the guard cannot render the protected page for even a
  // frame before navigating away.
  //
  // The session is re-read here rather than taken from this render. Signing in stores the
  // token and then navigates in the same tick, so the popstate that changes the path can be
  // committed before the queued session update. Reading the render's `session` in that window
  // saw a null session and bounced a user who had just signed in straight back to /login.
  useEffect(() => {
    const allowedRoles = pageRoles[resolvePage(path)];
    if (!allowedRoles) return;

    const currentSession = getSession();
    if (currentSession && allowedRoles.includes(currentSession.role)) return;

    const target = currentSession ? "/" : `/login?next=${encodeURIComponent(path)}`;
    if (window.location.pathname !== target) {
      navigate(target);
    }
  }, [session, path]);

  return (
    <div className={theme === "dark" ? "min-h-screen bg-[#191d1c] text-stone-100" : "min-h-screen bg-paper text-ink"}>
      {!isAuthPage && !isStandalonePage && page !== "home" && <Header path={path} theme={theme} cartCount={cartCount} isLoggedIn={isLoggedIn} onToggleTheme={toggleTheme} onLogout={handleLogout} />}
      {isBlocked ? (
        <RouteLoading standalone={isStandalonePage} />
      ) : (
      <Suspense fallback={<RouteLoading standalone={isStandalonePage} />}>
        {page === "home" && <HomePage addToCart={(item) => addToCart(item, setCart)} />}
        {page === "features" && <FeaturesPage />}
        {page === "shop" && <CatalogPage title="Explore All WoodVerse Collections" subtitle="Browse furniture, wooden gifts, and timber products from verified Sri Lankan vendors." items={catalogProducts} addToCart={(item) => addToCart(item, setCart)} />}
        {page === "furniture" && <CategoryPage type="furniture" items={catalogProducts} addToCart={(item) => addToCart(item, setCart)} />}
        {page === "gifts" && <CategoryPage type="gift" items={catalogProducts} addToCart={(item) => addToCart(item, setCart)} />}
        {page === "productDetails" && <ProductDetailsPage product={selectedProduct} catalogItems={catalogProducts} addToCart={(item) => addToCart(item, setCart)} />}
        {page === "cart" && <CartPage cart={cart} setCart={setCart} />}
        {page === "delivery" && <DeliveryPage cart={cart} />}
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
        {page === "supplierDashboard" && <SupplierDashboardPage theme={theme} onToggleTheme={toggleTheme} />}
        {page === "supplierPurchaseOrder" && <SupplierPurchaseOrderPage theme={theme} onToggleTheme={toggleTheme} />}
        {page === "supplierMaterials" && <SupplierMaterialsPage theme={theme} onToggleTheme={toggleTheme} />}
        {page === "supplierShipments" && <SupplierShipmentsPage theme={theme} onToggleTheme={toggleTheme} />}
        {page === "supplierNewShipment" && <SupplierNewShipmentPage theme={theme} onToggleTheme={toggleTheme} />}
        {page === "supplierVendors" && <SupplierVendorsPage theme={theme} onToggleTheme={toggleTheme} />}
        {page === "supplierNotifications" && <SupplierNotificationsPage theme={theme} onToggleTheme={toggleTheme} />}
        {page === "supplierProfile" && <SupplierProfilePage theme={theme} onToggleTheme={toggleTheme} />}
        {page === "supplierApps" && <SupplierAppsPage theme={theme} onToggleTheme={toggleTheme} />}
        {page === "supplierSupport" && <SupplierSupportPage theme={theme} onToggleTheme={toggleTheme} />}
        {page === "supplierSettings" && <SupplierSettingsPage theme={theme} onToggleTheme={toggleTheme} />}
        {page === "adminDashboard" && <AdminDashboardPage />}
        {page === "profile" && <ProfilePage isLoggedIn={isLoggedIn} role={session?.role} onLogout={handleLogout} />}
        {page === "login" && <LoginPage onAuthSuccess={handleAuthSuccess} />}
        {page === "forgotPassword" && <ForgotPasswordPage />}
      </Suspense>
      )}
      {page !== "chatbot" && !isAuthPage && !isStandalonePage && !isBlocked && <ChatLauncher />}
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
