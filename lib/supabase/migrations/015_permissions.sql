-- ============================================
-- Fonctions utilitaires de permissions
-- ============================================

-- Récupère le rôle de l'utilisateur courant
CREATE OR REPLACE FUNCTION auth_role()
RETURNS TEXT AS $$
    SELECT role FROM public.utilisateurs WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Vérifie si l'utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT COALESCE((SELECT role = 'admin' FROM public.utilisateurs WHERE id = auth.uid()), false);
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Vérifie si l'utilisateur peut gérer (admin ou gérant)
CREATE OR REPLACE FUNCTION can_manage()
RETURNS BOOLEAN AS $$
    SELECT COALESCE((SELECT role IN ('admin','gerant') FROM public.utilisateurs WHERE id = auth.uid()), false);
$$ LANGUAGE sql SECURITY DEFINER STABLE;