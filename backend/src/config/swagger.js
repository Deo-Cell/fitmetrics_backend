const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'FitMetrics API',
    version: '1.0.0',
    description: 'API de suivi fitness — séances, nutrition, statistiques',
  },
  servers: [
    { url: '/api', description: 'API principale' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          weight: { type: 'number', description: 'Poids en kg' },
          heightCm: { type: 'number', description: 'Taille en cm' },
          age: { type: 'integer' },
          gender: { type: 'string', enum: ['male', 'female'] },
          level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          goal: { type: 'string', enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'maintenance'] },
          activityLevel: { type: 'string', enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'] },
        },
      },
      Exercise: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          category: { type: 'string', enum: ['strength', 'cardio', 'stretching', 'hiit', 'bodyweight'] },
          muscleGroup: { type: 'string', enum: ['chest', 'back', 'shoulders', 'arms', 'legs', 'abs', 'full_body'] },
          equipment: { type: 'string', enum: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'none'] },
          difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
          description: { type: 'string' },
          metValue: { type: 'number' },
        },
      },
      Workout: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['strength', 'cardio', 'mixed'] },
          status: { type: 'string', enum: ['in_progress', 'completed', 'cancelled'] },
          duration: { type: 'integer', description: 'Durée en minutes' },
          notes: { type: 'string' },
          completedAt: { type: 'string', format: 'date-time' },
        },
      },
      WorkoutExercise: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          workoutId: { type: 'integer' },
          exerciseId: { type: 'integer' },
          setNumber: { type: 'integer' },
          weight: { type: 'number', description: 'Poids en kg' },
          reps: { type: 'integer' },
          duration: { type: 'integer', description: 'Durée en secondes (cardio)' },
          distance: { type: 'number', description: 'Distance en km (cardio)' },
          completed: { type: 'boolean' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Créer un compte',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', minLength: 6, example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Compte créé avec succès' },
          400: { description: 'Données invalides' },
          409: { description: 'Email déjà utilisé' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Se connecter',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Connexion réussie — retourne le token JWT' },
          400: { description: 'Champs manquants' },
          401: { description: 'Identifiants invalides' },
        },
      },
    },
    '/profile': {
      get: {
        tags: ['Profile'],
        summary: 'Récupérer son profil',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Profil utilisateur',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
          },
          404: { description: 'Utilisateur non trouvé' },
        },
      },
      put: {
        tags: ['Profile'],
        summary: 'Mettre à jour son profil',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string', example: 'John' },
                  lastName: { type: 'string', example: 'Doe' },
                  weight: { type: 'number', example: 75 },
                  heightCm: { type: 'number', example: 180 },
                  age: { type: 'integer', example: 25 },
                  gender: { type: 'string', enum: ['male', 'female'] },
                  level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                  goal: { type: 'string', enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'maintenance'] },
                  activityLevel: { type: 'string', enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profil mis à jour' },
          404: { description: 'Utilisateur non trouvé' },
        },
      },
    },
    '/exercises': {
      get: {
        tags: ['Exercises'],
        summary: 'Lister les exercices (avec filtres)',
        parameters: [
          { name: 'muscle', in: 'query', schema: { type: 'string' }, description: 'Filtrer par groupe musculaire' },
          { name: 'equipment', in: 'query', schema: { type: 'string' }, description: 'Filtrer par équipement' },
          { name: 'difficulty', in: 'query', schema: { type: 'string' }, description: 'Filtrer par difficulté' },
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filtrer par catégorie' },
        ],
        responses: {
          200: {
            description: 'Liste des exercices',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Exercise' } } } },
          },
        },
      },
    },
    '/exercises/{id}': {
      get: {
        tags: ['Exercises'],
        summary: 'Détail d\'un exercice',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Exercice trouvé',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Exercise' } } },
          },
          404: { description: 'Exercice non trouvé' },
        },
      },
    },
    '/workouts': {
      post: {
        tags: ['Workouts'],
        summary: 'Créer une séance',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Push Day' },
                  type: { type: 'string', enum: ['strength', 'cardio', 'mixed'], example: 'strength' },
                  notes: { type: 'string', example: 'Séance haut du corps' },
                  exercises: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        exerciseId: { type: 'integer', example: 1 },
                        setNumber: { type: 'integer', example: 1 },
                        weight: { type: 'number', example: 80 },
                        reps: { type: 'integer', example: 10 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Séance créée' },
          400: { description: 'Données invalides' },
        },
      },
      get: {
        tags: ['Workouts'],
        summary: 'Lister ses séances',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Filtrer par type' },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date début' },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Date fin' },
        ],
        responses: {
          200: {
            description: 'Liste des séances',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Workout' } } } },
          },
        },
      },
    },
    '/workouts/{id}': {
      get: {
        tags: ['Workouts'],
        summary: 'Détail d\'une séance',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Séance trouvée' },
          403: { description: 'Non autorisé' },
          404: { description: 'Séance non trouvée' },
        },
      },
      put: {
        tags: ['Workouts'],
        summary: 'Modifier une séance',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  type: { type: 'string', enum: ['strength', 'cardio', 'mixed'] },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Séance mise à jour' },
          403: { description: 'Non autorisé' },
          404: { description: 'Séance non trouvée' },
        },
      },
      delete: {
        tags: ['Workouts'],
        summary: 'Supprimer une séance',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          204: { description: 'Séance supprimée' },
          403: { description: 'Non autorisé' },
          404: { description: 'Séance non trouvée' },
        },
      },
    },
    '/workouts/{id}/complete': {
      post: {
        tags: ['Workouts'],
        summary: 'Marquer une séance comme terminée',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Séance complétée — déclenche le calcul des stats' },
          400: { description: 'Séance déjà complétée' },
          403: { description: 'Non autorisé' },
          404: { description: 'Séance non trouvée' },
        },
      },
    },
    '/stats/personal-records': {
      get: {
        tags: ['Stats'],
        summary: 'Records personnels',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Liste des PR par exercice' },
        },
      },
    },
    '/stats/volume': {
      get: {
        tags: ['Stats'],
        summary: 'Volume d\'entraînement (tonnage)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          200: { description: 'Tonnage total sur la période' },
        },
      },
    },
    '/stats/dashboard': {
      get: {
        tags: ['Stats'],
        summary: 'Tableau de bord (streak, stats globales)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Données du dashboard' },
        },
      },
    },
    '/nutrition/bmi': {
      get: {
        tags: ['Nutrition'],
        summary: 'Calculer l\'IMC',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'IMC calculé avec catégorie' },
          400: { description: 'Profil incomplet (poids/taille manquants)' },
        },
      },
    },
    '/nutrition/tdee': {
      get: {
        tags: ['Nutrition'],
        summary: 'Calculer le TDEE (besoin calorique)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'TDEE et répartition macros' },
          400: { description: 'Profil incomplet' },
        },
      },
    },
    '/nutrition/calories-burned': {
      get: {
        tags: ['Nutrition'],
        summary: 'Estimer les calories brûlées',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'duration', in: 'query', required: true, schema: { type: 'integer' }, description: 'Durée en minutes' },
          { name: 'type', in: 'query', schema: { type: 'string' }, description: 'Type d\'activité' },
        ],
        responses: {
          200: { description: 'Calories brûlées estimées' },
          400: { description: 'Durée manquante ou poids non renseigné' },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
