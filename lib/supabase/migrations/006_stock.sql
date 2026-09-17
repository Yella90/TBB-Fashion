-- ============================================
-- Stock par variante + mouvements
-- ============================================
CREATE TABLE IF NOT EXISTS stock (
    variante_id UUID PRIMARY KEY REFERENCES variantes(id) ON DELETE CASCADE,
    quantite INT NOT NULL DEFAULT 0 CHECK (quantite >= 0),
    seuil_alerte INT NOT NULL DEFAULT 5,
    emplacement TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_quantite ON stock(quantite);

CREATE TRIGGER trg_stock_updated_at
    BEFORE UPDATE ON stock
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Créer automatiquement une ligne stock à la création d'une variante
CREATE OR REPLACE FUNCTION creer_stock_variante()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO stock (variante_id, quantite, seuil_alerte)
    VALUES (
        NEW.id,
        0,
        COALESCE((SELECT seuil_alerte_stock FROM parametres_boutique WHERE id = 1), 5)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_variante_stock
    AFTER INSERT ON variantes
    FOR EACH ROW EXECUTE FUNCTION creer_stock_variante();

-- Mouvements de stock (audit)
CREATE TABLE IF NOT EXISTS mouvements_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variante_id UUID NOT NULL REFERENCES variantes(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('entree', 'sortie', 'ajustement', 'retour', 'perte')),
    quantite INT NOT NULL,
    quantite_avant INT NOT NULL,
    quantite_apres INT NOT NULL,
    motif TEXT,
    reference_id UUID,                       -- vente, achat, retour...
    reference_type TEXT,
    utilisateur_id UUID REFERENCES utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mouvements_variante ON mouvements_stock(variante_id);
CREATE INDEX idx_mouvements_date ON mouvements_stock(created_at DESC);

ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE mouvements_stock ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stock_select" ON stock FOR SELECT TO authenticated USING (true);
CREATE POLICY "stock_modif" ON stock FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM utilisateurs WHERE id = auth.uid() AND role IN ('admin','gerant','vendeur')));

CREATE POLICY "mouvements_select" ON mouvements_stock FOR SELECT TO authenticated USING (true);
CREATE POLICY "mouvements_insert" ON mouvements_stock FOR INSERT TO authenticated WITH CHECK (true);