import { useState } from "react";
import { jwtDecode } from 'jwt-decode';
import {
    Container,
    VStack,
    Text,
    useToast,
    useDisclosure,
    Button,
    HStack,
    Card,
    CardBody,
    Spinner,
    Flex,
    Alert,
    AlertIcon,
    Input,
    InputGroup,
    InputLeftElement
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
// import { AddIcon } from "@chakra-ui/icons";
import type { IScore, IScoreFormData } from "../interfaces";
import { Pagination as PaginationComponent } from "./ui/Pagination";
import ScoresTable from "./ui/ScoresTable";
import { ScoreModal } from "./ui/ScoreModal";
import { DeleteConfirmationModal } from "./ui/DeleteConfirmationModal";
import BulkScoreModal from "./ui/BulkScoreModal";
import { useCycles, useUsers, useGuilds, useScores } from "@/hooks/useAPI";
import { createScore, updateScore, deleteScore, createBulkScores } from "@/hooks/useAPIMutations";

const ScoresSection = () => {
    const [scoreSearchQuery, setScoreSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    
    // Utiliser useSWR pour les données (cache automatique + déduplication)
    const { cycles, isLoading: isLoadingCycles } = useCycles({ authenticated: true });
    const { users } = useUsers(true, 1000);
    const { guilds } = useGuilds(true);
    const { scores, pagination, isLoading: isLoadingScores, mutate: mutateScores } = useScores({
        page: currentPage,
        limit: 20,
        search: scoreSearchQuery,
        authenticated: true
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Formulaire
    const [selectedCycleId, setSelectedCycleId] = useState("");
    const [selectedRotationId, setSelectedRotationId] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [scoreValue, setScoreValue] = useState<number>(0);

    // États pour l'édition et suppression
    const [editingScore, setEditingScore] = useState<IScore | null>(null);
    const [scoreToDelete, setScoreToDelete] = useState<IScore | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

    const toast = useToast();
    const { isOpen, onClose } = useDisclosure();

    // Récupérer les informations utilisateur depuis le token JWT
    const getCurrentUser = () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) return null;

            const decoded = jwtDecode(token) as any;
            return decoded;
        } catch {
            return null;
        }
    };

    const currentUser = getCurrentUser();
    const isAdmin = currentUser?.isAdmin || false;
    const isGuildManager = currentUser?.role === 'chef' || currentUser?.role === 'sous-chef';
    const userGuildId = currentUser?.guilde_id;

    const handleSubmitScore = async () => {
        if (!currentUser) {
            toast({
                title: "Erreur",
                description: "Vous devez être connecté pour ajouter un score",
                status: "error",
                duration: 3000,
            });
            return;
        }

        if (!selectedCycleId || !selectedRotationId || !selectedUserId || scoreValue < 0) {
            toast({
                title: "Données manquantes",
                description: "Veuillez sélectionner un utilisateur, un cycle, une rotation et saisir un score valide",
                status: "error",
                duration: 3000,
            });
            return;
        }

        // Récupérer les informations de l'utilisateur sélectionné
        const selectedUser = users.find(user => user._id === selectedUserId);
        if (!selectedUser) {
            toast({
                title: "Utilisateur introuvable",
                description: "L'utilisateur sélectionné n'a pas été trouvé",
                status: "error",
                duration: 3000,
            });
            return;
        }

        const guildId = selectedUser.guilde_id || selectedUser.guild_id;
        if (!guildId) {
            toast({
                title: "Guilde manquante",
                description: "L'utilisateur sélectionné n'a pas de guilde associée",
                status: "error",
                duration: 3000,
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const scoreData: IScoreFormData = {
                user_id: selectedUserId,
                cycle_id: selectedCycleId,
                rotation_id: selectedRotationId,
                guild_id: guildId,
                score: scoreValue
            };

            await createScore(scoreData);
            
            toast({
                title: "Score ajouté",
                description: "Le score a été ajouté avec succès",
                status: "success",
                duration: 3000,
            });

            // Réinitialiser le formulaire
            setSelectedCycleId("");
            setSelectedRotationId("");
            setSelectedUserId("");
            setUserSearchQuery("");
            setScoreValue(0);
            onClose();

            // Le cache est automatiquement invalidé par createScore
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de l'ajout du score",
                status: "error",
                duration: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fonction pour supprimer un score
    const handleDeleteScore = async () => {
        if (!scoreToDelete) return;

        setIsDeleting(true);
        try {
            await deleteScore(scoreToDelete._id!);
            
            toast({
                title: "Score supprimé",
                description: "Le score a été supprimé avec succès",
                status: "success",
                duration: 3000,
            });

            setIsDeleteModalOpen(false);
            setScoreToDelete(null);
            // Le cache est automatiquement invalidé par deleteScore
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de la suppression du score",
                status: "error",
                duration: 3000,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Fonction pour la saisie groupée des scores
    const handleBulkScoreSubmit = async (scoresData: IScoreFormData[]) => {
        setIsBulkSubmitting(true);
        try {
            await createBulkScores(scoresData);
            
            toast({
                title: "Scores enregistrés",
                description: `${scoresData.length} scores ont été enregistrés avec succès`,
                status: "success",
                duration: 3000,
            });

            setIsBulkModalOpen(false);
            // Le cache est automatiquement invalidé par createBulkScores
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de l'enregistrement des scores",
                status: "error",
                duration: 3000,
            });
        } finally {
            setIsBulkSubmitting(false);
        }
    };

    // Fonction pour ouvrir le modal d'édition
    const handleEditScore = (score: IScore) => {
        setEditingScore(score);
        setSelectedUserId(score.user_id);
        setSelectedCycleId(score.cycle_id);
        setSelectedRotationId(score.rotation_id);
        setScoreValue(score.score);
        setIsEditModalOpen(true);
    };

    // Fonction pour modifier un score
    const handleUpdateScore = async () => {
        if (!editingScore) return;

        if (!selectedCycleId || !selectedRotationId || !selectedUserId || scoreValue < 0) {
            toast({
                title: "Données manquantes",
                description: "Veuillez sélectionner un utilisateur, un cycle, une rotation et saisir un score valide",
                status: "error",
                duration: 3000,
            });
            return;
        }

        const selectedUser = users.find(user => user._id === selectedUserId);
        if (!selectedUser) {
            toast({
                title: "Utilisateur introuvable",
                description: "L'utilisateur sélectionné n'a pas été trouvé",
                status: "error",
                duration: 3000,
            });
            return;
        }

        const guildId = selectedUser.guilde_id || selectedUser.guild_id;
        if (!guildId) {
            toast({
                title: "Guilde manquante",
                description: "L'utilisateur sélectionné n'a pas de guilde associée",
                status: "error",
                duration: 3000,
            });
            return;
        }

        setIsUpdating(true);
        try {
            const scoreData: IScoreFormData = {
                user_id: selectedUserId,
                cycle_id: selectedCycleId,
                rotation_id: selectedRotationId,
                guild_id: guildId,
                score: scoreValue
            };

            await updateScore(editingScore._id!, scoreData);
            
            toast({
                title: "Score modifié",
                description: "Le score a été modifié avec succès",
                status: "success",
                duration: 3000,
            });

            // Réinitialiser le formulaire
            setSelectedCycleId("");
            setSelectedRotationId("");
            setSelectedUserId("");
            setUserSearchQuery("");
            setScoreValue(0);
            setIsEditModalOpen(false);
            setEditingScore(null);
            // Le cache est automatiquement invalidé par updateScore
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de la modification du score",
                status: "error",
                duration: 3000,
            });
        } finally {
            setIsUpdating(false);
        }
    };

    // Obtenir les informations d'un utilisateur
    const getUserInfo = (userId: string) => {
        return users.find(user => user._id === userId || user.discordId === userId);
    };

    // Obtenir les informations d'un cycle
    const getCycleInfo = (cycleId: string) => {
        return cycles.find(cycle => cycle._id === cycleId);
    };

    // Gestion du changement de page
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <Container maxW="container.xl" py={8}>
            <VStack spacing={6} align="stretch">
                <HStack justify="space-between" align="center">
                    <Text fontSize="2xl" fontWeight="bold">
                        Gestion des Scores
                    </Text>
                    <HStack spacing={3}>
                        {/* <Button
                            leftIcon={<AddIcon />}
                            colorScheme="blue"
                            onClick={onOpen}
                            isDisabled={!currentUser}
                        >
                            Ajouter un score
                        </Button> */}
                        {(isAdmin || isGuildManager) && (
                            <Button
                                colorScheme="green"
                                onClick={() => setIsBulkModalOpen(true)}
                                isDisabled={!currentUser}
                            >
                                Saisie groupée
                            </Button>
                        )}
                    </HStack>
                </HStack>

                {/* Liste des scores */}
                <Card>
                    <CardBody>
                        <VStack spacing={4} align="stretch">
                            <HStack justify="space-between" align="center">
                                <VStack spacing={1} align="start">
                                    <Text fontSize="lg" fontWeight="semibold">
                                        Scores récents
                                    </Text>
                                    {pagination && (
                                        <Text fontSize="sm" color="gray.500">
                                            {pagination.itemsOnPage} scores sur {pagination.totalCount} au total
                                        </Text>
                                    )}
                                </VStack>
                                <InputGroup maxW="300px">
                                    <InputLeftElement pointerEvents="none">
                                        <SearchIcon color="gray.300" />
                                    </InputLeftElement>
                                    <Input
                                        placeholder="Rechercher dans les scores..."
                                        value={scoreSearchQuery}
                                        onChange={(e) => setScoreSearchQuery(e.target.value)}
                                    />
                                </InputGroup>
                                <Button
                                    size="sm"
                                    onClick={() => mutateScores()}
                                    isLoading={isLoadingScores}
                                    loadingText="Chargement..."
                                >
                                    Actualiser
                                </Button>
                            </HStack>

                            {isLoadingScores ? (
                                <Flex justify="center" p={8}>
                                    <Spinner size="lg" />
                                </Flex>
                            ) : !Array.isArray(scores) || scores.length === 0 ? (
                                <Alert status="info">
                                    <AlertIcon />
                                    Aucun score enregistré pour le moment.
                                </Alert>
                            ) : (
                                <ScoresTable
                                    scores={scores}
                                    users={users}
                                    cycles={cycles}
                                    isAdmin={isAdmin}
                                    isGuildManager={isGuildManager}
                                    onEditScore={handleEditScore}
                                    onDeleteScore={(score: IScore) => {
                                        setScoreToDelete(score);
                                        setIsDeleteModalOpen(true);
                                    }}
                                />
                            )}

                            {/* Pagination */}
                            {pagination && (
                                <PaginationComponent
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    hasPrevPage={pagination.hasPrevPage}
                                    hasNextPage={pagination.hasNextPage}
                                    onPageChange={handlePageChange}
                                    totalCount={pagination.totalCount}
                                    itemsOnPage={pagination.itemsOnPage}
                                />
                            )}
                        </VStack>
                    </CardBody>
                </Card>

                {/* Modal d'ajout de score */}
                <ScoreModal
                    isOpen={isOpen}
                    onClose={onClose}
                    users={users}
                    cycles={cycles}
                    selectedUserId={selectedUserId}
                    setSelectedUserId={setSelectedUserId}
                    selectedCycleId={selectedCycleId}
                    setSelectedCycleId={setSelectedCycleId}
                    selectedRotationId={selectedRotationId}
                    setSelectedRotationId={setSelectedRotationId}
                    scoreValue={scoreValue}
                    setScoreValue={setScoreValue}
                    userSearchQuery={userSearchQuery}
                    setUserSearchQuery={setUserSearchQuery}
                    onSubmit={handleSubmitScore}
                    isSubmitting={isSubmitting}
                    isLoadingCycles={isLoadingCycles}
                    title="Ajouter un score"
                    submitButtonText="Ajouter le score"
                />

                {/* Modal d'édition de score */}
                <ScoreModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingScore(null);
                    }}
                    users={users}
                    cycles={cycles}
                    selectedUserId={selectedUserId}
                    setSelectedUserId={setSelectedUserId}
                    selectedCycleId={selectedCycleId}
                    setSelectedCycleId={setSelectedCycleId}
                    selectedRotationId={selectedRotationId}
                    setSelectedRotationId={setSelectedRotationId}
                    scoreValue={scoreValue}
                    setScoreValue={setScoreValue}
                    userSearchQuery={userSearchQuery}
                    setUserSearchQuery={setUserSearchQuery}
                    onSubmit={handleUpdateScore}
                    isSubmitting={isUpdating}
                    isLoadingCycles={isLoadingCycles}
                    title="Modifier le score"
                    submitButtonText="Modifier le score"
                    submitButtonColor="yellow"
                    isEdit={true}
                />

                {/* Modal de confirmation de suppression */}
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                        setScoreToDelete(null);
                    }}
                    onConfirm={handleDeleteScore}
                    isDeleting={isDeleting}
                    title="Supprimer le score"
                    description="Êtes-vous sûr de vouloir supprimer ce score ? Cette action est irréversible."
                    itemDetails={
                        scoreToDelete ? (
                            <Text fontSize="sm">
                                <strong>Score:</strong> {scoreToDelete.score.toLocaleString()}<br />
                                <strong>Utilisateur:</strong> {getUserInfo(scoreToDelete.user_id)?.global_name || "Utilisateur inconnu"}<br />
                                <strong>Cycle:</strong> {getCycleInfo(scoreToDelete.cycle_id)?.name || "Cycle inconnu"}
                            </Text>
                        ) : undefined
                    }
                />

                {/* Modal de saisie groupée */}
                <BulkScoreModal
                    isOpen={isBulkModalOpen}
                    onClose={() => setIsBulkModalOpen(false)}
                    cycles={cycles}
                    guilds={guilds}
                    onSubmit={handleBulkScoreSubmit}
                    isSubmitting={isBulkSubmitting}
                    isGuildRestricted={!isAdmin && isGuildManager}
                    userGuildId={userGuildId}
                />
            </VStack>
        </Container>
    );
};

export default ScoresSection;
