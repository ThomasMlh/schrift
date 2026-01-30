import { Badge, Box } from "@chakra-ui/react";

interface ScoreBadgeProps {
    score: number;
    fontSize?: string | { base?: string; md?: string };
    forceBlue?: boolean; // Nouvelle prop pour forcer la couleur bleue
}

export const ScoreBadge = ({ score, fontSize = { base: "sm", md: "medium" }, forceBlue = false }: ScoreBadgeProps) => {
    // Vérification de sécurité
    if (score === undefined || score === null || score === 0) {
        return <Badge colorScheme="gray" fontSize={fontSize}>Miss</Badge>;
    }

    // Si forceBlue est activé, retourner directement un badge bleu
    if (forceBlue) {
        return (
            <Badge
                colorScheme="blue"
                variant="solid"
                fontWeight="bold"
                fontSize={fontSize}
            >
                {score.toLocaleString()}
            </Badge>
        );
    }

    const getScoreStyle = (value: number) => {
        if (value >= 600000000) {
            // Arc-en-ciel (buff QG)
            return {
                textGradient: "linear-gradient(90deg, #ff6b6b, #ffa07a, #ffd966, #90ee90, #87ceeb, #9370db)",
                bgSize: "300% 300%",
                animation: "rainbow 6s ease infinite",
                fontWeight: "bold",
                isRainbow: true
            };
        } else if (value >= 566000000) {
            // Bleu (avant buff)
            return {
                colorScheme: "blue",
                variant: "solid",
                isRainbow: false
            };
        } else if (value >= 400000000) {
            // Violet (Clear Vague Extra 3 et 4)
            return {
                colorScheme: "purple",
                variant: "solid",
                isRainbow: false
            };
        } else if (value >= 300000000) {
            // Vert (Clear Vague Extra 1 et 2)
            return {
                colorScheme: "green",
                variant: "solid",
                isRainbow: false
            };
        } else if (value >= 210000000) {
            // Jaune (clear très diff à non clear cauchemar)
            return {
                colorScheme: "yellow",
                variant: "solid",
                isRainbow: false
            };
        } else if (value >= 72000000) {
            // Orange (clear diff à non clear très diff)
            return {
                colorScheme: "orange",
                variant: "solid",
                isRainbow: false
            };
        } else if (value >= 22500000) {
            // Rouge (clear normal à non clear diff)
            return {
                colorScheme: "red",
                variant: "solid",
                isRainbow: false
            };
        } else {
            // Marron (non clear normal)
            return {
                bg: "#8B4513",
                color: "white",
                variant: "solid",
                isRainbow: false
            };
        }
    };

    const style = getScoreStyle(score);

    if (style.isRainbow) {
        return (
            <Box
                as="span"
                display="inline-block"
                px={3}
                py={1}
                borderRadius="md"
                fontWeight="bold"
                fontSize={fontSize}
                bgGradient={style.textGradient}
                backgroundSize={style.bgSize}
                backgroundClip="text"
                animation={style.animation}
                sx={{
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    "@keyframes rainbow": {
                        "0%": { backgroundPosition: "0% 50%" },
                        "50%": { backgroundPosition: "100% 50%" },
                        "100%": { backgroundPosition: "0% 50%" }
                    }
                }}
            >
                {score.toLocaleString()}
            </Box>
        );
    }

    return (
        <Badge
            colorScheme={style.colorScheme}
            bg={style.bg}
            color={style.color}
            variant={style.variant}
            fontWeight="bold"
            fontSize={fontSize}
        >
            {score?.toLocaleString()}
        </Badge>
    );
};
