import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
  Text
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { AffinityIcon } from "./AffinityIcon";
import { useTranslation } from "react-i18next";
import { useSelectTheme, type SelectVariant } from "@/hooks/useSelectTheme";

interface AffinityFilterProps {
  selectedAffinity: string;
  affinities: string[];
  onAffinityChange: (affinity: string) => void;
  variant?: SelectVariant;
}

export const AffinityFilter = ({
  selectedAffinity,
  affinities,
  onAffinityChange,
  variant = 'default'
}: AffinityFilterProps) => {
  const { t } = useTranslation();
  const theme = useSelectTheme(variant);
  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        variant="outline"
        w="100%"
        minW={0}
        sx={{ "& > span:first-of-type": { minW: 0, overflow: "hidden" } }}
        h="40px"
        justifyContent="space-between"
        bg={theme.buttonBg}
        borderColor={theme.borderColor}
        _hover={{ borderColor: theme.hoverBorderColor }}
        _focus={{
          borderColor: "blue.500",
          boxShadow: "0 0 0 1px #3182ce"
        }}
      >
        <HStack spacing={2} minW={0}>
          {selectedAffinity ? (
            <>
              <AffinityIcon affinity={selectedAffinity} size="20px" />
              <Text fontSize="sm" noOfLines={1}>{t(`affinities.${selectedAffinity}`, selectedAffinity)}</Text>
            </>
          ) : (
            <>
              <AffinityIcon affinity={"Goton"} size="20px" />
              <Text fontSize="sm" noOfLines={1}>{t("affinities.allAffinities")}</Text>
            </>
          )}
        </HStack>
      </MenuButton>
      <MenuList maxH="200px" overflowY="auto" bg={theme.menuBg} borderColor={theme.menuBorderColor}>
        <MenuItem bg={theme.menuBg} _hover={{ bg: theme.hoverItemBg }} onClick={() => onAffinityChange("")}>
          <HStack spacing={2}>
            <AffinityIcon affinity={"Goton"} size="20px" />
            <Text fontSize="sm">{t("affinities.allAffinities")}</Text>
          </HStack>
        </MenuItem>
        {affinities.map((affinity) => (
          <MenuItem key={affinity} bg={theme.menuBg} _hover={{ bg: theme.hoverItemBg }} onClick={() => onAffinityChange(affinity)}>
            <HStack spacing={2}>
              <AffinityIcon affinity={affinity} size="20px" />
              <Text fontSize="sm">{t(`affinities.${affinity}`, affinity)}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
