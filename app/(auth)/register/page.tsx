import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
          <span className="text-2xl font-bold text-white italic">F</span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-widest uppercase">FinPal ERP</h1>
      </div>
      <RegisterForm />
    </div>
  );
}
