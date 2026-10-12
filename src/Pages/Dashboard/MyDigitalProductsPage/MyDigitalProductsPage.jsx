import { Package } from 'lucide-react';
import DashboardLayout from '../../../Component/DashboardLayout/DashboardLayout';

export default function MyDigitalProductsPage() {
  return (
    <DashboardLayout activeId="digital">

      <h1 className="text-[14px] font-semibold text-gray-800 tracking-[-0.35px] leading-5"
        style={{ fontFamily: "'Inter', sans-serif" }}>
        My Digital Products
      </h1>

      <div className="w-full bg-white border border-gray-100 rounded-xl flex flex-row items-center px-8 py-[61px] min-h-[140px]">
        <div className="flex items-center gap-3 text-gray-400">
          <Package size={20} strokeWidth={1.5} className="text-gray-300" />
          <span className="text-[12px] font-medium text-gray-500"
            style={{ fontFamily: "'Inter', sans-serif" }}>
            No Order Found
          </span>
        </div>
      </div>

    </DashboardLayout>
  );
}
