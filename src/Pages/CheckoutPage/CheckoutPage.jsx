import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home, ChevronRight, Zap, MapPin, ShieldCheck,
  Lock, CreditCard, Truck, Leaf, Package, Wallet,
  Landmark, Tag, CheckCircle2, ArrowRight,
  ShoppingCart, Info, Loader2, AlertCircle, Minus, Plus,
} from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "../../context/useAuth";
import { useCart } from "../../context/CartContext";
import api from "../../api/axios";

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;

const DELIVERY_OPTIONS = [
  {
    id: "standard",
    icon: <Truck size={18} className="text-[#B80035]" />,
    name: "Standard Shipping",
    tag: "FREE",
    tagBg: "bg-[#B80035] text-white",
    desc: "Estimated delivery: 3–5 business days",
    cost: 0,
  },
  {
    id: "express",
    icon: <Zap size={18} className="text-[#815100]" />,
    name: "Express Priority",
    tag: "FAST",
    tagBg: "bg-[#815100] text-white",
    desc: "Guaranteed delivery by tomorrow 10:30 AM",
    cost: 9.99,
  },
  {
    id: "eco",
    icon: <Leaf size={18} className="text-[#565E74]" />,
    name: "Eco-Friendly",
    tag: "GREEN",
    tagBg: "bg-[#565E74] text-white",
    desc: "Zero-emission EV fulfilment (3–4 days)",
    cost: 2.50,
  },
];

const PAYMENT_TABS = [
  { id: "cards",   label: "Cards",           icon: <CreditCard size={16} /> },
  { id: "wallets", label: "Wallets",         icon: <Wallet size={16} /> },
  { id: "cod",     label: "Cash on Delivery",icon: <Package size={16} /> },
  { id: "bank",    label: "Net Banking",     icon: <Landmark size={16} /> },
];

// ─── Step bar ─────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Cart", "Checkout", "Confirmation"];
  return (
    <div className="w-full flex items-center px-6 py-3 bg-white/80 border-b border-[#DCE9FF]/60 backdrop-blur-sm">
      <div className="max-w-[1280px] mx-auto w-full flex items-center justify-between">
        <nav className="flex items-center gap-2 text-[12px]">
          <Link to="/" className="flex items-center gap-1 text-[#5C3F40] hover:text-[#B80035] transition-colors">
            <Home size={11} /><span>Home</span>
          </Link>
          <ChevronRight size={10} className="text-[#E5BDBE]" />
          <span className="font-semibold text-[#0B1C30]">Checkout</span>
        </nav>
        <div className="flex items-center gap-3">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              {i > 0 && <div className="w-8 h-0.5 rounded-full" style={{ background: i <= step ? "#B80035" : "#DCE9FF" }} />}
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={i < step ? { background: "#E5EEFF", color: "#5C3F40" }
                    : i === step ? { background: "#B80035", color: "#fff", boxShadow: "0 0 0 2px rgba(184,0,53,0.2)" }
                    : { background: "#E5EEFF", color: "#5C3F40", opacity: 0.4 }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-[12px] font-semibold hidden sm:block ${i === step ? "text-[#B80035]" : i < step ? "text-[#0B1C30]" : "text-[#5C3F40] opacity-40"}`}>
                  {s}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl p-6 flex flex-col gap-4 border border-[#DCE9FF]/60 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function SectionHeading({ step, title, badge, right }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {step && (
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold"
            style={{ background: "rgba(184,0,53,0.1)", color: "#B80035" }}>
            {step}
          </div>
        )}
        <h2 className="text-[13px] font-semibold text-[#0B1C30] leading-5">{title}</h2>
        {badge && (
          <span className="px-2.5 py-[2px] rounded-full text-[11px] font-bold uppercase tracking-[0.55px]"
            style={{ background: "rgba(184,0,53,0.1)", color: "#B80035" }}>
            {badge}
          </span>
        )}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}

const fieldCls = "w-full h-9 px-3 rounded-xl text-[12px] text-[#0B1C30] placeholder-[#906F70] focus:outline-none focus:ring-2 focus:ring-[rgba(184,0,53,0.3)] transition-shadow bg-[#F8F9FF] border border-[#DCE9FF]";

function Field({ label, name, value, onChange, placeholder, type = "text", className = "", readOnly }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[12px] font-semibold text-[#0B1C30]">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`${fieldCls} ${readOnly ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
      />
    </div>
  );
}

// ─── Order Confirmation Screen ─────────────────────────────────────────────────
function OrderConfirmation({ orderId, total, onContinue }) {
  return (
    <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-lg border border-[#DCE9FF]">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-[#0B1C30] mb-2">Order Placed!</h1>
        <p className="text-[#5C3F40] text-sm mb-1">Your order has been confirmed.</p>
        <p className="text-[11px] font-mono text-gray-400 mb-4">#{orderId?.slice(-8).toUpperCase()}</p>
        <div className="bg-[#F8F9FF] border border-[#DCE9FF] rounded-xl p-4 mb-6">
          <p className="text-xs text-[#5C3F40] mb-1">Order Total</p>
          <p className="text-2xl font-bold text-[#B80035]">{fmt(total)}</p>
          <p className="text-[11px] text-gray-400 mt-1">Payment held by platform. Released to seller on delivery.</p>
        </div>
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          ⏰ You can cancel this order within 24 hours from your Order History.
        </p>
        <button type="button" onClick={onContinue}
          className="w-full h-11 bg-[#E11D48] hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors cursor-pointer">
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

// ─── Main CheckoutPage ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { currentUser, dbUser, isAuthenticated } = useAuth();
  const { items: cartItems, clearCart, updateQty } = useCart();

  // Redirect if not logged in or cart empty
  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
  }, [isAuthenticated, navigate]);

  const [addresses,        setAddresses]        = useState([]);
  const [selectedAddrId,   setSelectedAddrId]   = useState(null);
  const [selectedDelivery, setSelectedDelivery] = useState("standard");
  const [activePayTab,     setActivePayTab]      = useState("cards");
  const [promoCode,        setPromoCode]         = useState("");
  const [promoApplied,     setPromoApplied]      = useState(false);
  const [promoError,       setPromoError]        = useState("");

  // ── Valid promo codes ─────────────────────────────────────────────────────
  const PROMO_CODES = {
    SONARBANGLA: { discount: 0.10, label: '10% off — Sonar Bangla' },
    WELCOME10:   { discount: 0.10, label: '10% First Order Discount' },
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setPromoApplied(code);
      setPromoError('');
    } else {
      setPromoApplied('');
      setPromoError('Invalid promo code. Try SONARBANGLA');
    }
  };

  const handleRemovePromo = () => {
    setPromoApplied('');
    setPromoCode('');
    setPromoError('');
  };
  const [placing,          setPlacing]           = useState(false);
  const [confirmedOrder,   setConfirmedOrder]    = useState(null);

  // Contact info
  const [contact, setContact] = useState({ email: "", phone: "" });

  // Shipping form
  const [shipping, setShipping] = useState({
    firstName: "", lastName: "", address: "", city: "", state: "", zip: "", country: "Bangladesh",
  });

  // ── Pre-fill from dbUser ───────────────────────────────────────────────────
  useEffect(() => {
    if (!dbUser && !currentUser) return;
    const email = dbUser?.email || currentUser?.email || "";
    const [firstName = "", ...rest] = (dbUser?.displayName || "").split(" ");
    const lastName = rest.join(" ");
    setContact(p => ({ ...p, email, phone: dbUser?.phone || "" }));
    setShipping(p => ({ ...p, firstName, lastName }));
  }, [dbUser, currentUser]);

  // ── Load saved addresses ───────────────────────────────────────────────────
  useEffect(() => {
    const email = dbUser?.email || currentUser?.email;
    if (!email) return;
    api.get(`/addresses?email=${encodeURIComponent(email)}`)
      .then(res => {
        setAddresses(res.data);
        const def = res.data.find(a => a.isDefault) || res.data[0];
        if (def) {
          setSelectedAddrId(def._id);
          const parts = (def.address || "").split(",");
          setShipping(p => ({
            ...p,
            address: parts[0]?.trim() || "",
            city:    def.city    || "",
            zip:     def.zip     || "",
            country: def.country || "Bangladesh",
          }));
        }
      })
      .catch(() => {});
  }, [dbUser, currentUser]);

  const handleContactChange  = (e) => setContact(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleShippingChange = (e) => setShipping(p => ({ ...p, [e.target.name]: e.target.value }));

  // ── When user picks a saved address ───────────────────────────────────────
  const pickAddress = (addr) => {
    setSelectedAddrId(addr._id);
    const parts = (addr.address || "").split(",");
    setShipping(p => ({
      ...p,
      address: parts[0]?.trim() || addr.address || "",
      city:    addr.city    || "",
      zip:     addr.zip     || "",
      country: addr.country || "Bangladesh",
    }));
  };

  // ── Totals ────────────────────────────────────────────────────────────────
  const priceForLocation = (product) => {
    const cityKey = shipping.city.trim().toLowerCase();
    const cityPrices = product.locationPrices || {};
    const matchedPrice = Object.entries(cityPrices).find(([city]) => city.toLowerCase() === cityKey)?.[1];
    return Number(matchedPrice ?? product.price ?? 0);
  };
  const checkoutSubtotal = cartItems.reduce((sum, { product, qty }) => sum + priceForLocation(product) * qty, 0);
  const deliveryCost = DELIVERY_OPTIONS.find(d => d.id === selectedDelivery)?.cost || 0;
  const promoRate    = promoApplied ? (PROMO_CODES[promoApplied]?.discount || 0) : 0;
  const discount     = checkoutSubtotal * promoRate;
  const tax          = (checkoutSubtotal - discount) * 0.05;
  const total        = checkoutSubtotal - discount + deliveryCost + tax;

  // ── Place order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Swal.fire({ icon: "warning", title: "Cart is empty", text: "Add items to your cart before placing an order.", confirmButtonColor: "#e11d48" });
      return;
    }
    if (!shipping.address || !shipping.city) {
      Swal.fire({ icon: "warning", title: "Address required", text: "Please fill in your shipping address.", confirmButtonColor: "#e11d48" });
      return;
    }

    setPlacing(true);
    const email = dbUser?.email || currentUser?.email || "";

    try {
      // Group items by seller
      const bySeller = {};
      cartItems.forEach(({ product, qty }) => {
        const sellerEmail = product.sellerEmail || "unknown";
        if (!bySeller[sellerEmail]) bySeller[sellerEmail] = [];
        bySeller[sellerEmail].push({
          productId: product._id || product.id,
          name:      product.title || product.name,
          qty,
          price:     priceForLocation(product),
          image:     product.productImg || product.image || "",
        });
      });

      // Place one order per seller
      let lastOrderId = null;
      for (const [sellerEmail, sellerItems] of Object.entries(bySeller)) {
        const res = await api.post("/orders", {
          buyerEmail:      email,
          sellerEmail,
          items:           sellerItems,
          shippingAddress: {
            ...shipping,
            name: `${shipping.firstName} ${shipping.lastName}`.trim(),
          },
          contactEmail:    contact.email,
          contactPhone:    contact.phone,
          deliveryMethod:  selectedDelivery,
          deliveryCost,
          discount,
          tax:             parseFloat(tax.toFixed(2)),
        });
        lastOrderId = res.data.insertedId || res.data.order?._id;
      }

      // Clear cart after successful order
      clearCart();
      setConfirmedOrder({ id: lastOrderId, total });

    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Order failed", text: "Please try again.", confirmButtonColor: "#e11d48" });
    } finally {
      setPlacing(false);
    }
  };

  // ── Show confirmation screen ───────────────────────────────────────────────
  if (confirmedOrder) {
    return (
      <OrderConfirmation
        orderId={confirmedOrder.id}
        total={confirmedOrder.total}
        onContinue={() => navigate("/")}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F0F4FF" }}>
      <StepBar step={1} />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10">
        {/* Cart empty warning */}
        {cartItems.length === 0 && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            <AlertCircle size={16} className="flex-shrink-0" />
            Your cart is empty.{" "}
            <button type="button" onClick={() => navigate("/products")}
              className="font-semibold underline cursor-pointer ml-1">Browse products →</button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ══ LEFT COLUMN ══ */}
          <div className="flex flex-col gap-6 w-full lg:w-[calc(57%-12px)]">

            {/* 1. Contact Information */}
            <Section>
              <SectionHeading step="1" title="Contact Information" />
              <div className="flex flex-col sm:flex-row gap-4">
                <Field label="Email Address *" name="email" value={contact.email} onChange={handleContactChange}
                  placeholder="your@email.com" className="flex-1" readOnly={!!currentUser?.email} />
                <Field label="Phone Number" name="phone" value={contact.phone} onChange={handleContactChange}
                  placeholder="+880 1XXX-XXXXXX" type="tel" className="flex-1" />
              </div>
            </Section>

            {/* 2. Shipping Address */}
            <Section>
              <SectionHeading step="2" title="Shipping Address" badge="FAST DISPATCH" />

              {/* Saved addresses */}
              {addresses.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                  {addresses.map(addr => (
                    <button key={addr._id} type="button" onClick={() => pickAddress(addr)}
                      className="flex-1 min-w-[160px] cursor-pointer rounded-xl p-3 text-left flex flex-col gap-1 transition-all"
                      style={selectedAddrId === addr._id
                        ? { background: "rgba(184,0,53,0.05)", border: "2px solid #B80035" }
                        : { background: "#F8F9FF", border: "1px solid #DCE9FF" }}>
                      <span className="text-[12px] font-semibold text-[#0B1C30]">
                        {addr.label || "Address"}
                        {addr.isDefault && " (Default)"}
                      </span>
                      <span className="text-[11px] text-[#5C3F40] line-clamp-2">
                        {addr.address}{addr.city ? `, ${addr.city}` : ""}
                      </span>
                    </button>
                  ))}
                  <button type="button" onClick={() => navigate("/dashboard/address")}
                    className="flex-1 min-w-[120px] flex items-center justify-center gap-1 rounded-xl p-3 text-[12px] font-semibold text-[#B80035] cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ background: "#EFF4FF", border: "1px dashed rgba(184,0,53,0.4)" }}>
                    + New Address
                  </button>
                </div>
              )}

              {/* Form */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Field label="First Name *" name="firstName" value={shipping.firstName} onChange={handleShippingChange}
                    placeholder="First name" className="flex-1" />
                  <Field label="Last Name" name="lastName" value={shipping.lastName} onChange={handleShippingChange}
                    placeholder="Last name" className="flex-1" />
                </div>
                <Field label="Street Address *" name="address" value={shipping.address} onChange={handleShippingChange}
                  placeholder="e.g. 124 Park Avenue, Apt 5B" />
                <div className="flex flex-col sm:flex-row gap-4">
                  <Field label="City *"          name="city"    value={shipping.city}    onChange={handleShippingChange} placeholder="Dhaka"      className="flex-1" />
                  <Field label="State/Province"  name="state"   value={shipping.state}   onChange={handleShippingChange} placeholder="Dhaka"      className="flex-1" />
                  <Field label="Postal Code"     name="zip"     value={shipping.zip}     onChange={handleShippingChange} placeholder="1207"       className="flex-1" />
                </div>
                <Field label="Country" name="country" value={shipping.country} onChange={handleShippingChange} placeholder="Bangladesh" />
              </div>
            </Section>

            {/* 3. Delivery Options */}
            <Section>
              <SectionHeading step="3" title="Delivery Options" />
              <div className="flex flex-col gap-3">
                {DELIVERY_OPTIONS.map(opt => (
                  <button key={opt.id} type="button" onClick={() => setSelectedDelivery(opt.id)}
                    className="flex items-center justify-between gap-4 rounded-xl p-3.5 cursor-pointer transition-all text-left"
                    style={selectedDelivery === opt.id
                      ? { background: "rgba(184,0,53,0.05)", border: "2px solid #B80035" }
                      : { background: "#F8F9FF", border: "1px solid #DCE9FF" }}>
                    <div className="flex items-center gap-3.5 flex-1">
                      {opt.icon}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[12px] font-semibold text-[#0B1C30]">{opt.name}</span>
                          <span className={`px-1.5 py-[2px] rounded text-[11px] font-bold uppercase ${opt.tagBg}`}>{opt.tag}</span>
                        </div>
                        <p className="text-[11px] text-[#5C3F40]">{opt.desc}</p>
                      </div>
                    </div>
                    <span className="text-[13px] font-bold text-[#0B1C30] flex-shrink-0">
                      {opt.cost === 0 ? <span className="text-[#B80035]">Free</span> : `+${fmt(opt.cost)}`}
                    </span>
                  </button>
                ))}
              </div>
            </Section>

            {/* 4. Payment Method */}
            <Section>
              <SectionHeading step="4" title="Payment Method"
                right={<div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5C3F40]"><Lock size={11} className="text-[#B80035]" />256-Bit SSL</div>} />

              <div className="flex gap-2">
                {PAYMENT_TABS.map(tab => (
                  <button key={tab.id} type="button" onClick={() => setActivePayTab(tab.id)}
                    className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer"
                    style={activePayTab === tab.id
                      ? { background: "rgba(184,0,53,0.05)", border: "2px solid #B80035", color: "#B80035" }
                      : { background: "#F8F9FF", border: "1px solid #DCE9FF", color: "#5C3F40" }}>
                    {tab.icon}
                    <span className="hidden sm:block">{tab.label}</span>
                  </button>
                ))}
              </div>

              {activePayTab === "cards" && (
                <div className="flex flex-col gap-4 p-5 rounded-xl bg-[#F8F9FF] border border-[#DCE9FF]">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-semibold text-[#0B1C30]">Card Number</label>
                    <div className="relative">
                      <input type="text" placeholder="1234 5678 9012 3456"
                        className="w-full h-10 px-3 pr-10 rounded-xl text-[14px] text-[#0B1C30] tracking-widest placeholder-[#906F70] focus:outline-none focus:ring-2 focus:ring-[rgba(184,0,53,0.3)] bg-white border border-[#DCE9FF]" />
                      <CreditCard size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B80035]" />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[12px] font-semibold text-[#0B1C30]">Expiry (MM/YY)</label>
                      <input type="text" placeholder="MM / YY"
                        className="h-10 px-3 rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-[rgba(184,0,53,0.3)] bg-white border border-[#DCE9FF]" />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                      <label className="text-[12px] font-semibold text-[#0B1C30] flex items-center gap-1">
                        CVV <Info size={11} className="text-gray-400" />
                      </label>
                      <input type="password" placeholder="•••"
                        className="h-10 px-3 rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-[rgba(184,0,53,0.3)] bg-white border border-[#DCE9FF]" />
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#EFF4FF] border border-[#DCE9FF]/60">
                    <ShieldCheck size={15} className="text-[#B80035] mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-[#5C3F40]">PCI-DSS Level 1 — Your card details are encrypted and never stored.</p>
                  </div>
                </div>
              )}
              {activePayTab === "cod" && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <Package size={16} className="text-amber-600 flex-shrink-0" />
                  <p className="text-[12px] text-amber-700 font-medium">Pay cash when your order is delivered to your door.</p>
                </div>
              )}
              {activePayTab !== "cards" && activePayTab !== "cod" && (
                <p className="text-center py-8 text-[13px] text-[#5C3F40]">{PAYMENT_TABS.find(t => t.id === activePayTab)?.label} — coming soon</p>
              )}
            </Section>
          </div>

          {/* ══ RIGHT COLUMN — Order Summary ══ */}
          <div className="flex flex-col gap-0 w-full lg:w-[calc(43%-12px)] lg:sticky lg:top-6">
            <div className="bg-white rounded-xl p-6 flex flex-col gap-4 border border-[#DCE9FF]/60 shadow-sm">

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE9FF]/60">
                <div className="flex items-center gap-2">
                  <h3 className="text-[20px] font-semibold text-[#0B1C30]">Order Summary</h3>
                  <span className="px-2 py-[2px] rounded-full text-[11px] font-bold text-[#0B1C30] bg-[#E5EEFF]">
                    {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <button type="button" onClick={() => navigate("/products")}
                  className="text-[12px] font-semibold text-[#B80035] hover:underline cursor-pointer">
                  Edit Cart
                </button>
              </div>

              {/* Items */}
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-[#5C3F40] text-sm">
                  <ShoppingCart size={28} strokeWidth={1.2} className="mb-2 text-gray-300" />
                  Cart is empty
                </div>
              ) : (
                <div className="flex flex-col gap-3.5 max-h-[240px] overflow-y-auto pr-1">
                  {cartItems.map(({ product, qty }, i) => {
                    const img = product.productImg || product.image;
                    const itemPrice = priceForLocation(product);
                    return (
                      <div key={i} className="flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-xl flex items-center justify-center shrink-0 bg-[#E5EEFF] border border-[#DCE9FF]/60 overflow-hidden">
                          {img
                            ? <img src={img} alt={product.title || product.name} className="w-full h-full object-cover" />
                            : <ShoppingCart size={20} className="text-[#B80035]" />
                          }
                          <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[#0B1C30] text-[#F8F9FF] text-[10px] font-bold flex items-center justify-center">{qty}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-[#0B1C30] leading-4 truncate">{product.title || product.name}</p>
                          {product.selectedColor && (
                            <p className="text-[11px] text-[#5C3F40] mt-0.5">{product.selectedColor}{product.selectedSize ? ` · ${product.selectedSize}` : ""}</p>
                          )}
                          <div className="flex items-center gap-1 mt-2">
                            <button type="button" onClick={() => updateQty(product._id || product.id, qty - 1)} aria-label="Decrease quantity" className="w-6 h-6 grid place-items-center border border-[#DCE9FF] rounded"><Minus size={11} /></button>
                            <span className="w-6 text-center text-xs font-semibold">{qty}</span>
                            <button type="button" onClick={() => updateQty(product._id || product.id, qty + 1)} aria-label="Increase quantity" className="w-6 h-6 grid place-items-center border border-[#DCE9FF] rounded"><Plus size={11} /></button>
                          </div>
                        </div>
                        <p className="text-[13px] font-bold text-[#0B1C30] shrink-0">{fmt(itemPrice * qty)}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Promo */}
              <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#F8F9FF] border border-[#DCE9FF]">
                <span className="text-[12px] font-semibold text-[#0B1C30]">Promo Code</span>
                {promoApplied ? (
                  <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-emerald-600 flex-shrink-0" />
                      <span className="text-[11px] font-bold text-emerald-700">
                        {PROMO_CODES[promoApplied]?.label} (−{fmt(discount)})
                      </span>
                    </div>
                    <button type="button" onClick={handleRemovePromo}
                      className="text-[11px] font-semibold text-red-500 hover:text-red-700 cursor-pointer ml-2">
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={e => { setPromoCode(e.target.value); setPromoError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleApplyPromo()}
                        placeholder="e.g. SONARBANGLA"
                        className="flex-1 h-9 px-3 rounded-xl text-[12px] uppercase font-semibold focus:outline-none focus:ring-2 focus:ring-[rgba(184,0,53,0.3)] bg-white border border-[#DCE9FF]"
                      />
                      <button type="button" onClick={handleApplyPromo}
                        disabled={!promoCode.trim()}
                        className="h-9 px-4 rounded-xl text-[12px] font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: "#0B1C30" }}>
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[11px] text-red-500 font-medium">{promoError}</p>
                    )}
                  </>
                )}
              </div>

              {/* Price breakdown */}
              <div className="flex flex-col gap-2.5">
                {[
                  ["Subtotal",   fmt(checkoutSubtotal)],
                  promoApplied && [`Discount (${Math.round(promoRate * 100)}%)`, `−${fmt(discount)}`],
                  ["Delivery",   deliveryCost === 0 ? "Free" : fmt(deliveryCost)],
                  ["Tax (5%)",   fmt(tax)],
                ].filter(Boolean).map(([label, val], i) => (
                  <div key={i} className="flex items-center justify-between text-[13px]">
                    <span className="text-[#5C3F40]">{label}</span>
                    <span className="font-semibold text-[#0B1C30]">{val}</span>
                  </div>
                ))}
              </div>

              {/* Total + CTA */}
              <div className="pt-1">
                <div className="w-full h-px mb-4 bg-[#DCE9FF]/80" />
                <div className="flex items-end justify-between mb-4">
                  <p className="text-[13px] font-semibold text-[#5C3F40]">Total</p>
                  <p className="text-[28px] font-extrabold text-[#B80035] leading-none">{fmt(total)}</p>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placing || cartItems.length === 0}
                  className="relative w-full flex items-center justify-center gap-2 h-14 rounded-full text-[18px] font-bold text-white cursor-pointer hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "#E11D48", boxShadow: "0 10px 15px -3px rgba(184,0,53,0.25)" }}
                >
                  {placing
                    ? <><Loader2 size={18} className="animate-spin" /> Placing Order…</>
                    : <><Lock size={14} /> Place Order · {fmt(total)} <ArrowRight size={13} /></>
                  }
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex gap-2 pt-1">
                {[
                  { icon: <ShoppingCart size={14} className="text-[#B80035]" />, text: "30-Day Returns" },
                  { icon: <Lock size={12} className="text-[#B80035]" />,         text: "SSL Encrypted" },
                  { icon: <Truck size={14} className="text-[#B80035]" />,        text: "Fast Dispatch" },
                ].map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-semibold text-[#0B1C30] text-center bg-[#F8F9FF] border border-[#DCE9FF]/50">
                    {b.icon}{b.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
