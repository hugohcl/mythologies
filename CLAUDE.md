# Mythologies — Jeu d'orientation · Dosches

## Contexte
Week-end entre collègues le **29 mars 2025** à **La Ferme d'Octave, 1 rue de la Fontaine des Champs, 10220 Dosches**.
Thème : **Mythologies**. Jeu du samedi après-midi : course d'orientation dans le village.

## Fichier principal
`index.html` + `data.js` + `game.js` + `sw.js` — PWA mobile multi-fichiers.

## Équipes
| Équipe | Mascotte | Membres | Couleur | Route |
|--------|----------|---------|---------|-------|
| Grecque 🦉 | Antoine, Bastien, Matthieu, Thomas | #5a8fd4 | fresque → eglise → lavoir → salle |
| Nordique 🐦‍⬛ | Alex, Livia, Raphaël, Victor | #c8c8c8 | mairie → salle → fresque → lavoir |
| Hindoue 🐯 | Axel, Jade, LG, Patrick | #c080e8 | lavoir → mairie → eglise → fresque |

Toutes les équipes partent et arrivent à la **Ferme d'Octave**.

## Checkpoints
| ID | Nom | Code cachette |
|----|-----|---------------|
| fresque | La Fresque du portail | NORD |
| eglise | Église Saint-Jean-Baptiste | JEAN |
| lavoir | Le Lavoir | ONDE |
| salle | Salle Polyvalente de la Rose | ROSE |
| mairie | La Mairie | LOIS |
| ferme | La Ferme d'Octave | (arrivée) |

## Mécanique de jeu
1. Toutes les équipes démarrent à la Ferme — reçoivent leur 1er indice sur place
2. Les indices révèlent la **prochaine destination**
3. À chaque checkpoint : **énigme de localisation** → trouvent la cachette → **code 4 lettres** → débloque les indices suivants
4. 4 niveaux d'indices : I gratuit / II +3min / III +6min / IV +10min
5. Mauvaise destination tapée = +1 min
6. Connexion internet détectée = +30 min
7. Score = chrono + pénalités

## Code MJ
`ZEUS`

## GitHub Pages
- Repo : `hugohcl/mythologies` (branche `master`)
- URL : https://hugohcl.github.io/mythologies/
- Déploiement : push sur `master` → GitHub Pages sert automatiquement la racine du repo
- Service worker : chemins relatifs (`./sw.js`, `./data.js`, etc.) pour compatibilité sous-chemin

## Architecture du fichier index.html
Screens (divs avec class `screen hidden`) :
- `s1` — Sélection équipe
- `s2` — Vérification mode avion (obligatoire, vérifie `navigator.onLine`)
- `s3` — Briefing équipe
- `s4` — Countdown 3-2-1
- `s5` — Indices départ (depuis la Ferme)
- `s6` — En route (chrono visible)
- `sEnigme` — Énigme pour trouver la cachette physique
- `s7` — Saisie code 4 lettres
- `s8` — Indices vers prochaine destination
- `s9` — Arrivée + score
- `sSplash` — Splash screen (toucher pour commencer)
- `s10` — MJ Login (code ZEUS)
- `s11` — Mode MJ (4 onglets : Live / Indices / Quiz / Classement)
- `sTest` — Mode Test (navigation libre, accessible depuis MJ)

## Variables JS clés
```js
S = { team, idx, t0, pen, oh, iv, onPen, plog, mjST, mjIv, pendingTeam, quizAnswers, cpTimes }
TEAMS, CPS, HINTS, ENIGMES, QUIZ, LVL, ACC, CITS
```

## Fonctions JS clés
- `go(id)` — navigation entre screens
- `th(team)` — applique le thème couleur de l'équipe
- `selTeam(k)` — sélectionne une équipe (vérifie mode avion)
- `showEnigme(cpk)` — affiche l'énigme cachette
- `showCode(cpk)` — affiche la saisie du code
- `showHintsScreen(cpk)` — affiche les indices
- `showArrival()` — écran d'arrivée
- `openMJ()` — ouvre le mode MJ
- `switchMJTab(tab)` — navigation onglets MJ (live/indices/quiz/lb)
- `renderQuiz()`, `renderLB()` — quiz et classement MJ
- `openTestMode()`, `testGo(screenId)` — mode test
- `playSound(type)` — sons (success/error/penalty/hint/tick/fanfare)
- `toggleTheme()` — cycle dark → light → high-contrast
- `save()`, `loadSaved()` — persistance localStorage

## ENIGMES (placeholders à remplacer vendredi après repérage)
```js
var ENIGMES = {
  moulin: "...[placeholder]...",
  eglise: "...[placeholder]...",
  mairie: "...[placeholder]...",
  lavoir: "...[placeholder]..."
};
```
**ACTION REQUISE** : Remplacer les textes placeholder par les vraies énigmes après le repérage vendredi après-midi sur place.

## Bugs connus / points d'attention
- Safari crash si `innerHTML` contient des `onclick` avec quotes échappées (`\\'`) → toujours utiliser `createElement` + `addEventListener`
- `playBeep()` doit être appelé AVANT tout overlay/transition (AudioContext iOS)
- Mode avion : le bouton vérifie `navigator.onLine` en temps réel (ne pas faire confiance à l'utilisateur)
- Wake lock activé au démarrage du chrono

## Quiz
Supprimé de l'app — remplacé par un jeu d'anagrammes physique le jour J.
Les données QUIZ restent dans data.js mais les fonctions renderQuiz/renderLB ont été supprimées.

## Auto-deploy (Claude Code web → GitHub Pages)

Claude Code web ne peut pas push sur `master`. Le workflow est :
1. Claude push sur `claude/xxx`
2. GitHub Actions rebase sur master, crée une PR, et squash-merge automatiquement
3. GitHub Pages déploie depuis `master`

**Avant chaque push sur une branche `claude/xxx` déjà mergée :** rebaser sur master pour éviter les conflits post-squash :
```bash
git fetch origin master
git rebase origin/master
# Si rebase dit "all commits already upstream" et qu'il n'y a rien à push, c'est normal
git push --force-with-lease -u origin claude/xxx
# Si --force-with-lease échoue (branche supprimée) :
git push -f -u origin claude/xxx
```

## Règles de travail (apprises sur ce projet)

**Ne JAMAIS réécrire le fichier from scratch** — toujours patcher l'existant avec des str_replace ciblés. La réécriture introduit des régressions et consomme 10x plus de tokens.

**Toujours valider avant de livrer :**
1. `node --check` sur le JS extrait
2. Vérifier que tous les `getElementById('x')` ont un `id="x"` dans le HTML
3. Taille du fichier cohérente avec la version précédente

**Ne jamais mettre d'`onclick` inline avec des quotes imbriquées dans du HTML généré par JS** — ça crash Safari silencieusement. Toujours utiliser `createElement` + `addEventListener`.

**`playBeep()` doit être appelé avant tout overlay ou transition** — contrainte AudioContext iOS.

**Après chaque correction de bug : ajouter la cause et la règle ici.**

## Ce qui reste à faire
- [ ] Remplacer les énigmes cachettes par les vraies (vendredi repérage)
- [ ] Ajouter les photos des cachettes
- [ ] Vérifier que le son fonctionne sur iOS (AudioContext user gesture)
- [ ] Tester le mode avion sur vrais téléphones
- [ ] Préparer les 6 cachettes physiques avec les codes (NORD/JEAN/ONDE/ROSE/LOIS/FINI)
