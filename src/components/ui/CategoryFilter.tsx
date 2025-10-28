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

interface CategoryFilterProps {
  selectedCategory: string;
  categories: string[];
  onCategoryChange: (category: string) => void;
}

export const CategoryFilter = ({ 
  selectedCategory, 
  categories, 
  onCategoryChange 
}: CategoryFilterProps) => {
  return (
    <Menu>
      <MenuButton 
        as={Button} 
        rightIcon={<ChevronDownIcon />}
        variant="outline"
        maxW="180px"
        w="180px"
        h="40px"
        justifyContent="space-between"
        bg="white"
        borderColor="gray.200"
        _dark={{ 
          bg: "gray.800", 
          borderColor: "gray.600" 
        }}
        _hover={{ 
          borderColor: "gray.300", 
          _dark: { borderColor: "gray.500" } 
        }}
        _focus={{ 
          borderColor: "blue.500", 
          boxShadow: "0 0 0 1px #3182ce" 
        }}
      >
        <HStack spacing={2}>
          {selectedCategory ? (
            <>
              <CategoryIcon category={selectedCategory} size="20px" />
              <Text fontSize="sm">{selectedCategory}</Text>
            </>
          ) : (
            <Text fontSize="sm">Toutes les catégories</Text>
          )}
        </HStack>
      </MenuButton>
      <MenuList maxH="200px" overflowY="auto">
        <MenuItem onClick={() => onCategoryChange("")}>
          <Text fontSize="sm">Toutes les catégories</Text>
        </MenuItem>
        {categories.map(category => (
          <MenuItem key={category} onClick={() => onCategoryChange(category)}>
            <HStack spacing={2}>
              <CategoryIcon category={category} size="20px" />
              <Text fontSize="sm">{category}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};