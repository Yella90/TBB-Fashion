CREATE TABLE IF NOT EXISTS ventes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id),
    date_vente TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sous_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    remise NUMERIC(12,2) NOT NULL DEFAULT 0,
    tva NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    montant_paye NUMERIC(12,2) NOT NULL DEFAULT 0,
    reste_a_payer NUMERIC(12,2) NOT NULL DEFAULT 0,
    mode_paiement TEXT CHECK (mode_paiement IN ('especes', 'mobile_money', 'carte', 'virement', 'credit', 'mixte')),
    statut TEXT NOT NULL DEFAULT 'payee'
        CHECK (statut IN ('payee', 'partielle', 'impayee', 'annulee')),
    points_fidelite_gagnes NUMERIC(10,2) DEFAULT 0,
    notes TEXT,
    utilisateur_id UUID REFERENCES utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lignes_vente (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vente_id UUID NOT NULL REFERENCES ventes(id) ON DELETE CASCADE,
    variante_id UUID NOT NULL REFERENCES variantes(id),
    quantite INT NOT NULL CHECK (quantite > 0),
    prix_unitaire NUMERIC(10,2) NOT NULL,
    remise NUMERIC(10,2) NOT NULL DEFAULT 0,
    sous_total NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_ventes_client ON ventes(client_id);
CREATE INDEX idx_ventes_date ON ventes(date_vente DESC);
CREATE INDEX idx_ventes_statut ON ventes(statut);
CREATE INDEX idx_lignes_vente_vente ON lignes_vente(vente_id);
CREATE INDEX idx_lignes_vente_variante ON lignes_vente(variante_id);

CREATE TRIGGER trg_ventes_updated_at BEFORE UPDATE ON ventes
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE ventes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes_vente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ventes_select" ON ventes FOR SELECT TO authenticated USING (true);
CREATE POLICY "ventes_insert" ON ventes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "ventes_update" ON ventes FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role IN ('admin','gerant')));
CREATE POLICY "ventes_delete" ON ventes FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "lignes_vente_select" ON lignes_vente FOR SELECT TO authenticated USING (true);
CREATE POLICY "lignes_vente_insert" ON lignes_vente FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lignes_vente_delete" ON lignes_vente FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role IN ('admin','gerant')));