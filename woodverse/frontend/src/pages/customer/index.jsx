import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
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
  Factory,
  Globe2,
  Grid3X3,
  Instagram,
  Linkedin,
  Handshake,
  Home,
  LayoutDashboard,
  LayoutGrid,
  LayoutList,
  Layers,
  Lock,
  Mail,
  Menu,
  MapPin,
  MessageSquare,
  Moon,
  Navigation,
  PackageCheck,
  Pencil,
  Phone,
  Plus,
  Play,
  Quote,
  RefreshCw,
  Search,
  Send,
  Settings,
  Star,
  ShoppingCart,
  Store,
  Sun,
  Timer,
  TrendingUp,
  Truck,
  UserPlus,
  Warehouse,
  UserRound,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { BrandLogo } from "../../components/BrandLogo";
import { CroppedImage } from "../../components/CroppedImage";
import { Footer, SectionHeading } from "../../components/LayoutParts";
import { ProductCard, ProductMedia } from "../../components/ProductCard";
import { categories, crop, vendors } from "../../data/catalog";
import { apiRequest, formatPrice, navigate, sortProducts } from "../../utils";

function publishAdminEvent(source, title, message, priority = "Normal") {
  try {
    const key = "woodverse-admin-notifications";
    const current = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([{ id: `EV-${Date.now()}`, audience: "Admin", type: source, source: `${source} Portal`, title, message, detail: message, priority, time: "Just now", createdAt: new Date().toISOString() }, ...current]));
  } catch {}
}

function AnimatedStat({ value, suffix = "" }) {
  const [displayValue, setDisplayValue] = useState(0);
  const statRef = useRef(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    const element = statRef.current;
    if (!element) return undefined;

    const finish = () => {
      if (hasStarted.current) return;
      hasStarted.current = true;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || typeof IntersectionObserver === "undefined") {
        setDisplayValue(value);
        return;
      }

      const startTime = performance.now();
      const duration = 1400;
      const animate = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        setDisplayValue(value * easedProgress);
        if (progress < 1) window.requestAnimationFrame(animate);
      };
      window.requestAnimationFrame(animate);
    };

    if (typeof IntersectionObserver === "undefined") {
      finish();
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        finish();
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  const formattedValue = Number.isInteger(value)
    ? Math.round(displayValue).toLocaleString()
    : displayValue.toFixed(1);

  return <strong ref={statRef} className="text-4xl font-extrabold text-[#d8a36b]">{formattedValue}{suffix}</strong>;
}

function HomePage({ addToCart }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreview, setActivePreview] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [contactSent, setContactSent] = useState(false);
  const previewImages = [
    ["/assets/home-hero.png", "Customer marketplace", "Browse verified products and place orders."],
    ["/assets/furniture-hero.png", "Vendor workspace", "Manage production, stock, and customer orders."],
    ["/assets/material-teak-log.png", "Supplier network", "Keep material availability connected to production."],
  ];
  const faqs = [
    ["What is WoodVerse?", "WoodVerse is a connected platform for customers, furniture vendors, and material suppliers. Customers shop and track orders, vendors manage fulfillment and production, and suppliers support the material flow."],
    ["Can vendors manufacture out-of-stock products?", "Yes. When an order needs manufacturing, the vendor reviews and approves it before a production work order is created and tracked."],
    ["How are vendors and suppliers verified?", "They submit business and compliance documents. Admin reviews the application and either approves it or requests corrections before portal access is granted."],
    ["Can I track my order?", "Customers can follow order status, vendor approval, production tracking, shipment progress, and delivery from the customer workflow."],
    ["Which plans are available?", "The public marketplace is available to customers. Vendors and suppliers can start with the Starter plan and scale into Pro or Enterprise operations."],
  ];
  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const homeLinks = [
    ["Home", "#top"],
    ["About", "#about"],
    ["Services", "#services"],
    ["Features", "#features"],
    ["How It Works", "#how-it-works"],
    ["Pricing", "#pricing"],
    ["FAQ", "#faq"],
    ["Contact", "#contact"],
  ];

  return (
    <main className="overflow-hidden bg-[#f7f8f5] text-[#17231f] dark:bg-[#101714] dark:text-stone-100">
      <nav className="sticky top-0 z-40 border-b border-white/20 bg-[#102f27]/90 text-white shadow-lg backdrop-blur-xl">
        <div className="page-shell flex min-h-20 items-center justify-between gap-6">
          <button onClick={() => scrollTo("#top")} className="flex items-center gap-3 text-left" aria-label="WoodVerse home">
            <img src="/assets/woodverse-logo.png" alt="WoodVerse" className="h-11 w-11 rounded-lg object-cover" />
            <span><strong className="block text-lg font-extrabold tracking-wide">WoodVerse</strong><small className="block text-xs text-emerald-100/70">Craft. Connect. Grow.</small></span>
          </button>
          <div className={`${mobileMenuOpen ? "absolute left-4 right-4 top-[76px] grid rounded-xl border border-white/10 bg-[#102f27] p-4 shadow-2xl" : "hidden"} items-center gap-1 lg:static lg:flex lg:bg-transparent lg:p-0 lg:shadow-none`}>
            {homeLinks.map(([item, target]) => <button key={item} onClick={() => target.startsWith("#") ? scrollTo(target) : navigate(target)} className="rounded-lg px-3 py-2 text-left text-sm font-bold text-emerald-50/80 transition hover:bg-white/10 hover:text-white">{item}</button>)}
            <div className="mt-3 grid gap-2 border-t border-white/10 pt-3 lg:ml-3 lg:mt-0 lg:flex lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
              <button onClick={() => navigate("/login")} className="rounded-lg px-4 py-2 text-sm font-extrabold text-white hover:bg-white/10">Login</button>
              <button onClick={() => navigate("/login")} className="rounded-lg bg-[#d8a36b] px-4 py-2 text-sm font-extrabold text-[#17231f] shadow-md transition hover:bg-[#e4b57e]">Sign Up</button>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen((value) => !value)} className="grid h-11 w-11 place-items-center rounded-lg bg-white/10 lg:hidden" aria-label="Toggle navigation">{mobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
      </nav>

      <section id="top" className="relative isolate min-h-[720px] overflow-hidden bg-[#102f27] text-white">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(16,47,39,.98)_0%,rgba(16,47,39,.86)_40%,rgba(16,47,39,.36)_100%),url('/assets/site-hero.png')] bg-cover bg-center" />
        <div className="page-shell grid min-h-[720px] items-center gap-12 py-20 lg:grid-cols-[minmax(0,1fr)_500px]">
          <div className="max-w-2xl animate-[fadeUp_.7s_ease-out]">
            <span className="inline-flex rounded-full border border-emerald-200/30 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[.18em] text-emerald-100 backdrop-blur">The connected woodcraft platform</span>
            <h1 className="mt-7 break-words text-5xl font-extrabold leading-[1.04] sm:text-6xl lg:text-7xl">Build better woodcraft, together.</h1>
            <p className="mt-6 max-w-xl break-words text-lg leading-relaxed text-emerald-50/80 sm:text-xl">WoodVerse brings customers, verified vendors, and trusted suppliers into one place, from the first product search to final delivery.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <button onClick={() => navigate("/shop")} className="inline-flex min-h-13 items-center gap-2 rounded-lg bg-[#d8a36b] px-6 font-extrabold text-[#17231f] shadow-xl transition hover:-translate-y-1 hover:bg-[#e4b57e]">Get Started <ArrowRight className="h-5 w-5" /></button>
              <button onClick={() => scrollTo("#about")} className="inline-flex min-h-13 items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-6 font-extrabold text-white backdrop-blur transition hover:bg-white/15"><Play className="h-4 w-4 fill-current" /> Learn More</button>
            </div>
            <div className="mt-12 flex flex-wrap gap-8 text-sm text-emerald-50/70"><span><strong className="block text-2xl text-white">2,400+</strong>Crafted orders</span><span><strong className="block text-2xl text-white">184</strong>Verified vendors</span><span><strong className="block text-2xl text-white">42</strong>Material suppliers</span></div>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-xl animate-[float_6s_ease-in-out_infinite]">
            <div className="overflow-hidden rounded-xl bg-[#f5f7f2] text-[#17231f] shadow-inner dark:bg-[#1b2823] dark:text-stone-100">
              <div className="flex items-center justify-between border-b border-[#dce5df] px-5 py-4 dark:border-white/10"><span className="flex items-center gap-2 text-sm font-extrabold"><span className="h-2.5 w-2.5 rounded-full bg-[#d8a36b]" /> WoodVerse workspace</span><span className="rounded-full bg-[#dceee2] px-2 py-1 text-[10px] font-extrabold uppercase text-[#25634f]">Live</span></div>
              <div className="grid gap-4 p-5"><div className="grid grid-cols-3 gap-3">{[["Orders", "248", "+18%"], ["In production", "36", "On track"], ["Suppliers", "42", "Verified"]].map(([label, value, note]) => <div key={label} className="rounded-lg bg-white p-3 shadow-sm dark:bg-[#24332d]"><span className="block text-[10px] font-extrabold uppercase text-[#718078]">{label}</span><strong className="mt-2 block text-2xl">{value}</strong><span className="text-[11px] font-bold text-[#3b8868]">{note}</span></div>)}</div><div className="grid grid-cols-[1.2fr_.8fr] gap-4"><div className="rounded-lg bg-white p-4 shadow-sm dark:bg-[#24332d]"><div className="flex items-center justify-between"><strong className="text-sm">Fulfillment overview</strong><BarChart3 className="h-4 w-4 text-[#3b8868]" /></div><div className="mt-6 flex h-28 items-end gap-2">{[42, 58, 49, 76, 64, 88, 72].map((height, index) => <span key={index} className="flex-1 rounded-t bg-[#5fa383]" style={{ height: `${height}%`, opacity: index === 5 ? 1 : .55 }} />)}</div><div className="mt-3 flex justify-between text-[10px] font-bold text-[#718078]"><span>Mon</span><span>Sun</span></div></div><div className="grid content-between rounded-lg bg-[#dbeee3] p-4 text-[#245f4d] dark:bg-[#29443a] dark:text-emerald-100"><span className="grid h-9 w-9 place-items-center rounded-lg bg-white/70"><PackageCheck className="h-5 w-5" /></span><span><strong className="block text-3xl">96.8%</strong><small className="text-xs font-bold">on-time delivery</small></span></div></div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="scroll-mt-24 page-shell grid gap-12 py-24 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
        <div><span className="eyebrow">About WoodVerse</span><h2 className="text-4xl font-extrabold leading-tight sm:text-5xl">A better way to move ideas from timber to home.</h2><p className="mt-5 text-lg leading-relaxed text-[#5b6b64] dark:text-stone-300">We are building the operating layer for modern woodcraft. Customers discover honest products, vendors get the tools to fulfill and manufacture confidently, and suppliers know exactly where materials are needed.</p><button onClick={() => navigate("/shop")} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#1c614f] px-5 font-extrabold text-white shadow-lg transition hover:-translate-y-1">Explore the marketplace <ArrowRight className="h-4 w-4" /></button></div>
        <div className="grid gap-4 sm:grid-cols-2"><article className="rounded-2xl border border-white/80 bg-white/70 p-6 shadow-xl shadow-[#183e3320] backdrop-blur dark:border-white/10 dark:bg-white/5"><Zap className="h-7 w-7 text-[#c98e53]" /><h3 className="mt-5 text-xl font-extrabold">Mission</h3><p className="mt-2 leading-relaxed text-[#5b6b64] dark:text-stone-300">Make sustainable, locally crafted furniture easier to discover, produce, and deliver.</p></article><article className="mt-8 rounded-2xl border border-white/80 bg-[#e1eee5] p-6 shadow-xl shadow-[#183e3320] dark:border-white/10 dark:bg-[#1e342b]"><Users className="h-7 w-7 text-[#1c614f] dark:text-emerald-200" /><h3 className="mt-5 text-xl font-extrabold">Vision</h3><p className="mt-2 leading-relaxed text-[#5b6b64] dark:text-stone-300">A transparent woodcraft ecosystem where every partner can grow with confidence.</p></article></div>
      </section>

      <section id="services" className="scroll-mt-24 border-y border-[#dce5df] bg-white py-20 dark:border-white/10 dark:bg-[#101714]"><div className="page-shell"><SectionHeading title="One platform, three clear paths" subtitle="Choose the workflow that matches your role. Every path stays connected to the same order and material network." /><div className="grid gap-5 lg:grid-cols-3">{[[UserRound, "Customers", "Discover verified furniture, place orders, and follow every step through production and delivery.", "/shop", "Browse marketplace"], [Store, "Vendors", "Publish products, evaluate stock, approve manufacturing, and manage customer fulfillment.", "/vendor-dashboard", "Open vendor portal"], [Warehouse, "Suppliers", "Submit verification documents, maintain material availability, and respond to purchase requests.", "/supplier/profile", "Open supplier portal"]].map(([Icon, title, detail, href, action]) => <article key={title} className="group grid gap-5 rounded-2xl border border-[#dce5df] bg-[#f7f8f5] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#dbeee3] text-[#1c614f] transition group-hover:bg-[#1c614f] group-hover:text-white dark:bg-[#29483b] dark:text-emerald-100"><Icon className="h-6 w-6" /></span><div><h3 className="text-xl font-extrabold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-[#65736c] dark:text-stone-300">{detail}</p></div><button onClick={() => navigate(href)} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-[#1c614f] px-4 text-sm font-extrabold text-white">{action}<ArrowRight className="h-4 w-4" /></button></article>)}</div></div></section>
      <section id="features" className="scroll-mt-24 bg-[#edf3ee] py-24 dark:bg-[#14221d]"><div className="page-shell"><SectionHeading title="Everything your operation needs" subtitle="One calm workspace for commerce, coordination, and growth." /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{[[ShoppingCart, "Customer marketplace", "Discover verified furniture, compare products, and order with confidence."], [Store, "Vendor operations", "Manage catalog, quotations, customer orders, and vendor approvals."], [Warehouse, "Supplier network", "Connect available timber and materials to real production demand."], [PackageCheck, "Order fulfillment", "Move every order from stock decision to shipment and delivery."], [Factory, "Production tracking", "Create work orders only when manufacturing is needed and approved."], [ShieldIcon, "Document verification", "Keep vendor and supplier registration documents in one review flow."], [BarChart3, "Business insights", "See sales, inventory, delivery, and supplier performance clearly."], [MessageSquare, "Real-time communication", "Keep customers, vendors, and suppliers aligned with live updates."]].map(([Icon, title, detail]) => <article key={title} className="group rounded-2xl border border-white/80 bg-white/80 p-6 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-white/10 dark:bg-white/5"><span className="grid h-12 w-12 place-items-center rounded-xl bg-[#dbeee3] text-[#1c614f] transition group-hover:bg-[#1c614f] group-hover:text-white dark:bg-[#28483b] dark:text-emerald-100"><Icon className="h-6 w-6" /></span><h3 className="mt-5 text-lg font-extrabold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-[#65736c] dark:text-stone-300">{detail}</p></article>)}</div></div></section>

      <section id="how-it-works" className="page-shell py-24"><SectionHeading title="How WoodVerse works" subtitle="A simple flow that keeps every handoff visible." /><div className="relative grid gap-8 md:grid-cols-4">{[[Search, "1", "Discover", "Customers find the right product or material."], [ClipboardList, "2", "Coordinate", "Vendors review stock and supplier availability."], [Factory, "3", "Create", "Approved manufacturing work becomes production tracking."], [Truck, "4", "Deliver", "Shipments move to the customer with clear status updates."]].map(([Icon, number, title, detail]) => <article key={number} className="group relative text-center"><span className="absolute left-1/2 top-7 hidden h-px w-full bg-[#bdd6c7] md:block" style={{ transform: "translateX(50%)" }} /><span className="relative z-10 mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#1c614f] text-white shadow-lg transition duration-300 group-hover:-translate-y-1 group-hover:scale-105 group-hover:shadow-xl"><Icon className="h-7 w-7" /></span><span className="absolute left-1/2 top-[-1.25rem] z-20 grid h-8 w-8 -translate-x-1/2 place-items-center rounded-full bg-[#dbeee3] text-sm font-black text-[#1c614f] shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:bg-[#d8a36b] dark:bg-[#29463a] dark:text-emerald-100">{number}</span><h3 className="relative mt-5 text-xl font-extrabold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-[#65736c] dark:text-stone-300">{detail}</p></article>)}</div></section>

      <section className="bg-[#102f27] py-20 text-white"><div className="page-shell grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{[[2400, "+", "Orders fulfilled", "from first click to delivery"], [184, "", "Verified vendors", "crafting across Sri Lanka"], [42, "", "Material suppliers", "supporting production demand"], [96.8, "%", "On-time delivery", "across active shipments"]].map(([value, suffix, label, detail]) => <article key={label} className="border-l border-white/20 pl-5"><AnimatedStat value={value} suffix={suffix} /><h3 className="mt-2 font-extrabold">{label}</h3><p className="mt-1 text-sm text-emerald-100/65">{detail}</p></article>)}</div></section>

      <section id="preview" className="page-shell py-24"><SectionHeading title="See the platform in action" subtitle="Purpose-built screens for every part of the woodcraft workflow." /><div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div className="overflow-hidden rounded-2xl border border-[#dce5df] bg-[#102f27] p-3 shadow-2xl dark:border-white/10"><img src={previewImages[activePreview][0]} alt={previewImages[activePreview][1]} className="h-[420px] w-full rounded-xl object-cover transition duration-500" /></div><div className="grid content-center gap-3">{previewImages.map(([image, title, detail], index) => <button key={title} onClick={() => setActivePreview(index)} className={`grid grid-cols-[72px_minmax(0,1fr)] items-center gap-4 rounded-xl p-3 text-left transition ${activePreview === index ? "bg-[#dbeee3] dark:bg-[#29483b]" : "hover:bg-white dark:hover:bg-white/5"}`}><img src={image} alt="" className="h-16 w-16 rounded-lg object-cover" /><span><strong className="block font-extrabold">{title}</strong><small className="mt-1 block leading-relaxed text-[#65736c] dark:text-stone-300">{detail}</small></span></button>)}</div></div></section>

      <section className="bg-[#edf3ee] py-24 dark:bg-[#14221d]"><div className="page-shell"><SectionHeading title="Trusted by people who make it happen" subtitle="A platform designed around real work, not just pretty dashboards." /><div className="grid gap-5 lg:grid-cols-3">{[["AK", "Amara Jayawardena", "Customer", "WoodVerse made it easy to see whether my table was in stock or being made. The updates kept me confident throughout the order."], ["HP", "Harini Perera", "Vendor", "The production workflow gives my team a clear handoff from customer approval to workshop floor."], ["SL", "Saman Loggers Ltd", "Supplier", "We can finally see which materials are needed and respond to vendor requests without losing context."]].map(([initials, name, role, quote], index) => <article key={name} style={{ animationDelay: `${index * 140}ms` }} className="animate-slide-in-right rounded-2xl border border-white/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"><Quote className="h-7 w-7 text-[#d8a36b]" /><div className="mt-4 flex gap-1 text-[#e0a45d]">{[1, 2, 3, 4, 5].map((star) => <Star key={star} className="h-4 w-4 fill-current" />)}</div><p className="mt-4 leading-relaxed text-[#52625a] dark:text-stone-300">“{quote}”</p><div className="mt-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#1c614f] text-xs font-extrabold text-white">{initials}</span><span><strong className="block text-sm">{name}</strong><small className="text-xs text-[#718078]">{role}</small></span></div></article>)}</div></div></section>

      <section id="pricing" className="page-shell py-24"><SectionHeading title="Plans that grow with your operation" subtitle="Start with the tools you need today and scale when you are ready." /><div className="grid gap-5 lg:grid-cols-3">{[["Free", "LKR 0", "For exploring WoodVerse", ["Customer marketplace", "Order tracking", "Basic support"], false], ["Pro", "LKR 9,900", "For growing vendors and suppliers", ["Everything in Free", "Production tracking", "Document verification", "Real-time collaboration"], true], ["Enterprise", "Let's talk", "For multi-site operations", ["Everything in Pro", "Advanced analytics", "Priority support", "Custom workflows"], false]].map(([name, price, detail, points, featured]) => <article key={name} className={`relative rounded-2xl border p-7 shadow-sm ${featured ? "border-[#1c614f] bg-[#1c614f] text-white shadow-xl lg:-translate-y-3" : "border-[#dce5df] bg-white dark:border-white/10 dark:bg-white/5"}`}>{featured && <span className="absolute -top-3 left-6 rounded-full bg-[#d8a36b] px-3 py-1 text-xs font-extrabold uppercase text-[#17231f]">Recommended</span>}<h3 className="text-xl font-extrabold">{name}</h3><p className={`mt-2 text-sm ${featured ? "text-emerald-50/70" : "text-[#718078] dark:text-stone-300"}`}>{detail}</p><strong className="mt-6 block text-4xl">{price}<small className="text-sm font-bold">{name === "Pro" ? "/month" : ""}</small></strong><ul className="mt-6 grid gap-3">{points.map((point) => <li key={point} className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-4 w-4 shrink-0 text-[#d8a36b]" />{point}</li>)}</ul><button onClick={() => navigate("/login")} className={`mt-8 min-h-12 w-full rounded-lg font-extrabold ${featured ? "bg-white text-[#1c614f]" : "bg-[#1c614f] text-white"}`}>{name === "Enterprise" ? "Contact Sales" : "Get Started"}</button></article>)}</div></section>

      <section id="faq" className="bg-[#edf3ee] py-24 dark:bg-[#14221d]"><div className="page-shell grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><span className="eyebrow">FAQ</span><h2 className="text-4xl font-extrabold leading-tight">Questions, answered clearly.</h2><p className="mt-4 leading-relaxed text-[#65736c] dark:text-stone-300">Still curious about how the connected workflow works? We keep the answers practical.</p></div><div className="grid gap-3">{faqs.map(([question, answer], index) => <article key={question} className="rounded-xl border border-white/80 bg-white/80 dark:border-white/10 dark:bg-white/5"><button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} className="flex min-h-16 w-full items-center justify-between gap-4 px-5 text-left font-extrabold">{question}<ChevronRight className={`h-5 w-5 shrink-0 transition-transform ${openFaq === index ? "rotate-90" : ""}`} /></button>{openFaq === index && <p className="border-t border-[#dce5df] px-5 py-4 text-sm leading-relaxed text-[#65736c] dark:border-white/10 dark:text-stone-300">{answer}</p>}</article>)}</div></div></section>

      <section id="contact" className="page-shell grid gap-10 py-24 lg:grid-cols-[1fr_1.15fr]"><div><span className="eyebrow">Contact</span><h2 className="text-4xl font-extrabold leading-tight">Let’s build a better woodcraft network.</h2><p className="mt-4 leading-relaxed text-[#65736c] dark:text-stone-300">Have a partnership question, need a vendor demo, or want help with your next order? Our team is ready to help.</p><div className="mt-8 grid gap-4 text-sm font-semibold"><a href="mailto:hello@woodverse.lk" className="flex items-center gap-3"><Mail className="h-5 w-5 text-[#1c614f]" /> hello@woodverse.lk</a><a href="tel:+94112458891" className="flex items-center gap-3"><Phone className="h-5 w-5 text-[#1c614f]" /> +94 11 245 8891</a><span className="flex items-center gap-3"><MapPin className="h-5 w-5 text-[#1c614f]" /> Colombo, Sri Lanka</span></div><div className="mt-7 flex gap-3"><a href="https://instagram.com" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-lg bg-[#dbeee3] text-[#1c614f]"><Instagram className="h-5 w-5" /></a><a href="https://linkedin.com" aria-label="LinkedIn" className="grid h-10 w-10 place-items-center rounded-lg bg-[#dbeee3] text-[#1c614f]"><Linkedin className="h-5 w-5" /></a></div></div><form onSubmit={(event) => { event.preventDefault(); setContactSent(true); }} className="rounded-2xl border border-[#dce5df] bg-white p-6 shadow-xl dark:border-white/10 dark:bg-white/5 sm:p-8"><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Name<input required className="min-h-12 rounded-lg border border-[#dce5df] bg-[#f7f8f5] px-4 outline-none focus:border-[#1c614f] dark:border-white/10 dark:bg-white/5" placeholder="Your name" /></label><label className="grid gap-2 text-sm font-bold">Email<input required type="email" className="min-h-12 rounded-lg border border-[#dce5df] bg-[#f7f8f5] px-4 outline-none focus:border-[#1c614f] dark:border-white/10 dark:bg-white/5" placeholder="you@company.com" /></label></div><label className="mt-4 grid gap-2 text-sm font-bold">I am a<select className="min-h-12 rounded-lg border border-[#dce5df] bg-[#f7f8f5] px-4 outline-none focus:border-[#1c614f] dark:border-white/10 dark:bg-white/5"><option>Customer</option><option>Vendor</option><option>Supplier</option><option>Partner</option></select></label><label className="mt-4 grid gap-2 text-sm font-bold">Message<textarea required rows={5} className="rounded-lg border border-[#dce5df] bg-[#f7f8f5] px-4 py-3 outline-none focus:border-[#1c614f] dark:border-white/10 dark:bg-white/5" placeholder="How can we help?" /></label><button type="submit" className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#1c614f] px-5 font-extrabold text-white">{contactSent ? "Message sent" : "Send Message"} <Send className="h-4 w-4" /></button></form></section>

      <footer className="bg-[#102f27] py-14 text-white"><div className="page-shell grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]"><div><div className="flex items-center gap-3"><img src="/assets/woodverse-logo.png" alt="WoodVerse" className="h-10 w-10 rounded-lg" /><strong className="text-xl">WoodVerse</strong></div><p className="mt-4 max-w-xs text-sm leading-relaxed text-emerald-100/65">The connected platform for customers, vendors, and suppliers in woodcraft.</p></div>{[["Platform", "About", "Features", "Pricing", "Contact"], ["Legal", "Privacy Policy", "Terms & Conditions", "Cookie Policy"]].map(([title, ...links]) => <div key={title}><h3 className="font-extrabold text-[#d8a36b]">{title}</h3><div className="mt-4 grid gap-3 text-sm text-emerald-100/65">{links.map((link) => <button key={link} onClick={() => { const target = `#${link.toLowerCase().replaceAll(" ", "-")}`; document.querySelector(target)?.scrollIntoView({ behavior: "smooth" }); }} className="text-left transition hover:text-white">{link}</button>)}</div></div>)}</div><div className="page-shell mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-emerald-100/55"><span>© 2026 WoodVerse. All rights reserved.</span><span>Made for sustainable Sri Lankan craftsmanship.</span></div></footer>
      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-5 right-5 z-30 grid h-11 w-11 place-items-center rounded-full bg-[#d8a36b] text-[#17231f] shadow-xl transition hover:-translate-y-1" aria-label="Scroll to top"><ArrowLeft className="h-5 w-5 rotate-90" /></button>
    </main>
  );
}

function ShieldIcon(props) {
  return <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-current text-[10px] font-black" {...props}>✓</span>;
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

function ProductDetailsPage({ product, catalogItems = [], addToCart }) {
  if (!product) {
    return (
      <>
        <section className="page-shell grid min-h-[calc(100svh-56px)] place-items-center py-14 text-center">
          <div className="max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-700 dark:bg-[#202624]">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-stone-100">Product not found</h1>
            <p className="mt-3 leading-relaxed text-slate-500 dark:text-stone-400">The selected WoodVerse item is no longer available in this catalog.</p>
            <button onClick={() => navigate("/shop")} className="mt-6 rounded-md bg-forest px-6 py-3 font-bold text-white">Back to Shop</button>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const details = [
    ["Material", product.tags[0] || "Solid wood"],
    ["Vendor", product.vendor],
    ["Room / Use", product.room],
    ["Availability", product.stock],
  ];
  const recommendations = catalogItems.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 3);

  return (
    <>
      <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(320px,460px)] gap-10 py-12 lg:gap-14 max-lg:grid-cols-1">
        <div className="min-w-0">
          <BackHome />
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-[#202624]">
            <div className="h-[clamp(280px,52vw,560px)] bg-slate-200 dark:bg-slate-800">
              <ProductCardMedia product={product} />
            </div>
          </div>
        </div>

        <aside className="min-w-0 self-start rounded-lg border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-[#202624]">
          <p className="eyebrow">Product Details</p>
          <h1 className="mt-3 break-words text-4xl font-bold leading-tight text-slate-800 dark:text-stone-100">{product.name}</h1>
          <p className="mt-3 break-words text-sm uppercase tracking-wide text-slate-500 dark:text-stone-400">Vendor: {product.vendor}</p>
          <p className="mt-5 break-words text-lg leading-relaxed text-slate-600 dark:text-stone-300">{product.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-bold text-forest dark:border-emerald-900 dark:bg-[#1d2422] dark:text-emerald-200">{tag}</span>
            ))}
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            {details.map(([label, value]) => (
              <article key={label} className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#1d2422]">
                <p className="text-xs font-extrabold uppercase text-slate-400 dark:text-stone-500">{label}</p>
                <strong className="mt-1 block break-words text-slate-700 dark:text-stone-100">{value}</strong>
              </article>
            ))}
          </div>

          <div className="mt-7 flex min-w-0 items-center justify-between gap-5 border-t border-slate-200 pt-6 dark:border-slate-700 max-sm:flex-col max-sm:items-stretch">
            <strong className="break-words text-3xl leading-tight text-forest dark:text-emerald-200">{formatPrice(product.price)}</strong>
            <div className="flex min-w-0 flex-wrap justify-end gap-3 max-sm:grid max-sm:w-full max-sm:grid-cols-1">
              <button
                onClick={() => {
                  if (product.stockType === "out") {
                    window.alert(`You will be notified when ${product.name} is available.`);
                    return;
                  }
                  addToCart(product);
                  navigate("/cart");
                }}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 font-bold text-white ${product.stockType === "out" ? "bg-slate-400" : "bg-forest"}`}
              >
                {product.stockType === "out" ? <Bell className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                {product.stockType === "out" ? "Notify Me" : "Add to Cart"}
              </button>
            </div>
          </div>
        </aside>
      </section>

      {recommendations.length > 0 && (
        <ProductSection title="Related Items" subtitle="More products from the same collection" items={recommendations} addToCart={addToCart} />
      )}
      <Footer />
    </>
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

function CategoryPage({ type, items: catalogItems = [], addToCart }) {
  const gift = type === "gift";
  const [sort, setSort] = useState("featured");
  const items = catalogItems.filter((item) => item.category === type);
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
        {items.map((item) => <label key={item} className="flex min-w-0 items-start gap-2 break-words leading-snug text-slate-500 dark:text-stone-400"><input type={radio ? "radio" : "checkbox"} name={title} className="mt-0.5 shrink-0 accent-forest" /> <span className="min-w-0">{item}</span></label>)}
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
  return <ProductMedia product={product} />;
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

function OrderSummary({ subtotal, cta, next, onAction, notice }) {
  const delivery = subtotal ? 7500 : 0;
  const assurance = subtotal ? 3500 : 0;
  return (
    <aside className="sticky top-20 self-start rounded-lg border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-[#202624] max-lg:static">
      <h2 className="text-2xl font-bold">Order Summary</h2>
      {[["Subtotal", subtotal], ["Delivery", delivery], ["Platform assurance", assurance]].map(([label, value]) => <div key={label} className="flex min-w-0 justify-between gap-4 border-b border-slate-200 py-4 dark:border-slate-700"><span className="min-w-0 break-words text-slate-500 dark:text-stone-400">{label}</span><strong className="shrink-0">{formatPrice(value)}</strong></div>)}
      <div className="flex min-w-0 justify-between gap-4 py-6 text-lg font-bold"><span>Total</span><strong className="shrink-0 text-forest dark:text-emerald-200">{formatPrice(subtotal + delivery + assurance)}</strong></div>
      <button onClick={() => (onAction ? onAction() : navigate(next))} className="grid min-h-14 w-full place-items-center rounded-md bg-forest font-bold text-white">{cta}</button>
      {notice && <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-forest dark:border-emerald-900 dark:bg-[#1d2422] dark:text-emerald-200">{notice}</p>}
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

function PaymentPage({ cart = [], setCart, catalogItems = [] }) {
  const [notice, setNotice] = useState("");
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0) || 357500;
  const delivery = subtotal ? 7500 : 0;
  const assurance = subtotal ? 3500 : 0;
  const total = subtotal + delivery + assurance;

  const placeOrder = async () => {
    const orderItems = cart.length ? cart : catalogItems.slice(0, 2).map((item) => ({ ...item, quantity: 1 }));
    const primaryProduct = orderItems.length === 1 ? orderItems[0].name : `${orderItems[0].name} + ${orderItems.length - 1} more`;
    const profile = getStoredCustomerProfile();
    let backendOrder = null;
    try {
      const result = await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customer: profile.fullName,
          totalAmount: total,
          items: orderItems.map((item) => ({ id: item.id, name: item.name, vendor: item.vendor, quantity: item.quantity, stock: item.stock, stockType: item.stockType })),
        }),
      });
      backendOrder = result;
    } catch {}
    const fulfillmentPlan = buildCustomerFulfillmentPlan(orderItems);
    const requiresManufacturing = fulfillmentPlan.some((item) => item.decision === "manufacture");
    const order = {
      id: backendOrder?.id || getNextVendorOrderId(),
      customer: profile.fullName,
      initials: getCustomerInitials(profile.fullName),
      product: primaryProduct,
      date: "Today",
      dueDate: getFutureDateLabel(14),
      amount: formatPrice(total),
      status: requiresManufacturing ? "Vendor Approval" : "Processing",
      tone: requiresManufacturing ? "bg-[#eef6fd] text-[#3d82bd]" : "bg-[#ffd0a8] text-[#8b5633]",
      source: "Customer Checkout",
      requiresManufacturing,
      fulfillmentPlan,
      items: orderItems.map((item) => ({
        name: item.name,
        quantity: item.quantity || 1,
        vendor: item.vendor,
        stock: item.stock,
        stockType: item.stockType,
      })),
    };

    try {
      const existing = JSON.parse(localStorage.getItem("woodverse-vendor-orders") || "null") || [];
      localStorage.setItem("woodverse-vendor-orders", JSON.stringify([order, ...existing]));
      localStorage.setItem("woodverse-latest-customer-order", JSON.stringify(order));
    } catch {}
    publishAdminEvent("Customer", `New order ${order.id}`, `${order.customer} placed ${order.product}. ${requiresManufacturing ? "Vendor approval and production are required." : "Stock is available for fulfillment."}`, requiresManufacturing ? "High" : "Normal");
    setCart?.([]);
    setNotice(requiresManufacturing
      ? `${order.id} placed. It is waiting for vendor approval before production tracking.`
      : `${order.id} placed. Stock is available, so the vendor can fulfill it without manufacturing.`);
  };

  return (
    <>
      <CheckoutHero title="Payment" subtitle="Choose a payment method. WoodVerse holds payment until vendors confirm readiness." active="Payment" back="/delivery" />
      <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(280px,340px)] gap-8 pb-16 max-lg:grid-cols-1">
        <div className="grid gap-6"><Panel title="Payment Method" subtitle="Select how you want to complete this order."><PaymentOptions /></Panel><Panel title="Card Details" subtitle="Use test information for this prototype."><CheckoutGrid payment /></Panel></div>
        <OrderSummary subtotal={subtotal} cta={`Pay ${formatPrice(total)}`} onAction={placeOrder} notice={notice} />
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

function getStoredCustomerProfile() {
  try {
    return JSON.parse(localStorage.getItem("woodverse-profile-info")) || { fullName: "WoodVerse Customer" };
  } catch {
    return { fullName: "WoodVerse Customer" };
  }
}

function getCustomerInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "WC";
}

function getNextVendorOrderId() {
  try {
    const existing = JSON.parse(localStorage.getItem("woodverse-vendor-orders") || "null") || [];
    const numericIds = existing.map((order) => Number(String(order.id).replace("#WV-", ""))).filter(Boolean);
    return `#WV-${Math.max(...numericIds, 9482) + 1}`;
  } catch {
    return `#WV-${Date.now().toString().slice(-4)}`;
  }
}

function getFutureDateLabel(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function buildCustomerFulfillmentPlan(orderItems) {
  return orderItems.map((item) => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const stockType = item.stockType || "review";
    const mustManufacture = stockType === "out";
    return {
      name: item.name,
      vendor: item.vendor,
      quantity,
      stock: item.stock || "Needs stock check",
      stockType,
      decision: mustManufacture ? "manufacture" : "stock",
      reason: mustManufacture
        ? "Catalog marks this item as out of stock."
        : "Catalog stock is available for customer fulfillment.",
    };
  });
}

function ChatbotPage() {
  const [messages, setMessages] = useState([
    ["assistant", "Ayubowan! How can I help you with your furniture order today?"],
    ["user", "I'd like to check the shipping cost for Kandy."],
    ["assistant", "Delivery to Kandy for the Maharaja Bed Frame is LKR 4,500. Would you like me to add this to your quote?"],
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [suggestions, setSuggestions] = useState(["Track My Order", "Find Teak Furniture", "Check Production", "Help with Payment"]);
  const send = async (text) => {
    const message = text.trim();
    if (!message || isThinking) return;
    setMessages((rows) => [...rows, ["user", message]]);
    setInput("");
    setIsThinking(true);

    try {
      const result = await apiRequest("/api/ai/chat", { method: "POST", body: JSON.stringify({ message, context: { role: "customer", page: "chatbot" } }) });
      setMessages((rows) => [...rows, ["assistant", result.reply || "I can help with WoodVerse orders and support."]]);
      if (Array.isArray(result.suggestions) && result.suggestions.length) setSuggestions(result.suggestions);
    } catch {
      setMessages((rows) => [...rows, ["assistant", "I can help with product search, delivery estimates, payment options, vendor contact, order tracking, and stock/manufacturing decisions."]]);
      setSuggestions(["Track My Order", "Search Products", "Check Stock", "Contact Support"]);
    } finally {
      setIsThinking(false);
    }
  };
  return (
    <main className="page-shell grid min-h-[calc(100svh-56px)] grid-cols-[230px_minmax(0,1fr)_260px] gap-6 py-7 lg:min-h-[calc(100vh-56px)] max-lg:grid-cols-1">
      <aside className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#202624] max-sm:hidden"><h1><BrandLogo imageClassName="h-9 w-9" textClassName="text-xl text-forest dark:text-emerald-200" subtitle="Assistant" subtitleClassName="text-sm font-bold text-slate-500 dark:text-stone-400" /></h1><button onClick={() => setMessages(messages.slice(0, 1))} className="mt-8 flex w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-forest px-3 py-3 font-bold leading-tight text-white"><Plus className="h-5 w-5 shrink-0" /> <span className="min-w-0 break-words">New Chat</span></button></aside>
      <section className="grid overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#202624]">
        <header className="flex min-w-0 items-center justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-700"><h2><BrandLogo imageClassName="h-8 w-8" textClassName="text-xl text-forest dark:text-emerald-200" subtitle="Assistant" subtitleClassName="text-xs font-bold text-slate-500 dark:text-stone-400" /></h2><button className="shrink-0" onClick={() => navigate("/")}><X /></button></header>
        <div className="grid gap-4 bg-[#fffdf9] p-6 dark:bg-[#1d2422]">
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">{suggestions.map((prompt) => <button onClick={() => send(prompt)} key={prompt} className="flex min-w-0 items-start gap-2 rounded-lg border border-emerald-200 p-4 text-left font-bold leading-snug text-forest dark:border-emerald-900 dark:text-emerald-200"><Search className="h-5 w-5 shrink-0" /><span className="min-w-0 break-words">{prompt}</span></button>)}</div>
          {messages.map(([role, text], index) => <article key={index} className={`max-w-[92%] min-w-0 sm:max-w-[78%] ${role === "user" ? "justify-self-end" : ""}`}><p className={`break-words rounded-lg p-4 leading-relaxed ${role === "user" ? "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-stone-100" : "bg-moss text-emerald-50"}`}>{text}</p><time className="text-xs text-slate-500 dark:text-stone-400">10:02 AM</time></article>)}
          {isThinking && <article className="max-w-[78%] min-w-0"><p className="break-words rounded-lg bg-moss p-4 leading-relaxed text-emerald-50">Checking WoodVerse AI service...</p><time className="text-xs text-slate-500 dark:text-stone-400">Now</time></article>}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); send(input); }} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-slate-200 p-5 dark:border-slate-700"><input value={input} onChange={(event) => setInput(event.target.value)} className="min-w-0 rounded-lg bg-blue-50 px-4 outline-none dark:bg-[#1d2422]" placeholder="Type your message..." /><button type="submit" disabled={isThinking} className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-forest text-white disabled:cursor-not-allowed disabled:bg-slate-400"><Send className="h-5 w-5" /></button></form>
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
  const [registrationDocuments, setRegistrationDocuments] = useState({});
  const [registrationMessage, setRegistrationMessage] = useState("");
  const isRegister = authMode === "register";
  const requiresVerification = accountType === "vendor" || accountType === "supplier";
  const requiredDocuments = accountType === "vendor"
    ? [
        ["businessRegistration", "Business Registration Certificate"],
        ["identityDocument", "Owner / Director Identity Document"],
        ["addressProof", "Business Address Proof"],
        ["bankProof", "Bank Account Confirmation"],
      ]
    : [
        ["businessRegistration", "Business Registration Certificate"],
        ["identityDocument", "Owner / Director Identity Document"],
        ["addressProof", "Business Address Proof"],
        ["materialCertificate", "Material Source / Compliance Certificate"],
      ];
  const selectedAccount = accountTypes.find((item) => item.id === accountType);

  return (
    <AuthShell>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (isRegister) {
              const formData = new FormData(event.currentTarget);
              const registeredEmail = String(formData.get("email") || "").trim().toLowerCase();
              if (requiresVerification && requiredDocuments.some(([id]) => !registrationDocuments[id])) {
                setRegistrationMessage("Upload all required documents before submitting your application.");
                return;
              }
              if (requiresVerification) {
                const application = {
                  id: `APP-${Date.now()}`,
                  type: accountType === "vendor" ? "Vendor" : "Supplier",
                  status: "Pending",
                  submittedAt: new Date().toISOString(),
                  documents: requiredDocuments.map(([id, label]) => ({ id, label, fileName: registrationDocuments[id].name })),
                };
                const existing = JSON.parse(localStorage.getItem("woodverse-registration-applications") || "[]");
                localStorage.setItem("woodverse-registration-applications", JSON.stringify([application, ...existing]));
                setRegistrationMessage("Application submitted. Your account is pending admin document approval.");
              }
              const accounts = JSON.parse(localStorage.getItem("woodverse-accounts") || "[]");
              const nextAccount = { email: registeredEmail, role: accountType, status: requiresVerification ? "Pending Approval" : "Active", createdAt: new Date().toISOString() };
              localStorage.setItem("woodverse-accounts", JSON.stringify([{ ...nextAccount }, ...accounts.filter((account) => account.email !== registeredEmail)]));
            try {
              const password = String(formData.get("password") || "");

              if (accountType === "customer") {
                const result = await apiRequest("/api/auth/register", {
                  method: "POST",
                  body: JSON.stringify({
                    email: registeredEmail,
                    fullName: `${formData.get("firstName")} ${formData.get("lastName")}`.trim(),
                    password,
                  }),
                });

                localStorage.setItem("woodverse-auth-token", result.token);
                localStorage.setItem("woodverse-api-user", JSON.stringify(result.user));
              } else {
                const result = await apiRequest("/api/users", {
                  method: "POST",
                  body: JSON.stringify({
                    email: registeredEmail,
                    fullName: `${formData.get("firstName")} ${formData.get("lastName")}`.trim(),
                    role: accountType,
                    password,
                  }),
                });

                localStorage.setItem(
                  "woodverse-api-user",
                  JSON.stringify(result.user)
                );
              }
            } catch (error) {
              setRegistrationMessage(
                error.message || "Registration failed. Please try again."
              );
              return;
            }
              publishAdminEvent(accountType === "customer" ? "Customer" : accountType === "vendor" ? "Vendor" : "Supplier", `${selectedAccount.label} registration received`, `${registeredEmail} created a ${selectedAccount.label.toLowerCase()} account${requiresVerification ? " with documents pending admin approval" : ""}.`, requiresVerification ? "High" : "Normal");
              setAuthMode("signin");
              return;
            }
            const signInData = new FormData(event.currentTarget);
            const signInEmail = String(signInData.get("email") || "").trim().toLowerCase();
            const signInPassword = String(signInData.get("password") || "");
            try {
              const result = await apiRequest("/api/auth/login", { method: "POST", body: JSON.stringify({ email: signInEmail, password: signInPassword }) });
              localStorage.setItem("woodverse-auth-token", result.token);
              localStorage.setItem("woodverse-api-user", JSON.stringify(result.user));
            } catch {}
            const accounts = JSON.parse(localStorage.getItem("woodverse-accounts") || "[]");
            const savedAccount = accounts.find((account) => account.email === signInEmail);
            const loginRole = savedAccount?.role || accountType;
            onAuthSuccess();
            navigate(loginRole === "vendor" ? "/vendor-dashboard" : loginRole === "supplier" ? "/supplier/profile" : "/");
          }}
          className="flex min-h-[760px] flex-col px-16 py-16 max-lg:min-h-0 max-sm:px-7 max-sm:py-10"
        >
          <button type="button" onClick={() => navigate("/")} className="w-fit text-left">
            <BrandLogo imageClassName="h-12 w-12" textClassName="text-[34px] text-[#164f40] max-sm:text-3xl" />
          </button>

          <div className="mt-9">
            <h1 className="break-words text-[34px] font-extrabold leading-tight tracking-normal text-[#151d28] max-sm:text-3xl">{isRegister ? "Create Your Account" : "Welcome Back"}</h1>
            <p className="mt-2 break-words text-base leading-relaxed text-[#4b514f]">
              {registrationMessage || (isRegister ? "Create an account to save locally crafted furniture and manage orders." : `Sign in as a ${selectedAccount.label.toLowerCase()} to continue.`)}
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
                <AuthField name="firstName" label="First Name" placeholder="First name" autoComplete="given-name" />
                <AuthField name="lastName" label="Last Name" placeholder="Last name" autoComplete="family-name" />
                <AuthField name="email" label="Email Address" placeholder="name@company.com" type="email" autoComplete="email" icon={Mail} className="sm:col-span-2" />
                <AuthField name="password" label="Password" placeholder="••••••••" type="password" autoComplete="new-password" icon={Lock} />
                <AuthField label="Confirm Password" placeholder="••••••••" type="password" autoComplete="new-password" icon={Lock} />
              </div>

              {requiresVerification && (
                <fieldset className="mt-8 grid gap-4 rounded-md border border-[#d8d4cc] bg-[#fffaf3] p-5">
                  <legend className="px-1 text-sm font-extrabold text-[#164f40]">Required verification documents</legend>
                  <p className="text-sm leading-relaxed text-[#4b514f]">All documents are required before your {accountType} application can be sent to admin approval.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {requiredDocuments.map(([id, label]) => (
                      <label key={id} className="grid min-w-0 gap-2 text-sm font-bold text-[#3e4744]">
                        <span className="break-words">{label}</span>
                        <input
                          required
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(event) => setRegistrationDocuments((items) => ({ ...items, [id]: event.target.files?.[0] || null }))}
                          className="min-w-0 rounded-md border border-[#c9d4cf] bg-white p-2 text-xs font-semibold text-[#4b514f]"
                        />
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <label className="mt-6 flex min-w-0 items-start gap-3 text-sm leading-relaxed text-[#4b514f]">
                <input required type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 rounded border-[#d0d8d3] accent-[#164f40]" />
                <span className="min-w-0 break-words">
                  I agree to the <button type="button" onClick={() => window.alert("Terms and Conditions opened.")} className="text-[#8b5633]">Terms and Conditions</button> and the <button type="button" onClick={() => window.alert("Privacy Policy opened.")} className="text-[#8b5633]">Privacy Policy</button>.
                </span>
              </label>
            </>
          ) : (
            <>
              <fieldset className="mt-9">
                <legend className="mb-4 text-sm font-bold text-[#3e4744]">Continue as</legend>
                <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
                  {accountTypes.map((item) => {
                    const Icon = item.icon;
                    const selected = accountType === item.id;
                    return (
                      <button key={item.id} type="button" onClick={() => setAccountType(item.id)} className={`flex min-h-14 min-w-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition ${selected ? "border-[#164f40] bg-[#edf6ef] text-[#164f40]" : "border-[#c9d4cf] bg-white text-[#4b514f] hover:border-[#164f40]"}`} aria-pressed={selected}>
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="break-words">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div className="mt-11 grid gap-7">
                <AuthField name="email" label="Email Address" placeholder="name@company.com" type="email" autoComplete="email" icon={Mail} />
                <AuthField name="password" label="Password" placeholder="••••••••" type="password" autoComplete="current-password" icon={Lock} trailingIcon={Eye} labelAction={<button type="button" onClick={() => navigate("/forgot-password")} className="font-semibold text-[#164f40]">Forgot Password?</button>} />
              </div>

              <div className="mt-6 flex min-w-0 items-center justify-between gap-4 text-sm max-sm:flex-col max-sm:items-start">
                <label className="flex min-w-0 items-start gap-3 leading-relaxed text-[#4b514f]">
                  <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 rounded border-[#d0d8d3] accent-[#164f40]" />
                  <span className="min-w-0 break-words">Remember this device for 30 days</span>
                </label>
              </div>
            </>
          )}

          <button type="submit" className="mt-9 inline-flex min-h-[68px] w-full min-w-0 items-center justify-center gap-3 rounded-md bg-[#164f40] px-4 text-base font-bold text-white shadow-sm">
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
            © 2026 WoodVerse Sri Lanka. Built for sustainable timber craftsmanship.
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
        <button type="button" onClick={() => navigate("/")} className="w-fit text-left">
          <BrandLogo imageClassName="h-12 w-12" textClassName="text-[34px] text-[#164f40] max-sm:text-3xl" />
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

        <button type="submit" className="mt-9 inline-flex min-h-[68px] w-full min-w-0 items-center justify-center gap-3 rounded-md bg-[#164f40] px-4 text-base font-bold text-white shadow-sm">
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
          © 2026 WoodVerse Sri Lanka. Built for sustainable timber craftsmanship.
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

function AuthField({
  name,
  label,
  placeholder,
  type = "text",
  autoComplete,
  icon: Icon,
  trailingIcon: TrailingIcon,
  labelAction,
  className = "",
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <label
      className={`grid min-w-0 gap-2 text-sm font-bold text-[#3e4744] ${className}`}
    >
      <span className="flex min-w-0 items-center justify-between gap-4">
        <span className="min-w-0 break-words">{label}</span>
        {labelAction}
      </span>

      <span className="flex min-h-[50px] min-w-0 items-center gap-4 rounded-md border border-[#c9d4cf] bg-[#eaf3ff] px-5 focus-within:border-[#164f40]">
        {Icon && <Icon className="h-5 w-5 shrink-0 text-[#b4beb9]" />}

        <input
          name={name}
          type={isPassword && showPassword ? "text" : type}
          required
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent text-base text-[#151d28] outline-none placeholder:text-[#697482]"
          placeholder={placeholder}
        />

        {TrailingIcon && (
          <button
            type="button"
            onClick={() => {
              if (isPassword) {
                setShowPassword((current) => !current);
              }
            }}
            className="shrink-0 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <TrailingIcon className="h-5 w-5 text-[#b4beb9]" />
          </button>
        )}
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
                          <button type="button" onClick={() => navigate("/chatbot")} className="min-h-10 rounded-md bg-forest px-4 font-bold text-white">Track Order</button>
                          <button type="button" onClick={() => window.alert(`Invoice for ${order.id} downloaded.`)} className="min-h-10 rounded-md border border-slate-200 bg-white px-4 font-bold text-slate-600 dark:border-slate-700 dark:bg-[#202624] dark:text-stone-300">Download Invoice</button>
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

function SellerPage() {
  return (
    <>
      <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(260px,360px)] items-center gap-10 py-14 lg:gap-16 max-lg:grid-cols-1">
        <div className="min-w-0"><BackHome /><p className="eyebrow">Seller Program</p><h1 className="break-words text-4xl font-bold leading-tight sm:text-5xl">Sell Furniture and Wooden Products on WoodVerse</h1><p className="mt-5 max-w-2xl break-words text-lg leading-relaxed text-slate-500 dark:text-stone-400">Join a marketplace built for Sri Lankan woodcraft, custom furniture requests, managed payments, and delivery coordination.</p></div>
        <div className="overflow-hidden rounded-lg bg-white shadow-soft dark:bg-[#202624]"><div className="h-64"><CroppedImage crop={crop.sideboard} label="Seller product" /></div><div className="p-6"><strong className="break-words text-forest dark:text-emerald-200">Vendor profile review</strong><p className="break-words leading-snug">Typical approval in 2-3 business days</p></div></div>
      </section>
      <section className="page-shell grid grid-cols-[.95fr_1.05fr] gap-8 pb-16 max-lg:grid-cols-1">
        <Panel title="What Sellers Get" subtitle="Tools for listing, quoting, and fulfilling custom wood products."><div className="grid gap-4">{["Verified Marketplace Profile", "Order and Quote Management", "Payment and Delivery Support"].map((item, index) => <article key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-[#1d2422]"><span className="font-extrabold text-forest dark:text-emerald-200">{String(index + 1).padStart(2, "0")}</span><h3 className="break-words font-bold leading-snug">{item}</h3><p className="break-words leading-snug text-slate-500 dark:text-stone-400">Showcase products and manage marketplace workflows.</p></article>)}</div></Panel>
        <Panel title="Seller Application" subtitle="Submit your workshop details for review."><CheckoutGrid /><button onClick={() => window.alert("Seller application submitted for review.")} className="mt-6 w-full rounded-md bg-forest py-3 font-bold text-white">Submit Application</button></Panel>
      </section>
      <Footer />
    </>
  );
}

export {
  HomePage,
  CatalogPage,
  CategoryPage,
  CartPage,
  DeliveryPage,
  PaymentPage,
  ProductDetailsPage,
  ChatbotPage,
  LoginPage,
  ForgotPasswordPage,
  ProfilePage,
  SellerPage,
};
