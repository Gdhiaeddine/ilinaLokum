"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/services/supabase/client";
import { IconFactory } from "@/shared/icon-factory";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex bg-[#FFFDF9]">
      {/* Left side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#FAF3EB] via-[#F5E9DA] to-[#E8D5C4] items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A227' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="text-center relative z-10 p-12">
          <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center shadow-2xl shadow-[#C9A227]/20">
            <IconFactory name="Store" className="text-white" size={40} />
          </div>
          <h1 className="font-serif text-4xl font-bold text-[#2C2419] mb-4">
            Kunafa Manager
          </h1>
          <p className="text-[#6B4F3A] text-lg max-w-md mx-auto leading-relaxed">
            Gestion premium de votre boutique de Kunafa. Suivez vos stocks, vos ventes et vos profits en temps réel.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center">
              <IconFactory name="Store" className="text-white" size={28} />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#2C2419]">Kunafa Manager</h1>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-2xl font-bold text-[#2C2419] mb-2">
              Bienvenue
            </h2>
            <p className="text-[#8C735A]">
              Connectez-vous pour accéder à votre tableau de bord
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#2C2419] mb-2">
                Email
              </label>
              <div className="relative">
                <IconFactory name="Mail" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C735A]" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-[#2C2419] placeholder:text-[#8C735A]/50 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                  placeholder="kunafa@boutique.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C2419] mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <IconFactory name="Lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C735A]" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-[#2C2419] placeholder:text-[#8C735A]/50 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white font-medium rounded-xl hover:from-[#C9A227] hover:to-[#B89219] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#C9A227]/20"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
