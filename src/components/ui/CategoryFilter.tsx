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
import { CategoryIcon } from "./CategoryIcon";
import { useTranslation } from "react-i18next";
import { useSelectTheme, type SelectVariant } from "@/hooks/useSelectTheme";

interface CategoryFilterProps {
  selectedCategory: string;
  categories: string[];
  onCategoryChange: (category: string) => void;
  variant?: SelectVariant;
}

export const CategoryFilter = ({
  selectedCategory,
  categories,
  onCategoryChange,
  variant = 'default'
}: CategoryFilterProps) => {
  const { t } = useTranslation();
  const theme = useSelectTheme(variant);
  return (
    <Menu matchWidth>
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
          {selectedCategory ? (
            <>
              <CategoryIcon category={selectedCategory} size="20px" />
              <Text fontSize="sm" noOfLines={1}>{t(`factions.${selectedCategory}`, selectedCategory)}</Text>
            </>
          ) : (
            <>
              <CategoryIcon category={"Toutes"} size="20px" />
              <Text fontSize="sm" noOfLines={1}>{t("factions.allCategories")}</Text>
            </>
          )}
        </HStack>
      </MenuButton>
      <MenuList maxH="200px" overflowY="auto" bg={theme.menuBg} borderColor={theme.menuBorderColor}>
        <MenuItem bg={theme.menuBg} _hover={{ bg: theme.hoverItemBg }} onClick={() => onCategoryChange("")}>
          <HStack spacing={2}>
            <CategoryIcon category={"Toutes"} size="20px" />
            <Text fontSize="sm">{t("factions.allCategories")}</Text>
          </HStack>
        </MenuItem>
        {categories.map((category) => (
          <MenuItem key={category} bg={theme.menuBg} _hover={{ bg: theme.hoverItemBg }} onClick={() => onCategoryChange(category)}>
            <HStack spacing={2}>
              <CategoryIcon category={category} size="20px" />
              <Text fontSize="sm">{t(`factions.${category}`, category)}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
