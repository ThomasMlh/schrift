import type { ICycle, ICycleRotation } from '../interfaces';

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
export const formatRotationDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
};

export const calculateRotationPeriod = (startDate: string, endDate: string): "Mardi-Jeudi" | "Vendredi-Dimanche" => {
    try {
        const [sd, sm, sy] = startDate.split('/');
        const [ed, em, ey] = endDate.split('/');
        const start = new Date(parseInt(sy), parseInt(sm) - 1, parseInt(sd));
        const end   = new Date(parseInt(ey), parseInt(em) - 1, parseInt(ed));
        if (start.getDay() === 2 && end.getDay() === 4) return "Mardi-Jeudi";
        if (start.getDay() === 5 && end.getDay() === 0) return "Vendredi-Dimanche";
    } catch { /* fallback */ }
    return "Mardi-Jeudi";
};

export const calculateAllRotationDates = (rotations: ICycleRotation[], firstStartDate: string): void => {
    try {
        const [d, m, y] = firstStartDate.split('/');
        let current = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));

        for (let i = 0; i < rotations.length; i++) {
            const isEven = (i + 1) % 2 === 0;
            const targetDay = isEven ? 5 : 2; // vendredi ou mardi
            while (current.getDay() !== targetDay) current.setDate(current.getDate() + 1);

            const end = new Date(current);
            end.setDate(current.getDate() + 2);

            rotations[i].start_date = formatRotationDate(current);
            rotations[i].end_date   = formatRotationDate(end);
            rotations[i].period     = isEven ? "Vendredi-Dimanche" : "Mardi-Jeudi";

            current = new Date(end);
            current.setDate(end.getDate() + (isEven ? 2 : 1));
        }
    } catch (error) {
        console.error('Erreur lors du calcul des dates:', error);
    }
};

export const ensureCorrectRotationPositions = (rotations: ICycleRotation[]): ICycleRotation[] =>
    rotations.map((r, i) => ({
        ...r,
        position: i + 1,
        period: (i + 1) % 2 === 1 ? "Mardi-Jeudi" as const : "Vendredi-Dimanche" as const,
    }));

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
