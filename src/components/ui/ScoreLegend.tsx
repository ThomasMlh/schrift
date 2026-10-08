import {
  Box,
  Button,
  HStack,
  Icon,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  VStack,
  useColorModeValue
} from "@chakra-ui/react";
import { InfoIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";

interface ScoreLegendItem {
  labelKey: string;
  minScore: number;
  maxScore?: number;
  colorScheme?: string;
  bg?: string;
  color?: string;
  isRainbow?: boolean;
}

const legendItems: ScoreLegendItem[] = [
  {
    labelKey: "rainbow",
    minScore: 621000000,
    isRainbow: true
  },
  {
    labelKey: "clearExtraWave56",
    minScore: 580000000,
    maxScore: 620999999,
    colorScheme: "blue"
  },
  {
    labelKey: "clearExtraWave34",
    minScore: 540000000,
    maxScore: 579999999,
    colorScheme: "purple"
  },
  {
    labelKey: "clearExtraWave12",
    minScore: 430000000,
    maxScore: 539999999,
    colorScheme: "green"
  },
  {
    labelKey: "clearNightmare",
    minScore: 350000000,
    maxScore: 429999999,
    colorScheme: "teal"
  },
  {
    labelKey: "clearVeryHard",
    minScore: 210000000,
    maxScore: 349999999,
    colorScheme: "yellow"
  },
  {
    labelKey: "clearHard",
    minScore: 100000000,
    maxScore: 209999999,
    colorScheme: "orange"
  },
  {
    labelKey: "clearNormal",
    minScore: 22500000,
    maxScore: 99999999,
    colorScheme: "red"
  },
  {
    labelKey: "noClearNormal",
    minScore: 1,
    maxScore: 22499999,
    bg: "#8B4513",
    color: "white"
  },
  {
    labelKey: "noGuildQuest",
    minScore: 0,
    maxScore: 0,
    bg: "gray.700",
    color: "white"
  }
];

export const ScoreLegend = () => {
  const { t } = useTranslation();
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = "bg.card";

  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Icon as={InfoIcon} />}
          colorScheme="blue"
        >
          {t("components.scoreLegend.buttonLabel")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        maxW={{ base: "90vw", md: "400px" }}
        bg={bgColor}
        borderColor={borderColor}
      >
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontWeight="bold" borderColor={borderColor}>
          {t("components.scoreLegend.heading")}
        </PopoverHeader>
        <PopoverBody>
          <VStack spacing={3} align="stretch">
            {legendItems.map((item, index) => (
              <HStack key={index} spacing={3} align="center">
                {item.isRainbow ? (
                  <Box
                    minW="60px"
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontWeight="bold"
                    fontSize="xs"
                    bgGradient="linear-gradient(90deg, #ff6b6b, #ffa07a, #ffd966, #90ee90, #87ceeb, #9370db)"
                    backgroundSize="300% 300%"
                    backgroundClip="text"
                    sx={{
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      animation: "rainbow 6s ease infinite",
                      "@keyframes rainbow": {
                        "0%": { backgroundPosition: "0% 50%" },
                        "50%": { backgroundPosition: "100% 50%" },
                        "100%": { backgroundPosition: "0% 50%" }
                      }
                    }}
                    textAlign="center"
                  >
                    621M+
                  </Box>
                ) : (
                  <Box
                    minW="60px"
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontWeight="bold"
                    fontSize="xs"
                    textAlign="center"
                    bg={
                      item.colorScheme
                        ? `${item.colorScheme}.500`
                        : item.bg
                    }
                    color={item.color || "white"}
                  >
                    {item.minScore >= 1000000
                      ? `${item.minScore / 1000000}M+`
                      : item.minScore > 0
                      ? `${item.minScore}+`
                      : "Miss"}
                  </Box>
                )}
                <Text fontSize="sm" flex={1}>
                  {t(`components.scoreLegend.${item.labelKey}`)}
                </Text>
              </HStack>
            ))}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
