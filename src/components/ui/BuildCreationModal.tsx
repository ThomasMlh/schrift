import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  useToast,
  Text,
  Box,
  Alert,
  AlertIcon,
  Badge,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  SimpleGrid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { FiAward, FiFileText, FiImage, FiUsers } from "react-icons/fi";
import { BuildScreenshotPicker } from "./BuildScreenshotPicker";
import { chronoInputValue, parseChrono } from "@/utils/chrono";
import { bucketUrl } from "@/utils/apiRequest";
import { formatWithCommas } from "@/utils/format";

// Same cap as the API (plausible rotation scores)
const MAX_BUILD_SCORE = 625_000_000;
import { useState, useEffect, useMemo, useCallback } from "react";
import { useAPIMutations } from "../../hooks/useAPIMutations";
import { DescriptionTextarea } from "./DescriptionTextarea";
import { TeamMemberCard, type TeamMember, type TeamMemberAccessory } from "./TeamMemberCard";
import { useAuth } from "@/providers/AuthProvider";
import { useTranslation } from "react-i18next";
import type { IBuild, IBuildTeamMember, IBuildLink, ISkill } from "@/interfaces";

interface BuildCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  rotationId: string;
  onSuccess: () => void;
  buildToEdit?: IBuild;
}

const BuildCreationModal = ({ isOpen, onClose, rotationId, onSuccess, buildToEdit }: BuildCreationModalProps) => {
  const { createBuild, updateBuild, uploadBuildScreenshot, deleteBuildScreenshot } = useAPIMutations();
  const { token } = useAuth();
  const { t } = useTranslation();
  const [description, setDescription] = useState("");
  const [team, setTeam] = useState<TeamMember[]>([
    { id_character: "", position: 1, links: [], skills: [], accessories: [] },
    { id_character: "", position: 2, links: [], skills: [], accessories: [] },
    { id_character: "", position: 3, links: [], skills: [], accessories: [] },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Result (text fields, converted on submit) and screenshot
  const [scoreInput, setScoreInput] = useState("");
  const [normalWaveInput, setNormalWaveInput] = useState("");
  const [extraWaveInput, setExtraWaveInput] = useState("");
  // New screenshot (data URL); null = no new screenshot
  const [newScreenshot, setNewScreenshot] = useState<string | null>(null);
  // Existing screenshot removed by the user
  const [screenshotRemoved, setScreenshotRemoved] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();
  const isEditMode = !!buildToEdit;
  const buildId = buildToEdit?._id;

  useEffect(() => {
    // Reset or prefill the form when the modal opens
    if (isOpen) {
      if (buildToEdit) {
        setDescription(buildToEdit.description || "");
        
        const editTeam: TeamMember[] = [
          { id_character: "", position: 1, links: [], skills: [], accessories: [] },
          { id_character: "", position: 2, links: [], skills: [], accessories: [] },
          { id_character: "", position: 3, links: [], skills: [], accessories: [] },
        ];
        
        if (buildToEdit.team && Array.isArray(buildToEdit.team)) {
          buildToEdit.team.forEach((member: IBuildTeamMember) => {
            const position = member.position - 1; // 0-based index
            if (position >= 0 && position < 3) {
              editTeam[position] = {
                id_character: member.character?._id || member.id_character || "",
                position: member.position,
                links: member.links?.map((link: IBuildLink) => ({
                  id_character: link.character?._id || link.id_character || ""
                })) || [],
                skills: member.skills?.map((skill: string | ISkill) => typeof skill === 'string' ? skill : skill._id) || [],
                accessories: member.accessories?.map((acc) => ({
                  id_accessory: acc.accessory?._id || acc.id_accessory || "",
                  id_subeffect: acc.subeffect?._id || acc.id_subeffect
                })) || []
              };
            }
          });
        }
        
        setTeam(editTeam);
        setScoreInput(buildToEdit.score != null ? String(buildToEdit.score) : "");
        setNormalWaveInput(chronoInputValue(buildToEdit.time_normal_wave));
        setExtraWaveInput(chronoInputValue(buildToEdit.time_extra_wave));
      } else {
        setDescription("");
        setScoreInput("");
        setNormalWaveInput("");
        setExtraWaveInput("");
        setTeam([
          { id_character: "", position: 1, links: [], skills: [], accessories: [] },
          { id_character: "", position: 2, links: [], skills: [], accessories: [] },
          { id_character: "", position: 3, links: [], skills: [], accessories: [] },
        ]);
      }
    }
    if (isOpen) {
      setNewScreenshot(null);
      setScreenshotRemoved(false);
      setActiveTab(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, buildId]); // Depend on the id only, not on the whole buildToEdit object

  const usedCharacterIds = useMemo(() => team.flatMap((member) => [
    member.id_character,
    ...member.links.map((link) => link.id_character),
  ]).filter(Boolean), [team]);

  const handleCharacterChange = useCallback((position: number, characterId: string) => {
    setTeam((prev) => prev.map((member) =>
      member.position === position ? { ...member, id_character: characterId } : member
    ));
  }, []);

  const handleRemoveLink = useCallback((position: number, linkIndex: number) => {
    setTeam((prev) =>
      prev.map((member) =>
        member.position === position
          ? { ...member, links: member.links.filter((_, i) => i !== linkIndex) }
          : member
      )
    );
  }, []);

  const handleLinkChange = useCallback((position: number, linkIndex: number, characterId: string) => {
    setTeam((prev) => prev.map((member) => {
      if (member.position !== position) return member;
      const links = [...member.links];
      links[linkIndex] = { id_character: characterId };
      return { ...member, links };
    }));
  }, []);

  const handleSkillsChange = useCallback((position: number, skillIds: string[]) => {
    setTeam((prev) =>
      prev.map((member) =>
        member.position === position ? { ...member, skills: skillIds } : member
      )
    );
  }, []);

  const handleRemoveAccessory = useCallback((position: number, accessoryIndex: number) => {
    setTeam((prev) =>
      prev.map((member) =>
        member.position === position
          ? {
              ...member,
              accessories: member.accessories?.filter((_, i) => i !== accessoryIndex),
            }
          : member
      )
    );
  }, []);

  const handleAccessoryChange = useCallback((
    position: number,
    accessoryIndex: number,
    accessory: TeamMemberAccessory
  ) => {
    setTeam((prev) =>
      prev.map((member) => {
        if (member.position !== position) return member;

        const accessories = [...(member.accessories || [])];
        accessories[accessoryIndex] = accessory;

        return { ...member, accessories };
      })
    );
  }, []);

  // Entered result: score as digits (spaces allowed), times in seconds
  const scoreDigits = scoreInput;
  const scoreValue = scoreDigits ? Number(scoreDigits) : null;
  const scoreInvalid = scoreDigits !== "" && (!/^\d+$/.test(scoreDigits) || (scoreValue ?? 0) > MAX_BUILD_SCORE);
  const normalWave = parseChrono(normalWaveInput);
  const extraWave = parseChrono(extraWaveInput);
  const normalInvalid = normalWave !== null && Number.isNaN(normalWave);
  const extraInvalid = extraWave !== null && Number.isNaN(extraWave);

  const existingScreenshotUrl = buildToEdit?.screenshot && !screenshotRemoved ? `${bucketUrl}/builds/${buildToEdit.screenshot}` : null;
  const screenshotPreview = newScreenshot ?? existingScreenshotUrl;
  const handleScreenshotChange = (dataUrl: string | null) => {
    setNewScreenshot(dataUrl);
    if (!dataUrl) setScreenshotRemoved(true);
  };

  const filledCount = team.filter((m) => m.id_character).length;
  const hasResult = scoreValue != null || normalWave != null || extraWave != null;

  // Uploads, replaces or removes the screenshot once the build is saved. A failure does not undo
  // the build save; the user is only warned.
  const saveScreenshot = async (savedBuildId: string) => {
    try {
      if (newScreenshot) {
        await uploadBuildScreenshot(savedBuildId, newScreenshot);
      } else if (screenshotRemoved && buildToEdit?.screenshot) {
        await deleteBuildScreenshot(savedBuildId);
      }
    } catch (error) {
      toast({
        title: t("components.buildScreenshot.saveError"),
        description: (error as Error).message,
        status: "warning",
        duration: 6000,
      });
    }
  };

  const handleSubmit = async () => {
    if (!token) {
      toast({
        title: t("components.buildCreationModal.toastAuthTitle"),
        description: t(isEditMode ? "components.buildCreationModal.toastAuthDescEdit" : "components.buildCreationModal.toastAuthDescCreate"),
        status: "error",
        duration: 5000,
      });
      return;
    }

    const hasAtLeastOneCharacter = team.some((member) => member.id_character !== "");
    if (!hasAtLeastOneCharacter) {
      toast({
        title: t("components.buildCreationModal.toastValidationTitle"),
        description: t("components.buildCreationModal.toastValidationDesc"),
        status: "error",
        duration: 5000,
      });
      return;
    }

    if (scoreInvalid || normalInvalid || extraInvalid) {
      setActiveTab(1);
      toast({
        title: t("components.buildCreationModal.toastValidationTitle"),
        description: t("components.buildCreationModal.toastResultInvalid"),
        status: "error",
        duration: 5000,
      });
      return;
    }

    const resultPayload = {
      score: scoreValue,
      time_normal_wave: normalWave,
      time_extra_wave: extraWave,
    };

    // Drop members without a character and validate links
    const filteredTeam = team
      .filter((member) => member.id_character !== "")
      .map((member) => ({
        ...member,
        links: member.links.filter((link) => link.id_character !== ""),
        skills: member.skills && member.skills.length > 0 ? member.skills : undefined,
        accessories: member.accessories
          ?.filter((acc) => acc.id_accessory !== "")
          .map((acc) => ({
            id_accessory: acc.id_accessory,
            ...(acc.id_subeffect && { id_subeffect: acc.id_subeffect }),
          })),
      }));

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        await updateBuild(buildToEdit._id!, {
          rotation_id: rotationId,
          description: description.trim(),
          team: filteredTeam,
          ...resultPayload,
        });
        await saveScreenshot(buildToEdit._id!);

        toast({
          title: t("components.buildCreationModal.toastSuccessEditTitle"),
          description: t("components.buildCreationModal.toastSuccessEditDesc"),
          status: "success",
          duration: 5000,
        });
      } else {
        const created = await createBuild({
          rotation_id: rotationId,
          description: description.trim(),
          team: filteredTeam,
          ...resultPayload,
        }) as { data?: { _id?: string } };
        if (created?.data?._id) await saveScreenshot(created.data._id);

        toast({
          title: t("components.buildCreationModal.toastSuccessCreateTitle"),
          description: t("components.buildCreationModal.toastSuccessCreateDesc"),
          status: "success",
          duration: 5000,
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      const err = error as Error;
      toast({
        title: t("components.buildCreationModal.toastErrorTitle"),
        description: err.message || t(isEditMode ? "components.buildCreationModal.toastErrorDescEdit" : "components.buildCreationModal.toastErrorDescCreate"),
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader borderBottomWidth="1px" borderColor="border.subtle">{isEditMode ? t("components.buildCreationModal.titleEdit") : t("components.buildCreationModal.titleCreate")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody py={4}>
          <VStack spacing={4} align="stretch">
            <Alert status="info" borderRadius="md" py={2}>
              <AlertIcon />
              <Text fontSize="sm">
                {isEditMode
                  ? t("components.buildCreationModal.alertEdit")
                  : t("components.buildCreationModal.alertCreate")
                }
              </Text>
            </Alert>

            <Tabs index={activeTab} onChange={setActiveTab} variant="soft-rounded" colorScheme="purple" size="sm" isLazy={false}>
              <TabList gap={1} flexWrap="wrap" mb={4}>
                <Tab color="text.secondary" fontWeight="semibold" gap={2}>
                  <Icon as={FiUsers} aria-hidden />
                  {t("components.buildCreationModal.tabTeam")}
                  <Badge colorScheme={filledCount > 0 ? "purple" : "gray"} variant="subtle" borderRadius="full">{filledCount}/3</Badge>
                </Tab>
                <Tab color="text.secondary" fontWeight="semibold" gap={2}>
                  <Icon as={FiAward} aria-hidden />
                  {t("components.buildCreationModal.tabResult")}
                  {(scoreInvalid || normalInvalid || extraInvalid)
                    ? <Box w="8px" h="8px" borderRadius="full" bg="red.400" />
                    : hasResult && <Box w="8px" h="8px" borderRadius="full" bg="green.400" />}
                </Tab>
                <Tab color="text.secondary" fontWeight="semibold" gap={2}>
                  <Icon as={FiImage} aria-hidden />
                  {t("components.buildCreationModal.tabScreenshot")}
                  {screenshotPreview && <Box w="8px" h="8px" borderRadius="full" bg="green.400" />}
                </Tab>
                <Tab color="text.secondary" fontWeight="semibold" gap={2}>
                  <Icon as={FiFileText} aria-hidden />
                  {t("components.buildCreationModal.tabNotes")}
                  {description.trim() && <Box w="8px" h="8px" borderRadius="full" bg="green.400" />}
                </Tab>
              </TabList>

              <TabPanels>
                {/* Team: one position per sub-tab */}
                <TabPanel p={0}>
                  <Tabs variant="line" colorScheme="purple" size="sm">
                    <TabList>
                      {team.map((member) => (
                        <Tab key={member.position} fontWeight="semibold" gap={2}>
                          {member.id_character && (
                            <Box
                              as="img"
                              src={`${bucketUrl}/characters/thumb/${member.id_character}.png`}
                              alt=""
                              w="24px"
                              h="24px"
                              borderRadius="full"
                              objectFit="cover"
                            />
                          )}
                          {t("components.buildCreationModal.position", { pos: member.position })}
                        </Tab>
                      ))}
                    </TabList>
                    <TabPanels>
                      {team.map((member) => (
                        <TabPanel key={member.position} px={0}>
                          <TeamMemberCard
                            member={member}
                            usedCharacterIds={usedCharacterIds}
                            onCharacterChange={handleCharacterChange}
                            onRemoveLink={handleRemoveLink}
                            onLinkChange={handleLinkChange}
                            onSkillsChange={handleSkillsChange}
                            onRemoveAccessory={handleRemoveAccessory}
                            onAccessoryChange={handleAccessoryChange}
                          />
                        </TabPanel>
                      ))}
                    </TabPanels>
                  </Tabs>
                </TabPanel>

                <TabPanel p={0}>
                  <VStack align="stretch" spacing={4}>
                    <Text fontSize="sm" color="text.muted">{t("components.buildCreationModal.resultHint")}</Text>
                    <FormControl isInvalid={scoreInvalid}>
                      <FormLabel fontSize="sm">{t("components.buildCreationModal.score")}</FormLabel>
                      <Input
                        inputMode="numeric"
                        placeholder="612,480,300"
                        // Commas every 3 digits while typing, like the bulk entry
                        value={formatWithCommas(scoreInput)}
                        onChange={(e) => setScoreInput(e.target.value.replace(/\D/g, ""))}
                        maxW="260px"
                      />
                      <FormErrorMessage>{t("components.buildCreationModal.scoreInvalid")}</FormErrorMessage>
                    </FormControl>
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} alignItems="start" maxW="520px">
                      <FormControl isInvalid={normalInvalid}>
                        <FormLabel fontSize="sm">{t("components.buildCreationModal.timeNormalWave")}</FormLabel>
                        <Input inputMode="decimal" placeholder="56.598" value={normalWaveInput} onChange={(e) => setNormalWaveInput(e.target.value)} />
                        <FormErrorMessage>{t("components.buildCreationModal.chronoInvalid")}</FormErrorMessage>
                      </FormControl>
                      <FormControl isInvalid={extraInvalid}>
                        <FormLabel fontSize="sm">{t("components.buildCreationModal.timeExtraWave")}</FormLabel>
                        <Input inputMode="decimal" placeholder="1:02.345" value={extraWaveInput} onChange={(e) => setExtraWaveInput(e.target.value)} />
                        <FormErrorMessage>{t("components.buildCreationModal.chronoInvalid")}</FormErrorMessage>
                      </FormControl>
                    </SimpleGrid>
                    <Text fontSize="xs" color="text.muted">{t("components.buildCreationModal.chronoFormat")}</Text>
                  </VStack>
                </TabPanel>

                <TabPanel p={0}>
                  <BuildScreenshotPicker value={screenshotPreview} onChange={handleScreenshotChange} />
                </TabPanel>

                <TabPanel p={0}>
                  <DescriptionTextarea value={description} onChange={setDescription} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </ModalBody>

        <ModalFooter borderTopWidth="1px" borderColor="border.subtle">
          <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isSubmitting}>
            {t("components.buildCreationModal.buttonCancel")}
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText={isEditMode ? t("components.buildCreationModal.loadingEdit") : t("components.buildCreationModal.loadingCreate")}
          >
            {isEditMode ? t("components.buildCreationModal.buttonEdit") : t("components.buildCreationModal.buttonCreate")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BuildCreationModal;
