import { useState } from "react";
import {
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";
import { apiRequest, navigate } from "../../utils";
import { BrandLogo } from "../../components/BrandLogo";
import { CroppedImage } from "../../components/CroppedImage";
import { crop } from "../../data/catalog";

export function ChatbotPage() {
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
        <header className="flex min-w-0 items-center justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-700"><h2><BrandLogo imageClassName="h-8 w-8" textClassName="text-xl text-forest dark:text-emerald-200" subtitle="Assistant" subtitleClassName="text-xs font-bold text-slate-500 dark:text-stone-400" /></h2><button className="shrink-0" onClick={() => navigate("/")} aria-label="Close chat"><X /></button></header>
        <div className="grid gap-4 bg-[#fffdf9] p-6 dark:bg-[#1d2422]">
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">{suggestions.map((prompt) => <button onClick={() => send(prompt)} key={prompt} className="flex min-w-0 items-start gap-2 rounded-lg border border-emerald-200 p-4 text-left font-bold leading-snug text-forest dark:border-emerald-900 dark:text-emerald-200"><Search className="h-5 w-5 shrink-0" /><span className="min-w-0 break-words">{prompt}</span></button>)}</div>
          {messages.map(([role, text], index) => <article key={index} className={`max-w-[92%] min-w-0 sm:max-w-[78%] ${role === "user" ? "justify-self-end" : ""}`}><p className={`break-words rounded-lg p-4 leading-relaxed ${role === "user" ? "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-stone-100" : "bg-moss text-emerald-50"}`}>{text}</p><time className="text-xs text-slate-500 dark:text-stone-400">10:02 AM</time></article>)}
          {isThinking && <article className="max-w-[78%] min-w-0"><p className="break-words rounded-lg bg-moss p-4 leading-relaxed text-emerald-50">Checking WoodVerse AI service...</p><time className="text-xs text-slate-500 dark:text-stone-400">Now</time></article>}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); send(input); }} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-t border-slate-200 p-5 dark:border-slate-700"><input value={input} onChange={(event) => setInput(event.target.value)} className="min-w-0 rounded-lg bg-blue-50 px-4 outline-none dark:bg-[#1d2422]" placeholder="Type your message..." /><button type="submit" disabled={isThinking} aria-label="Send message" className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-forest text-white disabled:cursor-not-allowed disabled:bg-slate-400"><Send className="h-5 w-5" /></button></form>
      </section>
      <aside className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#202624] max-lg:hidden"><h2 className="text-xl font-bold">Active Order</h2><div className="mt-5 overflow-hidden rounded-lg"><CroppedImage crop={crop.bed} src="/assets/bedroom-soft-neutral.png" label="Active order" className="h-40" /></div><button onClick={() => navigate("/cart")} className="mt-6 w-full rounded-md bg-forest py-3 font-bold text-white">Open Cart</button></aside>
    </main>
  );
}
