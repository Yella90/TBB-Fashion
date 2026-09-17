-- ============================================
-- Données de démarrage TBB Fashion
-- ============================================

-- Paramètres boutique
UPDATE parametres_boutique SET
    nom = 'TBB Fashion',
    slogan = 'La chaussure qui vous ressemble',
    devise = 'FCFA',
    symbole_devise = 'FCFA',
    seuil_alerte_stock = 5
WHERE id = 1;

-- Exemples de fournisseurs
INSERT INTO fournisseurs (nom, contact_nom, telephone, ville) VALUES
    ('Nike Distribution', 'Moussa Traoré', '+223 70 00 00 01', 'Bamako'),
    ('Adidas West Africa', 'Aminata Keita', '+223 70 00 00 02', 'Bamako'),
    ('Sneakers Import', 'Ibrahim Coulibaly', '+223 70 00 00 03', 'Bamako')
ON CONFLICT DO NOTHING;