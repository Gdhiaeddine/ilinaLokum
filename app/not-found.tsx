import Link from "next/link";
import { IconFactory } from "@/shared/icon-factory";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9]">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center">
          <IconFactory name="AlertTriangle" className="text-white" size={32} />
        </div>
        <h1 className="font-serif text-4xl font-bold text-[#2C2419] mb-4">
          404 - Page non trouvée
        </h1>
        <p className="text-[#8C735A] mb-8">
          La page que vous recherchez n&apos;existe pas.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#C9A227] text-white font-medium rounded-xl hover:from-[#C9A227] hover:to-[#B89219] transition-all shadow-lg shadow-[#C9A227]/20"
        >
          <IconFactory name="Dashboard" size={18} />
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
