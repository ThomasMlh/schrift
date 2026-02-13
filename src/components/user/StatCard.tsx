import {
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue
} from "@chakra-ui/react";

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  helpText: string;
  borderColor: string;
  valueColor: string;
}

export const StatCard = ({
  icon,
  label,
  value,
  helpText,
  borderColor,
  valueColor
}: StatCardProps) => {
  const statCardBg = useColorModeValue("blue.50", "gray.700");

  return (
    <Card
      bg={statCardBg}
      borderRadius="xl"
      boxShadow="md"
      borderTop="4px solid"
      borderColor={borderColor}
      transition="all 0.3s"
      _hover={{ transform: "translateY(-4px)", boxShadow: "xl" }}
    >
      <CardBody>
        <Stat>
          <StatLabel fontSize="sm" fontWeight="medium">
            {icon} {label}
          </StatLabel>
          <StatNumber fontSize="3xl" color={valueColor}>
            {value}
          </StatNumber>
          <StatHelpText>{helpText}</StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  );
};
