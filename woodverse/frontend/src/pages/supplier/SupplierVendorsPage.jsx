import { useEffect, useState, lazy } from "react";
import {
  ChevronRight,
  ClipboardList,
  Download,
  Eye,
  Globe2,
  Grid3X3,
  MapPin,
  Moon,
  Search,
  Send,
  Sun,
  UserPlus,
  X,
} from "lucide-react";
import { io } from "socket.io-client";
import { navigate } from "../../utils";
import { SupplierSidebar } from "./SupplierSidebar";
import { formatLkrCompact, formatMessageTime } from "./format.js";
import { SupplierProfileField } from "./shared";

export function SupplierVendorsPage({ theme, onToggleTheme }) {
  console.log("🚨🚨🚨 SUPPLIER VENDORS PAGE IS RENDERING 🚨🚨🚨");
  console.log("🚨🚨🚨 SUPPLIER VENDORS PAGE IS RENDERING 🚨🚨🚨");
  const [notice, setNotice] = useState("Vendor network loaded with 42 active marketplace partners.");
  const [showMap, setShowMap] = useState(false);
  const [mapRegion, setMapRegion] = useState("Sri Lanka timber suppliers");
  const [activeMessageVendor, setActiveMessageVendor] = useState(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [vendorMessages, setVendorMessages] = useState(VENDOR_MESSAGE_SEEDS);
  const [socketClient, setSocketClient] = useState(null);
  const [socketStatus, setSocketStatus] = useState("Connecting");
  const [activePoVendor, setActivePoVendor] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All Regions");
  const [materialFilter, setMaterialFilter] = useState("All Timber & Hardware");
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
  const activeMessages = activeMessageVendor ? vendorMessages[activeMessageVendor.name] || [] : [];
  const nextPoNumber = `PO-${String(8931 + purchaseOrders.length).padStart(4, "0")}`;

  // The three filters below are the only way to narrow this directory, so they have to
  // actually narrow it rather than just look selectable.
  const filteredVendors = vendorsList.filter((vendor) => {
    if (statusFilter !== "All" && vendor.status !== statusFilter) return false;
    if (regionFilter !== "All Regions" && !vendor.location.startsWith(regionFilter)) return false;
    if (materialFilter !== "All Timber & Hardware" && !vendor.materials.some((material) => material.startsWith(materialFilter))) return false;
    return true;
  });

  useEffect(() => {
    console.log("🚨🚨🚨 SUPPLIER VENDORS PAGE SOCKET EFFECT STARTED 🚨🚨🚨");

    const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL;

    const socketUrl =
      configuredSocketUrl && configuredSocketUrl !== "/"
        ? configuredSocketUrl
        : import.meta.env.VITE_API_URL || "http://localhost:4000";

    const token = localStorage.getItem("woodverse-auth-token");

    console.log("🔌 Supplier Socket.IO URL:", socketUrl);
    console.log("🔑 Supplier Socket token exists:", Boolean(token));

    if (!token) {
      console.warn("⚠️ Supplier Socket.IO: authentication token is missing.");
      setSocketStatus("Offline");
      return;
    }

    const socket = io(socketUrl, {
      auth: { token },
      autoConnect: true,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    const handleConnect = () => {
      console.log("✅ Supplier Socket.IO connected:", socket.id);

      setSocketStatus("Connected");

      socket.emit("vendor:join", {
        room: "supplier-vendor-messages",
        supplier: "Lumbini Timber Co.",
      });

      console.log("📡 Supplier joined vendor messaging room");
    };

    const handleDisconnect = () => {
      console.log("❌ Supplier Socket.IO disconnected");
      setSocketStatus("Offline");
    };

    const handleConnectError = (error) => {
      console.error(
        "❌ Supplier Socket.IO connection error:",
        error.message
      );
      setSocketStatus("Offline");
    };

    const handleIncomingMessage = (message) => {
      if (!message?.vendor || !message?.text) {
        return;
      }

      setVendorMessages((threads) => ({
        ...threads,
        [message.vendor]: [
          ...(threads[message.vendor] || []),
          {
            id: message.id || `socket-${Date.now()}`,
            sender: message.sender || "vendor",
            text: message.text,
            time: message.time || formatMessageTime(new Date()),
          },
        ],
      }));
    };

    const handlePurchaseOrder = (event) => {
      console.log("📦 New supplier purchase order received:", event);

      const purchaseOrder = event?.purchaseOrder;

      if (!purchaseOrder) {
        console.warn("⚠️ Purchase order event did not contain purchaseOrder.");
        return;
      }

      const incomingOrder = {
        id: purchaseOrder.id,
        vendor:
          purchaseOrder.vendor_name ||
          purchaseOrder.vendor_email ||
          "WoodVerse Vendor",
        material: purchaseOrder.product_name || "Material",
        quantity: Number(purchaseOrder.quantity || 0),
        unitPrice: 0,
        total: 0,
        deliveryDate: "Pending",
        destination: "Supplier Yard",
        notes: purchaseOrder.notes || "",
        status: "Pending",
        createdAt: purchaseOrder.created_at
          ? formatMessageTime(new Date(purchaseOrder.created_at))
          : formatMessageTime(new Date()),
      };

      setPurchaseOrders((orders) => {
        const alreadyExists = orders.some(
          (order) => order.id === incomingOrder.id
        );

        if (alreadyExists) {
          return orders;
        }

        return [incomingOrder, ...orders];
      });

      setNotice(
        `📦 New purchase order received from ${incomingOrder.vendor}.`
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("vendor:message", handleIncomingMessage);
    socket.on("supplier:purchase-order", handlePurchaseOrder);

    setSocketClient(socket);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("vendor:message", handleIncomingMessage);
      socket.off("supplier:purchase-order", handlePurchaseOrder);
      socket.disconnect();
    };
  }, []);

  const openVendorMessages = (vendor) => {
    setActiveMessageVendor(vendor);
    setMessageDraft("");
    setNotice(`Socket.IO message thread opened for ${vendor.name}.`);
    socketClient?.emit("vendor:thread:open", { vendor: vendor.name, supplier: "Lumbini Timber Co." });
  };

  const sendVendorMessage = (event) => {
    event.preventDefault();
    const text = messageDraft.trim();
    if (!text || !activeMessageVendor) {
      return;
    }
    const message = {
      id: `msg-${Date.now()}`,
      vendor: activeMessageVendor.name,
      sender: "supplier",
      text,
      time: formatMessageTime(new Date()),
    };
    setVendorMessages((threads) => ({
      ...threads,
      [activeMessageVendor.name]: [...(threads[activeMessageVendor.name] || []), message],
    }));
    socketClient?.emit("vendor:message:send", {
      room: "supplier-vendor-messages",
      supplier: "Lumbini Timber Co.",
      vendor: activeMessageVendor.name,
      text,
      sentAt: new Date().toISOString(),
    });
    setMessageDraft("");
    setNotice(socketClient?.connected ? `Message sent to ${activeMessageVendor.name}.` : `Message queued locally for ${activeMessageVendor.name}.`);
  };

  const openPurchaseOrderDraft = (vendor) => {
    setActivePoVendor(vendor);
    setActiveMessageVendor(null);
    setNotice(`Purchase order draft opened for ${vendor.name}.`);
  };

  const createPurchaseOrder = (event) => {
    event.preventDefault();
    if (!activePoVendor) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    const quantity = Number(formData.get("quantity"));
    const unitPrice = Number(formData.get("unitPrice"));
    const po = {
      id: formData.get("poNumber"),
      vendor: activePoVendor.name,
      material: formData.get("material"),
      quantity,
      unitPrice,
      total: quantity * unitPrice,
      deliveryDate: formData.get("deliveryDate"),
      destination: formData.get("destination").trim(),
      notes: formData.get("notes").trim(),
      status: "Draft",
      createdAt: formatMessageTime(new Date()),
    };
    setPurchaseOrders((orders) => [po, ...orders]);
    setVendorMessages((threads) => ({
      ...threads,
      [activePoVendor.name]: [
        ...(threads[activePoVendor.name] || []),
        {
          id: `po-message-${Date.now()}`,
          sender: "supplier",
          text: `${po.id} created for ${po.quantity} units of ${po.material}.`,
          time: po.createdAt,
        },
      ],
    }));
    socketClient?.emit("vendor:message:send", {
      room: "supplier-vendor-messages",
      supplier: "Lumbini Timber Co.",
      vendor: activePoVendor.name,
      text: `${po.id} purchase order draft created for ${po.material}.`,
      sentAt: new Date().toISOString(),
    });
    setNotice(`${po.id} created for ${activePoVendor.name}.`);
    setActivePoVendor(null);
  };

  return (
    <main className="min-h-screen bg-[#f7f2e9] text-[#39433f] dark:bg-[#111816] dark:text-stone-100">
      <div className="grid min-h-screen lg:grid-cols-[256px_minmax(0,1fr)]">
        <SupplierSidebar active="Vendors" onUnavailable={(label) => setNotice(`${label} section will be available soon.`)} />

        <section className="min-w-0">
          <header className="flex min-h-20 items-center justify-between gap-5 border-b border-[#cfd4cf] bg-[#fbf8f1]/90 px-6 backdrop-blur dark:border-white/10 dark:bg-[#151d1b]/90 xl:px-10">
            <label className="flex h-11 w-full max-w-[450px] min-w-0 items-center rounded-md border border-[#c8d0ca] bg-[#f7f3ec] px-3 text-[#7a8480] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-400">
              <Search className="h-5 w-5 shrink-0" />
              <input className="min-w-0 flex-1 bg-transparent px-3 outline-none dark:text-stone-100" placeholder="Search vendors, materials, or regions..." />
            </label>
            <div className="flex shrink-0 items-center gap-3">
              <button onClick={() => setNotice("Language selector opened.")} className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Language">
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
              <button onClick={() => navigate("/supplier/apps")} className="grid h-10 w-10 place-items-center rounded-full text-[#39433f] transition hover:bg-[#eee9df] dark:text-stone-300 dark:hover:bg-[#202b28]" aria-label="Apps">
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
                <FilterSelect label="Filter by Material" value={materialFilter} options={["All Timber & Hardware", "Teak", "Mahogany", "Brass Hardware", "Varnish", "Jack Wood"]} onChange={setMaterialFilter} />
                <FilterSelect label="Supplier Status" value={statusFilter} segmented options={["All", "Preferred", "Active"]} onChange={setStatusFilter} />
                <FilterSelect label="Location" value={regionFilter} options={["All Regions", "Colombo", "Moratuwa", "Kandy", "Galle"]} icon={MapPin} onChange={setRegionFilter} />
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
                {filteredVendors.length ? filteredVendors.map((vendor) => (
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
                      <button onClick={() => openVendorMessages(vendor)} className="grid h-9 w-9 place-items-center rounded-md text-[#115745] hover:bg-[#f4f0e8] dark:text-emerald-200 dark:hover:bg-[#202b28]" aria-label={`Message ${vendor.name}`}>
                        <Send className="h-5 w-5" />
                      </button>
                      <button onClick={() => openPurchaseOrderDraft(vendor)} disabled={vendor.status === "Inactive"} className="min-h-11 rounded-md bg-[#8b5633] px-4 text-sm font-extrabold text-white disabled:bg-[#aeb8b1] disabled:text-[#52605a]">
                        Create PO
                      </button>
                    </div>
                  </article>
                )) : (
                  <p className="px-6 py-10 text-center text-[#68716c] dark:text-stone-400">No suppliers match the current filters.</p>
                )}
              </div>
              <div className="flex min-w-0 items-center justify-between gap-4 border-t border-[#e2dfd7] px-6 py-4 text-sm dark:border-white/10 max-sm:flex-col max-sm:items-start">
                <p>Showing 1-4 of 42 suppliers</p>
                <div className="flex gap-2">
                  {["1", "2", "3", "...", "11"].map((page, index) => (
                    <button key={`${page}-${index}`} onClick={() => setNotice(`Supplier directory page ${page} opened.`)} className={`grid h-9 min-w-9 place-items-center rounded-md px-2 font-bold ${index === 0 ? "bg-[#115745] text-white" : "border border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#202b28]"}`}>{page}</button>
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
                      setNotice(showMap ? "Google vendor map minimized." : "Google vendor map opened.");
                    }}
                    className="font-bold text-[#115745] dark:text-emerald-200"
                  >
                    {showMap ? "Hide Map" : "View Map"}
                  </button>
                </div>
                <GoogleVendorMap expanded={showMap} selectedRegion={mapRegion} onSelectRegion={(region) => {
                  setMapRegion(region);
                  setShowMap(true);
                  setNotice(`Google map centered on ${region}.`);
                }} />
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

            {purchaseOrders.length > 0 && (
              <section className="rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18211f]">
                <div className="mb-5 flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-[#115745] dark:text-emerald-200" />
                  <h2 className="text-xl font-semibold text-[#115745] dark:text-emerald-200">Recent Purchase Orders</h2>
                </div>
                <div className="grid gap-3">
                  {purchaseOrders.slice(0, 4).map((po) => (
                    <article key={po.id} className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 rounded-md border border-[#e2dfd7] bg-[#fbf8f1] p-4 dark:border-white/10 dark:bg-[#202b28] max-md:grid-cols-1">
                      <div className="min-w-0">
                        <strong className="block break-words text-[#202621] dark:text-stone-100">{po.id} - {po.vendor}</strong>
                        <span className="text-sm text-[#68716c] dark:text-stone-400">{po.material} / {po.quantity} units / due {po.deliveryDate}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="block text-sm font-bold text-[#115745] dark:text-emerald-200">{formatLkrCompact(po.total)}</span>
                        <span className="text-sm text-[#68716c] dark:text-stone-400">{po.destination}</span>
                      </div>
                      <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-extrabold text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">{po.status}</span>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {activeMessageVendor && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-[#111816]/60 p-4">
                <section className="grid max-h-[92vh] w-full max-w-[760px] overflow-hidden rounded-lg border border-[#cbd2cd] bg-white shadow-2xl dark:border-white/10 dark:bg-[#18211f]">
                  <header className="flex min-w-0 items-start justify-between gap-4 border-b border-[#e2dfd7] p-5 dark:border-white/10">
                    <div className="grid min-w-0 grid-cols-[46px_minmax(0,1fr)] items-center gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-md bg-[#e9e5dc] text-sm font-extrabold text-[#115745] dark:bg-[#202b28] dark:text-emerald-200">{activeMessageVendor.initials}</span>
                      <div className="min-w-0">
                        <h2 className="break-words text-2xl font-extrabold text-[#115745] dark:text-emerald-200">{activeMessageVendor.name}</h2>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#68716c] dark:text-stone-400">
                          <span>{activeMessageVendor.location}</span>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-extrabold ${socketStatus === "Connected" ? "bg-emerald-100 text-[#115745] dark:bg-emerald-950/40 dark:text-emerald-200" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200"}`}>
                            Socket.IO {socketStatus}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setActiveMessageVendor(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#202b28]" aria-label="Close vendor messages">
                      <X className="h-5 w-5" />
                    </button>
                  </header>

                  <div className="grid max-h-[52vh] gap-4 overflow-y-auto bg-[#fbf8f1] p-5 dark:bg-[#111816]">
                    {activeMessages.map((message) => (
                      <article key={message.id} className={`max-w-[82%] min-w-0 ${message.sender === "supplier" ? "justify-self-end" : ""}`}>
                        <p className={`break-words rounded-lg p-4 leading-relaxed ${message.sender === "supplier" ? "bg-[#115745] text-white" : "border border-[#cbd2cd] bg-white text-[#202621] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100"}`}>
                          {message.text}
                        </p>
                        <time className={`mt-1 block text-xs text-[#68716c] dark:text-stone-400 ${message.sender === "supplier" ? "text-right" : ""}`}>{message.time}</time>
                      </article>
                    ))}
                  </div>

                  <form onSubmit={sendVendorMessage} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-[#e2dfd7] p-5 dark:border-white/10">
                    <input
                      value={messageDraft}
                      onChange={(event) => setMessageDraft(event.target.value)}
                      className="min-h-12 min-w-0 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none focus:border-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100"
                      placeholder={`Message ${activeMessageVendor.name}...`}
                    />
                    <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#115745] px-5 font-bold text-white">
                      <Send className="h-4 w-4" />
                      Send
                    </button>
                  </form>
                </section>
              </div>
            )}

            {activePoVendor && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-[#111816]/60 p-4">
                <form onSubmit={createPurchaseOrder} className="grid max-h-[92vh] w-full max-w-[860px] gap-5 overflow-y-auto rounded-lg border border-[#cbd2cd] bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#18211f]">
                  <div className="flex min-w-0 items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold uppercase tracking-wide text-[#68716c] dark:text-stone-400">New purchase order</p>
                      <h2 className="mt-1 break-words text-3xl font-extrabold text-[#115745] dark:text-emerald-200">{activePoVendor.name}</h2>
                      <p className="mt-2 break-words text-[#4d5651] dark:text-stone-300">{activePoVendor.email} / {activePoVendor.location}</p>
                    </div>
                    <button type="button" onClick={() => setActivePoVendor(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#cbd2cd] bg-white dark:border-white/10 dark:bg-[#202b28]" aria-label="Close purchase order draft">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
                    <SupplierProfileField label="PO number" name="poNumber" defaultValue={nextPoNumber} />
                    <label className="grid min-w-0 gap-2">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Material</span>
                      <select name="material" defaultValue={activePoVendor.materials[0]} className="min-h-11 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 outline-none dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100">
                        {activePoVendor.materials.map((material) => (
                          <option key={material}>{material}</option>
                        ))}
                      </select>
                    </label>
                    <SupplierProfileField label="Quantity" name="quantity" type="number" defaultValue="25" />
                    <SupplierProfileField label="Unit price (LKR)" name="unitPrice" type="number" defaultValue="125000" />
                    <SupplierProfileField label="Required delivery date" name="deliveryDate" type="date" defaultValue="2026-08-15" />
                    <SupplierProfileField label="Delivery destination" name="destination" defaultValue="Manufacturing Hub B, Malwana" />
                    <label className="grid min-w-0 gap-2 sm:col-span-2 lg:col-span-3">
                      <span className="text-sm font-bold text-[#39433f] dark:text-stone-100">Notes</span>
                      <textarea name="notes" rows="4" defaultValue="Confirm stock availability, packing details, and dispatch window before approval." className="min-w-0 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-4 py-3 outline-none focus:border-[#115745] dark:border-white/10 dark:bg-[#202b28] dark:text-stone-100" />
                    </label>
                  </div>

                  <div className="rounded-md border border-[#cbd2cd] bg-[#fbf8f1] p-4 dark:border-white/10 dark:bg-[#202b28]">
                    <p className="text-sm font-semibold text-[#68716c] dark:text-stone-400">Default status</p>
                    <strong className="mt-1 block text-[#115745] dark:text-emerald-200">Draft purchase order will be added to Recent Purchase Orders.</strong>
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <button type="button" onClick={() => setActivePoVendor(null)} className="min-h-11 rounded-md border border-[#cbd2cd] bg-white px-5 font-bold dark:border-white/10 dark:bg-[#202b28]">Cancel</button>
                    <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#115745] px-5 font-bold text-white">
                      <ClipboardList className="h-4 w-4" />
                      Create PO
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export function FilterSelect({ label, value, options, segmented = false, icon: Icon, onChange }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <p className="mb-2 text-xs font-extrabold uppercase text-[#4d5651] dark:text-stone-400">{label}</p>
      {segmented ? (
        <div role="group" aria-label={label} className="grid min-h-10 grid-cols-3 rounded-md border border-[#cbd2cd] bg-[#f4f0e8] p-1 text-sm font-bold dark:border-white/10 dark:bg-[#202b28]">
          {options.map((item) => (
            <button
              key={item}
              onClick={() => onChange(item)}
              aria-pressed={value === item}
              className={`rounded ${value === item ? "bg-white text-[#115745] dark:bg-[#18211f] dark:text-emerald-200" : "text-[#4d5651] dark:text-stone-300"}`}
            >
              {item}
            </button>
          ))}
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-haspopup="listbox"
            className="flex min-h-10 w-full items-center justify-between gap-3 rounded-md border border-[#cbd2cd] bg-[#fbf8f1] px-3 text-left dark:border-white/10 dark:bg-[#202b28]"
          >
            <span className="min-w-0 break-words">{value}</span>
            {Icon ? <Icon className="h-5 w-5 shrink-0 text-[#115745] dark:text-emerald-200" /> : <ChevronRight className={`h-5 w-5 shrink-0 text-[#68716c] transition ${open ? "rotate-90" : "rotate-0"}`} />}
          </button>
          {open && (
            <>
              <button
                aria-label={`Close ${label} options`}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-10 cursor-default"
              />
              <ul role="listbox" aria-label={label} className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-md border border-[#cbd2cd] bg-white shadow-lg dark:border-white/10 dark:bg-[#18211f]">
                {options.map((item) => (
                  <li key={item}>
                    <button
                      role="option"
                      aria-selected={value === item}
                      onClick={() => {
                        onChange(item);
                        setOpen(false);
                      }}
                      className={`block min-h-10 w-full px-3 text-left text-sm font-bold ${value === item ? "bg-[#e9f2ed] text-[#115745] dark:bg-[#202b28] dark:text-emerald-200" : "text-[#4d5651] dark:text-stone-300"}`}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function GoogleVendorMap({ expanded, selectedRegion, onSelectRegion }) {
  const regions = [
    { name: "Sri Lanka timber suppliers", detail: "All regions", tone: "bg-[#115745]" },
    { name: "Colombo timber suppliers", detail: "18 suppliers", tone: "bg-[#115745]" },
    { name: "Galle timber suppliers", detail: "10 suppliers", tone: "bg-[#8b5633]" },
    { name: "Kandy timber suppliers", detail: "10 suppliers", tone: "bg-[#2f6757]" },
    { name: "Matara timber suppliers", detail: "4 suppliers", tone: "bg-[#d58a1b]" },
  ];
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(selectedRegion)}&output=embed`;

  return (
    <div className="grid gap-4">
      <div className={`relative overflow-hidden rounded-md border border-[#d5d1c9] bg-[#eee9df] transition-all dark:border-white/10 dark:bg-[#202b28] ${expanded ? "min-h-[360px]" : "min-h-[190px]"}`}>
        <iframe
          title={`Google map for ${selectedRegion}`}
          src={mapSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
        <div className="absolute left-4 top-4 max-w-[calc(100%-2rem)] rounded-md bg-white/90 px-3 py-2 shadow-sm backdrop-blur dark:bg-[#111816]/90">
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#68716c] dark:text-stone-400">Google Vendor Map</p>
          <p className="break-words text-sm font-bold text-[#115745] dark:text-emerald-200">{selectedRegion}</p>
        </div>
      </div>
      {expanded && (
        <div className="grid grid-cols-5 gap-2 max-lg:grid-cols-3 max-sm:grid-cols-1">
          {regions.map((region) => (
            <button
              key={region.name}
              onClick={() => onSelectRegion(region.name)}
              className={`rounded-md border p-3 text-left shadow-sm transition ${
                selectedRegion === region.name
                  ? "border-[#115745] bg-emerald-50 dark:border-emerald-300 dark:bg-emerald-950/20"
                  : "border-[#cbd2cd] bg-white hover:border-[#115745] dark:border-white/10 dark:bg-[#18211f]"
              }`}
            >
              <span className={`mb-2 block h-1.5 rounded-full ${region.tone}`} />
              <strong className="block break-words text-[#202621] dark:text-stone-100">{region.name.replace(" timber suppliers", "")}</strong>
              <span className="text-sm text-[#68716c] dark:text-stone-400">{region.detail}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export const VENDOR_MESSAGE_SEEDS = {
  "Lanka Teak Estates": [
    { id: "lt-1", sender: "vendor", text: "Grade-A teak allocation is ready for your next PO.", time: "09:42 AM" },
  ],
  "Heritage Brassworks": [
    { id: "hb-1", sender: "vendor", text: "Copper inlay samples can ship with the next hardware batch.", time: "10:15 AM" },
  ],
  "EcoGloss Finishes": [
    { id: "eg-1", sender: "vendor", text: "We are updating compliance documents before accepting new orders.", time: "Yesterday" },
  ],
  "Royal Jackwood Supplies": [
    { id: "rj-1", sender: "vendor", text: "Jack wood stock is available from the Galle yard.", time: "08:30 AM" },
  ],
};
