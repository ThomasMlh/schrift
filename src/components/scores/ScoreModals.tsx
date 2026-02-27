import { Text } from "@chakra-ui/react";
import { ScoreModal } from "@/components/ui/ScoreModal";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import BulkScoreModal from "@/components/ui/BulkScoreModal";
import OCRScoreModal from "@/components/ui/OCRScoreModal";
import type { IScore, IUser, ICycle, IGuild } from "@/interfaces";

interface ScoreModalsProps {
    // Modal d'ajout
    isOpen: boolean;
    onClose: () => void;

    // Modal d'édition
    isEditModalOpen: boolean;
    onEditModalClose: () => void;

    // Modal de suppression
    isDeleteModalOpen: boolean;
    onDeleteModalClose: () => void;
    onDeleteConfirm: () => void;
    isDeleting: boolean;
    scoreToDelete: IScore | null;

    // Modal de saisie groupée
    isBulkModalOpen: boolean;
    onBulkModalClose: () => void;
    onBulkSubmit: (data: any[]) => void;
    isBulkSubmitting: boolean;
    isGuildRestricted: boolean;
    userGuildId: string | undefined;

    // Modal OCR
    isOCRModalOpen: boolean;
    onOCRModalClose: () => void;

    // Données communes
    users: IUser[];
    cycles: ICycle[];
    guilds: IGuild[];
    isLoadingCycles: boolean;

    // États du formulaire
    selectedUserId: string;
    setSelectedUserId: (value: string) => void;
    selectedCycleId: string;
    setSelectedCycleId: (value: string) => void;
    selectedRotationId: string;
    setSelectedRotationId: (value: string) => void;
    scoreValue: number;
    setScoreValue: (value: number) => void;
    userSearchQuery: string;
    setUserSearchQuery: (value: string) => void;

    // Handlers
    onSubmitScore: () => void;
    onUpdateScore: () => void;
    isSubmitting: boolean;
    isUpdating: boolean;

    // Helpers
    getUserInfo: (userId: string) => IUser | undefined;
    getCycleInfo: (cycleId: string) => ICycle | undefined;
}

export const ScoreModals = ({
    isOpen,
    onClose,
    isEditModalOpen,
    onEditModalClose,
    isDeleteModalOpen,
    onDeleteModalClose,
    onDeleteConfirm,
    isDeleting,
    scoreToDelete,
    isBulkModalOpen,
    onBulkModalClose,
    onBulkSubmit,
    isBulkSubmitting,
    isGuildRestricted,
    userGuildId,
    isOCRModalOpen,
    onOCRModalClose,
    users,
    cycles,
    guilds,
    isLoadingCycles,
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
    onSubmitScore,
    onUpdateScore,
    isSubmitting,
    isUpdating,
    getUserInfo,
    getCycleInfo
}: ScoreModalsProps) => {
    return (
        <>
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
                onSubmit={onSubmitScore}
                isSubmitting={isSubmitting}
                isLoadingCycles={isLoadingCycles}
                title="Ajouter un score"
                submitButtonText="Ajouter le score"
            />

            {/* Modal d'édition de score */}
            <ScoreModal
                isOpen={isEditModalOpen}
                onClose={onEditModalClose}
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
                onSubmit={onUpdateScore}
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
                onClose={onDeleteModalClose}
                onConfirm={onDeleteConfirm}
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
                onClose={onBulkModalClose}
                cycles={cycles}
                guilds={guilds}
                onSubmit={onBulkSubmit}
                isSubmitting={isBulkSubmitting}
                isGuildRestricted={isGuildRestricted}
                userGuildId={userGuildId}
            />

            {/* Modal OCR */}
            <OCRScoreModal
                isOpen={isOCRModalOpen}
                onClose={onOCRModalClose}
                cycles={cycles}
                guilds={guilds}
                isGuildRestricted={isGuildRestricted}
                userGuildId={userGuildId}
            />
        </>
    );
};
