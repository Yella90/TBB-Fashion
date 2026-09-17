CREATE TABLE IF NOT EXISTS paiements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id),
    vente_id UUID REFERENCES ventes(id),
    achat_id UUID REFERENCES achats(id),
    montant NUMERIC(12,2) NOT NULL CHECK (montant > 0),
    mode TEXT NOT NULL CHECK (mode IN ('especes', 'mobile_money', 'carte', 'virement')),
    date_paiement TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    utilisateur_id UUID REFERENCES utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_paiements_client ON paiements(client_id);
CREATE INDEX idx_paiements_vente ON paiements(vente_id);
CREATE INDEX idx_paiements_date ON paiements(date_paiement DESC);

ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paiements_select" ON paiements FOR SELECT TO authenticated USING (true);
CREATE POLICY "paiements_insert" ON paiements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "paiements_delete" ON paiements FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role = 'admin'));