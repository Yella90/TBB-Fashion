import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Colonne gauche : branding */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 gradient-tbb text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-black/40 blur-3xl" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary font-bold text-sm shadow-lg">
              TBB
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold tracking-tight">
                TBB Fashion
              </span>
              <span className="text-[10px] uppercase tracking-widest text-white/70">
                Chaussures
              </span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Gérez votre boutique de chaussures, simplement.
          </h1>
          <p className="mt-4 text-white/80 leading-relaxed">
            Ventes, stock, clients, dettes, fidélité — tout au même endroit.
            Une interface pensée pour les vendeurs de chaussures.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs text-white/70 mt-1">Mobile-first</p>
            </div>
            <div>
              <p className="text-2xl font-bold">FCFA</p>
              <p className="text-xs text-white/70 mt-1">Devise locale</p>
            </div>
            <div>
              <p className="text-2xl font-bold">TBB</p>
              <p className="text-xs text-white/70 mt-1">Made in Mali</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/60">
          © {new Date().getFullYear()} TBB Fashion · Tous droits réservés
        </div>
      </div>

      {/* Colonne droite : formulaire */}
      <div className="flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}