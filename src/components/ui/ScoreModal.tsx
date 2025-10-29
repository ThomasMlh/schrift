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
    Select,
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
import type { User, Cycle } from "../../interfaces";
import { UserSearchSelect } from "./UserSearchSelect";

interface ScoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    cycles: Cycle[];
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
                            <UserSearchSelect
                                users={users}
                                selectedUserId={selectedUserId}
                                onUserSelect={setSelectedUserId}
                                searchQuery={userSearchQuery}
                                onSearchChange={setUserSearchQuery}
                                placeholder="Rechercher et sélectionner un joueur"
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Cycle</FormLabel>
                            <Select
                                placeholder="Sélectionner un cycle"
                                value={selectedCycleId}
                                onChange={(e) => {
                                    setSelectedCycleId(e.target.value);
                                    setSelectedRotationId(""); // Reset rotation selection
                                }}
                                isDisabled={isLoadingCycles}
                            >
                                {cycles.map((cycle) => (
                                    <option key={cycle._id} value={cycle._id}>
                                        {cycle.name} ({cycle.rotations?.length || 0} rotations)
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Rotation</FormLabel>
                            <Select
                                placeholder="Sélectionner une rotation"
                                value={selectedRotationId}
                                onChange={(e) => setSelectedRotationId(e.target.value)}
                                isDisabled={!selectedCycle}
                            >
                                {selectedCycle?.rotations.map((rotation, index) => (
                                    <option key={rotation._id} value={rotation._id}>
                                        #{index + 1} - {rotation.killer} ({rotation.period})
                                    </option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Score</FormLabel>
                            <NumberInput
                                value={scoreValue}
                                onChange={(_, value) => setScoreValue(value || 0)}
                                min={0}
                                max={9999999999}
                                step={1000}
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
                                    <strong>{isEdit ? "Modification pour:" : "Score pour:"}</strong> {selectedUser.global_name || selectedUser.username}
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