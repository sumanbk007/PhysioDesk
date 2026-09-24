import { LoginForm } from "@/features/auth";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-[#14B8A6] text-white flex items-center justify-center font-bold">
          P
        </div>
        <div>
          <div className="font-semibold leading-tight">PhysioDesk</div>
          <div className="text-xs text-slate-500">Sahayatri Physio</div>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-slate-500">
          Sign in with your front desk credentials.
        </p>
      </div>

      <LoginForm />

      <div className="text-xs text-slate-400 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
        Front desk access only
      </div>
    </div>
  );
}
