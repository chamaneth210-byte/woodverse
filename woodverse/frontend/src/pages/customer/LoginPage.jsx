import { useState } from "react";
import {
  ArrowRight,
  Eye,
  Lock,
  Mail,
  Store,
  Warehouse,
  UserRound,
} from "lucide-react";
import { apiRequest, navigate, getSession, storeAuth, clearAuth } from "../../utils";
import { BrandLogo } from "../../components/BrandLogo";
import { publishAdminEvent } from "../../lib/adminEvents";

export function LoginPage({ onAuthSuccess }) {
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

              const password = String(formData.get("password") || "");
              const fullName = `${formData.get("firstName")} ${formData.get("lastName")}`.trim();

              // One endpoint for every self-service role. It cannot create an admin, and
              // vendor/supplier accounts come back as pending_approval.
              let created;
              try {
                created = await apiRequest("/api/auth/register", {
                  method: "POST",
                  body: JSON.stringify({
                    email: registeredEmail,
                    fullName,
                    password,
                    role: accountType,
                    businessName: fullName,
                  }),
                });
              } catch (requestError) {
                setRegistrationMessage(requestError.message || "Registration failed. Please try again.");
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
              }

              if (created.user.status === "pending_approval") {
                // A business account is not usable until an admin approves it, so no
                // session is stored. Signing in here would fail at the server.
                setRegistrationMessage("Account created. It is pending admin approval, so you can sign in once it is approved.");
                setAuthMode("signin");
                return;
              }

              storeAuth(created);
              publishAdminEvent(accountType === "customer" ? "Customer" : accountType === "vendor" ? "Vendor" : "Supplier", `${selectedAccount.label} registration received`, `${registeredEmail} created a ${selectedAccount.label.toLowerCase()} account${requiresVerification ? " with documents pending admin approval" : ""}.`, requiresVerification ? "High" : "Normal");
              onAuthSuccess();
              navigate(accountType === "customer" ? "/" : accountType === "vendor" ? "/vendor-dashboard" : "/supplier");
              return;
            }

            const signInData = new FormData(event.currentTarget);
            const signInEmail = String(signInData.get("email") || "").trim().toLowerCase();
            const signInPassword = String(signInData.get("password") || "");

            // A failed sign-in must stop here. The old code swallowed the error and then
            // called onAuthSuccess(), so a wrong password still looked like a login.
            let session;
            try {
              session = await apiRequest("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email: signInEmail, password: signInPassword }),
              });
            } catch (requestError) {
              clearAuth();
              setRegistrationMessage(requestError.message || "Sign in failed. Please try again.");
              return;
            }

            storeAuth(session);
            onAuthSuccess();

            // Role comes from the token the server issued, not from a localStorage record.
            const nextPath = new URLSearchParams(window.location.search).get("next");
            const role = getSession()?.role;
            const home = role === "vendor" ? "/vendor-dashboard" : role === "supplier" ? "/supplier" : role === "admin" ? "/admin" : "/";
            navigate(nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : home);
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
                <AuthField name="password" label="Password" placeholder="••••••••" type="password" autoComplete="current-password" icon={Lock} trailingIcon={Eye} />
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

          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="mt-4 min-h-[52px] rounded-md border border-[#d9e5e0] bg-[#f3faf6] px-4 font-bold text-[#164f40]"
          >
            Forgot Password?
          </button>

          <p className="mt-auto pt-16 text-xs font-semibold leading-snug tracking-wide text-[#7b827e] max-lg:pt-10">
            © 2026 WoodVerse Sri Lanka. Built for sustainable timber craftsmanship.
          </p>
        </form>
    </AuthShell>
  );
}

export function AuthShell({ children }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f1e8] px-5 py-10 text-[#151d28]">
      <section className="grid w-full max-w-[1150px] grid-cols-[minmax(360px,520px)_minmax(0,1fr)] overflow-hidden rounded-xl border border-[#e4e1da] bg-white shadow-[0_2px_10px_rgba(32,30,25,0.14)] max-lg:max-w-[620px] max-lg:grid-cols-1">
        {children}
        <aside className="relative min-h-[760px] overflow-hidden bg-[#203b31] max-lg:hidden">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,27,22,0.04),rgba(10,27,22,0.58)),url('/assets/auth-plant-table.webp')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,41,32,0.1),rgba(12,41,32,0.32))]" />
          <article className="absolute bottom-6 left-6 right-6 grid grid-cols-[minmax(0,1fr)_80px] gap-6 rounded-xl bg-white/90 p-6 shadow-xl backdrop-blur max-xl:grid-cols-1">
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

export function AuthField({
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
