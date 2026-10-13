import { Badge, Box } from "@chakra-ui/react";
import { formatWithCommas } from "@/utils/format";

interface ScoreBadgeProps {
    score: number;
    fontSize?: string | { base?: string; md?: string };
    forceBlue?: boolean; // Forces the blue color
    commas?: boolean; // Comma thousands separator (612,480,300) instead of the browser locale format
}

export const ScoreBadge = ({ score, fontSize = { base: "sm", md: "medium" }, forceBlue = false, commas = false }: ScoreBadgeProps) => {
    if (score === undefined || score === null || score === 0) {
        return <Badge colorScheme="gray" fontSize={fontSize}>Miss</Badge>;
    }

    if (forceBlue) {
        return (
            <Badge
                colorScheme="blue"
                variant="solid"
                fontWeight="bold"
                fontSize={fontSize}
            >
                {commas ? formatWithCommas(score) : score.toLocaleString()}
            </Badge>
        );
    }

    const getScoreStyle = (value: number) => {
        if (value >= 621000000) {
            // Rainbow (HQ buff)
            return {
                textGradient: "linear-gradient(90deg, #ff6b6b, #ffa07a, #ffd966, #90ee90, #87ceeb, #9370db)",
                bgSize: "300% 300%",
                animation: "rainbow 6s ease infinite",
                fontWeight: "bold",
                isRainbow: true
            };
        } else if (value >= 580000000) {
            // Blue (Extra Wave 5 and 6 clear)
            return {
                colorScheme: "blue",
                variant: "solid",
                isRainbow: false
            };
        } else if (value >= 540000000) {
            // Purple (Extra Wave 3 and 4 clear)
            return {
                colorScheme: "purple",
                variant: "solid",
                isRainbow: false
            };
        } else if (value >= 430000000) {
            // Green (Extra Wave 1 and 2 clear)
            return {
                colorScheme: "green",
                variant: "solid",
                isRainbow: false
            };
        } else if (value >= 350000000) {
            // Teal (Nightmare clear)
            return {
                colorScheme: "teal",
                variant: "solid",
                isRainbow: false
            };
        } else if (value >= 210000000) {
            // Yellow (Very Hard clear)
            return {
                colorScheme: "yellow",
                variant: "solid",
                isRainbow: false
            };
        } else if (value >= 100000000) {
            // Orange (Hard clear)
            return {
                colorScheme: "orange",
                variant: "solid",
                isRainbow: false
            };
        } else if (value >= 22500000) {
            // Red (Normal clear)
            return {
                colorScheme: "red",
                variant: "solid",
                isRainbow: false
            };
        } else {
            // Brown (Normal not cleared)
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
                {commas ? formatWithCommas(score) : score.toLocaleString()}
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
            {commas ? formatWithCommas(score) : score?.toLocaleString()}
        </Badge>
    );
};
