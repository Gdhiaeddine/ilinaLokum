"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/services/supabase/client";
import { IconFactory } from "@/shared/icon-factory";
import Image from "next/image";

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
    <div className="min-h-screen flex bg-background">
      {/* Left side - Visual */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/background.jpg)' }}
        />
        <div className="absolute inset-0 bg-[#2C2419]/40 backdrop-blur-xs" />
        <div className="text-center relative z-10 p-12">
          <div className="w-32 h-32 mx-auto mb-8 rounded-2xl flex items-center justify-center">
            {
              //<IconFactory name="Store" className="text-white" size={20} />
            }
            <Image src="/logo.png" width={200} height={200} alt="Ilina Lokum" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-white mb-4">
            Ilina Lokum Manager
          </h1>
          <p className="text-[#eee] text-lg max-w-md mx-auto leading-relaxed">
            Gestion premium de votre boutique de Kunafa. Suivez vos stocks, vos
            ventes et vos profits en temps réel.
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
            <h1 className="font-serif text-2xl font-bold text-[#2C2419]">
              Kunafa Manager
            </h1>
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
                <IconFactory
                  name="Mail"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C735A]"
                  size={18}
                />
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
                <IconFactory
                  name="Lock"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C735A]"
                  size={18}
                />
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
