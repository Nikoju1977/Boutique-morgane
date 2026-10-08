# Morgane medium

Site statique français : accueil féerique, boutique de Morgane, Tarot de Niko, Œil d’Horus et guide de 20 pierres.

## Pages
- `/` : accueil
- `/boutique/` : neuf créations, photos et prix repris du dépôt original ; préparation de demande de commande, sans paiement en ligne.
- `/tarot/` : application Tarot de Niko, 78 arcanes et lecture locale ; IA facultative via clé personnelle selon l’interface existante.
- `/horus/` : intégration de l’Œil d’Hermès rebaptisée Œil d’Horus à la demande du propriétaire. Calculs locaux et grimoire ; IA facultative via clé personnelle.
- `/lithotherapie/` : 20 fiches avec recherche, filtres, références minéralogiques et entretien ; symbolique distinguée des propriétés physiques.

## Lancer
`python3 -m http.server 8000` puis ouvrir le serveur local. Aucun build n’est nécessaire.

## État commercial
Le site reprend les tarifs existants sans inventer de stock. Les demandes se copient pour transmission en message privé à Morgane ; aucun message n’est envoyé automatiquement et aucun paiement n’est encaissé. Le lien de contact de Morgane, l’identité légale et les modalités commerciales restent à fournir avant ouverture commerciale complète.

## Origines
- Boutique : Nikoju1977/Boutique-morgane
- Tarot : Nikoju1977/tarot-de-niko ; licence conservée dans tarot/LICENSE
- Grimoire : Nikoju1977/oeil-hermes ; crédits Lyssa Jung et Niko conservés
- Illustration de forêt : création générée pour Morgane medium.

Les fonctions IA restent optionnelles, sans clé serveur intégrée ni promesse de fonctionnement sans compte fournisseur. Ne jamais ajouter de secret au dépôt.

## Aperçu hébergé
Le dossier `dist` est synchronisé avec `python3 build-static.py` pour la publication Sites. Les pages à la racine restent utilisables sur GitHub Pages.
