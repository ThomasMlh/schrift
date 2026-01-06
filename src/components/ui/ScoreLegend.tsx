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

interface ScoreLegendItem {
  label: string;
  minScore: number;
  maxScore?: number;
  colorScheme?: string;
  bg?: string;
  color?: string;
  isRainbow?: boolean;
}

const legendItems: ScoreLegendItem[] = [
  {
    label: "Buff QG (Arc-en-ciel)",
    minScore: 600000000,
    isRainbow: true
  },
  {
    label: "Avant buff",
    minScore: 566000000,
    maxScore: 599999999,
    colorScheme: "blue"
  },
  {
    label: "Clear Vague Extra 3 et 4",
    minScore: 400000000,
    maxScore: 565999999,
    colorScheme: "purple"
  },
  {
    label: "Clear Vague Extra 1 et 2",
    minScore: 300000000,
    maxScore: 399999999,
    colorScheme: "green"
  },
  {
    label: "Clear très difficile à non clear cauchemar",
    minScore: 210000000,
    maxScore: 299999999,
    colorScheme: "yellow"
  },
  {
    label: "Clear difficile à non clear très difficile",
    minScore: 72000000,
    maxScore: 209999999,
    colorScheme: "orange"
  },
  {
    label: "Clear normal à non clear difficile",
    minScore: 22500000,
    maxScore: 71999999,
    colorScheme: "red"
  },
  {
    label: "Non clear normal",
    minScore: 1,
    maxScore: 22499999,
    bg: "#8B4513",
    color: "white"
  },
  {
    label: "N'a pas fait sa QG",
    minScore: 0,
    maxScore: 0,
    bg: "gray.700",
    color: "white"
  }
];

export const ScoreLegend = () => {
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "gray.800");

  return (
    <Popover placement="bottom-start">
      <PopoverTrigger>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<Icon as={InfoIcon} />}
          colorScheme="blue"
        >
          Légende des scores
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
          Codes couleurs des scores
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
                    600M+
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
                  {item.label}
                </Text>
              </HStack>
            ))}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
