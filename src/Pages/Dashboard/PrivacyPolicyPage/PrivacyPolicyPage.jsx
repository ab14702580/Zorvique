import { ShieldCheck } from 'lucide-react';
import DashboardLayout from '../../../Component/DashboardLayout/DashboardLayout';

const sections = [
  {
    title: '1. Information We Collect',
    body: 'We collect information you provide directly, such as your name, email address, phone number, and shipping address. We also collect usage data automatically, including your IP address, browser type, and pages visited.',
  },
  {
    title: '2. How We Use Your Information',
    body: 'We use the information we collect to process your orders, send transactional emails, personalise your experience, improve our platform, and comply with legal obligations.',
  },
  {
    title: '3. Information Sharing',
    body: 'We do not sell, trade, or transfer your personal information to outside parties without your consent, except to trusted third parties who assist us in operating our platform, conducting our business, or serving you — provided they agree to keep this information confidential.',
  },
  {
    title: '4. Cookies',
    body: 'Our platform uses cookies to enhance user experience. You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies through your browser settings.',
  },
  {
    title: '5. Data Security',
    body: 'We implement a variety of security measures to maintain the safety of your personal information. Your data is stored behind secured networks and is only accessible by a limited number of persons who have special access rights.',
  },
  {
    title: '6. Your Rights',
    body: 'You have the right to access, correct, or delete your personal data at any time. You may also object to or restrict certain processing of your data. To exercise these rights, please contact us through our support channel.',
  },
  {
    title: '7. Third-Party Links',
    body: 'Our platform may contain links to third-party websites. These sites have their own privacy policies, and we are not responsible for their content or activities.',
  },
  {
    title: '8. Changes to This Policy',
    body: 'We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page with an updated revision date.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <DashboardLayout activeId="privacy">

      <div className="flex items-center gap-2">
        <ShieldCheck size={16} strokeWidth={1.5} className="text-gray-500" />
        <h1 className="text-[14px] font-semibold text-gray-800 tracking-[-0.35px] leading-5"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          Privacy Policy
        </h1>
      </div>

      <div className="w-full bg-white border border-gray-100 rounded-xl p-6 flex flex-col gap-5">
        <p className="text-xs text-gray-400"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          Last updated: January 1, 2026
        </p>

        {sections.map((s) => (
          <div key={s.title} className="flex flex-col gap-1.5">
            <h2 className="text-sm font-semibold text-gray-800 leading-5"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              {s.title}
            </h2>
            <p className="text-sm text-gray-600 leading-6"
              style={{ fontFamily: "'Inter', sans-serif" }}>
              {s.body}
            </p>
          </div>
        ))}
      </div>

    </DashboardLayout>
  );
}
