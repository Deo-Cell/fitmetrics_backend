# 📑 FitMetrics - Handover & Project Context

## 🎯 Projet & Philosophie
Ce projet est réalisé dans le cadre d'un **Master 1 Full Stack** pour l'UE **CI/CD & DevOps**. 
L'objectif n'est pas de faire un simple CRUD, mais de démontrer une maîtrise de l'ingénierie logicielle et des pratiques professionnelles de déploiement.

**Philosophie technique :**
- **Sur-ingénierie justifiée** : Utilisation de Design Patterns pour montrer la compréhension des architectures robustes.
- **Logique Métier Riche** : Au lieu de simples champs texte, l'app utilise des formules mathématiques (fitness/nutrition) pour justifier des tests unitaires complexes.
- **Qualité & Tests** : Priorité absolue à la testabilité (Dependency Injection, Repositories) et à la couverture de code (>70%).
- **Observabilité** : Logs structurés (JSON) pour faciliter le monitoring futur (Prometheus/Grafana).

## 🏗️ Architecture & Design Patterns
L'architecture suit une structure en couches : `Routes -> Controllers -> Services -> Repositories -> Models`.

**Patterns implémentés :**
1.  **Singleton** : Gestion de la connexion unique à la BDD (`src/config/db.js`) et du Logger (`src/config/logger.js`).
2.  **Strategy** : Utilisé pour les calculateurs (`src/strategies/calculator/Calculators.js`). On peut changer l'algorithme (ex: Epley vs Brzycki pour le 1RM) sans toucher au code appelant.
3.  **Repository** : Abstraction de Sequelize (`src/repositories/`). Permet de découpler la logique métier de l'ORM.
4.  **Factory** : `WorkoutSetFactory.js` crée le bon type d'objet (Muscu ou Cardio) selon le type d'exercice, garantissant la validité des données.
5.  **Observer** : `WorkoutService` émet des événements (`EventEmitter`) lors de la complétion d'une séance pour déclencher les statistiques de manière asynchrone et découplée.

## 🛠️ État Actuel du Backend

### Fonctionnalités Terminées :
- **Système d'Auth** : JWT + Bcrypt.
- **Gestion de Profil** : Données physiques (poids, taille, âge) nécessaires aux calculs de santé.
- **Catalogue d'Exercices** : Système de "seed" automatique au démarrage avec ~10 exercices de base.
- **Gestion des Séances (Workouts)** : Support complet (CRUD) des séances avec séries (sets) multiples.
- **Moteur de Statistiques** : Calcul du tonnage, détection des Records Personnels (PR) et calcul automatique du "streak" (jours consécutifs).
- **Moteur Nutrition** : Calcul de l'IMC (BMI) et du besoin calorique (TDEE).

### Tests & DevOps :
- **Coverage** : ~70% de lignes couvertes (Jest).
- **Environnement de Test** : Utilise SQLite en mémoire (`:memory:`) pour des tests rapides et isolés.
- **Logs** : Winston configuré pour la production (JSON).

## 📂 Structure du Code
```text
backend/
├── src/
│   ├── config/       # Singletons (DB, Logger)
│   ├── models/       # Modèles Sequelize
│   ├── repositories/ # Abstraction BDD
│   ├── services/     # Logique métier (Auth, Stats, Workouts)
│   ├── strategies/   # Algorithmes interchangeables (Calculators)
│   ├── factories/    # Création d'objets complexes
│   ├── routes/       # Points d'entrée API
│   ├── utils/        # Seed, helpers
│   └── app.js        # Config Express
├── tests/
│   ├── unit/         # Tests des services et strategies
│   └── integration/  # Tests des routes avec supertest
└── server.js         # Point d'entrée (Bootstrap)
```

## 🚀 Prochaines Étapes prévues
1.  **DevOps** : Créer le `Dockerfile` (multi-stage) et le `docker-compose.yml`.
2.  **CI/CD** : Configurer GitHub Actions pour le Lint, les Tests et le build d'image.
3.  **Frontend** : Initialiser l'application Vue.js 3 et créer les premiers écrans (Dashboard, Login).
4.  **Monitoring** : Exposer les métriques via `/metrics` pour Prometheus.
