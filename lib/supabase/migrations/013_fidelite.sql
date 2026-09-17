CREATE TABLE IF NOT EXISTS fidelite_mouvements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    points NUMERIC(10,2) NOT NULL,           -- positif = gain, négatif = utilisation
    type TEXT NOT NULL CHECK (type IN ('gain', 'utilisation', 'expiration', 'ajustement')),
    vente_id UUID REFERENCES ventes(id),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fidelite_client ON fidelite_mouvements(client_id);
CREATE INDEX idx_fidelite_date ON fidelite_mouvements(created_at DESC);

ALTER TABLE fidelite_mouvements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fidelite_select" ON fidelite_mouvements FOR SELECT TO authenticated USING (true);
CREATE POLICY "fidelite_all" ON fidelite_mouvements FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role IN ('admin','gerant','vendeur')));