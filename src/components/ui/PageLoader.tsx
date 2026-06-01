import { Center, VStack, Spinner, Text } from "@chakra-ui/react";

interface PageLoaderProps {
  label?: string;
  subtitle?: string;
  height?: string;
  color?: string;
}

export const PageLoader = ({
  label,
  subtitle,
  height = "50vh",
  color = "blue.500",
}: PageLoaderProps) => (
  <Center h={height}>
    <VStack spacing={4}>
      <Spinner size="xl" color={color} thickness="4px" />
      {label && <Text fontWeight="medium">{label}</Text>}
      {subtitle && <Text fontSize="sm" color="gray.500">{subtitle}</Text>}
    </VStack>
  </Center>
);
