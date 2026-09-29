# Chooser

PWA très basique pour choisir entre deux options.

## Fonctionnement

- Entrer deux options (texte libre) dans les champs Option A / Option B.
- Appuyer sur **Choisir** : tirage 100% aléatoire entre les deux.
- Réglage caché : appui long (~700ms) sur le titre "Chooser" ouvre un panneau permettant de prédéterminer quelle option gagne. Si ce réglage n'est pas activé, le tirage reste totalement aléatoire.

## Installation en PWA

Servir le dossier en HTTPS (ou via `localhost`) puis utiliser "Ajouter à l'écran d'accueil" / "Installer l'application" depuis le navigateur. L'app fonctionne hors-ligne grâce au service worker (`sw.js`).

## Structure

- `index.html` — structure de la page
- `style.css` — styles
- `app.js` — logique (tirage, réglage caché, persistance locale, enregistrement du service worker)
- `sw.js` — service worker (cache de l'app shell)
- `manifest.json` — manifeste PWA
- `icons/` — icônes 192x192 et 512x512
