"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Search,
  User,
  Phone,
  Printer,
  Download,
  MessageCircle,
  CheckCircle2,
  X,
  ShoppingCart,
  Tag,
  IndianRupee,
  ArrowLeft,
  Receipt,
} from "lucide-react";

interface SaleItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  unit: string;
}
type PaymentMethod = "cash" | "upi" | "card" | "credit";
type DiscountType  = "flat" | "percent";

const INVENTORY = [
  { name: "Tata Salt 1kg",       price: 24,  unit: "pcs" },
  { name: "Amul Butter 100g",    price: 52,  unit: "pcs" },
  { name: "Surf Excel 1kg",      price: 190, unit: "pcs" },
  { name: "Aashirvaad Atta 5kg", price: 265, unit: "bag" },
  { name: "Fortune Oil 1L",      price: 140, unit: "btl" },
  { name: "Parle-G Biscuit",     price: 10,  unit: "pcs" },
  { name: "Maggi 70g",           price: 14,  unit: "pcs" },
  { name: "Colgate 200g",        price: 80,  unit: "pcs" },
  { name: "Lifebuoy Soap",       price: 35,  unit: "pcs" },
  { name: "Horlicks 500g",       price: 245, unit: "jar" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string; emoji: string }[] = [
  { value: "cash",   label: "Cash",   emoji: "💵" },
  { value: "upi",    label: "UPI",    emoji: "📱" },
  { value: "card",   label: "Card",   emoji: "💳" },
  { value: "credit", label: "Credit", emoji: "📒" },
];

/* ── Invoice Modal ──────────────────────────────────────────── */
function InvoiceModal({
  items, subtotal, discount, discountType, tax, total,
  customerName, customerPhone, paymentMethod, invoiceNo, onClose,
}: {
  items: SaleItem[]; subtotal: number; discount: number;
  discountType: DiscountType; tax: number; total: number;
  customerName: string; customerPhone: string;
  paymentMethod: PaymentMethod; invoiceNo: string; onClose: () => void;
}) {
  const printRef    = useRef<HTMLDivElement>(null);
  const discountAmt = discountType === "percent" ? (subtotal * discount) / 100 : discount;
  const taxAmt      = ((subtotal - discountAmt) * tax) / 100;

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank", "width=420,height=680");
    if (!win) return;
    win.document.write(`<html><head><title>Invoice #${invoiceNo}</title>
      <style>body{font-family:monospace;font-size:12px;padding:20px;max-width:380px;margin:0 auto}
      table{width:100%;border-collapse:collapse}td,th{padding:4px 2px}
      .right{text-align:right}.center{text-align:center}.bold{font-weight:bold}
      .border-b{border-bottom:1px dashed #ccc}hr{border:none;border-top:1px dashed #ccc;margin:8px 0}
      </style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
    win.close();
  };

  const handleWhatsApp = () => {
    const lines = items.map((i) => `• ${i.name} ×${i.qty} = ₹${(i.price * i.qty).toFixed(2)}`).join("\n");
    const msg = [
      `🧾 *BillEase Invoice #${invoiceNo}*`,
      `📅 ${new Date().toLocaleDateString("en-IN")}`,
      ``,
      lines,
      ``,
      `Subtotal : ₹${subtotal.toFixed(2)}`,
      discountAmt > 0 ? `Discount : -₹${discountAmt.toFixed(2)}` : null,
      tax > 0         ? `Tax (${tax}%): +₹${taxAmt.toFixed(2)}`  : null,
      `*Total   : ₹${total.toFixed(2)}*`,
      `Payment  : ${paymentMethod.toUpperCase()}`,
      ``,
      `Thank you! 🙏`,
    ].filter(Boolean).join("\n");
    const phone = customerPhone.replace(/\D/g, "");
    const dest  = phone ? (phone.startsWith("91") ? phone : `91${phone}`) : "";
    window.open(`https://wa.me/${dest}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleDownload = () => {
    const sep   = "─".repeat(48);
    const lines = items.map((i) => `${i.name.padEnd(22)} ${i.qty} × ₹${i.price} = ₹${(i.price * i.qty).toFixed(2)}`).join("\n");
    const body  = [
      sep, "        BILLEASE POS — Sharma General Store", sep,
      `Invoice : #${invoiceNo}`,
      `Date    : ${new Date().toLocaleDateString("en-IN")}`,
      `Customer: ${customerName || "Walk-in"}`,
      customerPhone ? `Phone   : ${customerPhone}` : "",
      sep, lines, sep,
      `Subtotal : ₹${subtotal.toFixed(2)}`,
      discountAmt > 0 ? `Discount : -₹${discountAmt.toFixed(2)}` : "",
      tax > 0         ? `Tax      : +₹${taxAmt.toFixed(2)}`       : "",
      `TOTAL    : ₹${total.toFixed(2)}`,
      `Payment  : ${paymentMethod.toUpperCase()}`, sep,
      "     Thank you for your business!", sep,
    ].filter((l) => l !== "").join("\n");

    const a   = document.createElement("a");
    a.href    = URL.createObjectURL(new Blob([body], { type: "text/plain;charset=utf-8" }));
    a.download = `Invoice-${invoiceNo}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ zIndex: 50, backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: 440,
          maxHeight: "92vh",
          backgroundColor: "#fff",
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -8px 48px rgba(0,0,0,0.2)",
        }}
      >
        {/* @ts-ignore */}
        <style>{`@media(min-width:640px){.invoice-modal{border-radius:24px!important}}`}</style>
        <div className="invoice-modal" style={{ display: "contents" }}>

          {/* Header */}
          <div className="flex items-center justify-between flex-shrink-0" style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, backgroundColor: "#dcfce7" }}>
                <CheckCircle2 style={{ width: 18, height: 18, color: "#16a34a" }} />
              </div>
              <div>
                <p className="font-bold text-slate-800" style={{ fontSize: 14 }}>Sale Recorded! 🎉</p>
                <p className="text-slate-400" style={{ fontSize: 11 }}>Invoice #{invoiceNo}</p>
              </div>
            </div>
            <button onClick={onClose} className="flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: "#f1f5f9", border: "none", cursor: "pointer" }}>
              <X style={{ width: 13, height: 13, color: "#64748b" }} />
            </button>
          </div>

          {/* Scrollable invoice */}
          <div className="flex-1 overflow-y-auto">
            <div ref={printRef} style={{ padding: 24 }}>
              {/* Shop */}
              <div className="text-center" style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px dashed #e2e8f0" }}>
                <div className="flex items-center justify-center mx-auto rounded-xl" style={{ width: 44, height: 44, backgroundColor: "#2b34d1", marginBottom: 8 }}>
                  <Receipt style={{ width: 22, height: 22, color: "#fff" }} />
                </div>
                <p className="font-extrabold text-slate-900" style={{ fontSize: 15 }}>BillEase POS</p>
                <p className="text-slate-400" style={{ fontSize: 11 }}>Sharma General Store · Mumbai</p>
                <p className="text-slate-400" style={{ fontSize: 11 }}>GST: 27AABCS1429B1ZB</p>
              </div>

              {/* Bill to */}
              <div className="flex justify-between" style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "1px dashed #f1f5f9", fontSize: 11 }}>
                <div>
                  <p className="text-slate-400" style={{ marginBottom: 2 }}>Bill To</p>
                  <p className="font-semibold text-slate-800">{customerName || "Walk-in Customer"}</p>
                  {customerPhone && <p className="text-slate-500">{customerPhone}</p>}
                </div>
                <div className="text-right">
                  <p className="text-slate-400" style={{ marginBottom: 2 }}>Invoice</p>
                  <p className="font-semibold text-slate-800 font-mono">#{invoiceNo}</p>
                  <p className="text-slate-500">{new Date().toLocaleDateString("en-IN")}</p>
                </div>
              </div>

              {/* Items */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginBottom: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <th className="text-left text-slate-400 font-semibold" style={{ paddingBottom: 6 }}>Item</th>
                    <th className="text-center text-slate-400 font-semibold" style={{ paddingBottom: 6, width: 36 }}>Qty</th>
                    <th className="text-right text-slate-400 font-semibold" style={{ paddingBottom: 6, width: 52 }}>Rate</th>
                    <th className="text-right text-slate-400 font-semibold" style={{ paddingBottom: 6, width: 60 }}>Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #fafafa" }}>
                      <td className="text-slate-700 font-medium" style={{ paddingTop: 6, paddingBottom: 6 }}>{item.name}</td>
                      <td className="text-center text-slate-500" style={{ padding: "6px 0" }}>{item.qty}</td>
                      <td className="text-right text-slate-500" style={{ padding: "6px 0" }}>₹{item.price}</td>
                      <td className="text-right font-bold text-slate-800" style={{ padding: "6px 0" }}>₹{(item.price * item.qty).toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 10, fontSize: 12 }}>
                <div className="flex justify-between text-slate-500" style={{ marginBottom: 5 }}>
                  <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="flex justify-between" style={{ color: "#16a34a", marginBottom: 5 }}>
                    <span>Discount {discountType === "percent" ? `(${discount}%)` : ""}</span>
                    <span>-₹{discountAmt.toFixed(2)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between text-slate-500" style={{ marginBottom: 5 }}>
                    <span>Tax ({tax}%)</span><span>+₹{taxAmt.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold" style={{ fontSize: 15, color: "#0f172a", paddingTop: 8, borderTop: "1px solid #e2e8f0", marginTop: 4 }}>
                  <span>TOTAL</span><span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between" style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>
                  <span>Payment</span><span style={{ textTransform: "uppercase", fontWeight: 600 }}>{paymentMethod}</span>
                </div>
              </div>

              <p className="text-center" style={{ fontSize: 10, color: "#94a3b8", marginTop: 18, paddingTop: 14, borderTop: "1px dashed #e2e8f0" }}>
                Thank you for shopping! 🙏 · Powered by BillEase POS
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0" style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
              <button onClick={handlePrint} className="flex flex-col items-center gap-1.5 rounded-xl font-semibold transition-colors" style={{ padding: "12px 0", backgroundColor: "#f1f5f9", color: "#334155", border: "none", cursor: "pointer", fontSize: 11 }}>
                <Printer style={{ width: 18, height: 18 }} /> Print
              </button>
              <button onClick={handleDownload} className="flex flex-col items-center gap-1.5 rounded-xl font-semibold transition-colors" style={{ padding: "12px 0", backgroundColor: "rgba(43,52,209,0.1)", color: "#2b34d1", border: "none", cursor: "pointer", fontSize: 11 }}>
                <Download style={{ width: 18, height: 18 }} /> Download
              </button>
              <button onClick={handleWhatsApp} className="flex flex-col items-center gap-1.5 rounded-xl font-semibold transition-colors" style={{ padding: "12px 0", backgroundColor: "#dcfce7", color: "#15803d", border: "none", cursor: "pointer", fontSize: 11 }}>
                <MessageCircle style={{ width: 18, height: 18 }} /> WhatsApp
              </button>
            </div>
            <button onClick={onClose} className="w-full rounded-xl font-semibold transition-colors" style={{ padding: "13px 0", backgroundColor: "#0f172a", color: "#fff", border: "none", cursor: "pointer", fontSize: 14 }}>
              + New Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   NEW SALE PAGE
══════════════════════════════════════════════════════════════ */
export default function NewSalePage() {
  const router = useRouter();

  const [customerName,  setCustomerName]  = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items,         setItems]         = useState<SaleItem[]>([]);
  const [itemSearch,    setItemSearch]    = useState("");
  const [showDrop,      setShowDrop]      = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [discount,      setDiscount]      = useState("");
  const [discountType,  setDiscountType]  = useState<DiscountType>("flat");
  const [tax,           setTax]           = useState("0");
  const [notes,         setNotes]         = useState("");
  const [showInvoice,   setShowInvoice]   = useState(false);
  const [invoiceNo]                       = useState(`INV-${Date.now().toString().slice(-6)}`);

  const subtotal    = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discountNum = parseFloat(discount) || 0;
  const taxNum      = parseFloat(tax) || 0;
  const discountAmt = discountType === "percent" ? (subtotal * discountNum) / 100 : discountNum;
  const taxAmt      = ((subtotal - discountAmt) * taxNum) / 100;
  const total       = subtotal - discountAmt + taxAmt;

  const suggestions = INVENTORY.filter(
    (s) => s.name.toLowerCase().includes(itemSearch.toLowerCase()) && itemSearch.length > 0
  );

  const addItem = (s: typeof INVENTORY[0]) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.name === s.name);
      return ex
        ? prev.map((i) => i.name === s.name ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { id: `${Date.now()}-${Math.random()}`, ...s }];
    });
    setItemSearch(""); setShowDrop(false);
  };

  const addManual = () => {
    if (!itemSearch.trim()) return;
    setItems((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, name: itemSearch.trim(), qty: 1, price: 0, unit: "pcs" }]);
    setItemSearch(""); setShowDrop(false);
  };

  const updateItem = (id: string, field: keyof SaleItem, val: string | number) =>
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: field === "qty" || field === "price" ? Number(val) : val } : i));

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const resetSale = () => {
    setItems([]); setCustomerName(""); setCustomerPhone("");
    setDiscount(""); setTax("0"); setNotes(""); setShowInvoice(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1.5px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    fontSize: 13,
    color: "#1e293b",
    outline: "none",
    transition: "border-color 0.15s",
    fontFamily: "inherit",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        .sale-page * { font-family: 'Sora', sans-serif; box-sizing: border-box; }
        .sale-input:focus { border-color: #2b34d1 !important; background-color: #fff !important; box-shadow: 0 0 0 3px rgba(43,52,209,0.08); }
        @keyframes itemSlide { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .item-row { animation: itemSlide 0.2s ease both; }
        @media(min-width:1024px) { .sale-grid { grid-template-columns: 3fr 2fr !important; } }
      `}</style>

      <div className="sale-page min-h-full w-full" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-7xl mx-auto" style={{ padding: "24px 24px 48px" }}>

          {/* Header */}
          <div className="flex items-center gap-3" style={{ marginBottom: 28 }}>
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#fff", border: "1.5px solid #e2e8f0", cursor: "pointer" }}
            >
              <ArrowLeft style={{ width: 15, height: 15, color: "#64748b" }} />
            </button>
            <div>
              <h1 className="font-extrabold text-slate-900" style={{ fontSize: 20 }}>New Sale</h1>
              <p className="text-slate-400" style={{ fontSize: 12, marginTop: 1 }}>Add items and bill the customer</p>
            </div>
          </div>

          {/* Main grid */}
          <div className="sale-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>

            {/* ── LEFT ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Customer */}
              <div className="bg-white rounded-2xl" style={{ border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: 20 }}>
                <p className="font-bold text-slate-700 flex items-center gap-2" style={{ fontSize: 13, marginBottom: 14 }}>
                  <User style={{ width: 14, height: 14, color: "#94a3b8" }} /> Customer Details
                  <span className="font-normal text-slate-400" style={{ fontSize: 11 }}>(optional)</span>
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div className="relative">
                    <User style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#cbd5e1" }} />
                    <input type="text" placeholder="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                      className="sale-input" style={{ ...inputStyle, paddingLeft: 34 }} />
                  </div>
                  <div className="relative">
                    <Phone style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#cbd5e1" }} />
                    <input type="tel" placeholder="Mobile number" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                      className="sale-input" style={{ ...inputStyle, paddingLeft: 34 }} />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white rounded-2xl" style={{ border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: 20 }}>
                <p className="font-bold text-slate-700 flex items-center gap-2" style={{ fontSize: 13, marginBottom: 14 }}>
                  <ShoppingCart style={{ width: 14, height: 14, color: "#94a3b8" }} /> Items
                  {items.length > 0 && (
                    <span className="font-bold text-white" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, backgroundColor: "#2b34d1" }}>
                      {items.length}
                    </span>
                  )}
                </p>

                {/* Search */}
                <div className="relative" style={{ marginBottom: 14 }}>
                  <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94a3b8", pointerEvents: "none" }} />
                  <input
                    type="text"
                    placeholder="Search item or type to add manually..."
                    value={itemSearch}
                    onChange={(e) => { setItemSearch(e.target.value); setShowDrop(true); }}
                    onFocus={() => setShowDrop(true)}
                    onKeyDown={(e) => { if (e.key === "Enter") addManual(); if (e.key === "Escape") setShowDrop(false); }}
                    className="sale-input"
                    style={{ ...inputStyle, paddingLeft: 34 }}
                  />
                  {showDrop && (suggestions.length > 0 || itemSearch.length > 1) && (
                    <div className="absolute left-0 right-0" style={{ top: "calc(100% + 6px)", backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 20, overflow: "hidden", maxHeight: 200, overflowY: "auto" }}>
                      {suggestions.map((s) => (
                        <button key={s.name} onMouseDown={() => addItem(s)}
                          className="w-full flex items-center justify-between transition-colors"
                          style={{ padding: "11px 16px", border: "none", borderBottom: "1px solid #fafafa", backgroundColor: "#fff", cursor: "pointer", fontSize: 13, textAlign: "left" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                        >
                          <span className="font-medium text-slate-700">{s.name}</span>
                          <span className="font-bold" style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, backgroundColor: "rgba(43,52,209,0.08)", color: "#2b34d1" }}>₹{s.price}</span>
                        </button>
                      ))}
                      {itemSearch.trim() && !suggestions.find((s) => s.name.toLowerCase() === itemSearch.toLowerCase()) && (
                        <button onMouseDown={addManual} className="w-full flex items-center gap-2"
                          style={{ padding: "11px 16px", border: "none", backgroundColor: "#fff", cursor: "pointer", fontSize: 13, color: "#2b34d1", fontWeight: 600 }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(43,52,209,0.04)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                        >
                          <Plus style={{ width: 13, height: 13 }} />
                          Add &ldquo;{itemSearch}&rdquo; manually
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Items list */}
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center text-slate-400" style={{ padding: "40px 0" }}>
                    <div className="flex items-center justify-center rounded-2xl" style={{ width: 56, height: 56, backgroundColor: "#f1f5f9", marginBottom: 12 }}>
                      <ShoppingCart style={{ width: 24, height: 24, opacity: 0.4 }} />
                    </div>
                    <p className="font-medium" style={{ fontSize: 13 }}>No items added yet</p>
                    <p style={{ fontSize: 11, marginTop: 3 }}>Search above or use quick add below</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                    {items.map((item) => (
                      <div key={item.id} className="item-row" style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto auto", gap: 8, alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 12, padding: "10px 12px" }}>
                        <div style={{ minWidth: 0 }}>
                          <input type="text" value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)}
                            style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 13, fontWeight: 600, color: "#1e293b", fontFamily: "inherit" }} />
                          <p style={{ fontSize: 10, color: "#94a3b8" }}>{item.unit}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateItem(item.id, "qty", Math.max(1, item.qty - 1))} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", backgroundColor: "#fff", cursor: "pointer", fontSize: 14, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                          <span style={{ width: 28, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{item.qty}</span>
                          <button onClick={() => updateItem(item.id, "qty", item.qty + 1)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #e2e8f0", backgroundColor: "#fff", cursor: "pointer", fontSize: 14, color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                        </div>
                        <div className="relative" style={{ width: 80 }}>
                          <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#94a3b8" }}>₹</span>
                          <input type="number" min={0} value={item.price} onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                            style={{ width: "100%", paddingLeft: 18, paddingRight: 4, paddingTop: 6, paddingBottom: 6, border: "1px solid #e2e8f0", borderRadius: 8, backgroundColor: "#fff", fontSize: 13, color: "#1e293b", outline: "none", textAlign: "center", fontFamily: "inherit" }} />
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>₹{(item.price * item.qty).toFixed(0)}</p>
                        <button onClick={() => removeItem(item.id)} className="flex items-center justify-center" style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#fee2e2", border: "none", cursor: "pointer" }}>
                          <Trash2 style={{ width: 12, height: 12, color: "#ef4444" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick add */}
                <div style={{ paddingTop: 14, borderTop: "1px solid #f1f5f9" }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Quick Add</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {INVENTORY.slice(0, 6).map((s) => (
                      <button key={s.name} onClick={() => addItem(s)}
                        className="flex items-center gap-1.5 transition-colors"
                        style={{ padding: "6px 12px", borderRadius: 20, backgroundColor: "#f1f5f9", border: "none", cursor: "pointer", fontSize: 12, color: "#475569", fontFamily: "inherit" }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(43,52,209,0.08)"; e.currentTarget.style.color = "#2b34d1"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.color = "#475569"; }}
                      >
                        <Plus style={{ width: 10, height: 10 }} />
                        {s.name.split(" ")[0]}
                        <span style={{ color: "#94a3b8" }}>₹{s.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl" style={{ border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Notes (optional)</p>
                <textarea placeholder="Special instructions..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  className="sale-input" style={{ ...inputStyle, resize: "none" }} />
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Payment method */}
              <div className="bg-white rounded-2xl" style={{ border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: 20 }}>
                <p className="font-bold text-slate-700 flex items-center gap-2" style={{ fontSize: 13, marginBottom: 14 }}>
                  <IndianRupee style={{ width: 14, height: 14, color: "#94a3b8" }} /> Payment Method
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {PAYMENT_METHODS.map(({ value, label, emoji }) => {
                    const active = paymentMethod === value;
                    return (
                      <button key={value} onClick={() => setPaymentMethod(value)}
                        className="flex items-center gap-2.5 font-semibold transition-all"
                        style={{
                          padding: "11px 14px",
                          borderRadius: 12,
                          border: active ? "2px solid #2b34d1" : "2px solid #e2e8f0",
                          backgroundColor: active ? "rgba(43,52,209,0.06)" : "#fff",
                          color: active ? "#2b34d1" : "#475569",
                          fontSize: 13,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{emoji}</span> {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Discount & Tax */}
              <div className="bg-white rounded-2xl" style={{ border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: 20 }}>
                <p className="font-bold text-slate-700 flex items-center gap-2" style={{ fontSize: 13, marginBottom: 14 }}>
                  <Tag style={{ width: 14, height: 14, color: "#94a3b8" }} /> Discount & Tax
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Discount</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div className="relative flex-1">
                        <input type="number" min={0} placeholder="0" value={discount} onChange={(e) => setDiscount(e.target.value)}
                          className="sale-input" style={{ ...inputStyle, paddingRight: 30 }} />
                        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 700, color: "#94a3b8" }}>
                          {discountType === "percent" ? "%" : "₹"}
                        </span>
                      </div>
                      <button onClick={() => setDiscountType(dt => dt === "flat" ? "percent" : "flat")}
                        style={{ padding: "0 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", backgroundColor: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#475569", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                        {discountType === "flat" ? "₹ Flat" : "% Off"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>GST / Tax Rate</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                      {["0", "5", "12", "18", "28"].map((t) => (
                        <button key={t} onClick={() => setTax(t)}
                          style={{ padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit", transition: "all 0.15s",
                            backgroundColor: tax === t ? "#2b34d1" : "#f1f5f9",
                            color: tax === t ? "#fff" : "#475569" }}>
                          {t}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill Summary */}
              <div className="rounded-2xl text-white" style={{ background: "linear-gradient(135deg, #2b34d1 0%, #1a1f8f 100%)", padding: 20 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
                  Bill Summary
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, marginBottom: 20 }}>
                  <div className="flex justify-between">
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>
                      Subtotal <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>({items.length} item{items.length !== 1 ? "s" : ""})</span>
                    </span>
                    <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmt > 0 && (
                    <div className="flex justify-between" style={{ color: "#86efac" }}>
                      <span>Discount</span><span>-₹{discountAmt.toFixed(2)}</span>
                    </div>
                  )}
                  {taxNum > 0 && (
                    <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.6)" }}>
                      <span>Tax ({taxNum}%)</span><span>+₹{taxAmt.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline" style={{ paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.15)", marginTop: 4 }}>
                    <span className="font-bold">TOTAL</span>
                    <span style={{ fontSize: 24, fontWeight: 800 }}>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                    <span>Via</span><span style={{ textTransform: "uppercase", fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{paymentMethod}</span>
                  </div>
                </div>
                <button
                  onClick={() => items.length > 0 && setShowInvoice(true)}
                  disabled={items.length === 0}
                  style={{
                    width: "100%", padding: "14px 0",
                    borderRadius: 12,
                    backgroundColor: items.length === 0 ? "rgba(255,255,255,0.25)" : "#fff",
                    color: items.length === 0 ? "rgba(255,255,255,0.5)" : "#2b34d1",
                    border: "none",
                    cursor: items.length === 0 ? "not-allowed" : "pointer",
                    fontSize: 14, fontWeight: 800,
                    fontFamily: "inherit",
                    boxShadow: items.length > 0 ? "0 4px 20px rgba(0,0,0,0.2)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {items.length === 0 ? "Add items to continue" : `Record Sale · ₹${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showInvoice && (
        <InvoiceModal
          items={items} subtotal={subtotal} discount={discountNum} discountType={discountType}
          tax={taxNum} total={total} customerName={customerName} customerPhone={customerPhone}
          paymentMethod={paymentMethod} invoiceNo={invoiceNo} onClose={resetSale}
        />
      )}
    </>
  );
}