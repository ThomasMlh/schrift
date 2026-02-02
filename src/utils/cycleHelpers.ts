import type { ICycle } from '../interfaces';

/**
 * Calcule les vraies dates d'une rotation en tenant compte du fuseau horaire de Paris
 * @param startDate - Date de début au format DD/MM/YYYY
 * @param endDate - Date de fin au format DD/MM/YYYY
 * @returns Les dates réelles de début et de fin
 */
export const getRotationRealDates = (startDate: string, endDate: string) => {
    const createParisDate = (dateStr: string, baseHourUTC: number, dayOffset: number = 0) => {
        const [day, month, year] = dateStr.split('/').map(Number);
        const finalDate = new Date(Date.UTC(year, month - 1, day + dayOffset, baseHourUTC, 0, 0));
        return finalDate;
    };
    const BASE_HOUR_UTC = 15;
    
    const realStartDate = createParisDate(startDate, BASE_HOUR_UTC, -1);
    const realEndDate = createParisDate(endDate, BASE_HOUR_UTC, 0);

    return { realStartDate, realEndDate };
};

/**
 * Détermine si un cycle est actif
 * Un cycle est actif s'il a une rotation en cours OU une rotation à venir
 * @param cycle - Le cycle à vérifier
 * @returns true si le cycle est actif, false sinon
 */
export const isCycleActive = (cycle: ICycle): boolean => {
    const now = new Date();
    
    if (!cycle.rotations || cycle.rotations.length === 0) {
        return false;
    }
    
    // Vérifier s'il y a une rotation actuellement en cours
    const hasActiveRotation = cycle.rotations.some(rotation => {
        if (!rotation.start_date || !rotation.end_date) {
            return false;
        }
        
        const { realStartDate, realEndDate } = getRotationRealDates(
            rotation.start_date,
            rotation.end_date
        );
        
        return now >= realStartDate && now <= realEndDate;
    });
    
    if (hasActiveRotation) {
        return true;
    }
    
    // Si pas de rotation en cours, vérifier s'il y a une rotation à venir
    const hasUpcomingRotation = cycle.rotations.some(rotation => {
        if (!rotation.start_date || !rotation.end_date) {
            return false;
        }
        
        const { realStartDate } = getRotationRealDates(
            rotation.start_date,
            rotation.end_date
        );
        
        return now < realStartDate;
    });
    
    return hasUpcomingRotation;
};
