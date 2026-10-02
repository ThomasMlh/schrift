import { Text } from "@chakra-ui/react";
import { ScoreModal } from "@/components/ui/ScoreModal";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import BulkScoreModal from "@/components/ui/BulkScoreModal";
import OCRScoreModal from "@/components/ui/OCRScoreModal";
import TransferRotationModal from "@/components/ui/TransferRotationModal";
import type { IScore, IUser, ICycle, IGuild, IScoreFormData } from "@/interfaces";

interface ScoreModalsProps {
    // Modal d'édition
    isEditModalOpen: boolean;
    onEditModalClose: () => void;
    editingScore: IScore | null;

    // Modal de suppression
    isDeleteModalOpen: boolean;
    onDeleteModalClose: () => void;
    onDeleteConfirm: () => void;
    isDeleting: boolean;
    scoreToDelete: IScore | null;

    // Modal de saisie groupée
    isBulkModalOpen: boolean;
    onBulkModalClose: () => void;
    onBulkSubmit: (data: IScoreFormData[]) => void;
    isBulkSubmitting: boolean;
    isGuildRestricted: boolean;
    userGuildId: string | undefined;

    // Modal OCR
    isOCRModalOpen: boolean;
    onOCRModalClose: () => void;

    // Modal transfert de rotation
    isTransferModalOpen: boolean;
    onTransferModalClose: () => void;

    // Données communes
    users: IUser[];
    cycles: ICycle[];
    guilds: IGuild[];
    isLoadingCycles: boolean;

    // États du formulaire (édition)
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
    onUpdateScore: () => void;
    isUpdating: boolean;

    // Helpers
    getUserInfo: (userId: string) => IUser | undefined;
    getCycleInfo: (cycleId: string) => ICycle | undefined;
}

export const ScoreModals = ({
    isEditModalOpen,
    onEditModalClose,
    editingScore,
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
    isTransferModalOpen,
    onTransferModalClose,
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
    onUpdateScore,
    isUpdating,
    getUserInfo,
    getCycleInfo
}: ScoreModalsProps) => {
    return (
        <>
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
                editingScoreBbsName={editingScore?.bbs_name || undefined}
                editingScoreBbsId={editingScore?.bbs_id}
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

            {/* Modal transfert de rotation */}
            <TransferRotationModal
                isOpen={isTransferModalOpen}
                onClose={onTransferModalClose}
                cycles={cycles}
                guilds={guilds}
            />
        </>
    );
};
