export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-[#14B8A6] flex items-center justify-center text-white font-bold">
          P
        </div>
        <div>
          <div className="font-semibold leading-tight">PhysioDesk</div>
          <div className="text-xs text-slate-500">Sahayatri Physio</div>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500">
          Sign in with your front desk credentials.
        </p>
      </div>

      <div className="text-sm text-slate-500">Login form coming next.</div>
    </div>
  );
}
