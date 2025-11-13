# Composant PodiumSection

Le composant `PodiumSection` affiche un classement des meilleurs joueurs basé sur la moyenne de leurs scores pour un cycle donné.

## Fonctionnalités

### Filtres disponibles
- **Cycle** : Sélection du cycle pour calculer les moyennes (par défaut : cycle le plus récent)
- **Scope** : 
  - `Global` : Inclut tous les joueurs de toutes les guildes
  - `Guilde spécifique` : Filtre sur une guilde particulière

### Affichage
- **Top 10** : Affiche les 10 meilleurs joueurs
- **Médailles** : 🥇 🥈 🥉 pour les 3 premiers
- **Informations joueur** : Nom, avatar, score moyen
- **Statistiques** : Nombre total de scores par joueur

### API utilisée
- **Endpoint** : `GET /api/scores/podium`
- **Paramètres** :
  - `cycle_id` (obligatoire) : ID du cycle
  - `guild_id` (optionnel) : ID de la guilde pour filtrer

### Structure de réponse API
```json
{
  "success": true,
  "podium": [
    {
      "rank": 1,
      "user_id": "...",
      "bbs_name": "...",
      "discord_id": "...",
      "global_name": "...",
      "averageScore": 1250.75,
      "totalScores": 15
    }
  ],
  "filters": {
    "cycle_id": "...",
    "guild_id": null
  },
  "meta": {
    "totalPlayers": 10,
    "cycleId": "...",
    "guildSpecific": false
  }
}
```

## Utilisation

```tsx
import { PodiumSection } from "../components/PodiumSection";

// Dans votre composant
<PodiumSection />

// Avec URL API personnalisée
<PodiumSection apiUrl="http://localhost:3000" />
```

## Intégration

Le composant est intégré dans la `HomePage` en dessous de la section des guildes. Il se charge automatiquement avec le cycle le plus récent et affiche le podium global par défaut.