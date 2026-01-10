import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import OrbGuideAdminSection from "./OrbGuideAdminSection";
import BuildsAdminSection from "./BuildsAdminSection";

// Composant wrapper pour les sections de guides pliables
interface GuideFormWrapperProps {
  title: string;
  formName: string;
  children: React.ReactNode;
  colorScheme?: string;
  openForm: string | null;
  toggleForm: (formName: string) => void;
  bgColor: string;
  boxShadow: string;
}

const GuideFormWrapper: React.FC<GuideFormWrapperProps> = ({
  title,
  formName,
  children,
  colorScheme = "purple",
  openForm,
  toggleForm,
  bgColor,
  boxShadow,
}) => {
  const isOpen = openForm === formName;

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Button
        colorScheme={colorScheme}
        onClick={() => toggleForm(formName)}
        size="lg"
        variant={isOpen ? "solid" : "outline"}
      >
        {title} {isOpen ? "▲" : "▼"}
      </Button>
      {isOpen && (
        <Box p={4} borderWidth={1} borderRadius="lg" boxShadow={boxShadow} bg={bgColor}>
          {children}
        </Box>
      )}
    </VStack>
  );
};

const GuidesAdminSection = () => {
  const [openForm, setOpenForm] = useState<string | null>(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const boxShadow = useColorModeValue("md", "md");

  const toggleForm = (formName: string) => {
    setOpenForm(openForm === formName ? null : formName);
  };

  return (
    <Container maxW="100vw" w="100%" px={0} py={8}>
      <Heading mb={8} textAlign="center">
        Administration des Guides
      </Heading>

      <VStack spacing={6} w="100%" px={4}>
        {/* Guide des Orbes */}
        <GuideFormWrapper
          title="📚 Guide des Orbes"
          formName="orbGuide"
          colorScheme="purple"
          openForm={openForm}
          toggleForm={toggleForm}
          bgColor={bgColor}
          boxShadow={boxShadow}
        >
          <OrbGuideAdminSection />
        </GuideFormWrapper>

        {/* Guide des Rotations & Builds */}
        <GuideFormWrapper
          title="🔄 Guide des Rotations & Builds"
          formName="rotationGuide"
          colorScheme="purple"
          openForm={openForm}
          toggleForm={toggleForm}
          bgColor={bgColor}
          boxShadow={boxShadow}
        >
          <BuildsAdminSection />
        </GuideFormWrapper>

        {/* Futur: Autres guides */}
        {/* Vous pouvez ajouter d'autres guides ici en suivant le même pattern */}
      </VStack>
    </Container>
  );
};

export default GuidesAdminSection;
