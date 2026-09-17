CREATE TABLE IF NOT EXISTS achats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT UNIQUE NOT NULL,
    fournisseur_id UUID REFERENCES fournisseurs(id),
    date_achat DATE NOT NULL DEFAULT CURRENT_DATE,
    statut TEXT NOT NULL DEFAULT 'recu'
        CHECK (statut IN ('en_attente', 'recu', 'annule')),
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    montant_paye NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    utilisateur_id UUID REFERENCES utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lignes_achat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    achat_id UUID NOT NULL REFERENCES achats(id) ON DELETE CASCADE,
    variante_id UUID NOT NULL REFERENCES variantes(id),
    quantite INT NOT NULL CHECK (quantite > 0),
    prix_unitaire NUMERIC(10,2) NOT NULL,
    sous_total NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_achats_fournisseur ON achats(fournisseur_id);
CREATE INDEX idx_achats_date ON achats(date_achat DESC);
CREATE INDEX idx_lignes_achat_achat ON lignes_achat(achat_id);

CREATE TRIGGER trg_achats_updated_at BEFORE UPDATE ON achats
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE achats ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes_achat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achats_all" ON achats FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role IN ('admin','gerant')));
CREATE POLICY "lignes_achat_all" ON lignes_achat FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role IN ('admin','gerant')));