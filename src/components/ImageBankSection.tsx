import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { AddIcon, EditIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { mutate as swrMutate } from "swr";
import { useAccessories, useCharacterMeta, useAccessoryCodes } from "../hooks/useAPI";
import { useAccessoryMutations } from "@/hooks/useAPIMutations";
import {
  getAffinityIcon,
  getCategoryIcon,
  getKillerIcon,
} from "../utils/characterIcons";
import { useAuth } from "../providers/AuthProvider";
import type { IAccessory } from "../interfaces";
import { PageLoader } from "./ui/PageLoader";
import { apiUrl } from "../utils/apiRequest";

const bucketUrl = import.meta.env.VITE_BUCKET_URL;

type Bank = "accessories" | "killers" | "categories" | "affinity";

const BANKS: { key: Bank; label: string; icon: string }[] = [
  { key: "accessories", label: "Accessoires", icon: "\u{1F48D}" },
  { key: "killers", label: "Killers", icon: "\u2694\uFE0F" },
  { key: "categories", label: "Catégories", icon: "\u{1F4C2}" },
  { key: "affinity", label: "Affinités", icon: "\u2728" },
];

// ─── Modale création / édition accessoire

interface AccessoryFormModalProps {
  accessory: IAccessory | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  token: string | null;
}

const AccessoryFormModal = ({
  accessory,
  isOpen,
  onClose,
  onSaved,
  token,
}: AccessoryFormModalProps) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const toast = useToast();
  const isEdit = accessory !== null;
  const { saveAccessory } = useAccessoryMutations();
  const previewBg = useColorModeValue("gray.100", "gray.700");
  const browseBg = useColorModeValue("gray.50", "gray.900");
  const browseBorder = useColorModeValue("gray.200", "gray.700");
  const codeHoverBg = useColorModeValue("purple.50", "purple.900");
  const codeFallbackBg = useColorModeValue("gray.200", "gray.700");

  const { codes, isLoading: isLoadingCodes, fetchCodes } = useAccessoryCodes(token);

  useEffect(() => {
    if (isOpen) {
      setName(accessory?.name ?? "");
      setCode(accessory?.code ?? "");
      setIsBrowsing(false);
    }
  }, [isOpen, accessory]);

  const handleOpenBrowser = () => {
    if (!isBrowsing && codes.length === 0) fetchCodes();
    setIsBrowsing((v) => !v);
  };

  const handleSelectCode = (c: string) => {
    setCode(c);
    setIsBrowsing(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Le nom est obligatoire", status: "error", duration: 3000 });
      return;
    }
    setIsSaving(true);
    try {
      await saveAccessory(
        { name: name.trim(), code: code.trim() || null },
        isEdit && accessory!._id ? accessory!._id : undefined
      );
      toast({
        title: isEdit ? "Accessoire mis à jour" : "Accessoire créé",
        status: "success",
        duration: 2000,
      });
      onSaved();
    } catch (err: unknown) {
      toast({ title: (err as Error).message, status: "error", duration: 4000 });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isEdit ? "Modifier l’accessoire" : "Nouvel accessoire"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm">Nom</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Pilule fortifiante"
                size="sm"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">
                <HStack justify="space-between">
                  <Text as="span">Code</Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="purple"
                    onClick={handleOpenBrowser}
                  >
                    {isBrowsing ? "Masquer" : "Parcourir…"}
                  </Button>
                </HStack>
              </FormLabel>
              <HStack>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ex: 0012"
                  size="sm"
                  fontFamily="mono"
                />
                <Flex
                  boxSize="36px"
                  borderRadius="md"
                  bg={previewBg}
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  {code.trim() ? (
                    <Image
                      src={`${bucketUrl}/accessories/${code.trim()}/thumb.png`}
                      alt="preview"
                      boxSize="32px"
                      objectFit="contain"
                      borderRadius="md"
                      fallback={<Text fontSize="lg">❓</Text>}
                    />
                  ) : (
                    <Text fontSize="xs" color="gray.400">—</Text>
                  )}
                </Flex>
              </HStack>
            </FormControl>

            {/* Navigateur d'images */}
            {isBrowsing && (
              <Box
                mt={1}
                p={2}
                bg={browseBg}
                border="1px solid"
                borderColor={browseBorder}
                borderRadius="md"
                maxH="420px"
                overflowY="auto"
              >
                {isLoadingCodes ? (
                  <Flex justify="center" py={4}><Spinner size="sm" /></Flex>
                ) : codes.length === 0 ? (
                  <Text fontSize="xs" color="gray.500" textAlign="center" py={4}>
                    Aucune image trouvée dans le bucket
                  </Text>
                ) : (
                  <Grid templateColumns="repeat(auto-fill, minmax(96px, 1fr))" gap={2}>
                    {codes.map((c) => (
                      <Flex
                        key={c}
                        direction="column"
                        align="center"
                        gap={1}
                        p={1.5}
                        borderRadius="md"
                        cursor="pointer"
                        bg={code === c ? "purple.500" : "transparent"}
                        color={code === c ? "white" : "inherit"}
                        _hover={{ bg: code === c ? "purple.600" : codeHoverBg }}
                        transition="background 0.12s"
                        onClick={() => handleSelectCode(c)}
                      >
                        <Image
                          src={`${bucketUrl}/accessories/${c}/thumb.png`}
                          alt={c}
                          boxSize="56px"
                          objectFit="contain"
                          borderRadius="sm"
                          fallback={
                            <Flex
                              boxSize="56px"
                              borderRadius="sm"
                              bg={codeFallbackBg}
                              align="center"
                              justify="center"
                            >
                              <Text fontSize="lg">❓</Text>
                            </Flex>
                          }
                        />
                        <Text
                          fontSize="2xs"
                          fontFamily="mono"
                          textAlign="center"
                          wordBreak="break-all"
                          lineHeight={1.2}
                        >
                          {c}
                        </Text>
                      </Flex>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            size="sm"
            colorScheme="purple"
            onClick={handleSave}
            isLoading={isSaving}
          >
            {isEdit ? "Mettre à jour" : "Créer"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

// ─── Image card générique

interface ImageCardProps {
  src: string | null;
  label: string;
  sublabel?: string;
  onEdit?: () => void;
}

const ImageCard = ({ src, label, sublabel, onEdit }: ImageCardProps) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const emptyBg = useColorModeValue("gray.100", "gray.700");
  const labelColor = useColorModeValue("gray.700", "gray.200");
  const [imgError, setImgError] = useState(false);

  return (
    <Flex
      direction="column"
      align="center"
      gap={2}
      p={3}
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      boxShadow="sm"
      minW={0}
      position="relative"
      role="group"
    >
      {onEdit && (
        <IconButton
          aria-label="Modifier"
          icon={<EditIcon />}
          size="xs"
          position="absolute"
          top={1.5}
          right={1.5}
          opacity={0}
          _groupHover={{ opacity: 1 }}
          transition="opacity 0.15s"
          variant="ghost"
          colorScheme="purple"
          onClick={onEdit}
        />
      )}

      {src && !imgError ? (
        <Image
          src={src}
          alt={label}
          w="52px"
          h="52px"
          objectFit="contain"
          borderRadius="md"
          onError={() => setImgError(true)}
        />
      ) : (
        <Flex
          w="52px"
          h="52px"
          borderRadius="md"
          bg={emptyBg}
          align="center"
          justify="center"
        >
          <Text fontSize="xl">❓</Text>
        </Flex>
      )}

      {sublabel && (
        <Text fontSize="2xs" color="purple.400" fontFamily="mono" lineHeight={1}>
          {sublabel}
        </Text>
      )}
      <Text
        fontSize="xs"
        color={labelColor}
        textAlign="center"
        wordBreak="break-word"
        lineHeight="1.3"
        maxW="90px"
      >
        {label}
      </Text>
    </Flex>
  );
};

// ─── Onglet Accessoires

const AccessoriesBank = ({ token }: { token: string | null }) => {
  const { accessories, isLoading, mutate: mutateAccessories } = useAccessories();
  const [editing, setEditing] = useState<IAccessory | null | undefined>(undefined);

  const handleSaved = () => {
    mutateAccessories();
    swrMutate(`${apiUrl}/api/accessories`);
    setEditing(undefined);
  };

  if (isLoading) {
    return <PageLoader height="200px" />;
  }

  const withCode = accessories.filter((a) => a.code);

  return (
    <>
      <HStack mb={4} justify="space-between">
        <Text fontSize="sm" color="gray.500">
          {accessories.length} accessoires · {withCode.length} avec image ·{" "}
          {accessories.length - withCode.length} sans code
        </Text>
        <Button
          size="sm"
          leftIcon={<AddIcon />}
          colorScheme="purple"
          variant="outline"
          borderRadius="full"
          onClick={() => setEditing(null)}
        >
          Ajouter
        </Button>
      </HStack>

      <Grid templateColumns="repeat(auto-fill, minmax(110px, 1fr))" gap={3}>
        {accessories.map((acc) => (
          <ImageCard
            key={acc._id}
            src={acc.code ? `${bucketUrl}/accessories/${acc.code}/thumb.png` : null}
            label={acc.name}
            sublabel={acc.code}
            onEdit={() => setEditing(acc)}
          />
        ))}
      </Grid>

      {editing !== undefined && (
        <AccessoryFormModal
          accessory={editing}
          isOpen={true}
          onClose={() => setEditing(undefined)}
          onSaved={handleSaved}
          token={token}
        />
      )}
    </>
  );
};

// ─── Onglets Killers / Catégories / Affinités

type IconFn = (name: string) => string | null;

const MetaBank = ({
  items,
  iconFn,
  isLoading,
}: {
  items: string[];
  iconFn: IconFn;
  isLoading: boolean;
}) => {
  if (isLoading) return <PageLoader height="200px" />;
  if (!items.length) return <Text color="gray.500">Aucune donnée</Text>;

  return (
    <Grid templateColumns="repeat(auto-fill, minmax(110px, 1fr))" gap={3}>
      {items.map((name) => (
        <ImageCard key={name} src={iconFn(name)} label={name} />
      ))}
    </Grid>
  );
};

// ─── Section principale

const ImageBankSection = () => {
  const [activeBank, setActiveBank] = useState<Bank>("accessories");
  const { killers, categories, affinities, isLoading: isLoadingMeta } = useCharacterMeta();
  const { token } = useAuth();

  const tabInactiveColor = useColorModeValue("gray.500", "gray.400");
  const tabInactiveBorder = useColorModeValue("gray.200", "whiteAlpha.200");
  const tabInactiveHoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
  const tabInactiveHoverBorder = useColorModeValue("gray.300", "whiteAlpha.300");

  const renderBank = () => {
    switch (activeBank) {
      case "accessories":
        return <AccessoriesBank token={token} />;
      case "killers":
        return <MetaBank items={killers} iconFn={getKillerIcon} isLoading={isLoadingMeta} />;
      case "categories":
        return <MetaBank items={categories} iconFn={getCategoryIcon} isLoading={isLoadingMeta} />;
      case "affinity":
        return <MetaBank items={affinities} iconFn={getAffinityIcon} isLoading={isLoadingMeta} />;
    }
  };

  return (
    <Box>
      <Heading size="md" mb={5}>Banque d’images</Heading>

      <HStack spacing={1} mb={6} flexWrap="wrap">
        {BANKS.map((bank) => {
          const isActive = activeBank === bank.key;
          return (
            <Button
              key={bank.key}
              size="sm"
              px={4}
              h="36px"
              borderRadius="full"
              flexShrink={0}
              transition="all 0.18s ease"
              onClick={() => setActiveBank(bank.key)}
              sx={
                isActive
                  ? {
                      background: "linear-gradient(135deg, #7C3AED, #4F46E5)",
                      color: "white",
                      boxShadow: "0 0 16px rgba(124,58,237,0.35)",
                      border: "none",
                      _hover: { background: "linear-gradient(135deg, #6D28D9, #4338CA)" },
                    }
                  : {
                      background: "transparent",
                      color: tabInactiveColor,
                      border: "1px solid",
                      borderColor: tabInactiveBorder,
                      _hover: {
                        background: tabInactiveHoverBg,
                        borderColor: tabInactiveHoverBorder,
                      },
                    }
              }
            >
              <HStack spacing={1.5}>
                <Text as="span" fontSize="sm">{bank.icon}</Text>
                <Text as="span" fontSize="sm" fontWeight={isActive ? "semibold" : "normal"}>
                  {bank.label}
                </Text>
              </HStack>
            </Button>
          );
        })}
      </HStack>

      {renderBank()}
    </Box>
  );
};

export default ImageBankSection;
