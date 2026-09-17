-- ============================================
-- Paramètres de la boutique (singleton)
-- ============================================
CREATE TABLE IF NOT EXISTS parametres_boutique (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    nom TEXT NOT NULL DEFAULT 'TBB Fashion',
    slogan TEXT,
    adresse TEXT,
    telephone TEXT,
    email TEXT,
    logo_url TEXT,
    devise TEXT NOT NULL DEFAULT 'FCFA',
    symbole_devise TEXT NOT NULL DEFAULT 'FCFA',
    tva NUMERIC(5,2) NOT NULL DEFAULT 0,
    seuil_alerte_stock INT NOT NULL DEFAULT 5,
    points_fidelite_par_1000 NUMERIC(5,2) NOT NULL DEFAULT 1,
    valeur_point_fidelite NUMERIC(10,2) NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO parametres_boutique (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE TRIGGER trg_parametres_updated_at
    BEFORE UPDATE ON parametres_boutique
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE parametres_boutique ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parametres_select" ON parametres_boutique
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "parametres_update" ON parametres_boutique
    FOR UPDATE TO authenticated
    USING (
        EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role = 'admin')
    );