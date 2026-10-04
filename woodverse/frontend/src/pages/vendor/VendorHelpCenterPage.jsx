import { useState } from "react";
import {
  BookOpen,
  Clock3,
  HelpCircle,
  Mail,
  MessageSquare,
  PhoneCall,
  Save,
  Search,
  Send,
} from "lucide-react";
import { VendorHeader } from "./VendorHeader";
import { getVendorIdentity } from "./identity.js";
import { SettingsPanel } from "./VendorSettingsPage";
import { VendorSidebar } from "./VendorSidebar";
import { requestVendorNewOrder } from "./orders.js";
import { helpTopics, vendorFaqs } from "./seed.js";
import { ModalShell, SettingsInput, SettingsSelect } from "./shared";

export function VendorHelpCenterPage() {
  const defaultTickets = [
    { id: "VH-1024", subject: "Supplier notification delay", type: "Technical", status: "Open", time: "Today", priority: "High", message: "Supplier notification events need admin review." },
    { id: "VH-1023", subject: "Customer payment status mismatch", type: "Orders", status: "In Review", time: "Yesterday", priority: "Medium", message: "Customer payment status is not matching the order record." },
  ];
  const [notice, setNotice] = useState("Help center loaded.");
  const [query, setQuery] = useState("");
  const [activeContact, setActiveContact] = useState(null);
  const [tickets, setTickets] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("woodverse-vendor-support-tickets") || "[]");
      return stored.length ? stored : defaultTickets;
    } catch {
      return defaultTickets;
    }
  });
  const [ticketForm, setTicketForm] = useState({
    subject: "Need help with vendor notifications",
    type: "Technical",
    priority: "Medium",
    message: "Supplier and customer notifications need admin review.",
  });

  const filteredFaqs = vendorFaqs.filter((item) => {
    const content = `${item.question} ${item.answer}`.toLowerCase();
    return content.includes(query.toLowerCase());
  });

  const updateTicket = (field, value) => setTicketForm((current) => ({ ...current, [field]: value }));

  const saveTickets = (items) => {
    try {
      localStorage.setItem("woodverse-vendor-support-tickets", JSON.stringify(items));
    } catch {}
  };

  const addSupportRecord = ({ subject, type, priority = "Medium", message = "", status = "Open" }) => {
    const nextId = `VH-${Date.now().toString().slice(-6)}`;
    const ticket = { id: nextId, subject, type, priority, message, status, time: "Just now" };
    setTickets((items) => {
      const next = [ticket, ...items];
      saveTickets(next);
      return next;
    });
    return nextId;
  };

  const submitTicket = (event) => {
    event.preventDefault();
    if (!ticketForm.subject.trim()) {
      setNotice("Support ticket subject is required.");
      return;
    }
    if (!ticketForm.message.trim()) {
      setNotice("Support ticket message is required.");
      return;
    }
    const nextId = addSupportRecord(ticketForm);
    setNotice(`Support ticket ${nextId} sent to admin.`);
  };

  const submitEmailAdmin = (form) => {
    const subject = form.subject || "Vendor portal support request";
    const { businessName, ownerName } = getVendorIdentity();
    const body = `${form.message}\n\nVendor: ${businessName}\nContact: ${ownerName}\nCategory: ${form.category}`;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent("admin@woodverse.lk")}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
    const nextId = addSupportRecord({ subject, type: form.category, priority: "Medium", message: form.message, status: "Gmail Draft" });
    setActiveContact(null);
    setNotice(`Gmail opened for admin email. Support record ${nextId} created.`);
  };

  const submitCallbackRequest = (form) => {
    const nextId = addSupportRecord({
      subject: `Callback requested for ${form.topic}`,
      type: "Phone",
      priority: "Medium",
      message: `Call ${form.phone} at ${form.preferredTime}.`,
      status: "Scheduled",
    });
    setActiveContact(null);
    setNotice(`Callback request ${nextId} scheduled for ${form.preferredTime}.`);
  };

  const selectHelpTopic = (topic) => {
    const typeByTopic = {
      "Customer Orders": "Orders",
      "Production Tracking": "Technical",
      "Supplier Coordination": "Suppliers",
      Notifications: "Technical",
    };
    setTicketForm({
      subject: `Help needed: ${topic.title}`,
      type: typeByTopic[topic.title] || "Technical",
      priority: topic.title === "Supplier Coordination" ? "High" : "Medium",
      message: topic.detail,
    });
    setQuery(topic.title);
    setNotice(`${topic.title} selected. Support ticket form is ready.`);
  };

  const updateTicketStatus = (ticketId, status) => {
    setTickets((items) => {
      const next = items.map((ticket) => ticket.id === ticketId ? { ...ticket, status, time: "Updated now" } : ticket);
      saveTickets(next);
      return next;
    });
    setNotice(`Ticket ${ticketId} marked ${status}.`);
  };

  return (
    <main className="min-h-screen bg-[#f8f4ec] pb-24 text-[#303833] lg:pb-0">
      <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
        <VendorSidebar active="Help Center" onNavigate={setNotice} onNewOrder={requestVendorNewOrder} />

        <section className="min-w-0">
          <VendorHeader onAction={setNotice} onNotifications={() => setNotice("Notifications are available from the Dashboard page.")} unreadCount={0} status="Support" />

          <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-5 py-6 sm:px-8 lg:px-10">
            <section className="grid gap-3">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#115745]">Vendor Portal</p>
              <h1 className="text-3xl font-semibold leading-tight text-[#202621]">Help Center</h1>
              <p className="max-w-3xl text-sm leading-relaxed text-[#66716b]">
                Find vendor guidance, contact support, and send support tickets to the WoodVerse admin team.
              </p>
            </section>

            <div className="rounded-lg border border-[#cbd7cf] bg-white px-4 py-3 text-sm font-semibold text-[#115745] shadow-sm">
              {notice}
            </div>

            <section className="grid gap-4 md:grid-cols-3">
              <HelpContactCard icon={MessageSquare} title="Live Chat" detail="Ask admin support about urgent vendor portal issues." action="Start Chat" onClick={() => setActiveContact("chat")} />
              <HelpContactCard icon={Mail} title="Email Support" detail="Send order, supplier, or payment issues to support." action="Email Admin" onClick={() => setActiveContact("email")} />
              <HelpContactCard icon={PhoneCall} title="Phone Support" detail="Call vendor support during Colombo business hours." action="Request Call" onClick={() => setActiveContact("call")} />
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="grid gap-6">
                <SettingsPanel icon={BookOpen} title="Help Topics" detail="Common areas where vendors usually need support.">
                  <div className="grid gap-4 md:grid-cols-2">
                    {helpTopics.map((topic) => (
                      <article key={topic.title} className="rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4">
                        <topic.icon className="h-5 w-5 text-[#115745]" />
                        <h3 className="mt-3 font-semibold text-[#202621]">{topic.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#66716b]">{topic.detail}</p>
                        <button type="button" onClick={() => selectHelpTopic(topic)} className="mt-4 min-h-10 rounded-lg bg-[#eef4ef] px-4 text-sm font-extrabold text-[#115745]">
                          Select Topic
                        </button>
                      </article>
                    ))}
                  </div>
                </SettingsPanel>

                <SettingsPanel icon={HelpCircle} title="FAQ" detail="Search quick answers before creating a support ticket.">
                  <label className="mb-4 flex min-h-11 items-center rounded-lg border border-[#c4cbc7] bg-white px-3 text-[#747a76]">
                    <Search className="h-4 w-4 shrink-0" />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold outline-none" placeholder="Search help..." />
                  </label>
                  <div className="grid gap-3">
                    {filteredFaqs.map((faq) => (
                      <article key={faq.question} className="rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4">
                        <h3 className="font-semibold text-[#202621]">{faq.question}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#66716b]">{faq.answer}</p>
                      </article>
                    ))}
                    {filteredFaqs.length === 0 && <p className="rounded-lg bg-[#f8f4ec] p-4 text-sm font-semibold text-[#66716b]">No FAQ results found.</p>}
                  </div>
                </SettingsPanel>
              </div>

              <aside className="grid content-start gap-6">
                <SettingsPanel icon={Send} title="Create Support Ticket" detail="Send a support request directly to admin.">
                  <form onSubmit={submitTicket} className="grid gap-4">
                    <SettingsInput label="Subject" value={ticketForm.subject} onChange={(value) => updateTicket("subject", value)} />
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                      <SettingsSelect label="Type" value={ticketForm.type} options={["Technical", "Orders", "Suppliers", "Payments", "Account"]} onChange={(value) => updateTicket("type", value)} />
                      <SettingsSelect label="Priority" value={ticketForm.priority} options={["Low", "Medium", "High", "Urgent"]} onChange={(value) => updateTicket("priority", value)} />
                    </div>
                    <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
                      Message
                      <textarea value={ticketForm.message} onChange={(event) => updateTicket("message", event.target.value)} rows={5} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 font-semibold outline-none transition focus:border-[#115745]" />
                    </label>
                    <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
                      <Send className="h-4 w-4" />
                      Send To Admin
                    </button>
                  </form>
                </SettingsPanel>

                <SettingsPanel icon={Clock3} title="Recent Tickets" detail="Track support requests sent by the vendor account.">
                  <div className="grid gap-3">
                    {tickets.map((ticket) => (
                      <article key={ticket.id} className="rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <strong className="text-[#202621]">{ticket.id}</strong>
                          <span className="rounded-full bg-[#eef4ef] px-2.5 py-1 text-xs font-extrabold uppercase text-[#115745]">{ticket.status}</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-[#3d4541]">{ticket.subject}</p>
                        <p className="mt-2 text-xs font-bold uppercase text-[#66716b]">{ticket.type} - {ticket.priority || "Medium"} - {ticket.time}</p>
                        {ticket.message && <p className="mt-2 text-sm leading-relaxed text-[#66716b]">{ticket.message}</p>}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button type="button" onClick={() => updateTicketStatus(ticket.id, "In Review")} className="min-h-9 rounded-lg border border-[#c4cbc7] bg-white px-3 text-xs font-extrabold text-[#3d4541]">Review</button>
                          <button type="button" onClick={() => updateTicketStatus(ticket.id, "Resolved")} className="min-h-9 rounded-lg bg-[#d9ecd8] px-3 text-xs font-extrabold text-[#115745]">Resolve</button>
                          <button type="button" onClick={() => updateTicketStatus(ticket.id, "Open")} className="min-h-9 rounded-lg bg-[#e9e4dc] px-3 text-xs font-extrabold text-[#3d4541]">Reopen</button>
                        </div>
                      </article>
                    ))}
                  </div>
                </SettingsPanel>
              </aside>
            </section>
          </div>
        </section>
      </div>

      {activeContact === "chat" && <SupportChatModal onClose={() => setActiveContact(null)} onCreateTicket={(subject) => { const nextId = addSupportRecord({ subject, type: "Chat", status: "Open", priority: "High", message: "Live chat transcript saved for admin review." }); setActiveContact(null); setNotice(`Chat transcript saved as ticket ${nextId}.`); }} />}
      {activeContact === "email" && <EmailAdminModal onClose={() => setActiveContact(null)} onSubmit={submitEmailAdmin} />}
      {activeContact === "call" && <RequestCallModal onClose={() => setActiveContact(null)} onSubmit={submitCallbackRequest} />}
    </main>
  );
}

export function HelpContactCard({ icon: Icon, title, detail, action, onClick }) {
  return (
    <article className="rounded-xl border border-[#c2cac5] bg-white p-5 shadow-sm">
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#eef4ef] text-[#115745]">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-[#202621]">{title}</h2>
      <p className="mt-2 min-h-[44px] text-sm leading-relaxed text-[#66716b]">{detail}</p>
      <button onClick={onClick} className="mt-4 min-h-10 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
        {action}
      </button>
    </article>
  );
}

export function SupportChatModal({ onClose, onCreateTicket }) {
  const [message, setMessage] = useState("I need help connecting supplier and customer notifications.");
  const [messages, setMessages] = useState([
    { sender: "Admin Support", text: "You are connected to WoodVerse admin support. How can we help?" },
  ]);

  const sendMessage = (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    const text = message.trim();
    setMessages((items) => [
      ...items,
      { sender: "You", text },
      { sender: "Admin Support", text: "Thanks. We received your message and attached it to the vendor support queue." },
    ]);
    setMessage("");
  };

  return (
    <ModalShell title="Admin Live Chat" subtitle="Connected support chat for vendor portal issues." onClose={onClose}>
      <div className="grid max-h-[calc(90vh-86px)] gap-4 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="grid gap-3 rounded-lg border border-[#d9d5cd] bg-[#fbfaf6] p-4">
          {messages.map((item, index) => (
            <div key={`${item.sender}-${index}`} className={`max-w-[85%] rounded-lg px-4 py-3 text-sm ${item.sender === "You" ? "ml-auto bg-[#115745] text-white" : "bg-white text-[#3d4541]"}`}>
              <strong className="block text-xs uppercase opacity-75">{item.sender}</strong>
              <span className="mt-1 block leading-relaxed">{item.text}</span>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="grid gap-3">
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-[#115745]" />
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={() => onCreateTicket("Live chat transcript with admin support")} className="min-h-10 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">
              Save As Ticket
            </button>
            <button type="submit" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
              <Send className="h-4 w-4" />
              Send Message
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}

export function EmailAdminModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    subject: "Vendor portal support request",
    category: "Technical",
    message: "Please review supplier/customer notification connection for my vendor account.",
  });
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submitEmail = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <ModalShell title="Email Admin" subtitle="Send a structured support email to the WoodVerse admin team." onClose={onClose}>
      <form onSubmit={submitEmail} className="grid gap-4 px-5 py-5 sm:px-6">
        <SettingsInput label="Subject" value={form.subject} onChange={(value) => updateField("subject", value)} />
        <SettingsSelect label="Category" value={form.category} options={["Technical", "Orders", "Suppliers", "Payments", "Account"]} onChange={(value) => updateField("category", value)} />
        <label className="grid gap-2 text-sm font-bold text-[#3d4541]">
          Message
          <textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} rows={5} className="rounded-lg border border-[#c4cbc7] bg-white px-3 py-2 font-semibold outline-none transition focus:border-[#115745]" />
        </label>
        <div className="flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] pt-4">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
            <Mail className="h-4 w-4" />
            Send Email
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function RequestCallModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    phone: "+94 77 412 8890",
    topic: "Notification setup",
    preferredTime: "Today 3:00 PM - 5:00 PM",
  });
  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submitCall = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <ModalShell title="Request Call" subtitle="Ask WoodVerse admin support to call the vendor contact." onClose={onClose}>
      <form onSubmit={submitCall} className="grid gap-4 px-5 py-5 sm:px-6">
        <SettingsInput label="Phone Number" value={form.phone} onChange={(value) => updateField("phone", value)} />
        <SettingsSelect label="Topic" value={form.topic} options={["Notification setup", "Order support", "Supplier issue", "Payment issue", "Account access"]} onChange={(value) => updateField("topic", value)} />
        <SettingsSelect label="Preferred Time" value={form.preferredTime} options={["Today 3:00 PM - 5:00 PM", "Tomorrow 9:00 AM - 11:00 AM", "Tomorrow 2:00 PM - 4:00 PM"]} onChange={(value) => updateField("preferredTime", value)} />
        <div className="flex flex-wrap justify-end gap-3 border-t border-[#d9d5cd] pt-4">
          <button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-[#c4cbc7] bg-white px-4 text-sm font-extrabold text-[#3d4541]">Cancel</button>
          <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#115745] px-4 text-sm font-extrabold text-white">
            <PhoneCall className="h-4 w-4" />
            Schedule Call
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
