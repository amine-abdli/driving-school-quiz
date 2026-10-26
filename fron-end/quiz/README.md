# route40 — quiz du code de la route

Application React pour créer des séries de 40 questions, s'entraîner au code de la route et consulter des corrections détaillées.

## Démarrer

```sh
npm install
npm start
```

## Fonctionnalités

- Une série de démonstration de 40 questions, avec réponses simples et multiples.
- Création et gestion locale des séries et de leurs 40 emplacements de questions.
- Questions illustrées en PNG, JPG ou WEBP (350 Ko maximum par image).
- Sauvegarde dans le stockage local du navigateur des séries et des quiz en cours.
- Navigation, repérage des questions à revoir, chronomètre, confirmation de soumission, score et corrections.
- OCR non inclus.

Les données sont conservées dans le navigateur utilisé. Le dossier `back-end` du dépôt ne contient pas encore d'API ni de schéma de base de données ; cette version ne synchronise donc pas les données entre appareils.

## Vérification

```sh
npm test -- --watchAll=false
npm run build
```
