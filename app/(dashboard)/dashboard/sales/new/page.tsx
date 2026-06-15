// NewSale.tsx
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
  Wallet,
  Smartphone,
  CreditCard,
  BookOpen,
  Percent,
} from "lucide-react";
import "./newsale.css";

interface SaleItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  unit: string;
}
type PaymentMethod = "cash" | "upi" | "card" | "credit";
type DiscountType = "flat" | "percent";

const INVENTORY = [
  { name: "Tata Salt 1kg", price: 24, unit: "pcs" },
  { name: "Amul Butter 100g", price: 52, unit: "pcs" },
  { name: "Surf Excel 1kg", price: 190, unit: "pcs" },
  { name: "Aashirvaad Atta 5kg", price: 265, unit: "bag" },
  { name: "Fortune Oil 1L", price: 140, unit: "btl" },
  { name: "Parle-G Biscuit", price: 10, unit: "pcs" },
  { name: "Maggi 70g", price: 14, unit: "pcs" },
  { name: "Colgate 200g", price: 80, unit: "pcs" },
  { name: "Lifebuoy Soap", price: 35, unit: "pcs" },
  { name: "Horlicks 500g", price: 245, unit: "jar" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "cash", label: "Cash", icon: <Wallet size={16} /> },
  { value: "upi", label: "UPI", icon: <Smartphone size={16} /> },
  { value: "card", label: "Card", icon: <CreditCard size={16} /> },
  { value: "credit", label: "Credit", icon: <BookOpen size={16} /> },
];

/* Invoice Modal */
function InvoiceModal({
  items,
  subtotal,
  discount,
  discountType,
  tax,
  total,
  customerName,
  customerPhone,
  paymentMethod,
  invoiceNo,
  onClose,
}: {
  items: SaleItem[];
  subtotal: number;
  discount: number;
  discountType: DiscountType;
  tax: number;
  total: number;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  invoiceNo: string;
  onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);
  const discountAmt = discountType === "percent" ? (subtotal * discount) / 100 : discount;
  const taxAmt = ((subtotal - discountAmt) * tax) / 100;

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
    const lines = items
      .map((i) => `• ${i.name} ×${i.qty} = ₹${(i.price * i.qty).toFixed(2)}`)
      .join("\n");
    const msg = [
      `🧾 *BillEase Invoice #${invoiceNo}*`,
      `📅 ${new Date().toLocaleDateString("en-IN")}`,
      ``,
      lines,
      ``,
      `Subtotal : ₹${subtotal.toFixed(2)}`,
      discountAmt > 0 ? `Discount : -₹${discountAmt.toFixed(2)}` : null,
      tax > 0 ? `Tax (${tax}%): +₹${taxAmt.toFixed(2)}` : null,
      `*Total   : ₹${total.toFixed(2)}*`,
      `Payment  : ${paymentMethod.toUpperCase()}`,
      ``,
      `Thank you!`,
    ]
      .filter(Boolean)
      .join("\n");
    const phone = customerPhone.replace(/\D/g, "");
    const dest = phone ? (phone.startsWith("91") ? phone : `91${phone}`) : "";
    window.open(`https://wa.me/${dest}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleDownload = () => {
    const sep = "─".repeat(48);
    const lines = items
      .map(
        (i) =>
          `${i.name.padEnd(22)} ${i.qty} × ₹${i.price} = ₹${(i.price * i.qty).toFixed(2)}`
      )
      .join("\n");
    const body = [
      sep,
      "        BILLEASE POS — Sharma General Store",
      sep,
      `Invoice : #${invoiceNo}`,
      `Date    : ${new Date().toLocaleDateString("en-IN")}`,
      `Customer: ${customerName || "Walk-in"}`,
      customerPhone ? `Phone   : ${customerPhone}` : "",
      sep,
      lines,
      sep,
      `Subtotal : ₹${subtotal.toFixed(2)}`,
      discountAmt > 0 ? `Discount : -₹${discountAmt.toFixed(2)}` : "",
      tax > 0 ? `Tax      : +₹${taxAmt.toFixed(2)}` : "",
      `TOTAL    : ₹${total.toFixed(2)}`,
      `Payment  : ${paymentMethod.toUpperCase()}`,
      sep,
      "     Thank you for your business!",
      sep,
    ]
      .filter((l) => l !== "")
      .join("\n");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/plain;charset=utf-8" }));
    a.download = `Invoice-${invoiceNo}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal-container">
        <div className="invoice-modal">
          {/* Header */}
          <div className="invoice-modal-header">
            <div className="invoice-modal-header-left">
              <div className="invoice-modal-header-icon">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="invoice-modal-header-title">Sale Recorded!</p>
                <p className="invoice-modal-header-subtitle">Invoice #{invoiceNo}</p>
              </div>
            </div>
            <button onClick={onClose} className="invoice-modal-close-btn">
              <X size={13} />
            </button>
          </div>

          {/* Scrollable invoice */}
          <div className="invoice-modal-scroll">
            <div ref={printRef} className="invoice-content">
              {/* Shop */}
              <div className="invoice-shop">
                <div className="invoice-shop-icon">
                  <Receipt size={22} />
                </div>
                <p className="invoice-shop-name">BillEase POS</p>
                <p className="invoice-shop-address">Sharma General Store · Mumbai</p>
                <p className="invoice-shop-gst">GST: 27AABCS1429B1ZB</p>
              </div>

              {/* Bill to */}
              <div className="invoice-bill-to">
                <div>
                  <p className="invoice-bill-to-label">Bill To</p>
                  <p className="invoice-bill-to-name">{customerName || "Walk-in Customer"}</p>
                  {customerPhone && <p className="invoice-bill-to-phone">{customerPhone}</p>}
                </div>
                <div className="invoice-bill-to-right">
                  <p className="invoice-bill-to-label">Invoice</p>
                  <p className="invoice-bill-to-invoice">#{invoiceNo}</p>
                  <p className="invoice-bill-to-date">{new Date().toLocaleDateString("en-IN")}</p>
                </div>
              </div>

              {/* Items */}
              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th className="invoice-items-th-left">Item</th>
                    <th className="invoice-items-th-center">Qty</th>
                    <th className="invoice-items-th-right">Rate</th>
                    <th className="invoice-items-th-right">Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="invoice-items-td-name">{item.name}</td>
                      <td className="invoice-items-td-center">{item.qty}</td>
                      <td className="invoice-items-td-right">₹{item.price}</td>
                      <td className="invoice-items-td-amount">
                        ₹{(item.price * item.qty).toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="invoice-totals">
                <div className="invoice-totals-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="invoice-totals-discount">
                    <span>Discount {discountType === "percent" ? `(${discount}%)` : ""}</span>
                    <span>-₹{discountAmt.toFixed(2)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="invoice-totals-row">
                    <span>Tax ({tax}%)</span>
                    <span>+₹{taxAmt.toFixed(2)}</span>
                  </div>
                )}
                <div className="invoice-totals-total">
                  <span>TOTAL</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="invoice-totals-payment">
                  <span>Payment</span>
                  <span>{paymentMethod}</span>
                </div>
              </div>

              <p className="invoice-footer">
                Thank you for shopping! · Powered by BillEase POS
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="invoice-actions">
            <div className="invoice-actions-grid">
              <button onClick={handlePrint} className="invoice-action-btn invoice-action-print">
                <Printer size={18} /> Print
              </button>
              <button onClick={handleDownload} className="invoice-action-btn invoice-action-download">
                <Download size={18} /> Download
              </button>
              <button onClick={handleWhatsApp} className="invoice-action-btn invoice-action-whatsapp">
                <MessageCircle size={18} /> WhatsApp
              </button>
            </div>
            <button onClick={onClose} className="invoice-new-sale-btn">
              + New Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* New Sale Page */
export default function NewSalePage() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<SaleItem[]>([]);
  const [itemSearch, setItemSearch] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("flat");
  const [tax, setTax] = useState("0");
  const [notes, setNotes] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discountNum = parseFloat(discount) || 0;
  const taxNum = parseFloat(tax) || 0;
  const discountAmt = discountType === "percent" ? (subtotal * discountNum) / 100 : discountNum;
  const taxAmt = ((subtotal - discountAmt) * taxNum) / 100;
  const total = subtotal - discountAmt + taxAmt;

  const suggestions = INVENTORY.filter(
    (s) => s.name.toLowerCase().includes(itemSearch.toLowerCase()) && itemSearch.length > 0
  );

  const addItem = (s: (typeof INVENTORY)[0]) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.name === s.name);
      return ex
        ? prev.map((i) => (i.name === s.name ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { id: `${Date.now()}-${Math.random()}`, ...s }];
    });
    setItemSearch("");
    setShowDrop(false);
  };

  const addManual = () => {
    if (!itemSearch.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        name: itemSearch.trim(),
        qty: 1,
        price: 0,
        unit: "pcs",
      },
    ]);
    setItemSearch("");
    setShowDrop(false);
  };

  const updateItem = (id: string, field: keyof SaleItem, val: string | number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, [field]: field === "qty" || field === "price" ? Number(val) : val } : i
      )
    );

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const resetSale = () => {
    setItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setDiscount("");
    setTax("0");
    setNotes("");
    setShowInvoice(false);
  };

  return (
    <div className="sale-page">
      <div className="sale-page-container">
        {/* Header */}
        <div className="sale-header">
          <button onClick={() => router.back()} className="sale-back-btn">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="sale-header-title">New Sale</h1>
            <p className="sale-header-subtitle">Add items and bill the customer</p>
          </div>
        </div>

        {/* Main grid */}
        <div className="sale-grid">
          {/* LEFT COLUMN */}
          <div className="sale-left-col">
            {/* Customer */}
            <div className="sale-card">
              <p className="sale-card-title">
                <User size={14} /> Customer Details
                <span className="sale-card-title-optional">(optional)</span>
              </p>
              <div className="sale-customer-grid">
                <div className="sale-input-icon-wrapper">
                  <User size={14} className="sale-input-icon" />
                  <input
                    type="text"
                    placeholder="Customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="sale-input sale-input-pl-34"
                  />
                </div>
                <div className="sale-input-icon-wrapper">
                  <Phone size={14} className="sale-input-icon" />
                  <input
                    type="tel"
                    placeholder="Mobile number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="sale-input sale-input-pl-34"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="sale-card">
              <p className="sale-card-title">
                <ShoppingCart size={14} /> Items
                {items.length > 0 && (
                  <span className="sale-item-count-badge">{items.length}</span>
                )}
              </p>

              {/* Search */}
              <div className="sale-search-wrapper">
                <Search size={14} className="sale-search-icon" />
                <input
                  type="text"
                  placeholder="Search item or type to add manually..."
                  value={itemSearch}
                  onChange={(e) => {
                    setItemSearch(e.target.value);
                    setShowDrop(true);
                  }}
                  onFocus={() => setShowDrop(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addManual();
                    if (e.key === "Escape") setShowDrop(false);
                  }}
                  className="sale-input sale-input-pl-34"
                />
                {showDrop && (suggestions.length > 0 || itemSearch.length > 1) && (
                  <div className="sale-dropdown">
                    {suggestions.map((s) => (
                      <button
                        key={s.name}
                        onMouseDown={() => addItem(s)}
                        className="sale-dropdown-item"
                      >
                        <span className="sale-dropdown-item-name">{s.name}</span>
                        <span className="sale-dropdown-item-price">₹{s.price}</span>
                      </button>
                    ))}
                    {itemSearch.trim() &&
                      !suggestions.find((s) => s.name.toLowerCase() === itemSearch.toLowerCase()) && (
                        <button onMouseDown={addManual} className="sale-dropdown-manual">
                          <Plus size={13} /> Add "{itemSearch}" manually
                        </button>
                      )}
                  </div>
                )}
              </div>

              {/* Items list */}
              {items.length === 0 ? (
                <div className="sale-empty-items">
                  <div className="sale-empty-items-icon">
                    <ShoppingCart size={24} />
                  </div>
                  <p className="sale-empty-items-title">No items added yet</p>
                  <p className="sale-empty-items-subtitle">Search above or use quick add below</p>
                </div>
              ) : (
                <div className="sale-items-list">
                  {items.map((item) => (
                    <div key={item.id} className="sale-item-row">
                      <div className="sale-item-info">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, "name", e.target.value)}
                          className="sale-item-name-input"
                        />
                        <p className="sale-item-unit">{item.unit}</p>
                      </div>
                      <div className="sale-item-qty">
                        <button
                          onClick={() => updateItem(item.id, "qty", Math.max(1, item.qty - 1))}
                          className="sale-qty-btn"
                        >
                          −
                        </button>
                        <span className="sale-qty-value">{item.qty}</span>
                        <button
                          onClick={() => updateItem(item.id, "qty", item.qty + 1)}
                          className="sale-qty-btn"
                        >
                          +
                        </button>
                      </div>
                      <div className="sale-item-price-wrapper">
                        <span className="sale-price-currency">₹</span>
                        <input
                          type="number"
                          min={0}
                          value={item.price}
                          onChange={(e) =>
                            updateItem(item.id, "price", parseFloat(e.target.value) || 0)
                          }
                          className="sale-item-price-input"
                        />
                      </div>
                      <p className="sale-item-total">₹{(item.price * item.qty).toFixed(0)}</p>
                      <button onClick={() => removeItem(item.id)} className="sale-item-delete">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick add */}
              <div className="sale-quick-add">
                <p className="sale-quick-add-title">Quick Add</p>
                <div className="sale-quick-add-grid">
                  {INVENTORY.slice(0, 6).map((s) => (
                    <button key={s.name} onClick={() => addItem(s)} className="sale-quick-add-btn">
                      <Plus size={10} />
                      {s.name.split(" ")[0]}
                      <span className="sale-quick-add-price">₹{s.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="sale-card">
              <p className="sale-notes-title">Notes (optional)</p>
              <textarea
                placeholder="Special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="sale-textarea"
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="sale-right-col">
            {/* Payment method */}
            <div className="sale-card">
              <p className="sale-card-title">
                <IndianRupee size={14} /> Payment Method
              </p>
              <div className="sale-payment-grid">
                {PAYMENT_METHODS.map(({ value, label, icon }) => {
                  const active = paymentMethod === value;
                  return (
                    <button
                      key={value}
                      onClick={() => setPaymentMethod(value)}
                      className={`sale-payment-btn ${active ? "sale-payment-btn-active" : ""}`}
                    >
                      {icon} {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Discount & Tax */}
            <div className="sale-card">
              <p className="sale-card-title">
                <Tag size={14} /> Discount & Tax
              </p>
              <div className="sale-discount-tax">
                <div>
                  <p className="sale-section-label">Discount</p>
                  <div className="sale-discount-input-group">
                    <div className="sale-discount-input-wrapper">
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="sale-input sale-discount-input"
                      />
                      <span className="sale-discount-symbol">
                        {discountType === "percent" ? "%" : "₹"}
                      </span>
                    </div>
                    <button
                      onClick={() => setDiscountType((dt) => (dt === "flat" ? "percent" : "flat"))}
                      className="sale-discount-type-btn"
                    >
                      {discountType === "flat" ? "₹ Flat" : "% Off"}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="sale-section-label">GST / Tax Rate</p>
                  <div className="sale-tax-grid">
                    {["0", "5", "12", "18", "28"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTax(t)}
                        className={`sale-tax-btn ${tax === t ? "sale-tax-btn-active" : ""}`}
                      >
                        {t}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="sale-summary">
              <p className="sale-summary-title">Bill Summary</p>
              <div className="sale-summary-details">
                <div className="sale-summary-row">
                  <span>
                    Subtotal <span className="sale-summary-item-count">
                      ({items.length} item{items.length !== 1 ? "s" : ""})
                    </span>
                  </span>
                  <span className="sale-summary-value">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmt > 0 && (
                  <div className="sale-summary-discount">
                    <span>Discount</span>
                    <span>-₹{discountAmt.toFixed(2)}</span>
                  </div>
                )}
                {taxNum > 0 && (
                  <div className="sale-summary-row">
                    <span>Tax ({taxNum}%)</span>
                    <span>+₹{taxAmt.toFixed(2)}</span>
                  </div>
                )}
                <div className="sale-summary-total">
                  <span className="sale-summary-total-label">TOTAL</span>
                  <span className="sale-summary-total-value">₹{total.toFixed(2)}</span>
                </div>
                <div className="sale-summary-payment">
                  <span>Via</span>
                  <span className="sale-summary-payment-method">{paymentMethod}</span>
                </div>
              </div>
              <button
                onClick={() => items.length > 0 && setShowInvoice(true)}
                disabled={items.length === 0}
                className={`sale-record-btn ${items.length === 0 ? "sale-record-btn-disabled" : ""}`}
              >
                {items.length === 0 ? "Add items to continue" : `Record Sale · ₹${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showInvoice && (
        <InvoiceModal
          items={items}
          subtotal={subtotal}
          discount={discountNum}
          discountType={discountType}
          tax={taxNum}
          total={total}
          customerName={customerName}
          customerPhone={customerPhone}
          paymentMethod={paymentMethod}
          invoiceNo={invoiceNo}
          onClose={resetSale}
        />
      )}
    </div>
  );
}