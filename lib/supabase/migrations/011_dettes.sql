CREATE TABLE IF NOT EXISTS dettes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    vente_id UUID REFERENCES ventes(id),
    montant_initial NUMERIC(12,2) NOT NULL,
    montant_restant NUMERIC(12,2) NOT NULL,
    date_echeance DATE,
    statut TEXT NOT NULL DEFAULT 'impayee'
        CHECK (statut IN ('impayee', 'partielle', 'payee', 'annulee')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dettes_client ON dettes(client_id);
CREATE INDEX idx_dettes_statut ON dettes(statut);

CREATE TRIGGER trg_dettes_updated_at BEFORE UPDATE ON dettes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE dettes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dettes_select" ON dettes FOR SELECT TO authenticated USING (true);
CREATE POLICY "dettes_all" ON dettes FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role IN ('admin','gerant','vendeur')));