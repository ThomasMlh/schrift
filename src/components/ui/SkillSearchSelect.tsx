import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Flex,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useState, useEffect, useRef } from "react";
import { FloatingMenu } from "./FloatingMenu";
import { useSkills } from "../../hooks/useAPI";
import { useTranslation } from "react-i18next";

interface SkillSearchSelectProps {
  value: string[];
  onChange: (skillIds: string[]) => void;
  placeholder?: string;
  size?: "sm" | "md";
  isDisabled?: boolean;
  maxSkills?: number;
}

export const SkillSearchSelect = ({
  value,
  onChange,
  placeholder,
  size = "md",
  isDisabled = false,
  maxSkills = 2,
}: SkillSearchSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);

  const bgColor = "bg.elevated";
  const borderColor = "border.default";
  const hoverBg = useColorModeValue("gray.50", "gray.600");

  const { t } = useTranslation();
  const { skills, isLoading } = useSkills(searchTerm);

  const availableSkills = skills.filter((skill) => !value.includes(skill._id));

  const selectedSkills = skills.filter((skill) => value.includes(skill._id));

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target) && !floatingRef.current?.contains(target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (skillId: string) => {
    if (value.length < maxSkills) {
      onChange([...value, skillId]);
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleRemove = (skillId: string) => {
    onChange(value.filter((id) => id !== skillId));
  };

  const handleInputFocus = () => {
    if (!isDisabled && value.length < maxSkills) {
      setIsOpen(true);
    }
  };

  const canAddMore = value.length < maxSkills;

  return (
    <Box w="100%">
      {selectedSkills.length > 0 && (
        <HStack spacing={2} mb={2} flexWrap="wrap">
          {selectedSkills.map((skill) => (
            <Badge
              key={skill._id}
              colorScheme="purple"
              fontSize={size === "sm" ? "xs" : "sm"}
              px={3}
              py={1}
              borderRadius="full"
              cursor="pointer"
              onClick={() => !isDisabled && handleRemove(skill._id)}
              _hover={!isDisabled ? { opacity: 0.7 } : {}}
            >
              {skill.name} ✕
            </Badge>
          ))}
        </HStack>
      )}

      {canAddMore && (
        <Box position="relative" ref={menuRef}>
          <InputGroup size={size}>
            <InputLeftElement pointerEvents="none">
              {isLoading ? <Spinner size="sm" /> : <SearchIcon color="gray.400" />}
            </InputLeftElement>
            <Input
              placeholder={placeholder ?? t("components.buildForm.searchSkill")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleInputFocus}
              isDisabled={isDisabled}
              bg={bgColor}
            />
          </InputGroup>

          {isOpen && !isDisabled && (
            <FloatingMenu anchorRef={menuRef} menuRef={floatingRef} maxH={200}>
              {isLoading ? (
                <Flex justify="center" p={4}>
                  <Spinner size="sm" />
                </Flex>
              ) : availableSkills.length === 0 ? (
                <Text p={4} textAlign="center" color="gray.500" fontSize="sm">
                  {t("components.buildForm.noSkill")}
                </Text>
              ) : (
                <VStack spacing={0} align="stretch">
                  {availableSkills.map((skill) => (
                    <HStack
                      key={skill._id}
                      p={3}
                      cursor="pointer"
                      _hover={{ bg: hoverBg }}
                      onClick={() => handleSelect(skill._id)}
                      spacing={3}
                      borderBottom="1px solid"
                      borderColor={borderColor}
                      _last={{ borderBottom: "none" }}
                    >
                      <Text fontSize={size === "sm" ? "sm" : "md"} flex={1}>
                        {skill.name}
                      </Text>
                      {skill.description && (
                        <Text fontSize="xs" color="gray.500" isTruncated maxW="200px">
                          {skill.description}
                        </Text>
                      )}
                    </HStack>
                  ))}
                </VStack>
              )}
            </FloatingMenu>
          )}
        </Box>
      )}

      {!canAddMore && (
        <Text fontSize="xs" color="gray.500" mt={1}>
          {t("components.buildForm.maxSkills", { count: maxSkills })}
        </Text>
      )}
    </Box>
  );
};
