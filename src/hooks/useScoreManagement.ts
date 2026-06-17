import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();

    const sm = (key: string) => `hooks.scoreManagement.${key}`;

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
    const [isOCRModalOpen, setIsOCRModalOpen] = useState(false);

    // État de chargement unifié — une seule action à la fois
    type LoadingAction = 'submit' | 'delete' | 'update' | 'bulk' | null;
    const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);
    const isSubmitting = loadingAction === 'submit';
    const isDeleting = loadingAction === 'delete';
    const isUpdating = loadingAction === 'update';
    const isBulkSubmitting = loadingAction === 'bulk';

    const resetForm = () => {
        setSelectedCycleId("");
        setSelectedRotationId("");
        setSelectedUserId("");
        setUserSearchQuery("");
        setScoreValue(0);
    };

    const validateAndGetUserData = (userId: string) => {
        const selectedUser = users.find(user => user._id === userId);
        if (!selectedUser) {
            toast({
                title: t(sm("toastUserNotFoundTitle")),
                description: t(sm("toastUserNotFoundDesc")),
                status: "error",
                duration: 3000,
            });
            return null;
        }

        const guildId = selectedUser.guilde_id;
        if (!guildId) {
            toast({
                title: t(sm("toastNoGuildTitle")),
                description: t(sm("toastNoGuildDesc")),
                status: "error",
                duration: 3000,
            });
            return null;
        }

        return { selectedUser, guildId };
    };

    const handleSubmitScore = async (currentUser: IUser | null) => {
        if (!currentUser) {
            toast({
                title: t(sm("toastNotLoggedTitle")),
                description: t(sm("toastNotLoggedDesc")),
                status: "error",
                duration: 3000,
            });
            return;
        }

        if (!selectedCycleId || !selectedRotationId || !selectedUserId || scoreValue < 0) {
            toast({
                title: t(sm("toastMissingDataTitle")),
                description: t(sm("toastMissingDataDesc")),
                status: "error",
                duration: 3000,
            });
            return;
        }

        const userData = validateAndGetUserData(selectedUserId);
        if (!userData) return;

        setLoadingAction('submit');
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
                title: t(sm("toastScoreAddedTitle")),
                description: t(sm("toastScoreAddedDesc")),
                status: "success",
                duration: 3000,
            });
            resetForm();
            onClose();
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: t(sm("toastScoreAddErrorTitle")),
                description: err.message || t(sm("toastScoreAddErrorFallback")),
                status: "error",
                duration: 3000,
            });
        } finally {
            setLoadingAction(null);
        }
    };

    const handleDeleteScore = async () => {
        if (!scoreToDelete) return;

        setLoadingAction('delete');
        try {
            await deleteScore(scoreToDelete._id!);
            toast({
                title: t(sm("toastScoreDeletedTitle")),
                description: t(sm("toastScoreDeletedDesc")),
                status: "success",
                duration: 3000,
            });
            setIsDeleteModalOpen(false);
            setScoreToDelete(null);
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: t(sm("toastScoreDeleteErrorTitle")),
                description: err.message || t(sm("toastScoreDeleteErrorFallback")),
                status: "error",
                duration: 3000,
            });
        } finally {
            setLoadingAction(null);
        }
    };

    const handleEditScore = (score: IScore) => {
        setEditingScore(score);
        setSelectedUserId(score.user_id);
        setSelectedCycleId(score.cycle_id);

        const cycle = cycles.find(c => c._id === score.cycle_id);
        if (cycle) {
            const rotation = cycle.rotations.find(r => r.rotation_id === score.rotation_id);
            setSelectedRotationId(rotation?._id || "");
        } else {
            setSelectedRotationId("");
        }

        setScoreValue(score.score);
        setIsEditModalOpen(true);
    };

    const handleUpdateScore = async () => {
        if (!editingScore) return;

        if (!selectedCycleId || !selectedRotationId || !selectedUserId || scoreValue < 0) {
            toast({
                title: t(sm("toastMissingDataTitle")),
                description: t(sm("toastMissingDataDesc")),
                status: "error",
                duration: 3000,
            });
            return;
        }

        const userData = validateAndGetUserData(selectedUserId);
        if (!userData) return;

        const cycle = cycles.find(c => c._id === selectedCycleId);
        const rotation = cycle?.rotations.find(r => r._id === selectedRotationId);

        if (!rotation) {
            toast({
                title: t(sm("toastRotationNotFoundTitle")),
                description: t(sm("toastRotationNotFoundDesc")),
                status: "error",
                duration: 3000,
            });
            return;
        }

        setLoadingAction('update');
        try {
            const scoreData: IScoreFormData = {
                user_id: selectedUserId,
                cycle_id: selectedCycleId,
                rotation_id: rotation.rotation_id,
                guild_id: userData.guildId,
                score: scoreValue
            };

            await updateScore(editingScore._id!, scoreData);
            toast({
                title: t(sm("toastScoreEditedTitle")),
                description: t(sm("toastScoreEditedDesc")),
                status: "success",
                duration: 3000,
            });
            resetForm();
            setIsEditModalOpen(false);
            setEditingScore(null);
        } catch (error: unknown) {
            const err = error as Error;
            toast({
                title: t(sm("toastScoreEditErrorTitle")),
                description: err.message || t(sm("toastScoreEditErrorFallback")),
                status: "error",
                duration: 3000,
            });
        } finally {
            setLoadingAction(null);
        }
    };

    const handleBulkScoreSubmit = async (scoresData: IScoreFormData[]) => {
        setLoadingAction('bulk');
        try {
            await createBulkScores(scoresData);
            toast({
                title: t(sm("toastBulkSuccessTitle")),
                description: t(sm("toastBulkSuccessDesc"), { count: scoresData.length }),
                status: "success",
                duration: 3000,
            });
            setIsBulkModalOpen(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t(sm("toastBulkErrorFallback"));
            toast({
                title: t(sm("toastBulkErrorTitle")),
                description: errorMessage,
                status: "error",
                duration: 3000,
            });
        } finally {
            setLoadingAction(null);
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
        isOCRModalOpen,
        setIsOCRModalOpen,

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
