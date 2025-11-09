export const getScoreDisplayValue = (score: number) => {
    switch (true) {
        case score >= 490000000:
            return "green";
        case score >= 250000000:
            return "orange";
        default:
            return "red";
    }
};