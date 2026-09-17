-- ============================================================
-- TBB FASHION — Schéma custom `tbb`
-- À exécuter dans Supabase → SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Créer le schéma custom
CREATE SCHEMA IF NOT EXISTS tbb;

-- ============================================================
-- 1. UTILISATEURS
-- ============================================================
CREATE TABLE IF NOT EXISTS tbb.utilisateurs (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nom TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telephone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'vendeur'
        CHECK (role IN ('admin', 'gerant', 'vendeur')),
    actif BOOLEAN NOT NULL DEFAULT true,
    derniere_connexion TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_utilisateurs_role ON tbb.utilisateurs(role);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_actif ON tbb.utilisateurs(actif);

-- Trigger updated_at générique
CREATE OR REPLACE FUNCTION tbb.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = tbb, public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Trigger création auto utilisateur
CREATE OR REPLACE FUNCTION tbb.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = tbb, public
AS $$
BEGIN
    INSERT INTO tbb.utilisateurs (id, nom, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nom', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'vendeur')
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION tbb.handle_new_user();

DROP TRIGGER IF EXISTS trg_utilisateurs_updated_at ON tbb.utilisateurs;
CREATE TRIGGER trg_utilisateurs_updated_at
    BEFORE UPDATE ON tbb.utilisateurs
    FOR EACH ROW EXECUTE FUNCTION tbb.set_updated_at();

-- ============================================================
-- 2. PARAMETRES BOUTIQUE
-- ============================================================
CREATE TABLE IF NOT EXISTS tbb.parametres_boutique (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    nom TEXT NOT NULL DEFAULT 'TBB Fashion',
    slogan TEXT,
    adresse TEXT,
    telephone TEXT,
    email TEXT,
    logo_url TEXT,
    devise TEXT NOT NULL DEFAULT 'FCFA',
    symbole_devise TEXT NOT NULL DEFAULT 'FCFA',
    tva NUMERIC(5,2) NOT NULL DEFAULT 0,
    seuil_alerte_stock INT NOT NULL DEFAULT 5,
    points_fidelite_par_1000 NUMERIC(5,2) NOT NULL DEFAULT 1,
    valeur_point_fidelite NUMERIC(10,2) NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO tbb.parametres_boutique (id) VALUES (1) ON CONFLICT DO NOTHING;

DROP TRIGGER IF EXISTS trg_parametres_updated_at ON tbb.parametres_boutique;
CREATE TRIGGER trg_parametres_updated_at
    BEFORE UPDATE ON tbb.parametres_boutique
    FOR EACH ROW EXECUTE FUNCTION tbb.set_updated_at();

-- ============================================================
-- 3. FOURNISSEURS
-- ============================================================
CREATE TABLE IF NOT EXISTS tbb.fournisseurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX IF NOT EXISTS idx_fournisseurs_nom ON tbb.fournisseurs(nom);

DROP TRIGGER IF EXISTS trg_fournisseurs_updated_at ON tbb.fournisseurs;
CREATE TRIGGER trg_fournisseurs_updated_at
    BEFORE UPDATE ON tbb.fournisseurs
    FOR EACH ROW EXECUTE FUNCTION tbb.set_updated_at();

-- ============================================================
-- 4. PRODUITS
-- ============================================================
CREATE TABLE IF NOT EXISTS tbb.produits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT UNIQUE NOT NULL,
    nom TEXT NOT NULL,
    marque TEXT,
    description TEXT,
    categorie TEXT NOT NULL
        CHECK (categorie IN ('homme', 'femme', 'enfant', 'unisexe')),
    type TEXT
        CHECK (type IN ('sport', 'ville', 'bottine', 'sandale', 'espadrille', 'basket', 'mocassin', 'autre')),
    saison TEXT CHECK (saison IN ('printemps', 'ete', 'automne', 'hiver', 'toutes')),
    prix_achat NUMERIC(10,2) NOT NULL DEFAULT 0,
    prix_vente NUMERIC(10,2) NOT NULL DEFAULT 0,
    image_url TEXT,
    images TEXT[],
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_produits_reference ON tbb.produits(reference);
CREATE INDEX IF NOT EXISTS idx_produits_marque ON tbb.produits(marque);
CREATE INDEX IF NOT EXISTS idx_produits_categorie ON tbb.produits(categorie);
CREATE INDEX IF NOT EXISTS idx_produits_actif ON tbb.produits(actif);

DROP TRIGGER IF EXISTS trg_produits_updated_at ON tbb.produits;
CREATE TRIGGER trg_produits_updated_at
    BEFORE UPDATE ON tbb.produits
    FOR EACH ROW EXECUTE FUNCTION tbb.set_updated_at();

-- ============================================================
-- 5. VARIANTES
-- ============================================================
CREATE TABLE IF NOT EXISTS tbb.variantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produit_id UUID NOT NULL REFERENCES tbb.produits(id) ON DELETE CASCADE,
    pointure NUMERIC(4,1) NOT NULL,
    couleur TEXT NOT NULL,
    code_barre TEXT UNIQUE,
    prix_vente NUMERIC(10,2) NOT NULL,
    prix_achat NUMERIC(10,2) NOT NULL DEFAULT 0,
    sku TEXT UNIQUE,
    actif BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (produit_id, pointure, couleur)
);

CREATE INDEX IF NOT EXISTS idx_variantes_produit ON tbb.variantes(produit_id);
CREATE INDEX IF NOT EXISTS idx_variantes_pointure ON tbb.variantes(pointure);
CREATE INDEX IF NOT EXISTS idx_variantes_code_barre ON tbb.variantes(code_barre);

DROP TRIGGER IF EXISTS trg_variantes_updated_at ON tbb.variantes;
CREATE TRIGGER trg_variantes_updated_at
    BEFORE UPDATE ON tbb.variantes
    FOR EACH ROW EXECUTE FUNCTION tbb.set_updated_at();

-- ============================================================
-- 6. STOCK
-- ============================================================
CREATE TABLE IF NOT EXISTS tbb.stock (
    variante_id UUID PRIMARY KEY REFERENCES tbb.variantes(id) ON DELETE CASCADE,
    quantite INT NOT NULL DEFAULT 0 CHECK (quantite >= 0),
    seuil_alerte INT NOT NULL DEFAULT 5,
    emplacement TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_quantite ON tbb.stock(quantite);

DROP TRIGGER IF EXISTS trg_stock_updated_at ON tbb.stock;
CREATE TRIGGER trg_stock_updated_at
    BEFORE UPDATE ON tbb.stock
    FOR EACH ROW EXECUTE FUNCTION tbb.set_updated_at();

CREATE OR REPLACE FUNCTION tbb.creer_stock_variante()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = tbb, public
AS $$
BEGIN
    INSERT INTO tbb.stock (variante_id, quantite, seuil_alerte)
    VALUES (
        NEW.id,
        0,
        COALESCE((SELECT seuil_alerte_stock FROM tbb.parametres_boutique WHERE id = 1), 5)
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_variante_stock ON tbb.variantes;
CREATE TRIGGER trg_variante_stock
    AFTER INSERT ON tbb.variantes
    FOR EACH ROW EXECUTE FUNCTION tbb.creer_stock_variante();

CREATE TABLE IF NOT EXISTS tbb.mouvements_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variante_id UUID NOT NULL REFERENCES tbb.variantes(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('entree', 'sortie', 'ajustement', 'retour', 'perte')),
    quantite INT NOT NULL,
    quantite_avant INT NOT NULL,
    quantite_apres INT NOT NULL,
    motif TEXT,
    reference_id UUID,
    reference_type TEXT,
    utilisateur_id UUID REFERENCES tbb.utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mouvements_variante ON tbb.mouvements_stock(variante_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_date ON tbb.mouvements_stock(created_at DESC);

-- ============================================================
-- 7. CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS tbb.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE INDEX IF NOT EXISTS idx_clients_nom ON tbb.clients(nom);
CREATE INDEX IF NOT EXISTS idx_clients_telephone ON tbb.clients(telephone);

DROP TRIGGER IF EXISTS trg_clients_updated_at ON tbb.clients;
CREATE TRIGGER trg_clients_updated_at
    BEFORE UPDATE ON tbb.clients
    FOR EACH ROW EXECUTE FUNCTION tbb.set_updated_at();

-- ============================================================
-- 8. ACHATS
-- ============================================================
CREATE TABLE IF NOT EXISTS tbb.achats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT UNIQUE NOT NULL,
    fournisseur_id UUID REFERENCES tbb.fournisseurs(id),
    date_achat DATE NOT NULL DEFAULT CURRENT_DATE,
    statut TEXT NOT NULL DEFAULT 'recu'
        CHECK (statut IN ('en_attente', 'recu', 'annule')),
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    montant_paye NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    utilisateur_id UUID REFERENCES tbb.utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tbb.lignes_achat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    achat_id UUID NOT NULL REFERENCES tbb.achats(id) ON DELETE CASCADE,
    variante_id UUID NOT NULL REFERENCES tbb.variantes(id),
    quantite INT NOT NULL CHECK (quantite > 0),
    prix_unitaire NUMERIC(10,2) NOT NULL,
    sous_total NUMERIC(12,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_achats_fournisseur ON tbb.achats(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_achats_date ON tbb.achats(date_achat DESC);
CREATE INDEX IF NOT EXISTS idx_lignes_achat_achat ON tbb.lignes_achat(achat_id);

DROP TRIGGER IF EXISTS trg_achats_updated_at ON tbb.achats;
CREATE TRIGGER trg_achats_updated_at
    BEFORE UPDATE ON tbb.achats
    FOR EACH ROW EXECUTE FUNCTION tbb.set_updated_at();

-- ============================================================
-- 9. VENTES
-- ============================================================
CREATE TABLE IF NOT EXISTS tbb.ventes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES tbb.clients(id),
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
    utilisateur_id UUID REFERENCES tbb.utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tbb.lignes_vente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vente_id UUID NOT NULL REFERENCES tbb.ventes(id) ON DELETE CASCADE,
    variante_id UUID NOT NULL REFERENCES tbb.variantes(id),
    quantite INT NOT NULL CHECK (quantite > 0),
    prix_unitaire NUMERIC(10,2) NOT NULL,
    remise NUMERIC(10,2) NOT NULL DEFAULT 0,
    sous_total NUMERIC(12,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ventes_client ON tbb.ventes(client_id);
CREATE INDEX IF NOT EXISTS idx_ventes_date ON tbb.ventes(date_vente DESC);
CREATE INDEX IF NOT EXISTS idx_ventes_statut ON tbb.ventes(statut);
CREATE INDEX IF NOT EXISTS idx_lignes_vente_vente ON tbb.lignes_vente(vente_id);
CREATE INDEX IF NOT EXISTS idx_lignes_vente_variante ON tbb.lignes_vente(variante_id);

DROP TRIGGER IF EXISTS trg_ventes_updated_at ON tbb.ventes;
CREATE TRIGGER trg_ventes_updated_at
    BEFORE UPDATE ON tbb.ventes
    FOR EACH ROW EXECUTE FUNCTION tbb.set_updated_at();

-- ============================================================
-- 10. PAIEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS tbb.paiements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT UNIQUE NOT NULL,
    client_id UUID REFERENCES tbb.clients(id),
    vente_id UUID REFERENCES tbb.ventes(id),
    achat_id UUID REFERENCES tbb.achats(id),
    montant NUMERIC(12,2) NOT NULL CHECK (montant > 0),
    mode TEXT NOT NULL CHECK (mode IN ('especes', 'mobile_money', 'carte', 'virement')),
    date_paiement TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    utilisateur_id UUID REFERENCES tbb.utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paiements_client ON tbb.paiements(client_id);
CREATE INDEX IF NOT EXISTS idx_paiements_vente ON tbb.paiements(vente_id);
CREATE INDEX IF NOT EXISTS idx_paiements_date ON tbb.paiements(date_paiement DESC);

-- ============================================================
-- 11. DETTES
-- ============================================================
CREATE TABLE IF NOT EXISTS tbb.dettes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES tbb.clients(id) ON DELETE CASCADE,
    vente_id UUID REFERENCES tbb.ventes(id),
    montant_initial NUMERIC(12,2) NOT NULL,
    montant_restant NUMERIC(12,2) NOT NULL,
    date_echeance DATE,
    statut TEXT NOT NULL DEFAULT 'impayee'
        CHECK (statut IN ('impayee', 'partielle', 'payee', 'annulee')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dettes_client ON tbb.dettes(client_id);
CREATE INDEX IF NOT EXISTS idx_dettes_statut ON tbb.dettes(statut);

DROP TRIGGER IF EXISTS trg_dettes_updated_at ON tbb.dettes;
CREATE TRIGGER trg_dettes_updated_at
    BEFORE UPDATE ON tbb.dettes
    FOR EACH ROW EXECUTE FUNCTION tbb.set_updated_at();

-- ============================================================
-- 12. RETOURS
-- ============================================================
CREATE TABLE IF NOT EXISTS tbb.retours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference TEXT UNIQUE NOT NULL,
    vente_id UUID NOT NULL REFERENCES tbb.ventes(id),
    client_id UUID REFERENCES tbb.clients(id),
    date_retour TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    motif TEXT NOT NULL CHECK (motif IN ('defectueux', 'mauvaise_taille', 'changement_avis', 'erreur', 'autre')),
    description TEXT,
    montant_rembourse NUMERIC(12,2) NOT NULL DEFAULT 0,
    type_remboursement TEXT CHECK (type_remboursement IN ('especes', 'avoir', 'echange')),
    statut TEXT NOT NULL DEFAULT 'en_attente'
        CHECK (statut IN ('en_attente', 'valide', 'refuse', 'termine')),
    utilisateur_id UUID REFERENCES tbb.utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tbb.lignes_retour (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retour_id UUID NOT NULL REFERENCES tbb.retours(id) ON DELETE CASCADE,
    variante_id UUID NOT NULL REFERENCES tbb.variantes(id),
    quantite INT NOT NULL CHECK (quantite > 0),
    prix_unitaire NUMERIC(10,2) NOT NULL,
    sous_total NUMERIC(12,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_retours_vente ON tbb.retours(vente_id);
CREATE INDEX IF NOT EXISTS idx_retours_date ON tbb.retours(date_retour DESC);

DROP TRIGGER IF EXISTS trg_retours_updated_at ON tbb.retours;
CREATE TRIGGER trg_retours_updated_at
    BEFORE UPDATE ON tbb.retours
    FOR EACH ROW EXECUTE FUNCTION tbb.set_updated_at();

-- ============================================================
-- 13. FIDELITE
-- ============================================================
CREATE TABLE IF NOT EXISTS tbb.fidelite_mouvements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES tbb.clients(id) ON DELETE CASCADE,
    points NUMERIC(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('gain', 'utilisation', 'expiration', 'ajustement')),
    vente_id UUID REFERENCES tbb.ventes(id),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fidelite_client ON tbb.fidelite_mouvements(client_id);
CREATE INDEX IF NOT EXISTS idx_fidelite_date ON tbb.fidelite_mouvements(created_at DESC);

-- ============================================================
-- 14. FINANCES
-- ============================================================
CREATE TABLE IF NOT EXISTS tbb.transactions_financieres (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('revenu', 'depense')),
    categorie TEXT NOT NULL,
    montant NUMERIC(12,2) NOT NULL CHECK (montant > 0),
    description TEXT,
    mode_paiement TEXT CHECK (mode_paiement IN ('especes', 'mobile_money', 'carte', 'virement')),
    reference_id UUID,
    reference_type TEXT,
    date_transaction TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    utilisateur_id UUID REFERENCES tbb.utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_type ON tbb.transactions_financieres(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON tbb.transactions_financieres(date_transaction DESC);

CREATE TABLE IF NOT EXISTS tbb.caisse (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_jour DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
    fond_ouverture NUMERIC(12,2) NOT NULL DEFAULT 0,
    entrees NUMERIC(12,2) NOT NULL DEFAULT 0,
    sorties NUMERIC(12,2) NOT NULL DEFAULT 0,
    solde_theorique NUMERIC(12,2) NOT NULL DEFAULT 0,
    solde_reel NUMERIC(12,2),
    ecart NUMERIC(12,2),
    notes TEXT,
    utilisateur_id UUID REFERENCES tbb.utilisateurs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_caisse_updated_at ON tbb.caisse;
CREATE TRIGGER trg_caisse_updated_at
    BEFORE UPDATE ON tbb.caisse
    FOR EACH ROW EXECUTE FUNCTION tbb.set_updated_at();

-- ============================================================
-- 15. RLS
-- ============================================================
ALTER TABLE tbb.utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.parametres_boutique ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.fournisseurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.variantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.mouvements_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.achats ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.lignes_achat ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.ventes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.lignes_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.dettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.retours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.lignes_retour ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.fidelite_mouvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.transactions_financieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE tbb.caisse ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION tbb.auth_role()
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = tbb, public
AS $$
    SELECT role FROM tbb.utilisateurs WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION tbb.is_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = tbb, public
AS $$
    SELECT COALESCE((SELECT role = 'admin' FROM tbb.utilisateurs WHERE id = auth.uid()), false);
$$;

CREATE OR REPLACE FUNCTION tbb.can_manage()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = tbb, public
AS $$
    SELECT COALESCE((SELECT role IN ('admin','gerant') FROM tbb.utilisateurs WHERE id = auth.uid()), false);
$$;

-- ----- Policies -----
DROP POLICY IF EXISTS utilisateurs_select ON tbb.utilisateurs;
CREATE POLICY utilisateurs_select ON tbb.utilisateurs
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS utilisateurs_update ON tbb.utilisateurs;
CREATE POLICY utilisateurs_update ON tbb.utilisateurs
    FOR UPDATE TO authenticated USING (tbb.is_admin());

DROP POLICY IF EXISTS parametres_select ON tbb.parametres_boutique;
CREATE POLICY parametres_select ON tbb.parametres_boutique
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS parametres_update ON tbb.parametres_boutique;
CREATE POLICY parametres_update ON tbb.parametres_boutique
    FOR UPDATE TO authenticated USING (tbb.is_admin());

DROP POLICY IF EXISTS produits_select ON tbb.produits;
CREATE POLICY produits_select ON tbb.produits FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS produits_modif ON tbb.produits;
CREATE POLICY produits_modif ON tbb.produits FOR ALL TO authenticated
    USING (tbb.can_manage()) WITH CHECK (tbb.can_manage());

DROP POLICY IF EXISTS variantes_select ON tbb.variantes;
CREATE POLICY variantes_select ON tbb.variantes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS variantes_modif ON tbb.variantes;
CREATE POLICY variantes_modif ON tbb.variantes FOR ALL TO authenticated
    USING (tbb.can_manage()) WITH CHECK (tbb.can_manage());

DROP POLICY IF EXISTS stock_select ON tbb.stock;
CREATE POLICY stock_select ON tbb.stock FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS stock_modif ON tbb.stock;
CREATE POLICY stock_modif ON tbb.stock FOR ALL TO authenticated
    USING (tbb.can_manage()) WITH CHECK (tbb.can_manage());

DROP POLICY IF EXISTS clients_select ON tbb.clients;
CREATE POLICY clients_select ON tbb.clients FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS clients_modif ON tbb.clients;
CREATE POLICY clients_modif ON tbb.clients FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS ventes_select ON tbb.ventes;
CREATE POLICY ventes_select ON tbb.ventes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS ventes_insert ON tbb.ventes;
CREATE POLICY ventes_insert ON tbb.ventes FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS ventes_update ON tbb.ventes;
CREATE POLICY ventes_update ON tbb.ventes FOR UPDATE TO authenticated USING (tbb.can_manage());

DROP POLICY IF EXISTS ventes_delete ON tbb.ventes;
CREATE POLICY ventes_delete ON tbb.ventes FOR DELETE TO authenticated USING (tbb.is_admin());

DROP POLICY IF EXISTS lignes_vente_select ON tbb.lignes_vente;
CREATE POLICY lignes_vente_select ON tbb.lignes_vente FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS lignes_vente_insert ON tbb.lignes_vente;
CREATE POLICY lignes_vente_insert ON tbb.lignes_vente FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS lignes_vente_delete ON tbb.lignes_vente;
CREATE POLICY lignes_vente_delete ON tbb.lignes_vente FOR DELETE TO authenticated USING (tbb.can_manage());

DROP POLICY IF EXISTS paiements_select ON tbb.paiements;
CREATE POLICY paiements_select ON tbb.paiements FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS paiements_insert ON tbb.paiements;
CREATE POLICY paiements_insert ON tbb.paiements FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS paiements_delete ON tbb.paiements;
CREATE POLICY paiements_delete ON tbb.paiements FOR DELETE TO authenticated USING (tbb.is_admin());

DROP POLICY IF EXISTS dettes_select ON tbb.dettes;
CREATE POLICY dettes_select ON tbb.dettes FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS dettes_all ON tbb.dettes;
CREATE POLICY dettes_all ON tbb.dettes FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS fournisseurs_all ON tbb.fournisseurs;
CREATE POLICY fournisseurs_all ON tbb.fournisseurs FOR ALL TO authenticated
    USING (tbb.can_manage()) WITH CHECK (tbb.can_manage());

DROP POLICY IF EXISTS achats_all ON tbb.achats;
CREATE POLICY achats_all ON tbb.achats FOR ALL TO authenticated
    USING (tbb.can_manage()) WITH CHECK (tbb.can_manage());

DROP POLICY IF EXISTS lignes_achat_all ON tbb.lignes_achat;
CREATE POLICY lignes_achat_all ON tbb.lignes_achat FOR ALL TO authenticated
    USING (tbb.can_manage()) WITH CHECK (tbb.can_manage());

DROP POLICY IF EXISTS mouvements_select ON tbb.mouvements_stock;
CREATE POLICY mouvements_select ON tbb.mouvements_stock FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS mouvements_insert ON tbb.mouvements_stock;
CREATE POLICY mouvements_insert ON tbb.mouvements_stock FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS retours_all ON tbb.retours;
CREATE POLICY retours_all ON tbb.retours FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS lignes_retour_all ON tbb.lignes_retour;
CREATE POLICY lignes_retour_all ON tbb.lignes_retour FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS fidelite_all ON tbb.fidelite_mouvements;
CREATE POLICY fidelite_all ON tbb.fidelite_mouvements FOR ALL TO authenticated
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS finances_all ON tbb.transactions_financieres;
CREATE POLICY finances_all ON tbb.transactions_financieres FOR ALL TO authenticated
    USING (tbb.can_manage()) WITH CHECK (tbb.can_manage());

DROP POLICY IF EXISTS caisse_all ON tbb.caisse;
CREATE POLICY caisse_all ON tbb.caisse FOR ALL TO authenticated
    USING (tbb.can_manage()) WITH CHECK (tbb.can_manage());

-- ============================================================
-- 16. DONNEES INITIALES
-- ============================================================
UPDATE tbb.parametres_boutique SET
    nom = 'TBB Fashion',
    slogan = 'La chaussure qui vous ressemble',
    devise = 'FCFA',
    symbole_devise = 'FCFA',
    seuil_alerte_stock = 5
WHERE id = 1;

INSERT INTO tbb.fournisseurs (nom, contact_nom, telephone, ville) VALUES
    ('Nike Distribution', 'Moussa Traoré', '+223 70 00 00 01', 'Bamako'),
    ('Adidas West Africa', 'Aminata Keita', '+223 70 00 00 02', 'Bamako'),
    ('Sneakers Import', 'Ibrahim Coulibaly', '+223 70 00 00 03', 'Bamako')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 17. PERMISSIONS AUX ROLES
-- ============================================================
GRANT USAGE ON SCHEMA tbb TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA tbb TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA tbb TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA tbb TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA tbb
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA tbb
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA tbb
    GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- Fin