CREATE TABLE IF NOT EXISTS transactions_financieres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('revenu', 'depense')),
    categorie TEXT NOT NULL,
    montant NUMERIC(12,2) NOT NULL CHECK (montant > 0),
    description TEXT,
    mode_paiement TEXT CHECK (mode_paiement IN ('especes', 'mobile_money', 'carte', 'virement')),
    reference_id UUID,
    reference_type TEXT,
    date_transaction TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    utilisateur_id UUID REFERENCES utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_type ON transactions_financieres(type);
CREATE INDEX idx_transactions_date ON transactions_financieres(date_transaction DESC);

CREATE TABLE IF NOT EXISTS caisse (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date_jour DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
    fond_ouverture NUMERIC(12,2) NOT NULL DEFAULT 0,
    entrees NUMERIC(12,2) NOT NULL DEFAULT 0,
    sorties NUMERIC(12,2) NOT NULL DEFAULT 0,
    solde_theorique NUMERIC(12,2) NOT NULL DEFAULT 0,
    solde_reel NUMERIC(12,2),
    ecart NUMERIC(12,2),
    notes TEXT,
    utilisateur_id UUID REFERENCES utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_caisse_updated_at BEFORE UPDATE ON caisse
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE transactions_financieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE caisse ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_all" ON transactions_financieres FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role IN ('admin','gerant')));
CREATE POLICY "caisse_all" ON caisse FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role IN ('admin','gerant')));