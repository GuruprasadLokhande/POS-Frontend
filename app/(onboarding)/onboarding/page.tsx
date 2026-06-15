"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt, Store, User, Clock, FileText,
  CheckCircle2, ChevronRight, ChevronLeft,
  MapPin, Phone, Mail, Users, Building2,
  CreditCard, Camera, Plus, X, ChevronDown,
  ShoppingCart, Smartphone, Shirt, Pill,
  UtensilsCrossed, Wrench, BookOpen, Scissors,
  Package, Menu,
} from "lucide-react";
import "./onboarding.css";

/* ════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
════════════════════════════════════════════════════════════ */
type ShopType =
  | "grocery" | "electronics" | "clothing" | "pharmacy"
  | "restaurant" | "hardware" | "stationery" | "salon" | "other";

type Step = 1 | 2 | 3 | 4;

const SHOP_TYPES: { value: ShopType; label: string; Icon: React.ElementType }[] = [
  { value: "grocery",     label: "Grocery",      Icon: ShoppingCart    },
  { value: "electronics", label: "Electronics",  Icon: Smartphone      },
  { value: "clothing",    label: "Clothing",     Icon: Shirt           },
  { value: "pharmacy",    label: "Pharmacy",     Icon: Pill            },
  { value: "restaurant",  label: "Restaurant",   Icon: UtensilsCrossed },
  { value: "hardware",    label: "Hardware",     Icon: Wrench          },
  { value: "stationery",  label: "Stationery",   Icon: BookOpen        },
  { value: "salon",       label: "Salon",        Icon: Scissors        },
  { value: "other",       label: "Other",        Icon: Package         },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const STEPS: { id: Step; label: string; Icon: React.ElementType }[] = [
  { id: 1, label: "Shop Info",    Icon: Store    },
  { id: 2, label: "Owner",        Icon: User     },
  { id: 3, label: "Operations",   Icon: Clock    },
  { id: 4, label: "Legal & Docs", Icon: FileText },
];

/* ════════════════════════════════════════════════════════════
   SMALL REUSABLE COMPONENTS
════════════════════════════════════════════════════════════ */

function Field({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="ob-field">
      <label className="ob-field__label">
        {label}
        {required && <span className="ob-field__required">*</span>}
      </label>
      {children}
      {hint && <p className="ob-field__hint">{hint}</p>}
    </div>
  );
}

function FInput({
  type = "text",
  placeholder,
  value,
  onChange,
  Icon: IconComp,
  maxLength,
}: {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  Icon?: React.ElementType;
  maxLength?: number;
}) {
  return (
    <div className="ob-input-wrap">
      {IconComp && <IconComp className="ob-input-wrap__icon" />}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={`ob-input ${IconComp ? "ob-input--icon" : ""}`}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════ */
export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [done, setDone] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Step 1 */
  const [shopType,    setShopType]    = useState<ShopType | "">("");
  const [otherType,   setOtherType]   = useState("");
  const [shopName,    setShopName]    = useState("");
  const [shopEmail,   setShopEmail]   = useState("");
  const [shopPhone,   setShopPhone]   = useState("");
  const [address,     setAddress]     = useState("");
  const [city,        setCity]        = useState("");
  const [stateVal,    setStateVal]    = useState("");
  const [pincode,     setPincode]     = useState("");

  /* Step 2 */
  const [ownerName,   setOwnerName]   = useState("");
  const [ownerPhone,  setOwnerPhone]  = useState("");
  const [ownerEmail,  setOwnerEmail]  = useState("");
  const [employees,   setEmployees]   = useState("");
  const [altPhones,   setAltPhones]   = useState<string[]>([""]);

  /* Step 3 */
  const [openTime,  setOpenTime]  = useState("09:00");
  const [closeTime, setCloseTime] = useState("21:00");
  const [offDays,   setOffDays]   = useState<string[]>(["Sun"]);

  /* Step 4 */
  const [gstNo,     setGstNo]     = useState("");
  const [panNo,     setPanNo]     = useState("");
  const [aadharNo,  setAadharNo]  = useState("");
  const [bankName,  setBankName]  = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [ifscCode,  setIfscCode]  = useState("");
  const [upiId,     setUpiId]     = useState("");
  const [logoFile,  setLogoFile]  = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  /* helpers */
  const toggleDay = (d: string) =>
    setOffDays((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]);

  const addPhone  = () => setAltPhones((p) => [...p, ""]);
  const delPhone  = (i: number) => setAltPhones((p) => p.filter((_, idx) => idx !== i));
  const editPhone = (i: number, v: string) =>
    setAltPhones((p) => p.map((x, idx) => (idx === i ? v : x)));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    const formData = {
      shop: {
        type: shopType,
        otherType: shopType === "other" ? otherType : undefined,
        name: shopName,
        email: shopEmail,
        phone: shopPhone,
        address: { street: address, city, state: stateVal, pincode },
      },
      owner: {
        name: ownerName,
        phone: ownerPhone,
        email: ownerEmail,
        employees: employees ? parseInt(employees) : undefined,
        altPhones: altPhones.filter(Boolean),
      },
      operations: {
        openTime,
        closeTime,
        offDays,
      },
      legal: {
        gstNo,
        panNo,
        aadharNo,
        bank: { name: bankName, accountNo, ifscCode },
        upiId,
      },
    };
    console.log("Onboarding payload:", JSON.stringify(formData, null, 2));
    setDone(true);
  };

  const nextStep = () => {
    if (step < 4) setStep((s) => (s + 1) as Step);
    else handleSubmit();
  };
  const prevStep = () => {
    setStep((s) => Math.max(1, s - 1) as Step);
    setSidebarOpen(false);
  };

  const dotCls = (sid: number) => {
    if (sid === step)  return "ob-nav__dot ob-nav__dot--active";
    if (sid < step)    return "ob-nav__dot ob-nav__dot--done";
    return "ob-nav__dot ob-nav__dot--idle";
  };

  const hdrDotCls = (sid: number) => {
    if (sid === step)  return "ob-header__dot ob-header__dot--active";
    if (sid < step)    return "ob-header__dot ob-header__dot--done";
    return "ob-header__dot ob-header__dot--idle";
  };

  /* ══════════════ DONE SCREEN ══════════════ */
  if (done) {
    return (
      <div className="ob-done">
        <div className="ob-done__icon-ring">
          <CheckCircle2 size={40} />
        </div>
        <h1>You&apos;re all set! 🎉</h1>
        <p>
          <strong>{shopName || "Your shop"}</strong> has been registered.
          Welcome to BillEase POS!
        </p>
        <button
          className="ob-done__cta"
          onClick={() => router.push("/dashboard")}
        >
          Open Dashboard →
        </button>
      </div>
    );
  }

  /* ══════════════ MAIN FORM SHELL ══════════════ */
  return (
    <div className="ob-screen">

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="ob-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════ LEFT PANEL ══════════ */}
      <aside className={`ob-panel ${sidebarOpen ? "ob-panel--open" : ""}`}>
        <div className="ob-brand">
          <div className="ob-brand__icon">
            <Receipt size={18} />
          </div>
          <span className="ob-brand__name">BillEase POS</span>
        </div>

        <div className="ob-panel__headline">
          <h2>Set up your<br />shop profile</h2>
          <p>Fill in your shop details once and BillEase auto-fills everything — invoices, receipts, reports.</p>
        </div>

        <nav className="ob-steps">
          {STEPS.map((s) => {
            const isActive    = step === s.id;
            const isCompleted = step > s.id;
            const cls = isActive ? "ob-step ob-step--active"
                      : isCompleted ? "ob-step ob-step--done"
                      : "ob-step ob-step--idle";
            return (
              <div key={s.id} className={cls}>
                <div className="ob-step__icon">
                  {isCompleted
                    ? <CheckCircle2 size={16} />
                    : <s.Icon size={16} />
                  }
                </div>
                <div className="ob-step__meta">
                  <p className="ob-step__num">Step {s.id}</p>
                  <p className="ob-step__label">{s.label}</p>
                </div>
                {/* Completion badge visible in mobile drawer */}
                {isCompleted && (
                  <div className="ob-step__badge">✓</div>
                )}
              </div>
            );
          })}
        </nav>

        <p className="ob-panel__copyright">© 2024 BillEase POS. All rights reserved.</p>
      </aside>

      {/* ══════════ FORM AREA ══════════ */}
      <main className="ob-main">

        {/* Header bar */}
        <div className="ob-header">
          {/* Hamburger — mobile/tablet only */}
          <button
            className="ob-header__menu-btn"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle steps menu"
          >
            <Menu size={20} />
          </button>

          <div className="ob-header__title-group">
            <span className="ob-header__step-label">Step {step} of 4</span>
            <h1 className="ob-header__title">{STEPS[step - 1].label}</h1>
          </div>
          <div className="ob-header__dots">
            {STEPS.map((s) => (
              <div key={s.id} className={hdrDotCls(s.id)} />
            ))}
          </div>
        </div>

        {/* Progress bar — mobile visual cue */}
        <div className="ob-progress-bar">
          <div
            className="ob-progress-bar__fill"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Scrollable content */}
        <div className="ob-content">
          <div className="ob-content__inner">
            <div key={step} className="ob-step-body">

              {/* ══ STEP 1 — Shop Info ══ */}
              {step === 1 && (
                <>
                  <div className="ob-step-heading">
                    <h2>Shop Information</h2>
                    <p>Tell us about your shop to personalise your experience.</p>
                  </div>

                  <Field label="Type of Shop" required>
                    <div className="ob-select-wrap">
                      <Store className="ob-select-wrap__icon" />
                      <select
                        className={`ob-select ${!shopType ? "ob-select--placeholder" : ""}`}
                        value={shopType}
                        onChange={(e) => setShopType(e.target.value as ShopType | "")}
                      >
                        <option value="" disabled hidden>Select shop type…</option>
                        {SHOP_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="ob-select-wrap__chevron" />
                    </div>
                    {shopType === "other" && (
                      <div className="ob-other-input">
                        <FInput
                          placeholder="Describe your shop type…"
                          value={otherType}
                          onChange={setOtherType}
                          Icon={Package}
                        />
                      </div>
                    )}
                  </Field>

                  <Field label="Shop Name" required>
                    <FInput
                      placeholder="e.g. Sharma General Store"
                      value={shopName}
                      onChange={setShopName}
                      Icon={Store}
                    />
                  </Field>

                  <div className="ob-grid-2">
                    <Field label="Shop Email">
                      <FInput type="email" placeholder="shop@example.com" value={shopEmail} onChange={setShopEmail} Icon={Mail} />
                    </Field>
                    <Field label="Shop Phone" required>
                      <FInput type="tel" placeholder="+91 98765 43210" value={shopPhone} onChange={setShopPhone} Icon={Phone} />
                    </Field>
                  </div>

                  <Field label="Full Address" required>
                    <textarea
                      className="ob-textarea"
                      placeholder="Street, Building, Landmark…"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                    />
                  </Field>

                  <div className="ob-grid-3">
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
                </>
              )}

              {/* ══ STEP 2 — Owner ══ */}
              {step === 2 && (
                <>
                  <div className="ob-step-heading">
                    <h2>Owner Details</h2>
                    <p>Information about the shop owner and team.</p>
                  </div>

                  <div className="ob-grid-2">
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
                    <div className="ob-alt-phones">
                      {altPhones.map((phone, i) => (
                        <div key={i} className="ob-alt-phone-row">
                          <div className="ob-input-wrap" style={{ flex: 1 }}>
                            <Phone className="ob-input-wrap__icon" />
                            <input
                              type="tel"
                              placeholder={`Alternate number ${i + 1}`}
                              value={phone}
                              onChange={(e) => editPhone(i, e.target.value)}
                              className="ob-input ob-input--icon"
                            />
                          </div>
                          {altPhones.length > 1 && (
                            <button
                              type="button"
                              className="ob-del-btn"
                              onClick={() => delPhone(i)}
                              aria-label="Remove number"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      {altPhones.length < 4 && (
                        <button type="button" className="ob-add-btn" onClick={addPhone}>
                          <Plus size={14} />
                          Add another number
                        </button>
                      )}
                    </div>
                  </Field>
                </>
              )}

              {/* ══ STEP 3 — Operations ══ */}
              {step === 3 && (
                <>
                  <div className="ob-step-heading">
                    <h2>Working Hours &amp; Days</h2>
                    <p>Set your shop&apos;s operating schedule.</p>
                  </div>

                  <div className="ob-hours-card">
                    <p className="ob-hours-card__title">Daily Working Hours</p>
                    <div className="ob-hours-row">
                      <div className="ob-hours-row__block">
                        <label>Opening Time</label>
                        <input
                          type="time"
                          value={openTime}
                          onChange={(e) => setOpenTime(e.target.value)}
                          className="ob-input"
                        />
                      </div>
                      <span className="ob-hours-row__arrow">→</span>
                      <div className="ob-hours-row__block">
                        <label>Closing Time</label>
                        <input
                          type="time"
                          value={closeTime}
                          onChange={(e) => setCloseTime(e.target.value)}
                          className="ob-input"
                        />
                      </div>
                    </div>
                  </div>

                  <Field label="Weekly Off Days" hint="Tap a day to mark it as closed">
                    <div className="ob-days">
                      {DAYS.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`ob-day-btn ${offDays.includes(day) ? "ob-day-btn--off" : ""}`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </Field>

                  <div className="ob-schedule-summary">
                    <p className="ob-schedule-summary__label">Schedule Preview</p>
                    <p className="ob-schedule-summary__text">
                      Open <strong>{openTime}</strong> – <strong>{closeTime}</strong>
                      {" · "}
                      {offDays.length === 0
                        ? "Open all 7 days"
                        : `Closed on ${offDays.join(", ")}`}
                    </p>
                  </div>
                </>
              )}

              {/* ══ STEP 4 — Legal & Docs ══ */}
              {step === 4 && (
                <>
                  <div className="ob-step-heading">
                    <h2>Legal &amp; Financial Details</h2>
                    <p>These details appear on your invoices. All fields are optional but recommended.</p>
                  </div>

                  <div className="ob-grid-2">
                    <Field label="GST Number" hint="15-digit GSTIN">
                      <FInput placeholder="22AAAAA0000A1Z5" value={gstNo} onChange={setGstNo} Icon={FileText} maxLength={15} />
                    </Field>
                    <Field label="PAN Number">
                      <FInput placeholder="AAAPL1234C" value={panNo} onChange={setPanNo} Icon={CreditCard} maxLength={10} />
                    </Field>
                  </div>

                  <Field label="Aadhaar Number" hint="Only last 4 digits shown on documents">
                    <FInput type="tel" placeholder="XXXX XXXX XXXX" value={aadharNo} onChange={setAadharNo} Icon={User} maxLength={12} />
                  </Field>

                  <div className="ob-divider" />

                  <p className="ob-section-label">
                    Bank Details
                    <span>for payment collection</span>
                  </p>

                  <div className="ob-grid-2">
                    <Field label="Bank Name">
                      <FInput placeholder="State Bank of India" value={bankName} onChange={setBankName} Icon={Building2} />
                    </Field>
                    <Field label="Account Number">
                      <FInput type="tel" placeholder="XXXXXXXXXXXXXXXXXX" value={accountNo} onChange={setAccountNo} Icon={CreditCard} />
                    </Field>
                  </div>

                  <div className="ob-grid-2">
                    <Field label="IFSC Code">
                      <FInput placeholder="SBIN0001234" value={ifscCode} onChange={setIfscCode} maxLength={11} />
                    </Field>
                    <Field label="UPI ID">
                      <FInput placeholder="shopname@upi" value={upiId} onChange={setUpiId} Icon={Phone} />
                    </Field>
                  </div>

                  {/* Logo upload */}
                  <Field label="Shop Logo" hint="PNG or JPG, max 2 MB — appears on invoices">
                    <label className="ob-upload-label">
                      {logoPreview ? (
                        <div className="ob-upload-preview">
                          <img src={logoPreview} alt="Logo preview" className="ob-upload-preview__img" />
                          <p className="ob-upload-preview__name">{logoFile?.name}</p>
                          <p className="ob-upload-label__sub">Click to change</p>
                        </div>
                      ) : (
                        <>
                          <div className="ob-upload-label__icon">
                            <Camera size={22} />
                          </div>
                          <div>
                            <p className="ob-upload-label__title">Click to upload logo</p>
                            <p className="ob-upload-label__sub">PNG, JPG up to 2 MB</p>
                          </div>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        style={{ display: "none" }}
                        onChange={handleLogoChange}
                      />
                    </label>
                  </Field>
                </>
              )}

            </div>
          </div>
        </div>

        {/* ══ BOTTOM NAV ══ */}
        <div className="ob-nav">
          <button
            className="ob-btn ob-btn--secondary"
            onClick={prevStep}
            disabled={step === 1}
          >
            <ChevronLeft size={15} />
            <span>Previous</span>
          </button>

          <div className="ob-nav__dots">
            {STEPS.map((s) => (
              <div key={s.id} className={dotCls(s.id)} />
            ))}
          </div>

          <button className="ob-btn ob-btn--primary" onClick={nextStep}>
            {step === 4
              ? "Finish Setup ✓"
              : (<><span>Continue</span> <ChevronRight size={15} /></>)
            }
          </button>
        </div>

      </main>
    </div>
  );
}