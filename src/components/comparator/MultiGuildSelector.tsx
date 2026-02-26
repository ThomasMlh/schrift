import {
  VStack,
  HStack,
  Box,
  Text,
  IconButton,
  Card,
  CardBody,
  useColorModeValue,
  Badge
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { CustomSelect } from "../ui/CustomSelect";
import type { IGuild } from "@/interfaces";

interface SelectedGuild {
  id: string;
  guild: IGuild;
}

interface MultiGuildSelectorProps {
  selectedGuilds: SelectedGuild[];
  onAddGuild: (guildId: string, guild: IGuild) => void;
  onRemoveGuild: (id: string) => void;
  maxGuilds?: number;
  availableGuilds: IGuild[];
}

export const MultiGuildSelector = ({
  selectedGuilds,
  onAddGuild,
  onRemoveGuild,
  maxGuilds = 5,
  availableGuilds
}: MultiGuildSelectorProps) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.700");
  const [selectedGuildId, setSelectedGuildId] = useState("");

  const handleGuildSelect = (guildId: string) => {
    const guild = availableGuilds.find((g) => g._id === guildId);
    if (guild && selectedGuilds.length < maxGuilds) {
      onAddGuild(guildId, guild);
      setSelectedGuildId("");
    }
  };

  const availableGuildsFiltered = availableGuilds.filter(
    (guild) => !selectedGuilds.some((g) => g.id === guild._id)
  );

  const guildOptions = availableGuildsFiltered.map((guild) => ({
    value: guild._id,
    label: guild.name
  }));

  return (
    <Card bg={cardBg} borderRadius="xl" boxShadow="lg">
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Text fontSize="lg" fontWeight="bold">
                🏛️ Guildes sélectionnées
              </Text>
              <Badge colorScheme="purple" fontSize="sm">
                {selectedGuilds.length}/{maxGuilds}
              </Badge>
            </HStack>
          </HStack>

          {/* Liste des guildes sélectionnées */}
          <VStack spacing={3} align="stretch">
            {selectedGuilds.map((selected, index) => (
              <Box
                key={selected.id}
                p={3}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                bg={bgColor}
                transition="all 0.2s"
                _hover={{
                  borderColor: "purple.400",
                  transform: "translateX(4px)"
                }}
              >
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Badge colorScheme="purple" fontSize="sm">
                      #{index + 1}
                    </Badge>
                    <Text fontWeight="medium">{selected.guild.name}</Text>
                  </HStack>
                  <IconButton
                    icon={<CloseIcon />}
                    aria-label="Retirer la guilde"
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => onRemoveGuild(selected.id)}
                  />
                </HStack>
              </Box>
            ))}

            {selectedGuilds.length === 0 && (
              <Box
                p={6}
                textAlign="center"
                borderRadius="lg"
                borderWidth="2px"
                borderStyle="dashed"
                borderColor={borderColor}
              >
                <Text color="gray.500" fontSize="sm">
                  Aucune guilde sélectionnée
                </Text>
                <Text color="gray.400" fontSize="xs" mt={1}>
                  Ajoutez jusqu'à {maxGuilds} guildes pour comparer
                </Text>
              </Box>
            )}
          </VStack>

          {/* Sélecteur d'ajout */}
          {selectedGuilds.length < maxGuilds && (
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.600">
                Ajouter une guilde
              </Text>
              <CustomSelect
                options={guildOptions}
                value={selectedGuildId}
                onChange={handleGuildSelect}
                placeholder="Sélectionner une guilde..."
              />
            </Box>
          )}

          {selectedGuilds.length >= maxGuilds && (
            <Text fontSize="xs" color="orange.500" textAlign="center">
              ⚠️ Limite de {maxGuilds} guildes atteinte
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};
