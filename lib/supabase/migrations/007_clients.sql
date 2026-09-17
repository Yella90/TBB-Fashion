CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom TEXT NOT NULL,
    prenom TEXT,
    telephone TEXT,
    email TEXT,
    adresse TEXT,
    ville TEXT,
    date_naissance DATE,
    genre TEXT CHECK (genre IN ('homme', 'femme', 'autre')),
    points_fidelite NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_achats NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_dettes NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_nom ON clients(nom);
CREATE INDEX idx_clients_telephone ON clients(telephone);

CREATE TRIGGER trg_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "clients_modif" ON clients FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role IN ('admin','gerant','vendeur')));