-- ============================================
-- Variantes de produit (pointure × couleur)
-- Cœur du métier chaussures
-- ============================================
CREATE TABLE IF NOT EXISTS variantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produit_id UUID NOT NULL REFERENCES produits(id) ON DELETE CASCADE,
    pointure NUMERIC(4,1) NOT NULL,          -- 36, 38.5, 42...
    couleur TEXT NOT NULL,
    code_barre TEXT UNIQUE,
    prix_vente NUMERIC(10,2) NOT NULL,
    prix_achat NUMERIC(10,2) NOT NULL DEFAULT 0,
    sku TEXT UNIQUE,
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (produit_id, pointure, couleur)
);

CREATE INDEX idx_variantes_produit ON variantes(produit_id);
CREATE INDEX idx_variantes_pointure ON variantes(pointure);
CREATE INDEX idx_variantes_code_barre ON variantes(code_barre);

CREATE TRIGGER trg_variantes_updated_at
    BEFORE UPDATE ON variantes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE variantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "variantes_select" ON variantes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "variantes_modif" ON variantes
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role IN ('admin','gerant'))
    );