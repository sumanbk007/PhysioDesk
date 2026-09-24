export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      <div className="hidden lg:flex items-center justify-center bg-[#E6F7F5] p-12 relative overflow-hidden">
        <div className="max-w-md text-center space-y-6">
          <div className="mx-auto w-40 h-40 rounded-full bg-[#14B8A6]/10 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-[#14B8A6]/20 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#14B8A6]" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold">
            Empowering Physical Recovery
          </h2>
          <p className="text-slate-600">
            High-throughput patient management, musculoskeletal scheduling,
            and precision telemetry in one terminal.
          </p>
        </div>
      </div>
    </div>
  );
}
