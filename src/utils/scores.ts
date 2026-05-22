export const getScoreDisplayValue = (score: number) => {
    switch (true) {
        case score >= 600000000:
            return "rainbow";
        case score >= 580000000:
            return "blue";
        case score >= 540000000:
            return "purple";
        case score >= 430000000:
            return "green";
        case score >= 350000000:
            return "teal";
        case score >= 210000000:
            return "yellow";
        case score >= 100000000:
            return "orange";
        case score >= 22500000:
            return "red";
        default:
            return "brown";
    }
};
