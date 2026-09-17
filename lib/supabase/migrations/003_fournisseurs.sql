CREATE TABLE IF NOT EXISTS fournisseurs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom TEXT NOT NULL,
    contact_nom TEXT,
    telephone TEXT,
    email TEXT,
    adresse TEXT,
    ville TEXT,
    pays TEXT DEFAULT 'Mali',
    notes TEXT,
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fournisseurs_nom ON fournisseurs(nom);

CREATE TRIGGER trg_fournisseurs_updated_at
    BEFORE UPDATE ON fournisseurs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE fournisseurs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fournisseurs_all" ON fournisseurs
    FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role IN ('admin','gerant'))
    );