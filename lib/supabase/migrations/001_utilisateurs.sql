-- ============================================
-- Utilisateurs (lié à auth.users de Supabase)
-- ============================================
CREATE TABLE IF NOT EXISTS utilisateurs (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nom TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telephone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'vendeur'
        CHECK (role IN ('admin', 'gerant', 'vendeur')),
    actif BOOLEAN NOT NULL DEFAULT true,
    derniere_connexion TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_utilisateurs_role ON utilisateurs(role);
CREATE INDEX idx_utilisateurs_actif ON utilisateurs(actif);

-- Trigger : créer automatiquement un utilisateur lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.utilisateurs (id, nom, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nom', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'vendeur')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger updated_at générique (réutilisé partout)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_utilisateurs_updated_at
    BEFORE UPDATE ON utilisateurs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;

-- Tout utilisateur connecté peut lire les autres utilisateurs (pour affichage)
CREATE POLICY "utilisateurs_select" ON utilisateurs
    FOR SELECT TO authenticated
    USING (true);

-- Seul admin peut modifier les rôles
CREATE POLICY "utilisateurs_update" ON utilisateurs
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM utilisateurs u WHERE u.id = auth.uid() AND u.role = 'admin')
    );