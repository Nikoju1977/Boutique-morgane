# Morgane medium

Site statique français : accueil féerique, boutique de Morgane, Tarot de Morgane, Œil d’Hermès de Morgane et guide de 20 pierres.

## Pages
- `/` : accueil
- `/boutique/` : neuf créations, photos et prix repris du dépôt original ; préparation de demande de commande, sans paiement en ligne.
- `/tarot/` : application Tarot de Morgane, 78 arcanes et lecture locale ; IA facultative via clé personnelle selon l’interface existante.
- `/horus/` : intégration de l’Œil d’Hermès rebaptisée Œil d’Hermès de Morgane à la demande du propriétaire. Calculs locaux et grimoire ; IA facultative via clé personnelle.
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
Le dossier `dist` est généré avec `npm run build` pour la publication Sites. Les pages à la racine restent utilisables comme vitrine statique sur GitHub Pages ; la gestion et les informations enregistrées nécessitent l’hébergement Worker.

## Compléments Morgane
- `/consultation/` : présentation de la consultation médium, questions fréquentes et préparation de demande. Aucune réservation ni envoi automatique.
- `/morgane/` : présentation de l’univers sans biographie inventée.
- `/contact/` : préparation de message, copie locale.
- `/confidentialite/` : fonctionnement des formulaires, stockage local et services externes.
Les noms visibles des outils sont au nom de Morgane. Les crédits des applications sources et leur licence restent conservés dans la documentation. Les tarifs, modalités exactes et coordonnées des consultations doivent être fournis par Morgane.

## Gestion autonome
`/admin/` permet de modifier la présentation, les contacts, les modalités et les prestations avec prix, durée et visibilité. Les changements sont enregistrés dans Cloudflare D1 et lus par les pages du site. Authentification ChatGPT et autorisation serveur : propriétaire identifié par `SITE_OWNER_EMAIL` (variable privée), ou compte de gestion enregistré par le propriétaire. Le compte de Morgane doit aussi recevoir l’accès au site dans les réglages de partage. Aucun e-mail d’invitation n’est envoyé par l’application.

`npm run db:generate` produit les migrations ; `npm run build` construit le Worker et les assets. Les données D1 ne sont pas remplacées lors d’une publication. Les formulaires visiteurs ne sont pas stockés : ils préparent une demande, avec ouverture d’e-mail ou WhatsApp si ces coordonnées ont été renseignées. Un lien d’agenda existant peut être publié.
