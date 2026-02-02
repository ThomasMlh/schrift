import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Button,
    VStack,
    Box,
    Text
} from "@chakra-ui/react";
import { CycleSelect } from "./CycleSelect";
import { CustomSelect } from "./CustomSelect";
import type { IUser, ICycle } from "../../interfaces";
import { UserSearchSelect } from "./UserSearchSelect";

interface ScoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: IUser[];
    cycles: ICycle[];
    selectedUserId: string;
    setSelectedUserId: (id: string) => void;
    selectedCycleId: string;
    setSelectedCycleId: (id: string) => void;
    selectedRotationId: string;
    setSelectedRotationId: (id: string) => void;
    scoreValue: number;
    setScoreValue: (value: number) => void;
    userSearchQuery: string;
    setUserSearchQuery: (query: string) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    isLoadingCycles: boolean;
    title: string;
    submitButtonText: string;
    submitButtonColor?: string;
    isEdit?: boolean;
}

export const ScoreModal = ({
    isOpen,
    onClose,
    users,
    cycles,
    selectedUserId,
    setSelectedUserId,
    selectedCycleId,
    setSelectedCycleId,
    selectedRotationId,
    setSelectedRotationId,
    scoreValue,
    setScoreValue,
    userSearchQuery,
    setUserSearchQuery,
    onSubmit,
    isSubmitting,
    isLoadingCycles,
    title,
    submitButtonText,
    submitButtonColor = "blue",
    isEdit = false
}: ScoreModalProps) => {
    const selectedCycle = cycles.find(cycle => cycle._id === selectedCycleId);
    const selectedUser = users.find(u => u._id === selectedUserId);

    // Fonction pour formater les nombres avec des virgules
    const formatNumber = (value: string | number): string => {
        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
        return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // Fonction pour parser les nombres formatés
    const parseNumber = (value: string): string => {
        return value.replace(/,/g, '');
    };

    const handleClose = () => {
        setSelectedCycleId("");
        setSelectedRotationId("");
        setSelectedUserId("");
        setUserSearchQuery("");
        setScoreValue(0);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>{title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Joueur</FormLabel>
                            {isEdit && selectedUser ? (
                                <Box
                                    p={3}
                                    borderWidth="1px"
                                    borderRadius="md"
                                    bg="gray.50"
                                    _dark={{ bg: "gray.700" }}
                                >
                                    <Text fontWeight="medium">
                                        {selectedUser.bbs_name || selectedUser.global_name}
                                    </Text>
                                    {selectedUser.discord_id && (
                                        <Text fontSize="sm" color="gray.500">
                                            Discord: {selectedUser.discord_id}
                                        </Text>
                                    )}
                                </Box>
                            ) : (
                                <UserSearchSelect
                                    users={users}
                                    selectedUserId={selectedUserId}
                                    onUserSelect={setSelectedUserId}
                                    searchQuery={userSearchQuery}
                                    onSearchChange={setUserSearchQuery}
                                    placeholder="Rechercher et sélectionner un joueur"
                                />
                            )}
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Cycle</FormLabel>
                            <CycleSelect
                                cycles={cycles}
                                value={selectedCycleId}
                                onChange={(value) => {
                                    setSelectedCycleId(value);
                                    setSelectedRotationId(""); // Reset rotation selection
                                }}
                                placeholder="Sélectionner un cycle"
                                isDisabled={isLoadingCycles || isEdit}
                                allowDeselect={false}
                                showActiveBadge={true}
                                size="md"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Rotation</FormLabel>
                            <CustomSelect
                                placeholder="Sélectionner une rotation"
                                value={selectedRotationId}
                                onChange={setSelectedRotationId}
                                isDisabled={!selectedCycle || isEdit}
                                options={(selectedCycle?.rotations || [])
                                    .filter(rotation => rotation._id)
                                    .map((rotation, index) => ({
                                        value: rotation._id as string,
                                        label: `#${index + 1} - ${rotation.killer} (${rotation.period})`
                                    }))}
                                allowDeselect={false}
                                size="md"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Score</FormLabel>
                            <NumberInput
                                value={scoreValue}
                                onChange={(_, value) => setScoreValue(value || 0)}
                                min={0}
                                max={9999999999}
                                step={1000}
                                format={formatNumber}
                                parse={parseNumber}
                            >
                                <NumberInputField placeholder="Saisir le score" />
                                <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                        </FormControl>

                        {selectedUser && (
                            <Box 
                                w="full" 
                                p={3} 
                                bg={isEdit ? "yellow.50" : "blue.50"} 
                                _dark={{ bg: isEdit ? "yellow.900" : "blue.900" }} 
                                borderRadius="md"
                            >
                                <Text 
                                    fontSize="sm" 
                                    color={isEdit ? "yellow.700" : "blue.600"} 
                                    _dark={{ color: isEdit ? "yellow.200" : "blue.200" }}
                                >
                                    <strong>{isEdit ? "Modification pour:" : "Score pour:"}</strong> {selectedUser.bbs_name || selectedUser.global_name}
                                </Text>
                            </Box>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={handleClose}>
                        Annuler
                    </Button>
                    <Button
                        colorScheme={submitButtonColor}
                        onClick={onSubmit}
                        isLoading={isSubmitting}
                        loadingText={`${isEdit ? "Modification" : "Ajout"}...`}
                        isDisabled={!selectedUserId || !selectedCycleId || !selectedRotationId || scoreValue < 0}
                    >
                        {submitButtonText}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};