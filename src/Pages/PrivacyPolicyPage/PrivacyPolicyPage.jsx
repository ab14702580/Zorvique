import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Eye, Share2, Cookie, Database, UserCheck, Link, RefreshCw } from 'lucide-react';

const sections = [
  {
    icon: Eye,
    title: '1. Information We Collect',
    body: 'We collect information you provide directly — such as your name, email address, phone number, and shipping address. We also collect usage data automatically, including your IP address, browser type, device information, and pages visited on our platform.',
  },
  {
    icon: Database,
    title: '2. How We Use Your Information',
    body: 'We use the information we collect to process your orders, send transactional emails and order updates, personalise your shopping experience, improve our platform features, resolve disputes, and comply with legal obligations.',
  },
  {
    icon: Share2,
    title: '3. Information Sharing',
    body: 'We do not sell, trade, or transfer your personal information to outside parties without your consent. We may share data with trusted third-party service providers who assist us in operating our platform — such as payment processors and delivery partners — provided they agree to keep this information confidential.',
  },
  {
    icon: Cookie,
    title: '4. Cookies & Tracking',
    body: 'Our platform uses cookies and similar tracking technologies to enhance user experience, remember your preferences, and analyse traffic patterns. You can choose to disable cookies through your browser settings, though some features may not function correctly without them.',
  },
  {
    icon: Lock,
    title: '5. Data Security',
    body: 'We implement industry-standard security measures including SSL/TLS encryption, secure database access, and regular security audits to protect your personal information. Your data is stored in secured environments accessible only by authorised personnel.',
  },
  {
    icon: UserCheck,
    title: '6. Your Rights',
    body: 'You have the right to access, correct, or delete your personal data at any time. You may also object to or restrict certain processing of your data, request data portability, or withdraw consent where processing is based on consent. To exercise these rights, please contact us through our support channel.',
  },
  {
    icon: Link,
    title: '7. Third-Party Links',
    body: 'Our platform may contain links to third-party websites, seller storefronts, and external services. These sites have their own privacy policies, and we are not responsible for their content, privacy practices, or activities. We encourage you to review the privacy policy of every site you visit.',
  },
  {
    icon: RefreshCw,
    title: '8. Changes to This Policy',
    body: 'We may update this privacy policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any significant changes by posting the new policy on this page with an updated revision date. Continued use of our platform after changes constitutes acceptance of the updated policy.',
  },
];

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ── Header ── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-rose-600" />
            <span className="text-sm font-bold text-slate-800">Privacy Policy</span>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={28} className="text-white" strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-rose-200 text-sm max-w-md mx-auto leading-relaxed">
            We value your privacy. This policy explains what data we collect, how we use it, and how we protect it.
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs text-rose-100">
            <RefreshCw size={11} />
            Last updated: January 1, 2026
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col gap-4">
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={18} className="text-rose-600" strokeWidth={1.8} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 mb-2 leading-snug">{s.title}</h2>
                  <p className="text-sm text-slate-600 leading-6">{s.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Contact section ── */}
        <div className="mt-6 bg-rose-50 border border-rose-100 rounded-2xl p-6 text-center">
          <ShieldCheck size={20} className="text-rose-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800 mb-1">Questions about your privacy?</p>
          <p className="text-xs text-slate-500 mb-3">
            Contact our support team and we will respond within 48 hours.
          </p>
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Contact Support
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © {new Date().getFullYear()} Multiventor. All rights reserved.
        </p>
      </div>
    </div>
  );
}
