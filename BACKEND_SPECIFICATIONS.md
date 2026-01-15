# 📋 Spécifications Backend - Podium Weekly & Misses

## 🎯 Nouveaux Endpoints à Implémenter

### 1. Endpoint Podium par Semaine

#### **Route**
```
GET /api/users/podium/weekly
```

#### **Query Parameters**
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `cycle_name` | string | ✅ Oui | Nom du cycle (ex: "Cycle 1") |
| `week_number` | number | ✅ Oui | Numéro de la semaine (1, 2, 3, etc.) |
| `guild_name` | string | ❌ Non | Nom de la guilde pour filtrer |
| `page` | number | ❌ Non | Numéro de page (défaut: 1) |
| `limit` | number | ❌ Non | Nombre d'items par page (défaut: 50) |

#### **Logique Backend**

1. **Récupérer le cycle** depuis la base de données via `cycle_name`
2. **Calculer les rotations de la semaine**:
   - Semaine 1 = rotations aux positions 1 et 2
   - Semaine 2 = rotations aux positions 3 et 4
   - Semaine N = rotations aux positions (2N-1) et (2N)
3. **Pour chaque joueur**:
   - Récupérer les scores des 2 rotations de la semaine
   - Sommer les 2 scores pour obtenir `week_total_score`
   - Si un score manque, considérer 0 ou -5000 selon votre logique
4. **Trier** par `week_total_score` décroissant
5. **Filtrer** par guilde si `guild_name` est fourni
6. **Appliquer la pagination**
7. **Calculer le rank** (1, 2, 3, etc.)
8. **Calculer les métadonnées**:
   - Score moyen de la semaine
   - Nombre total de joueurs

#### **Format de Réponse**

```typescript
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user_id": "507f1f77bcf86cd799439011",
      "username": "Player1",
      "global_name": "Player One",
      "bbs_name": "P1BBS",
      "discord_id": "123456789",
      "avatar": "https://cdn.discordapp.com/avatars/...",
      "guild_name": "Guild A",
      "week_total_score": 12500,       // Score rotation 1 + rotation 2
      "rotation1_score": 6200,
      "rotation2_score": 6300,
      "hasUser": true
    },
    // ... autres joueurs
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalCount": 150,
    "hasNextPage": true,
    "hasPrevPage": false,
    "itemsPerPage": 50,
    "itemsOnPage": 50
  },
  "filters": {
    "cycle_name": "Cycle 1",
    "cycle_id": "507f1f77bcf86cd799439012",
    "week_number": 1,
    "guild_name": "Guild A"  // Si filtré
  },
  "meta": {
    "weekNumber": 1,
    "rotationsInfo": [
      {
        "position": 1,
        "killer": "Arrancar",
        "attack": "Melee",
        "start_date": "01/01/2026",
        "end_date": "03/01/2026"
      },
      {
        "position": 2,
        "killer": "Soul Reaper",
        "attack": "Ranged",
        "start_date": "04/01/2026",
        "end_date": "06/01/2026"
      }
    ],
    "totalPlayers": 150,
    "averageWeekScore": 11000
  }
}
```

#### **Cas particuliers**

- ⚠️ **Cycle avec nombre impair de rotations** : retourner une erreur 400
  ```json
  {
    "success": false,
    "message": "Ce cycle ne contient pas un nombre pair de rotations pour le classement hebdomadaire"
  }
  ```
- ⚠️ **Semaine inexistante** : si `week_number` > nombre de semaines disponibles, retourner erreur 404
- 🔢 **Joueur avec score manquant** : gérer selon votre logique métier (0 ou -5000)

---

### 2. Endpoint Podium des Miss

#### **Route**
```
GET /api/users/podium/misses
```

#### **Query Parameters**
| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `cycle_name` | string | ✅ Oui | Nom du cycle |
| `guild_name` | string | ❌ Non | Nom de la guilde pour filtrer |
| `page` | number | ❌ Non | Numéro de page (défaut: 1) |
| `limit` | number | ❌ Non | Nombre d'items par page (défaut: 50) |

#### **Logique Backend**

1. **Récupérer le cycle** via `cycle_name`
2. **Récupérer tous les scores du cycle** pour tous les joueurs
3. **Pour chaque joueur**:
   - Filtrer les scores < 0
   - Compter le nombre de miss (`total_misses`)
   - Sommer les scores négatifs (`total_negative_score`)
   - Lister les rotations où il y a eu miss
4. **Ne garder que les joueurs avec au moins 1 miss**
5. **Trier**:
   - Par `total_misses` décroissant (celui qui a le plus de miss en premier)
   - En cas d'égalité : par `total_negative_score` croissant (le plus négatif en premier)
6. **Filtrer** par guilde si `guild_name` est fourni
7. **Appliquer la pagination**
8. **Calculer le rank**
9. **Calculer les métadonnées**

#### **Format de Réponse**

```typescript
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user_id": "507f1f77bcf86cd799439011",
      "username": "MissKing",
      "global_name": "Miss King",
      "bbs_name": "MKBBS",
      "discord_id": "987654321",
      "avatar": "https://cdn.discordapp.com/avatars/...",
      "guild_name": "Guild B",
      "total_misses": 5,                  // Nombre de rotations missées
      "total_negative_score": -25000,     // Somme de tous les scores négatifs
      "missed_rotations": [
        {
          "rotation_position": 1,
          "score": -5000
        },
        {
          "rotation_position": 3,
          "score": -5000
        },
        {
          "rotation_position": 5,
          "score": -5000
        },
        {
          "rotation_position": 7,
          "score": -5000
        },
        {
          "rotation_position": 9,
          "score": -5000
        }
      ],
      "hasUser": true
    },
    // ... autres joueurs
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalCount": 45,
    "hasNextPage": true,
    "hasPrevPage": false,
    "itemsPerPage": 50,
    "itemsOnPage": 45
  },
  "filters": {
    "cycle_name": "Cycle 1",
    "cycle_id": "507f1f77bcf86cd799439012",
    "guild_name": "Guild B"  // Si filtré
  },
  "meta": {
    "totalPlayersWithMisses": 45,       // Joueurs qui ont au moins 1 miss
    "totalMissesInCycle": 120,          // Total de miss dans le cycle
    "averageMissesPerPlayer": 2.67      // Moyenne par joueur qui a missé
  }
}
```

#### **Cas particuliers**

- ✅ **Aucun miss dans le cycle** : retourner data vide mais success: true
  ```json
  {
    "success": true,
    "data": [],
    "meta": {
      "totalPlayersWithMisses": 0,
      "totalMissesInCycle": 0,
      "averageMissesPerPlayer": 0
    }
  }
  ```
- 🎯 **Tri en cas d'égalité** : si 2 joueurs ont le même nombre de miss, celui avec le total le plus négatif est classé avant

---

## 🗄️ Requêtes Base de Données Suggérées

### Pour Weekly (exemple MongoDB)

```javascript
// 1. Récupérer le cycle
const cycle = await Cycle.findOne({ name: cycle_name }).populate('rotations');

// 2. Calculer les indices des rotations de la semaine
const rotation1Index = (week_number - 1) * 2;
const rotation2Index = rotation1Index + 1;
const rotation1 = cycle.rotations[rotation1Index];
const rotation2 = cycle.rotations[rotation2Index];

// 3. Agréger les scores
const weeklyScores = await Score.aggregate([
  {
    $match: {
      cycle_id: cycle._id,
      rotation_id: { $in: [rotation1.rotation_id, rotation2.rotation_id] }
    }
  },
  {
    $group: {
      _id: "$user_id",
      scores: {
        $push: {
          rotation_id: "$rotation_id",
          score: "$score"
        }
      }
    }
  },
  // ... suite de l'agrégation pour calculer le total
]);

// 4. Joindre avec les infos utilisateur
// 5. Filtrer par guilde si nécessaire
// 6. Trier et paginer
```

### Pour Misses (exemple MongoDB)

```javascript
// 1. Récupérer le cycle
const cycle = await Cycle.findOne({ name: cycle_name });

// 2. Agréger les miss
const missesData = await Score.aggregate([
  {
    $match: {
      cycle_id: cycle._id,
      score: { $lt: 0 }  // Uniquement les scores négatifs
    }
  },
  {
    $group: {
      _id: "$user_id",
      total_misses: { $sum: 1 },
      total_negative_score: { $sum: "$score" },
      missed_rotations: {
        $push: {
          rotation_id: "$rotation_id",
          score: "$score"
        }
      }
    }
  },
  {
    $sort: {
      total_misses: -1,           // D'abord par nombre de miss
      total_negative_score: 1     // Puis par total négatif
    }
  }
]);

// 3. Enrichir avec les infos de rotation (position)
// 4. Joindre avec les infos utilisateur
// 5. Filtrer par guilde si nécessaire
// 6. Paginer
```

---

## ✅ Checklist d'Implémentation

### Backend Tasks

- [ ] **Endpoint Weekly**
  - [ ] Créer route GET `/api/users/podium/weekly`
  - [ ] Valider les paramètres (cycle_name, week_number requis)
  - [ ] Vérifier que le cycle a un nombre pair de rotations
  - [ ] Calculer les indices des rotations de la semaine
  - [ ] Agréger les scores des 2 rotations
  - [ ] Gérer les scores manquants
  - [ ] Appliquer le filtre guilde
  - [ ] Trier et paginer
  - [ ] Calculer les métadonnées
  - [ ] Retourner la réponse au format spécifié
  - [ ] Tester avec différents cas (guilde, pagination, semaines)

- [ ] **Endpoint Misses**
  - [ ] Créer route GET `/api/users/podium/misses`
  - [ ] Valider les paramètres (cycle_name requis)
  - [ ] Récupérer tous les scores négatifs du cycle
  - [ ] Grouper par user_id
  - [ ] Calculer total_misses et total_negative_score
  - [ ] Enrichir avec les positions de rotation
  - [ ] Trier correctement (miss puis total négatif)
  - [ ] Appliquer le filtre guilde
  - [ ] Paginer
  - [ ] Calculer les métadonnées
  - [ ] Retourner la réponse au format spécifié
  - [ ] Tester avec différents cas

### Tests à Effectuer

#### Weekly
- ✅ Semaine 1 d'un cycle
- ✅ Dernière semaine d'un cycle
- ✅ Avec filtre guilde
- ✅ Pagination (page 2, 3...)
- ✅ Cycle avec nombre impair de rotations (doit échouer)
- ✅ Week_number invalide (trop grand)
- ✅ Joueurs avec scores manquants

#### Misses
- ✅ Cycle sans aucun miss
- ✅ Cycle avec quelques miss
- ✅ Avec filtre guilde
- ✅ Pagination
- ✅ Tri correct (égalité sur total_misses)
- ✅ Vérifier que les rotations sont bien listées

---

## 🔗 Compatibilité Frontend

Le frontend est déjà implémenté et attend ces réponses aux formats spécifiés ci-dessus.

### Fichiers Frontend Créés/Modifiés
- ✅ `/src/pages/PodiumPage.tsx` - Page principale avec 4 modes
- ✅ `/src/interfaces.ts` - Interfaces TypeScript ajoutées
- ✅ `/src/components/ui/PlayerCardWeekly.tsx` - Carte joueur pour mode weekly
- ✅ `/src/components/ui/PlayerCardMiss.tsx` - Carte joueur pour mode misses

### Mode de Fonctionnement Frontend
1. Utilisateur sélectionne un mode : `cycle`, `rotation`, `weekly`, ou `misses`
2. Sélectionne un cycle (requis)
3. Selon le mode :
   - **weekly** : sélectionne une semaine
   - **rotation** : sélectionne une rotation
   - **misses** : aucun filtre supplémentaire nécessaire
4. Peut filtrer par guilde (optionnel)
5. Appelle l'endpoint correspondant
6. Affiche les résultats avec les cartes adaptées

---

## 📝 Notes Importantes

### Gestion des Scores Négatifs
- Score < 0 signifie "miss"
- Généralement : score = -5000 pour un miss
- À adapter selon votre logique métier

### Calcul des Semaines
- 1 semaine = 2 rotations consécutives
- Week 1 : rotations position 1 et 2
- Week 2 : rotations position 3 et 4
- Etc.

### Performance
- Prévoir des index sur :
  - `scores.cycle_id`
  - `scores.rotation_id`
  - `scores.user_id`
  - `scores.score` (pour filtre < 0)
- Considérer la mise en cache pour les cycles récents

### Sécurité
- Valider tous les paramètres
- Limiter le `limit` maximum (ex: 100)
- Sanitiser `cycle_name` et `guild_name` pour éviter injections

---

## 🚀 Ordre d'Implémentation Recommandé

1. **Weekly** (plus simple, réutilise beaucoup de logique existante)
2. **Misses** (logique spécifique mais pas trop complexe)
3. **Tests & Debug**
4. **Optimisation & Cache**

---

Bon courage pour l'implémentation ! 💪
