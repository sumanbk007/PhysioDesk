import { ReactNode } from "react";
import { BrandPanel } from "@/components/auth";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-10 lg:p-12 bg-white">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-linear-to-br from-[#E6F7F5] via-[#D5F0EC] to-[#EAF9F5]">
        <BrandPanel />
      </div>
    </div>
  );
}
