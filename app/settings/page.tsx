// Settings.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Store,
  User,
  Bell,
  Shield,
  CreditCard,
  Printer,
  Smartphone,
  Mail,
  Globe,
  Moon,
  Sun,
  Save,
  Edit2,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Upload,
  Download,
  Trash2,
  Plus,
  Minus,
  Percent,
  IndianRupee,
  Settings as SettingsIcon,
  FileText,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Receipt,
  Calendar,
  Clock,
  MapPin,
  Phone,
  AtSign,
  Link,
  Database,
  Cloud,
  ShieldCheck,
  Key,
  Lock,
  Unlock,
  HelpCircle,
  Info,
} from "lucide-react";
import "./setting.css";
import { Topbar } from "@/components/topbar";

// Types
interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  storeGST: string;
  storeLogo: string;
  currencySymbol: string;
  timezone: string;
  dateFormat: string;
}

interface InvoiceSettings {
  invoicePrefix: string;
  invoiceNumberStart: number;
  footerText: string;
  showGST: boolean;
  showDiscount: boolean;
  showCustomerDetails: boolean;
  showTax: boolean;
  rounding: boolean;
}

interface NotificationSettings {
  emailNotifications: boolean;
  lowStockAlerts: boolean;
  dailyReports: boolean;
  weeklyReports: boolean;
  saleNotifications: boolean;
}

interface PaymentSettings {
  enableCash: boolean;
  enableUPI: boolean;
  enableCard: boolean;
  enableCredit: boolean;
  upiID: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

interface SecuritySettings {
  requireLogin: boolean;
  sessionTimeout: number;
  twoFactorAuth: boolean;
  pinProtection: boolean;
  pinCode: string;
  autoLogout: boolean;
}

interface TaxSettings {
  defaultTaxRate: number;
  enableTax: boolean;
  taxInclusive: boolean;
  taxLabel: string;
}

interface ReceiptSettings {
  showStoreInfo: boolean;
  showItemDetails: boolean;
  showPaymentDetails: boolean;
  showThankYou: boolean;
  receiptWidth: number;
}

interface UserSettings {
  username: string;
  email: string;
  fullName: string;
  role: string;
  avatar: string;
}

const CURRENCIES = ["₹", "$", "€", "£", "¥"];
const TIMEZONES = [
  "UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-09:00", "UTC-08:00",
  "UTC-07:00", "UTC-06:00", "UTC-05:00", "UTC-04:00", "UTC-03:00",
  "UTC-02:00", "UTC-01:00", "UTC+00:00", "UTC+01:00", "UTC+02:00",
  "UTC+03:00", "UTC+04:00", "UTC+05:00", "UTC+05:30", "UTC+06:00",
  "UTC+07:00", "UTC+08:00", "UTC+09:00", "UTC+10:00", "UTC+11:00",
  "UTC+12:00",
];
const DATE_FORMATS = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("store");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Store Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: "Sharma General Store",
    storeAddress: "123, Main Road, Mumbai - 400001",
    storePhone: "+91 98765 43210",
    storeEmail: "info@sharmastore.com",
    storeGST: "27AABCS1429B1ZB",
    storeLogo: "",
    currencySymbol: "₹",
    timezone: "UTC+05:30",
    dateFormat: "DD/MM/YYYY",
  });

  // Invoice Settings
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    invoicePrefix: "INV",
    invoiceNumberStart: 1001,
    footerText: "Thank you for shopping with us!",
    showGST: true,
    showDiscount: true,
    showCustomerDetails: true,
    showTax: true,
    rounding: false,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    lowStockAlerts: true,
    dailyReports: false,
    weeklyReports: true,
    saleNotifications: true,
  });

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    enableCash: true,
    enableUPI: true,
    enableCard: true,
    enableCredit: false,
    upiID: "sharmastore@upi",
    bankName: "State Bank of India",
    accountNumber: "12345678901",
    ifscCode: "SBIN0001234",
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    requireLogin: true,
    sessionTimeout: 30,
    twoFactorAuth: false,
    pinProtection: false,
    pinCode: "",
    autoLogout: true,
  });

  // Tax Settings
  const [taxSettings, setTaxSettings] = useState<TaxSettings>({
    defaultTaxRate: 12,
    enableTax: true,
    taxInclusive: false,
    taxLabel: "GST",
  });

  // Receipt Settings
  const [receiptSettings, setReceiptSettings] = useState<ReceiptSettings>({
    showStoreInfo: true,
    showItemDetails: true,
    showPaymentDetails: true,
    showThankYou: true,
    receiptWidth: 80,
  });

  // User Settings
  const [userSettings, setUserSettings] = useState<UserSettings>({
    username: "admin",
    email: "admin@sharmastore.com",
    fullName: "Rajesh Sharma",
    role: "Administrator",
    avatar: "",
  });

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("posSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.storeSettings) setStoreSettings(parsed.storeSettings);
        if (parsed.invoiceSettings) setInvoiceSettings(parsed.invoiceSettings);
        if (parsed.notificationSettings) setNotificationSettings(parsed.notificationSettings);
        if (parsed.paymentSettings) setPaymentSettings(parsed.paymentSettings);
        if (parsed.securitySettings) setSecuritySettings(parsed.securitySettings);
        if (parsed.taxSettings) setTaxSettings(parsed.taxSettings);
        if (parsed.receiptSettings) setReceiptSettings(parsed.receiptSettings);
        if (parsed.userSettings) setUserSettings(parsed.userSettings);
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    const allSettings = {
      storeSettings,
      invoiceSettings,
      notificationSettings,
      paymentSettings,
      securitySettings,
      taxSettings,
      receiptSettings,
      userSettings,
    };

    // Save to localStorage
    localStorage.setItem("posSettings", JSON.stringify(allSettings));
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const handlePinSave = () => {
    if (pinInput.length === 4) {
      setSecuritySettings({ ...securitySettings, pinCode: pinInput });
      setShowPinModal(false);
      setPinInput("");
    }
  };

  const handleResetSettings = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      localStorage.removeItem("posSettings");
      window.location.reload();
    }
  };

  const TabButton = ({ id, icon, label }: { id: string; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`settings-tab-btn ${activeTab === id ? "settings-tab-btn-active" : ""}`}
    >
      {icon}
      {label}
    </button>
  );

  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    label 
  }: { 
    enabled: boolean; 
    onChange: (value: boolean) => void; 
    label?: string;
  }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`settings-toggle ${enabled ? "settings-toggle-on" : "settings-toggle-off"}`}
      role="switch"
      aria-checked={enabled}
    >
      <span className="settings-toggle-track">
        <span className="settings-toggle-thumb" />
      </span>
      {label && <span className="settings-toggle-label">{label}</span>}
    </button>
  );

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <div className="settings-header-left">
            <button onClick={() => router.back()} className="settings-back-btn">
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="settings-header-title">Settings</h1>
              <p className="settings-header-subtitle">
                Manage your POS system configuration
              </p>
            </div>
          </div>
          <div className="settings-header-actions">
            <button onClick={handleResetSettings} className="settings-reset-btn">
              <RefreshCw size={16} />
              Reset
            </button>
            <button onClick={handleSaveSettings} className="settings-save-btn">
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="settings-success-banner">
            <CheckCircle2 size={20} />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Tabs */}
        <div className="settings-tabs">
          <TabButton id="store" icon={<Store size={16} />} label="Store" />
          <TabButton id="invoice" icon={<Receipt size={16} />} label="Invoice" />
          <TabButton id="payment" icon={<CreditCard size={16} />} label="Payment" />
          <TabButton id="tax" icon={<Percent size={16} />} label="Tax" />
          <TabButton id="receipt" icon={<FileText size={16} />} label="Receipt" />
          <TabButton id="notification" icon={<Bell size={16} />} label="Notifications" />
          <TabButton id="security" icon={<Shield size={16} />} label="Security" />
          <TabButton id="user" icon={<User size={16} />} label="User" />
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* Store Settings */}
          {activeTab === "store" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Store Information</h2>
              <p className="settings-section-subtitle">Configure your store details</p>

              <div className="settings-grid settings-grid-2">
                <div className="settings-field">
                  <label className="settings-label">Store Name *</label>
                  <input
                    type="text"
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                    className="settings-input"
                    placeholder="Enter store name"
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Store Logo</label>
                  <div className="settings-logo-upload">
                    <div className="settings-logo-placeholder">
                      <Store size={32} />
                    </div>
                    <button className="settings-logo-btn">
                      <Upload size={14} />
                      Upload Logo
                    </button>
                  </div>
                </div>

                <div className="settings-field">
                  <label className="settings-label">Address</label>
                  <textarea
                    value={storeSettings.storeAddress}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeAddress: e.target.value })}
                    className="settings-textarea"
                    placeholder="Enter store address"
                    rows={2}
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Phone Number</label>
                  <input
                    type="tel"
                    value={storeSettings.storePhone}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storePhone: e.target.value })}
                    className="settings-input"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Email Address</label>
                  <input
                    type="email"
                    value={storeSettings.storeEmail}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeEmail: e.target.value })}
                    className="settings-input"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">GST Number</label>
                  <input
                    type="text"
                    value={storeSettings.storeGST}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeGST: e.target.value })}
                    className="settings-input"
                    placeholder="Enter GST number"
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Currency Symbol</label>
                  <select
                    value={storeSettings.currencySymbol}
                    onChange={(e) => setStoreSettings({ ...storeSettings, currencySymbol: e.target.value })}
                    className="settings-select"
                  >
                    {CURRENCIES.map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>

                <div className="settings-field">
                  <label className="settings-label">Timezone</label>
                  <select
                    value={storeSettings.timezone}
                    onChange={(e) => setStoreSettings({ ...storeSettings, timezone: e.target.value })}
                    className="settings-select"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div className="settings-field">
                  <label className="settings-label">Date Format</label>
                  <select
                    value={storeSettings.dateFormat}
                    onChange={(e) => setStoreSettings({ ...storeSettings, dateFormat: e.target.value })}
                    className="settings-select"
                  >
                    {DATE_FORMATS.map((df) => (
                      <option key={df} value={df}>{df}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Invoice Settings */}
          {activeTab === "invoice" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Invoice Settings</h2>
              <p className="settings-section-subtitle">Configure your invoice preferences</p>

              <div className="settings-grid settings-grid-2">
                <div className="settings-field">
                  <label className="settings-label">Invoice Prefix</label>
                  <input
                    type="text"
                    value={invoiceSettings.invoicePrefix}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoicePrefix: e.target.value })}
                    className="settings-input"
                    placeholder="INV"
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Starting Invoice Number</label>
                  <input
                    type="number"
                    value={invoiceSettings.invoiceNumberStart}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoiceNumberStart: parseInt(e.target.value) || 1 })}
                    className="settings-input"
                    min="1"
                  />
                </div>

                <div className="settings-field settings-field-full">
                  <label className="settings-label">Invoice Footer Text</label>
                  <input
                    type="text"
                    value={invoiceSettings.footerText}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, footerText: e.target.value })}
                    className="settings-input"
                    placeholder="Thank you for shopping with us!"
                  />
                </div>

                <div className="settings-field settings-field-full">
                  <label className="settings-label">Invoice Display Options</label>
                  <div className="settings-toggle-group">
                    <div className="settings-toggle-item">
                      <span>Show GST</span>
                      <ToggleSwitch
                        enabled={invoiceSettings.showGST}
                        onChange={(val) => setInvoiceSettings({ ...invoiceSettings, showGST: val })}
                      />
                    </div>
                    <div className="settings-toggle-item">
                      <span>Show Discount</span>
                      <ToggleSwitch
                        enabled={invoiceSettings.showDiscount}
                        onChange={(val) => setInvoiceSettings({ ...invoiceSettings, showDiscount: val })}
                      />
                    </div>
                    <div className="settings-toggle-item">
                      <span>Show Customer Details</span>
                      <ToggleSwitch
                        enabled={invoiceSettings.showCustomerDetails}
                        onChange={(val) => setInvoiceSettings({ ...invoiceSettings, showCustomerDetails: val })}
                      />
                    </div>
                    <div className="settings-toggle-item">
                      <span>Show Tax</span>
                      <ToggleSwitch
                        enabled={invoiceSettings.showTax}
                        onChange={(val) => setInvoiceSettings({ ...invoiceSettings, showTax: val })}
                      />
                    </div>
                    <div className="settings-toggle-item">
                      <span>Round Total</span>
                      <ToggleSwitch
                        enabled={invoiceSettings.rounding}
                        onChange={(val) => setInvoiceSettings({ ...invoiceSettings, rounding: val })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === "payment" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Payment Settings</h2>
              <p className="settings-section-subtitle">Configure payment methods and details</p>

              <div className="settings-grid settings-grid-2">
                <div className="settings-field settings-field-full">
                  <label className="settings-label">Payment Methods</label>
                  <div className="settings-toggle-group">
                    <div className="settings-toggle-item">
                      <span>Cash</span>
                      <ToggleSwitch
                        enabled={paymentSettings.enableCash}
                        onChange={(val) => setPaymentSettings({ ...paymentSettings, enableCash: val })}
                      />
                    </div>
                    <div className="settings-toggle-item">
                      <span>UPI</span>
                      <ToggleSwitch
                        enabled={paymentSettings.enableUPI}
                        onChange={(val) => setPaymentSettings({ ...paymentSettings, enableUPI: val })}
                      />
                    </div>
                    <div className="settings-toggle-item">
                      <span>Card</span>
                      <ToggleSwitch
                        enabled={paymentSettings.enableCard}
                        onChange={(val) => setPaymentSettings({ ...paymentSettings, enableCard: val })}
                      />
                    </div>
                    <div className="settings-toggle-item">
                      <span>Credit</span>
                      <ToggleSwitch
                        enabled={paymentSettings.enableCredit}
                        onChange={(val) => setPaymentSettings({ ...paymentSettings, enableCredit: val })}
                      />
                    </div>
                  </div>
                </div>

                {paymentSettings.enableUPI && (
                  <div className="settings-field">
                    <label className="settings-label">UPI ID</label>
                    <input
                      type="text"
                      value={paymentSettings.upiID}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, upiID: e.target.value })}
                      className="settings-input"
                      placeholder="store@upi"
                    />
                  </div>
                )}

                {paymentSettings.enableCard && (
                  <>
                    <div className="settings-field">
                      <label className="settings-label">Bank Name</label>
                      <input
                        type="text"
                        value={paymentSettings.bankName}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })}
                        className="settings-input"
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">Account Number</label>
                      <input
                        type="text"
                        value={paymentSettings.accountNumber}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, accountNumber: e.target.value })}
                        className="settings-input"
                        placeholder="Enter account number"
                      />
                    </div>
                    <div className="settings-field">
                      <label className="settings-label">IFSC Code</label>
                      <input
                        type="text"
                        value={paymentSettings.ifscCode}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, ifscCode: e.target.value })}
                        className="settings-input"
                        placeholder="Enter IFSC code"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Tax Settings */}
          {activeTab === "tax" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Tax Settings</h2>
              <p className="settings-section-subtitle">Configure tax rates and rules</p>

              <div className="settings-grid settings-grid-2">
                <div className="settings-field settings-field-full">
                  <div className="settings-toggle-item">
                    <span>Enable Tax</span>
                    <ToggleSwitch
                      enabled={taxSettings.enableTax}
                      onChange={(val) => setTaxSettings({ ...taxSettings, enableTax: val })}
                    />
                  </div>
                </div>

                {taxSettings.enableTax && (
                  <>
                    <div className="settings-field">
                      <label className="settings-label">Default Tax Rate (%)</label>
                      <input
                        type="number"
                        value={taxSettings.defaultTaxRate}
                        onChange={(e) => setTaxSettings({ ...taxSettings, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                        className="settings-input"
                        min="0"
                        max="100"
                        step="0.5"
                      />
                    </div>

                    <div className="settings-field">
                      <label className="settings-label">Tax Label</label>
                      <input
                        type="text"
                        value={taxSettings.taxLabel}
                        onChange={(e) => setTaxSettings({ ...taxSettings, taxLabel: e.target.value })}
                        className="settings-input"
                        placeholder="GST"
                      />
                    </div>

                    <div className="settings-field settings-field-full">
                      <div className="settings-toggle-item">
                        <span>Tax Inclusive Pricing</span>
                        <ToggleSwitch
                          enabled={taxSettings.taxInclusive}
                          onChange={(val) => setTaxSettings({ ...taxSettings, taxInclusive: val })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Receipt Settings */}
          {activeTab === "receipt" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Receipt Settings</h2>
              <p className="settings-section-subtitle">Configure receipt appearance</p>

              <div className="settings-grid settings-grid-2">
                <div className="settings-field">
                  <label className="settings-label">Receipt Width (characters)</label>
                  <input
                    type="number"
                    value={receiptSettings.receiptWidth}
                    onChange={(e) => setReceiptSettings({ ...receiptSettings, receiptWidth: parseInt(e.target.value) || 80 })}
                    className="settings-input"
                    min="40"
                    max="120"
                  />
                </div>

                <div className="settings-field settings-field-full">
                  <label className="settings-label">Receipt Display Options</label>
                  <div className="settings-toggle-group">
                    <div className="settings-toggle-item">
                      <span>Show Store Information</span>
                      <ToggleSwitch
                        enabled={receiptSettings.showStoreInfo}
                        onChange={(val) => setReceiptSettings({ ...receiptSettings, showStoreInfo: val })}
                      />
                    </div>
                    <div className="settings-toggle-item">
                      <span>Show Item Details</span>
                      <ToggleSwitch
                        enabled={receiptSettings.showItemDetails}
                        onChange={(val) => setReceiptSettings({ ...receiptSettings, showItemDetails: val })}
                      />
                    </div>
                    <div className="settings-toggle-item">
                      <span>Show Payment Details</span>
                      <ToggleSwitch
                        enabled={receiptSettings.showPaymentDetails}
                        onChange={(val) => setReceiptSettings({ ...receiptSettings, showPaymentDetails: val })}
                      />
                    </div>
                    <div className="settings-toggle-item">
                      <span>Show Thank You Message</span>
                      <ToggleSwitch
                        enabled={receiptSettings.showThankYou}
                        onChange={(val) => setReceiptSettings({ ...receiptSettings, showThankYou: val })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === "notification" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Notification Settings</h2>
              <p className="settings-section-subtitle">Configure your notification preferences</p>

              <div className="settings-grid settings-grid-1">
                <div className="settings-field settings-field-full">
                  <div className="settings-toggle-group settings-toggle-vertical">
                    <div className="settings-toggle-item">
                      <div>
                        <span className="settings-toggle-item-title">Email Notifications</span>
                        <span className="settings-toggle-item-sub">Receive notifications via email</span>
                      </div>
                      <ToggleSwitch
                        enabled={notificationSettings.emailNotifications}
                        onChange={(val) => setNotificationSettings({ ...notificationSettings, emailNotifications: val })}
                      />
                    </div>

                    <div className="settings-toggle-item">
                      <div>
                        <span className="settings-toggle-item-title">Low Stock Alerts</span>
                        <span className="settings-toggle-item-sub">Get notified when stock is low</span>
                      </div>
                      <ToggleSwitch
                        enabled={notificationSettings.lowStockAlerts}
                        onChange={(val) => setNotificationSettings({ ...notificationSettings, lowStockAlerts: val })}
                      />
                    </div>

                    <div className="settings-toggle-item">
                      <div>
                        <span className="settings-toggle-item-title">Daily Reports</span>
                        <span className="settings-toggle-item-sub">Receive daily sales summary</span>
                      </div>
                      <ToggleSwitch
                        enabled={notificationSettings.dailyReports}
                        onChange={(val) => setNotificationSettings({ ...notificationSettings, dailyReports: val })}
                      />
                    </div>

                    <div className="settings-toggle-item">
                      <div>
                        <span className="settings-toggle-item-title">Weekly Reports</span>
                        <span className="settings-toggle-item-sub">Receive weekly performance report</span>
                      </div>
                      <ToggleSwitch
                        enabled={notificationSettings.weeklyReports}
                        onChange={(val) => setNotificationSettings({ ...notificationSettings, weeklyReports: val })}
                      />
                    </div>

                    <div className="settings-toggle-item">
                      <div>
                        <span className="settings-toggle-item-title">Sale Notifications</span>
                        <span className="settings-toggle-item-sub">Get notified for each sale</span>
                      </div>
                      <ToggleSwitch
                        enabled={notificationSettings.saleNotifications}
                        onChange={(val) => setNotificationSettings({ ...notificationSettings, saleNotifications: val })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="settings-section">
              <h2 className="settings-section-title">Security Settings</h2>
              <p className="settings-section-subtitle">Configure security preferences</p>

              <div className="settings-grid settings-grid-2">
                <div className="settings-field settings-field-full">
                  <div className="settings-toggle-group settings-toggle-vertical">
                    <div className="settings-toggle-item">
                      <div>
                        <span className="settings-toggle-item-title">Require Login</span>
                        <span className="settings-toggle-item-sub">Require login to access the POS</span>
                      </div>
                      <ToggleSwitch
                        enabled={securitySettings.requireLogin}
                        onChange={(val) => setSecuritySettings({ ...securitySettings, requireLogin: val })}
                      />
                    </div>

                    <div className="settings-toggle-item">
                      <div>
                        <span className="settings-toggle-item-title">Auto Logout</span>
                        <span className="settings-toggle-item-sub">Automatically logout after inactivity</span>
                      </div>
                      <ToggleSwitch
                        enabled={securitySettings.autoLogout}
                        onChange={(val) => setSecuritySettings({ ...securitySettings, autoLogout: val })}
                      />
                    </div>

                    <div className="settings-toggle-item">
                      <div>
                        <span className="settings-toggle-item-title">Two-Factor Authentication</span>
                        <span className="settings-toggle-item-sub">Enable 2FA for enhanced security</span>
                      </div>
                      <ToggleSwitch
                        enabled={securitySettings.twoFactorAuth}
                        onChange={(val) => setSecuritySettings({ ...securitySettings, twoFactorAuth: val })}
                      />
                    </div>

                    <div className="settings-toggle-item">
                      <div>
                        <span className="settings-toggle-item-title">PIN Protection</span>
                        <span className="settings-toggle-item-sub">Require PIN for sensitive operations</span>
                      </div>
                      <ToggleSwitch
                        enabled={securitySettings.pinProtection}
                        onChange={(val) => {
                          setSecuritySettings({ ...securitySettings, pinProtection: val });
                          if (val) setShowPinModal(true);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-field">
                  <label className="settings-label">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) || 5 })}
                    className="settings-input"
                    min="5"
                    max="120"
                  />
                </div>
              </div>
            </div>
          )}

          {/* User Settings */}
          {activeTab === "user" && (
            <div className="settings-section">
              <h2 className="settings-section-title">User Settings</h2>
              <p className="settings-section-subtitle">Manage your profile preferences</p>

              <div className="settings-grid settings-grid-2">
                <div className="settings-field settings-field-full">
                  <div className="settings-avatar-section">
                    <div className="settings-avatar">
                      <User size={48} />
                    </div>
                    <div>
                      <button className="settings-avatar-btn">
                        <Upload size={14} />
                        Change Avatar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="settings-field">
                  <label className="settings-label">Full Name</label>
                  <input
                    type="text"
                    value={userSettings.fullName}
                    onChange={(e) => setUserSettings({ ...userSettings, fullName: e.target.value })}
                    className="settings-input"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Username</label>
                  <input
                    type="text"
                    value={userSettings.username}
                    onChange={(e) => setUserSettings({ ...userSettings, username: e.target.value })}
                    className="settings-input"
                    placeholder="Enter username"
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Email Address</label>
                  <input
                    type="email"
                    value={userSettings.email}
                    onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                    className="settings-input"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="settings-field">
                  <label className="settings-label">Role</label>
                  <select
                    value={userSettings.role}
                    onChange={(e) => setUserSettings({ ...userSettings, role: e.target.value })}
                    className="settings-select"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Manager">Manager</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="settings-modal-overlay" onClick={() => setShowPinModal(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal-header">
              <h3 className="settings-modal-title">Set PIN Code</h3>
              <button onClick={() => setShowPinModal(false)} className="settings-modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="settings-modal-body">
              <p className="settings-modal-text">Enter a 4-digit PIN for secure operations</p>
              <div className="settings-pin-input-group">
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                  className="settings-pin-input"
                  placeholder="****"
                  autoFocus
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="settings-pin-toggle"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="settings-modal-footer">
              <button onClick={() => setShowPinModal(false)} className="settings-modal-cancel">
                Cancel
              </button>
              <button
                onClick={handlePinSave}
                disabled={pinInput.length !== 4}
                className="settings-modal-submit"
              >
                Save PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}