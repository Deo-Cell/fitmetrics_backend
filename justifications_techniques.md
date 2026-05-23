# Justifications Techniques — Projet FitMetrics

Ce document justifie l'ensemble des choix techniques, architecturaux et méthodologiques réalisés pour la construction, la sécurisation et le déploiement de l'API FitMetrics, en conformité avec les exigences du module CI/CD & DevOps.

---

## 1. Architecture Applicative (4-Tiers)

L'application respecte strictement une architecture en **4 couches (4-tier architecture)** pour garantir la séparation des responsabilités (Single Responsibility Principle) et faciliter les tests unitaires :

1. **Routes (`src/routes`)** : Définissent uniquement les chemins HTTP, appliquent les middlewares (ex: authentification) et redirigent vers le bon Controller.
2. **Controllers (`src/controllers`)** : Gèrent l'objet requête (`req`) et réponse (`res`), valident les paramètres d'entrée de base, et délèguent la logique complexe aux Services. Ils gèrent également le formatage des codes d'erreur HTTP (400, 404, 500, etc.).
3. **Services (`src/services`)** : Contiennent toute la **logique métier** (Business Logic) pure. Ils ne connaissent ni Express (HTTP) ni la base de données directement.
4. **Repositories (`src/repositories`)** : Abstraient l'accès aux données (Sequelize/PostgreSQL). Si l'on décide de changer d'ORM demain, seul le dossier `repositories` sera impacté.

---

## 2. Design Patterns Implémentés

Plusieurs patrons de conception du GoF (Gang of Four) ont été appliqués de manière justifiée :

1. **Repository Pattern** (`src/repositories`) : 
   - *Justification* : Isole la logique d'accès aux données. Le `BaseRepository.js` factorise les opérations CRUD communes, tandis que les repositories spécifiques (ex: `WorkoutRepository`) implémentent les requêtes complexes.
2. **Singleton Pattern** (`src/config/logger.js` et `src/config/db.js`) : 
   - *Justification* : Garantit qu'une seule instance de connexion à la base de données et une seule instance de Logger (Winston) soient créées durant tout le cycle de vie de l'application, évitant ainsi les fuites de mémoire.
3. **Strategy Pattern** (`src/strategies/calculator`) : 
   - *Justification* : Permet d'interchanger les algorithmes de calcul mathématique (ex: Epley vs Brzycki pour la force maximale, Mifflin vs Harris-Benedict pour les calories) sans modifier les classes qui les utilisent. Très utile pour l'extensibilité.
4. **Factory Pattern** (`src/factories/WorkoutSetFactory.js`) : 
   - *Justification* : Centralise la logique complexe de création d'un "Set" d'exercice. Un set de cardio (distance, temps) a des règles de validation différentes d'un set de musculation (poids, répétitions). La factory masque cette complexité.
5. **Observer Pattern** (`src/controllers/WorkoutController.js` et `src/services/WorkoutService.js`) : 
   - *Justification* : Lorsque qu'une séance de sport (`workout`) est terminée, nous devons recalculer les statistiques de l'utilisateur. Au lieu de coupler fortement les deux services, le `WorkoutService` émet un événement asynchrone `'workout:completed'` que le système écoute pour déclencher le recalcul, améliorant les performances et réduisant le couplage.

---

## 3. Stratégie de Tests et Couverture

L'application dispose d'une couverture de code très élevée (**~87%**), dépassant largement l'exigence des 70%.

- **Pattern AAA (Arrange, Act, Assert)** : Tous les tests suivent cette structure pour garantir leur lisibilité.
- **Convention de nommage** : Les descriptions de tests suivent la norme `should [expected result] when [condition]`.
- **Pyramide des tests** :
  - *Tests unitaires* (`tests/unit`) : Valident la logique métier isolée (ex: Factory, Calculators) en utilisant des Mocks jest pour les dépendances externes.
  - *Tests d'intégration* (`tests/integration`) : Testent l'API réelle (`Supertest`) connectée à une base de données en mémoire (SQLite) pour valider l'interaction complète entre les routes, les controllers, les services et la BDD.
- **Tests d'erreurs (Edge Cases)** : Les tests d'intégration vérifient explicitement le comportement de l'API face aux requêtes invalides (retours HTTP 400, 401, 403, 404, 409).

---

## 4. Qualité de Code et Outillage

Pour garantir l'excellence et la maintenabilité du code, l'outillage suivant a été mis en place :

- **ESLint personnalisé** : Des règles ont été ajoutées pour forcer les bonnes pratiques modernes (`eqeqeq`, `no-var`, interdiction de modifier les paramètres de fonctions) et le logger remplace les `console.log`.
- **Prettier** : Une configuration explicite (`.prettierrc`) a été définie pour harmoniser l'indentation (2 espaces), l'usage de quotes simples, et la largeur de ligne.
- **Husky & Lint-Staged** : Un hook `pre-commit` a été configuré pour empêcher la création d'un commit si le code n'est pas formaté et conforme aux règles de linting, assurant que le dépôt reste propre.

---

## 5. Docker et Conteneurisation

La création de l'image Docker pour le backend a été optimisée pour la production :

- **Multi-stage build** : Utilisation d'un premier stage pour installer toutes les dépendances (y compris devDependencies pour compiler si nécessaire), puis d'un second stage léger qui ne copie que les fichiers nécessaires pour exécuter l'application.
- **Layer Caching** : Les fichiers `package.json` et `package-lock.json` sont copiés *avant* le code source. Cela permet à Docker de mettre en cache l'installation npm (`npm ci`) et d'accélérer drastiquement les rebuilds.
- **Sécurité (Non-root user)** : Le conteneur s'exécute avec un utilisateur restreint (`appuser`) pour respecter le principe de moindre privilège.
- **Dépendances de production** : Le flag `npm ci --omit=dev` est utilisé pour ne pas embarquer de code inutile/vulnérable de développement dans l'image de production.

---

## 6. Pipeline CI/CD et DevOps

Le workflow GitHub Actions (`.github/workflows/main.yml`) orchestre l'intégration et le déploiement continu à chaque Push ou Pull Request sur `main` :

1. **Job Lint** : Vérifie la propreté du code avec ESLint.
2. **Job Test** : 
   - Lance un service PostgreSQL via docker container pour permettre des tests robustes.
   - Exécute un `npm audit --audit-level=critical` pour détecter d'éventuelles vulnérabilités (DevSecOps).
   - Lance `npm run test:coverage`. Si la couverture tombe sous les 70%, le pipeline échoue immédiatement (fail fast).
3. **Job Build & Push** : Construit l'image Docker optimisée et la pousse sur le registre GitHub Container Registry (GHCR) en la taggant avec le hash du commit (`${{ github.sha }}`) pour une traçabilité parfaite.
4. **Job Deploy** : Utilise le webhook fourni par **Render** pour redéployer le service de production uniquement si toutes les étapes précédentes sont passées au vert.
5. **Dependabot** : Configuré (`.github/dependabot.yml`) pour surveiller de manière hebdomadaire les failles de sécurité des paquets npm et proposer des PR de mise à jour automatiques.
