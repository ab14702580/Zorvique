import { FileText } from 'lucide-react';
import DashboardLayout from '../../../Component/DashboardLayout/DashboardLayout';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using our platform, you agree to be bound by these Terms & Conditions. If you do not agree to any part of the terms, you may not access the service.',
  },
  {
    title: '2. Use of the Platform',
    body: 'You agree to use the platform only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the platform. Prohibited behaviour includes harassing other users, posting false information, or attempting to gain unauthorised access to the platform.',
  },
  {
    title: '3. Account Responsibility',
    body: 'You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorised use of your account.',
  },
  {
    title: '4. Orders & Payments',
    body: 'All orders placed through the platform are subject to availability and confirmation of the order price. We reserve the right to refuse any order. Payment must be completed before the order is processed.',
  },
  {
    title: '5. Returns & Refunds',
    body: 'Our return and refund policy allows you to return items within 30 days of receipt. Items must be in original condition. Refunds will be processed within 7 business days after the return is received.',
  },
  {
    title: '6. Intellectual Property',
    body: 'All content on this platform, including text, images, logos, and software, is the property of the company and is protected by applicable intellectual property laws.',
  },
  {
    title: '7. Limitation of Liability',
    body: 'To the maximum extent permitted by law, the company shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the platform.',
  },
  {
    title: '8. Changes to Terms',
    body: 'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the platform after changes are posted constitutes your acceptance of the new terms.',
  },
];

export default function TermsConditionsPage() {
  return (
    <DashboardLayout activeId="terms">

      <div className="flex items-center gap-2">
        <FileText size={16} strokeWidth={1.5} className="text-gray-500" />
        <h1 className="text-[14px] font-semibold text-gray-800 tracking-[-0.35px] leading-5"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          Terms &amp; Conditions
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
