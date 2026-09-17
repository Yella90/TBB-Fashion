import { NextResponse, type NextRequest } from 'next/server';

// ============================================
// Proxy léger (Edge)
// - Vérifie la présence du cookie de session (rapide)
// - Redirige si nécessaire
// - NE fait AUCUN appel réseau vers Supabase
// La validation complète du JWT se fait dans les Server Components
// (déjà en place via supabase.auth.getUser() dans les services)
// ============================================

const ROUTES_PUBLIQUES = ['/', '/connexion', '/inscription'];

function aUnCookieDeSession(request: NextRequest): boolean {
  // Supabase stocke la session dans un cookie nommé sb-<ref>-auth-token
  // On cherche n'importe quel cookie qui commence par "sb-" et contient "auth-token"
  const cookies = request.cookies.getAll();
  return cookies.some(
    (c) => c.name.startsWith('sb-') && c.name.includes('auth-token')
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const connecte = aUnCookieDeSession(request);

  const estRoutePublique = ROUTES_PUBLIQUES.includes(pathname);

  // Non connecté sur route protégée → redirection vers connexion
  if (!connecte && !estRoutePublique) {
    const url = request.nextUrl.clone();
    url.pathname = '/connexion';
    return NextResponse.redirect(url);
  }

  // Connecté sur page de connexion/inscription → redirection vers dashboard
  if (connecte && (pathname === '/connexion' || pathname === '/inscription')) {
    const url = request.nextUrl.clone();
    url.pathname = '/tableau-de-bord';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Exécuter le proxy sur toutes les routes SAUF :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation images)
     * - favicon.ico
     * - fichiers avec extensions (svg, png, jpg, jpeg, gif, webp)
     * - api (les routes API gèrent leur propre auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};