"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Store, User, Clock, FileText, CheckCircle2,
  ChevronRight, ChevronLeft, MapPin, Phone, Mail,
  Users, Building2, CreditCard, Receipt, Camera, Plus, X,
} from "lucide-react";

const BRAND  = "#2b34d1";
const WHITE  = "#ffffff";
const BORDER = "#e2e8f0";
const TXT    = "#0f172a";
const SUBT   = "#475569";
const MUTE   = "#94a3b8";
const SURF   = "#f8fafc";

type ShopType = "grocery"|"electronics"|"clothing"|"pharmacy"|"restaurant"|"hardware"|"stationery"|"salon"|"other";

const SHOP_TYPES = [
  { value: "grocery"     as ShopType, label: "Grocery",     emoji: "🛒" },
  { value: "electronics" as ShopType, label: "Electronics",  emoji: "📱" },
  { value: "clothing"    as ShopType, label: "Clothing",     emoji: "👕" },
  { value: "pharmacy"    as ShopType, label: "Pharmacy",     emoji: "💊" },
  { value: "restaurant"  as ShopType, label: "Restaurant",   emoji: "🍽️" },
  { value: "hardware"    as ShopType, label: "Hardware",     emoji: "🔧" },
  { value: "stationery"  as ShopType, label: "Stationery",   emoji: "📚" },
  { value: "salon"       as ShopType, label: "Salon",        emoji: "💈" },
  { value: "other"       as ShopType, label: "Other",        emoji: "🏪" },
];

const DAYS  = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const STEPS = [
  { id: 1, label: "Shop Info",    Icon: Store    },
  { id: 2, label: "Owner",        Icon: User     },
  { id: 3, label: "Operations",   Icon: Clock    },
  { id: 4, label: "Legal & Docs", Icon: FileText },
];

/* ── reusable Field wrapper ── */
function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: MUTE, textTransform: "uppercase", letterSpacing: "0.07em" }}>
        {label} {required && <span style={{ color: "#f87171" }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: MUTE, margin: 0 }}>{hint}</p>}
    </div>
  );
}

/* ── reusable Input ── */
function FInput({ type="text", placeholder, value, onChange, Icon: IconComp, maxLength }: {
  type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; Icon?: React.ElementType; maxLength?: number;
}) {
  const base: React.CSSProperties = {
    width: "100%", padding: IconComp ? "11px 14px 11px 38px" : "11px 14px",
    borderRadius: 12, border: `1.5px solid ${BORDER}`,
    background: WHITE, fontSize: 13, color: TXT, outline: "none",
    fontFamily: "Sora,sans-serif", boxSizing: "border-box",
    transition: "border-color 0.15s",
  };
  return (
    <div style={{ position: "relative" }}>
      {IconComp && <IconComp style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 15, height: 15, color: MUTE }} />}
      <input type={type} placeholder={placeholder} value={value} maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        style={base}
        onFocus={(e) => { e.target.style.borderColor = BRAND; e.target.style.boxShadow = "0 0 0 3px rgba(43,52,209,0.08)"; }}
        onBlur={(e)  => { e.target.style.borderColor = BORDER; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step,  setStep]  = useState(1);
  const [done,  setDone]  = useState(false);

  const [shopName,  setShopName]  = useState("");
  const [shopType,  setShopType]  = useState<ShopType | "">("");
  const [address,   setAddress]   = useState("");
  const [city,      setCity]      = useState("");
  const [pincode,   setPincode]   = useState("");
  const [stateVal,  setStateVal]  = useState("");
  const [shopEmail, setShopEmail] = useState("");
  const [shopPhone, setShopPhone] = useState("");

  const [ownerName,  setOwnerName]  = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [employees,  setEmployees]  = useState("");
  const [altPhones,  setAltPhones]  = useState<string[]>([""]);

  const [openTime,  setOpenTime]  = useState("09:00");
  const [closeTime, setCloseTime] = useState("21:00");
  const [offDays,   setOffDays]   = useState<string[]>(["Sun"]);

  const [gstNo,     setGstNo]     = useState("");
  const [aadharNo,  setAadharNo]  = useState("");
  const [panNo,     setPanNo]     = useState("");
  const [bankName,  setBankName]  = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifscCode,  setIfscCode]  = useState("");
  const [upiId,     setUpiId]     = useState("");

  const toggleDay  = (d: string) => setOffDays((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]);
  const addPhone   = () => setAltPhones((p) => [...p, ""]);
  const delPhone   = (i: number) => setAltPhones((p) => p.filter((_, idx) => idx !== i));
  const editPhone  = (i: number, v: string) => setAltPhones((p) => p.map((x, idx) => idx === i ? v : x));

  const nextStep = () => {
    if (step < 4) setStep((s) => s + 1);
    else setDone(true);
  };
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  /* ── Done ── */
  if (done) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#2b34d1,#1a1f8f)", padding: "24px", textAlign: "center", fontFamily: "Sora,sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');`}</style>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 28 }}>
          <CheckCircle2 style={{ width: 40, height: 40, color: "#fff" }} />
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 12 }}>You're all set! 🎉</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", maxWidth: 320, lineHeight: 1.7, marginBottom: 36 }}>
          <strong style={{ color: "#fff" }}>{shopName || "Your shop"}</strong> has been registered. Welcome to BillEase POS!
        </p>
        <button onClick={() => router.push("/dashboard")} style={{ padding: "14px 36px", borderRadius: 16, background: "#fff", color: BRAND, fontSize: 14, fontWeight: 800, border: "none", cursor: "pointer", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", fontFamily: "Sora,sans-serif" }}>
          Open Dashboard →
        </button>
      </div>
    );
  }

  const inputTA: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 12,
    border: `1.5px solid ${BORDER}`, background: WHITE,
    fontSize: 13, color: TXT, outline: "none", resize: "none",
    fontFamily: "Sora,sans-serif", boxSizing: "border-box",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        .ob * { font-family:'Sora',sans-serif; box-sizing:border-box; }
        .ob-left  { width:100%; background:${BRAND}; padding:28px 24px 20px; }
        .ob-steps { display:flex; flex-wrap:wrap; gap:10px; }
        @media(min-width:1024px){
          .ob-wrap  { flex-direction:row!important; }
          .ob-left  { width:340px!important; min-height:100vh!important; padding:48px 40px!important; flex-shrink:0!important; }
          .ob-desc  { display:block!important; }
          .ob-steps { flex-direction:column!important; flex-wrap:nowrap!important; gap:12px!important; }
        }
        .ob-type-btn { display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 8px;border-radius:12px;border:2px solid ${BORDER};background:${WHITE};cursor:pointer;transition:all 0.15s;font-family:Sora,sans-serif;text-align:center; }
        .ob-type-btn:hover { border-color:#a5b4fc; }
        .ob-type-active { border-color:${BRAND}!important;background:rgba(43,52,209,0.05)!important; }
        .ob-day-btn { padding:9px 18px;border-radius:10px;border:2px solid ${BORDER};background:${WHITE};font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;font-family:Sora,sans-serif; }
        .ob-day-active { background:${BRAND}!important;border-color:${BRAND}!important;color:#fff!important; }
        .ob-step-item { display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;transition:all 0.2s; }
        .ob-step-active { background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.3); }
        .ob-step-done   { background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15); }
        .ob-step-idle   { opacity:0.45; }
        .ob-grid2 { display:grid;grid-template-columns:1fr 1fr;gap:14px; }
        .ob-grid3 { display:grid;grid-template-columns:1fr 1fr;gap:14px; }
        @media(min-width:768px){ .ob-grid3 { grid-template-columns:1fr 1fr 1fr; } }
        .ob-shop-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:8px; }
        @media(min-width:480px){ .ob-shop-grid { grid-template-columns:repeat(4,1fr); } }
        @media(min-width:640px){ .ob-shop-grid { grid-template-columns:repeat(5,1fr); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div className="ob" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div className="ob-wrap" style={{ flex: 1, display: "flex", flexDirection: "column" }}>

          {/* ── LEFT PANEL ── */}
          <div className="ob-left">
            {/* Brand */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Receipt style={{ width: 18, height: 18, color: "#fff" }} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>BillEase POS</span>
            </div>

            {/* Desc — hidden on mobile */}
            <div className="ob-desc" style={{ display: "none", marginBottom: 36 }}>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 10 }}>Set up your<br />shop profile 🏪</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>Fill in your shop details once and BillEase auto-fills everything.</p>
            </div>

            {/* Steps */}
            <div className="ob-steps">
              {STEPS.map((s) => {
                const active    = step === s.id;
                const completed = step > s.id;
                return (
                  <div key={s.id} className={`ob-step-item ${active ? "ob-step-active" : completed ? "ob-step-done" : "ob-step-idle"}`}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: active ? "#fff" : completed ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {completed
                        ? <CheckCircle2 style={{ width: 16, height: 16, color: BRAND }} />
                        : <s.Icon style={{ width: 16, height: 16, color: active ? BRAND : "#fff" }} />
                      }
                    </div>
                    <div>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", margin: 0 }}>Step {s.id}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: active ? "#fff" : "rgba(255,255,255,0.7)", margin: 0 }}>{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: FORM ── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: SURF, minHeight: 0 }}>

            {/* Form header */}
            <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <p style={{ fontSize: 11, color: MUTE, margin: 0 }}>Step {step} of 4</p>
                <h1 style={{ fontSize: 17, fontWeight: 800, color: TXT, margin: 0 }}>{STEPS[step - 1].label}</h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {STEPS.map((s) => (
                  <div key={s.id} style={{ height: 6, borderRadius: 3, transition: "all 0.4s", background: s.id <= step ? BRAND : "#e2e8f0", width: s.id === step ? 28 : 14 }} />
                ))}
              </div>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "32px 24px" }}>
              <div key={step} className="fade-up" style={{ maxWidth: 680 }}>

                {/* STEP 1 */}
                {step === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div>
                      <h2 style={{ fontSize: 22, fontWeight: 800, color: TXT, margin: "0 0 6px" }}>Shop Information</h2>
                      <p style={{ fontSize: 13, color: MUTE, margin: 0 }}>Tell us about your shop to personalise your experience.</p>
                    </div>

                    <Field label="Type of Shop" required>
                      <div className="ob-shop-grid">
                        {SHOP_TYPES.map((t) => (
                          <button key={t.value} type="button" onClick={() => setShopType(t.value)}
                            className={`ob-type-btn ${shopType === t.value ? "ob-type-active" : ""}`}>
                            <span style={{ fontSize: 22 }}>{t.emoji}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: shopType === t.value ? BRAND : SUBT, lineHeight: 1.3 }}>{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="Shop Name" required>
                      <FInput placeholder="e.g. Sharma General Store" value={shopName} onChange={setShopName} Icon={Store} />
                    </Field>
                    <div className="ob-grid2">
                      <Field label="Shop Email">
                        <FInput type="email" placeholder="shop@example.com" value={shopEmail} onChange={setShopEmail} Icon={Mail} />
                      </Field>
                      <Field label="Shop Phone" required>
                        <FInput type="tel" placeholder="+91 98765 43210" value={shopPhone} onChange={setShopPhone} Icon={Phone} />
                      </Field>
                    </div>
                    <Field label="Full Address" required>
                      <textarea placeholder="Street, Building, Landmark..." value={address} onChange={(e) => setAddress(e.target.value)} rows={3} style={inputTA} />
                    </Field>
                    <div className="ob-grid3">
                      <Field label="City" required>
                        <FInput placeholder="Mumbai" value={city} onChange={setCity} Icon={MapPin} />
                      </Field>
                      <Field label="State" required>
                        <FInput placeholder="Maharashtra" value={stateVal} onChange={setStateVal} Icon={Building2} />
                      </Field>
                      <Field label="Pincode" required>
                        <FInput placeholder="400001" value={pincode} onChange={setPincode} maxLength={6} />
                      </Field>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div>
                      <h2 style={{ fontSize: 22, fontWeight: 800, color: TXT, margin: "0 0 6px" }}>Owner Details</h2>
                      <p style={{ fontSize: 13, color: MUTE, margin: 0 }}>Information about the shop owner and team.</p>
                    </div>
                    <div className="ob-grid2">
                      <Field label="Owner Full Name" required>
                        <FInput placeholder="Rajesh Sharma" value={ownerName} onChange={setOwnerName} Icon={User} />
                      </Field>
                      <Field label="Owner Mobile" required>
                        <FInput type="tel" placeholder="+91 98765 43210" value={ownerPhone} onChange={setOwnerPhone} Icon={Phone} />
                      </Field>
                    </div>
                    <Field label="Owner Email">
                      <FInput type="email" placeholder="owner@example.com" value={ownerEmail} onChange={setOwnerEmail} Icon={Mail} />
                    </Field>
                    <Field label="Number of Employees" hint="Including the owner">
                      <FInput type="number" placeholder="1" value={employees} onChange={setEmployees} Icon={Users} />
                    </Field>
                    <Field label="Additional Contact Numbers">
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {altPhones.map((phone, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <div style={{ flex: 1 }}>
                              <FInput type="tel" placeholder={`Alternate number ${i + 1}`} value={phone} onChange={(v) => editPhone(i, v)} Icon={Phone} />
                            </div>
                            {altPhones.length > 1 && (
                              <button onClick={() => delPhone(i)} style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid #fecaca", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                                <X style={{ width: 14, height: 14, color: "#f87171" }} />
                              </button>
                            )}
                          </div>
                        ))}
                        {altPhones.length < 4 && (
                          <button onClick={addPhone} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 10, border: `1.5px dashed rgba(43,52,209,0.35)`, background: "transparent", color: BRAND, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Sora,sans-serif", alignSelf: "flex-start" }}>
                            <Plus style={{ width: 14, height: 14 }} /> Add another number
                          </button>
                        )}
                      </div>
                    </Field>
                  </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div>
                      <h2 style={{ fontSize: 22, fontWeight: 800, color: TXT, margin: "0 0 6px" }}>Working Hours & Days</h2>
                      <p style={{ fontSize: 13, color: MUTE, margin: 0 }}>Set your shop's operating schedule.</p>
                    </div>
                    <div style={{ background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`, padding: 20 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: TXT, marginBottom: 16, marginTop: 0 }}>Daily Working Hours</p>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <p style={{ fontSize: 11, color: MUTE, marginBottom: 6, marginTop: 0 }}>Opening Time</p>
                          <input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`, fontSize: 14, color: TXT, outline: "none", background: SURF, fontFamily: "Sora,sans-serif" }} />
                        </div>
                        <span style={{ color: MUTE, fontWeight: 700, fontSize: 18, marginTop: 20 }}>→</span>
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <p style={{ fontSize: 11, color: MUTE, marginBottom: 6, marginTop: 0 }}>Closing Time</p>
                          <input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)}
                            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${BORDER}`, fontSize: 14, color: TXT, outline: "none", background: SURF, fontFamily: "Sora,sans-serif" }} />
                        </div>
                      </div>
                    </div>

                    <Field label="Weekly Off Days" hint="Tap to toggle days off">
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {DAYS.map((day) => (
                          <button key={day} type="button" onClick={() => toggleDay(day)}
                            className={`ob-day-btn ${offDays.includes(day) ? "ob-day-active" : ""}`}>
                            {day}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <div style={{ padding: 16, borderRadius: 14, background: "rgba(43,52,209,0.05)", border: "1px solid rgba(43,52,209,0.15)" }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: BRAND, marginBottom: 6, marginTop: 0 }}>📋 Schedule Summary</p>
                      <p style={{ fontSize: 13, color: SUBT, margin: 0 }}>
                        Open <strong>{openTime}</strong> – <strong>{closeTime}</strong>
                        {" · "}
                        {offDays.length === 0 ? "Open all 7 days" : `Off on ${offDays.join(", ")}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div>
                      <h2 style={{ fontSize: 22, fontWeight: 800, color: TXT, margin: "0 0 6px" }}>Legal & Financial Details</h2>
                      <p style={{ fontSize: 13, color: MUTE, margin: 0 }}>These details appear on your invoices. All fields are optional but recommended.</p>
                    </div>
                    <div className="ob-grid2">
                      <Field label="GST Number" hint="15-digit GSTIN">
                        <FInput placeholder="22AAAAA0000A1Z5" value={gstNo} onChange={setGstNo} Icon={FileText} maxLength={15} />
                      </Field>
                      <Field label="PAN Number">
                        <FInput placeholder="AAAPL1234C" value={panNo} onChange={setPanNo} Icon={CreditCard} maxLength={10} />
                      </Field>
                    </div>
                    <Field label="Aadhaar Number" hint="Only last 4 digits will be shown">
                      <FInput type="tel" placeholder="XXXX XXXX XXXX" value={aadharNo} onChange={setAadharNo} Icon={User} maxLength={12} />
                    </Field>
                    <div style={{ height: 1, background: BORDER }} />
                    <p style={{ fontSize: 14, fontWeight: 700, color: TXT, margin: 0 }}>Bank Details <span style={{ fontSize: 12, fontWeight: 400, color: MUTE }}>(for payment collection)</span></p>
                    <div className="ob-grid2">
                      <Field label="Bank Name">
                        <FInput placeholder="State Bank of India" value={bankName} onChange={setBankName} Icon={Building2} />
                      </Field>
                      <Field label="Account Number">
                        <FInput type="tel" placeholder="XXXXXXXXXXXXXXXXXX" value={accountNo} onChange={setAccountNo} Icon={CreditCard} />
                      </Field>
                    </div>
                    <div className="ob-grid2">
                      <Field label="IFSC Code">
                        <FInput placeholder="SBIN0001234" value={ifscCode} onChange={setIfscCode} maxLength={11} />
                      </Field>
                      <Field label="UPI ID">
                        <FInput placeholder="shopname@upi" value={upiId} onChange={setUpiId} Icon={Phone} />
                      </Field>
                    </div>
                    <Field label="Shop Logo" hint="PNG or JPG, max 2MB — appears on invoices">
                      <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "32px 20px", borderRadius: 16, border: `2px dashed ${BORDER}`, background: WHITE, cursor: "pointer", transition: "border-color 0.15s" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: SURF, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Camera style={{ width: 22, height: 22, color: MUTE }} />
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: SUBT, margin: "0 0 3px" }}>Click to upload logo</p>
                          <p style={{ fontSize: 11, color: MUTE, margin: 0 }}>PNG, JPG up to 2MB</p>
                        </div>
                        <input type="file" accept="image/*" style={{ display: "none" }} />
                      </label>
                    </Field>
                  </div>
                )}
              </div>
            </div>

            {/* ── Bottom nav ── */}
            <div style={{ background: WHITE, borderTop: `1px solid ${BORDER}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexShrink: 0 }}>
              <button onClick={prevStep} disabled={step === 1}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 20px", borderRadius: 12, border: `1.5px solid ${BORDER}`, background: WHITE, fontSize: 13, fontWeight: 700, color: SUBT, cursor: step === 1 ? "not-allowed" : "pointer", opacity: step === 1 ? 0.35 : 1, fontFamily: "Sora,sans-serif" }}>
                <ChevronLeft style={{ width: 15, height: 15 }} /> Previous
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {STEPS.map((s) => (
                  <div key={s.id} style={{ height: 7, borderRadius: 4, transition: "all 0.35s", background: s.id <= step ? BRAND : "#e2e8f0", width: s.id === step ? 24 : 10 }} />
                ))}
              </div>

              <button onClick={nextStep}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 22px", borderRadius: 12, background: BRAND, color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 14px rgba(43,52,209,0.28)", fontFamily: "Sora,sans-serif" }}>
                {step === 4 ? "Finish Setup ✓" : <>Continue <ChevronRight style={{ width: 15, height: 15 }} /></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}