import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
      <div className="w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">
            PJ Intranet
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">Sign in to your account</p>
        </div>
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
