CREATE TABLE IF NOT EXISTS retours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT UNIQUE NOT NULL,
    vente_id UUID NOT NULL REFERENCES ventes(id),
    client_id UUID REFERENCES clients(id),
    date_retour TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    motif TEXT NOT NULL CHECK (motif IN ('defectueux', 'mauvaise_taille', 'changement_avis', 'erreur', 'autre')),
    description TEXT,
    montant_rembourse NUMERIC(12,2) NOT NULL DEFAULT 0,
    type_remboursement TEXT CHECK (type_remboursement IN ('especes', 'avoir', 'echange')),
    statut TEXT NOT NULL DEFAULT 'en_attente'
        CHECK (statut IN ('en_attente', 'valide', 'refuse', 'termine')),
    utilisateur_id UUID REFERENCES utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lignes_retour (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    retour_id UUID NOT NULL REFERENCES retours(id) ON DELETE CASCADE,
    variante_id UUID NOT NULL REFERENCES variantes(id),
    quantite INT NOT NULL CHECK (quantite > 0),
    prix_unitaire NUMERIC(10,2) NOT NULL,
    sous_total NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_retours_vente ON retours(vente_id);
CREATE INDEX idx_retours_date ON retours(date_retour DESC);

CREATE TRIGGER trg_retours_updated_at BEFORE UPDATE ON retours
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE retours ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes_retour ENABLE ROW LEVEL SECURITY;

CREATE POLICY "retours_all" ON retours FOR ALL TO authenticated USING (true);
CREATE POLICY "lignes_retour_all" ON lignes_retour FOR ALL TO authenticated USING (true);