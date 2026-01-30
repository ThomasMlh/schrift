import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import type { IScore, IScoreFormData, IUser, ICycle } from "../interfaces";
import { useAPIMutations } from "./useAPIMutations";

interface UseScoreManagementProps {
    users: IUser[];
    cycles: ICycle[];
    onClose: () => void;
}

export const useScoreManagement = ({ users, cycles, onClose }: UseScoreManagementProps) => {
    const { createScore, updateScore, deleteScore, createBulkScores } = useAPIMutations();
    const toast = useToast();

    // États du formulaire
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
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    // États de chargement
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

    // Réinitialiser le formulaire
    const resetForm = () => {
        setSelectedCycleId("");
        setSelectedRotationId("");
        setSelectedUserId("");
        setUserSearchQuery("");
        setScoreValue(0);
    };

    // Validation et récupération des données utilisateur
    const validateAndGetUserData = (userId: string) => {
        const selectedUser = users.find(user => user._id === userId);
        if (!selectedUser) {
            toast({
                title: "Utilisateur introuvable",
                description: "L'utilisateur sélectionné n'a pas été trouvé",
                status: "error",
                duration: 3000,
            });
            return null;
        }

        const guildId = selectedUser.guilde_id;
        if (!guildId) {
            toast({
                title: "Guilde manquante",
                description: "L'utilisateur sélectionné n'a pas de guilde associée",
                status: "error",
                duration: 3000,
            });
            return null;
        }

        return { selectedUser, guildId };
    };

    // Ajouter un score
    const handleSubmitScore = async (currentUser: any) => {
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

        const userData = validateAndGetUserData(selectedUserId);
        if (!userData) return;

        setIsSubmitting(true);
        try {
            const scoreData: IScoreFormData = {
                user_id: selectedUserId,
                cycle_id: selectedCycleId,
                rotation_id: selectedRotationId,
                guild_id: userData.guildId,
                score: scoreValue
            };

            await createScore(scoreData);
            
            toast({
                title: "Score ajouté",
                description: "Le score a été ajouté avec succès",
                status: "success",
                duration: 3000,
            });

            resetForm();
            onClose();
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: "Erreur",
                description: err.message || "Erreur lors de l'ajout du score",
                status: "error",
                duration: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Supprimer un score
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
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: "Erreur",
                description: err.message || "Erreur lors de la suppression du score",
                status: "error",
                duration: 3000,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Ouvrir le modal d'édition
    const handleEditScore = (score: IScore) => {
        setEditingScore(score);
        setSelectedUserId(score.user_id);
        setSelectedCycleId(score.cycle_id);
        
        const cycle = cycles.find(c => c._id === score.cycle_id);
        if (cycle) {
            const rotation = cycle.rotations.find(r => r.rotation_id === score.rotation_id);
            if (rotation) {
                setSelectedRotationId(rotation._id || "");
            } else {
                setSelectedRotationId("");
            }
        } else {
            setSelectedRotationId("");
        }
        
        setScoreValue(score.score);
        setIsEditModalOpen(true);
    };

    // Modifier un score
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

        const userData = validateAndGetUserData(selectedUserId);
        if (!userData) return;

        setIsUpdating(true);
        try {
            const cycle = cycles.find(c => c._id === selectedCycleId);
            const rotation = cycle?.rotations.find(r => r._id === selectedRotationId);
            
            if (!rotation) {
                toast({
                    title: "Rotation introuvable",
                    description: "La rotation sélectionnée n'a pas été trouvée",
                    status: "error",
                    duration: 3000,
                });
                setIsUpdating(false);
                return;
            }

            const scoreData: IScoreFormData = {
                user_id: selectedUserId,
                cycle_id: selectedCycleId,
                rotation_id: rotation.rotation_id,
                guild_id: userData.guildId,
                score: scoreValue
            };

            await updateScore(editingScore._id!, scoreData);
            
            toast({
                title: "Score modifié",
                description: "Le score a été modifié avec succès",
                status: "success",
                duration: 3000,
            });

            resetForm();
            setIsEditModalOpen(false);
            setEditingScore(null);
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: "Erreur",
                description: err.message || "Erreur lors de la modification du score",
                status: "error",
                duration: 3000,
            });
        } finally {
            setIsUpdating(false);
        }
    };

    // Saisie groupée
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
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erreur lors de l'enregistrement des scores";
            toast({
                title: "Erreur",
                description: errorMessage,
                status: "error",
                duration: 3000,
            });
        } finally {
            setIsBulkSubmitting(false);
        }
    };

    return {
        // États du formulaire
        selectedCycleId,
        setSelectedCycleId,
        selectedRotationId,
        setSelectedRotationId,
        selectedUserId,
        setSelectedUserId,
        userSearchQuery,
        setUserSearchQuery,
        scoreValue,
        setScoreValue,

        // États des modals
        editingScore,
        scoreToDelete,
        setScoreToDelete,
        isEditModalOpen,
        setIsEditModalOpen,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        isBulkModalOpen,
        setIsBulkModalOpen,

        // États de chargement
        isSubmitting,
        isDeleting,
        isUpdating,
        isBulkSubmitting,

        // Handlers
        handleSubmitScore,
        handleDeleteScore,
        handleEditScore,
        handleUpdateScore,
        handleBulkScoreSubmit,
        resetForm,
    };
};
