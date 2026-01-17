import type { ICycle } from '../interfaces';

/**
 * Génère les options de select groupées par année pour les cycles
 * @param cycles - Liste des cycles à grouper
 * @param valueKey - Clé à utiliser comme value ('_id' ou 'name')
 * @param showRotationCount - Afficher le nombre de rotations
 * @returns JSX des optgroups avec les options
 */
export const generateCycleOptions = (
  cycles: ICycle[],
  valueKey: '_id' | 'name' = '_id',
  showRotationCount: boolean = false
) => {
  // Grouper les cycles par année
  const cyclesByYear = cycles.reduce((acc, cycle) => {
    const year = cycle.year || 'Année inconnue';
    if (!acc[year]) acc[year] = [];
    acc[year].push(cycle);
    return acc;
  }, {} as Record<string | number, ICycle[]>);

  // Trier les années par ordre décroissant (2026 puis 2025...)
  const sortedYears = Object.entries(cyclesByYear)
    .sort(([a], [b]) => Number(b) - Number(a));

  return sortedYears.map(([year, cyclesInYear]) => (
    <optgroup key={year} label={`━━━━━ ${year} ━━━━━`}>
      {cyclesInYear.map((cycle) => (
        <option 
          key={cycle._id} 
          value={valueKey === '_id' ? cycle._id : cycle.name}
        >
          {showRotationCount 
            ? `${cycle.name} - ${cycle.rotations?.length || 0} rotations`
            : cycle.name
          }
        </option>
      ))}
    </optgroup>
  ));
};
