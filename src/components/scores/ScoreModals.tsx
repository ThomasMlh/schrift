import { Text } from "@chakra-ui/react";
import { ScoreModal } from "@/components/ui/ScoreModal";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import BulkScoreModal from "@/components/ui/BulkScoreModal";
import OCRScoreModal from "@/components/ui/OCRScoreModal";
import TransferRotationModal from "@/components/ui/TransferRotationModal";
import type { IScore, IUser, ICycle, IGuild, IScoreFormData } from "@/interfaces";

interface ScoreModalsProps {
    isEditModalOpen: boolean;
    onEditModalClose: () => void;
    editingScore: IScore | null;

    isDeleteModalOpen: boolean;
    onDeleteModalClose: () => void;
    onDeleteConfirm: () => void;
    isDeleting: boolean;
    scoreToDelete: IScore | null;

    isBulkModalOpen: boolean;
    onBulkModalClose: () => void;
    onBulkSubmit: (data: IScoreFormData[]) => void;
    isBulkSubmitting: boolean;
    isGuildRestricted: boolean;
    userGuildId: string | undefined;

    isOCRModalOpen: boolean;
    onOCRModalClose: () => void;

    isTransferModalOpen: boolean;
    onTransferModalClose: () => void;

    users: IUser[];
    cycles: ICycle[];
    guilds: IGuild[];
    isLoadingCycles: boolean;

    // Edit form state
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

    onUpdateScore: () => void;
    isUpdating: boolean;

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

            <OCRScoreModal
                isOpen={isOCRModalOpen}
                onClose={onOCRModalClose}
                cycles={cycles}
                guilds={guilds}
                isGuildRestricted={isGuildRestricted}
                userGuildId={userGuildId}
            />

            <TransferRotationModal
                isOpen={isTransferModalOpen}
                onClose={onTransferModalClose}
                cycles={cycles}
                guilds={guilds}
            />
        </>
    );
};
