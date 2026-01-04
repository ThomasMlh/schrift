import { Badge, Box } from "@chakra-ui/react";

interface ScoreBadgeProps {
    score: number;
    fontSize?: string | { base?: string; md?: string };
}

export const ScoreBadge = ({ score, fontSize = { base: "xs", md: "medium" } }: ScoreBadgeProps) => {
    // Vérification de sécurité
    if (score === undefined || score === null) {
        return <Badge colorScheme="gray">N/A</Badge>;
    }

    const getScoreStyle = (value: number) => {
        if (value > 605000000) {
            return {
                textGradient: "linear-gradient(90deg, #ff6b6b, #ffa07a, #ffd966, #90ee90, #87ceeb, #9370db)",
                bgSize: "300% 300%",
                animation: "rainbow 6s ease infinite",
                fontWeight: "bold",
                isRainbow: true
            };
        } else if (value >= 501000000) {
            return {
                colorScheme: "green",
                variant: "solid",
                isRainbow: false
            };
        } else if (value >= 401000000) {
            return {
                colorScheme: "teal",
                variant: "solid",
                isRainbow: false
            };
        } else if (value >= 251000000) {
            return {
                colorScheme: "red",
                variant: "solid",
                isRainbow: false
            };
        } else if (value >= 151000000) {
            return {
                bg: "#8B4513",
                color: "white",
                variant: "solid",
                isRainbow: false
            };
        } else {
            return {
                colorScheme: "blackAlpha",
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
