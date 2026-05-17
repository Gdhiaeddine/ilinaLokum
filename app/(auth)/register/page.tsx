"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/services/supabase/client";
import { IconFactory } from "@/shared/icon-factory";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
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
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9]">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center">
            <IconFactory name="Store" className="text-white" size={28} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#2C2419] mb-2">
            Créer un compte
          </h1>
          <p className="text-[#8C735A]">
            Configurez votre boutique de Kunafa
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
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
                className="w-full pl-10 pr-4 py-3 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-[#2C2419] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
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
                className="w-full pl-10 pr-4 py-3 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-[#2C2419] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2C2419] mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <IconFactory name="Lock" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C735A]" size={18} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FAF3EB] border border-[#E8D5C4] rounded-xl text-[#2C2419] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white font-medium rounded-xl hover:from-[#C9A227] hover:to-[#B89219] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 transition-all disabled:opacity-50 shadow-lg shadow-[#C9A227]/20"
          >
            {loading ? "Création du compte..." : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#8C735A]">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-[#C9A227] font-medium hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
