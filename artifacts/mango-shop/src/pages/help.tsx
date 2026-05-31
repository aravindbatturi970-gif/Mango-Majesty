import { useState } from "react";
import { Layout } from "@/components/layout";
import { ChevronDown, MessageCircle, Mail, Phone, Package, CreditCard, Truck, RefreshCw } from "lucide-react";

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "We deliver within 24–48 hours for most metro cities. Delivery to tier-2 cities may take 2–4 days. You'll receive an estimated delivery date when you place your order.",
  },
  {
    q: "Are the mangoes fresh and farm-sourced?",
    a: "Yes! All our mangoes are sourced directly from certified farms across Maharashtra, Gujarat, and Andhra Pradesh. We pick them at the right stage of ripeness so they arrive perfect for you.",
  },
  {
    q: "What if I receive damaged or unripe mangoes?",
    a: "We have a 100% satisfaction guarantee. If you receive damaged, unripe, or poor quality mangoes, contact us within 24 hours of delivery with a photo and we will arrange a replacement or full refund.",
  },
  {
    q: "Can I cancel or modify my order?",
    a: "Orders can be cancelled within 1 hour of placement. Once the order is being packed, cancellation is not possible. To cancel, use the Track Order page or contact our support team on WhatsApp.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Cash on Delivery (COD), UPI (GPay, PhonePe, Paytm), and all major debit/credit cards. Online payment is powered by Razorpay.",
  },
  {
    q: "How do I use a coupon code?",
    a: "On the checkout page, scroll to the Order Summary section. You'll find a 'Coupon code' input — enter your code and click Apply. The discount will be reflected in your total before you place the order.",
  },
  {
    q: "Do you offer subscriptions?",
    a: "Yes! Subscribe to a weekly or monthly mango box and save up to 15%. Visit the Subscribe page to choose your plan and variety.",
  },
  {
    q: "What is the minimum order value?",
    a: "There is no minimum order value. Delivery is free on orders above ₹999. A flat delivery fee of ₹49 applies for smaller orders.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left gap-3"
      >
        <span className="text-sm font-medium text-gray-800">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="text-sm text-gray-500 pb-4 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

const TOPICS = [
  { icon: Package, label: "Orders & Tracking", color: "text-amber-500 bg-amber-50" },
  { icon: Truck, label: "Delivery", color: "text-blue-500 bg-blue-50" },
  { icon: CreditCard, label: "Payments", color: "text-purple-500 bg-purple-50" },
  { icon: RefreshCw, label: "Returns & Refunds", color: "text-green-500 bg-green-50" },
];

export default function Help() {
  return (
    <Layout>
      <div className="max-w-lg mx-auto w-full px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-100 mb-3">
            <MessageCircle className="w-6 h-6 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Help &amp; Support</h1>
          <p className="text-sm text-gray-500 mt-1">We're here to help you</p>
        </div>

        {/* Quick topics */}
        <div className="grid grid-cols-2 gap-3">
          {TOPICS.map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-medium text-gray-700 leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Contact us */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100 space-y-3">
          <h3 className="font-bold text-gray-800 text-sm">Contact Us</h3>
          <a
            href="https://wa.me/919000000000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 bg-white rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-800">WhatsApp Support</div>
              <div className="text-xs text-gray-500">Fastest response — usually within minutes</div>
            </div>
          </a>
          <a
            href="mailto:support@aamras.com"
            className="flex items-center gap-3 bg-white rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-800">Email Us</div>
              <div className="text-xs text-gray-500">support@aamras.com</div>
            </div>
          </a>
          <a
            href="tel:+919000000000"
            className="flex items-center gap-3 bg-white rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-800">Call Us</div>
              <div className="text-xs text-gray-500">Mon–Sat, 9 AM – 6 PM</div>
            </div>
          </a>
        </div>

        {/* FAQs */}
        <div>
          <h3 className="font-bold text-gray-800 text-sm mb-3">Frequently Asked Questions</h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
