import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Button, Input, VStack, useToast, HStack, Avatar, Text,
    Box, Badge, IconButton, Tooltip, useColorModeValue
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiStar, FiTrash2, FiPlus, FiRepeat, FiCheck } from "react-icons/fi";
import type { IUser, IGuild, Role, IBbsAccount } from "../interfaces";
import { getUserAvatarUrl } from "../utils/discord";
import { useUserMutations } from "@/hooks/useAPIMutations";
import { useUsers } from "@/hooks/useAPI";
import { CustomSelect } from "./ui/CustomSelect";
import { UserSearchSelect } from "./ui/UserSearchSelect";

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: IUser | null;
    guilds: IGuild[];
    onUserUpdated: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, guilds, onUserUpdated }) => {
    const { addUserAccount, updateUserAccount, removeUserAccount, setPrimaryUserAccount, transferUserAccount } = useUserMutations();
    const { users: allUsers } = useUsers({ authenticated: true, limit: 1000 });
    const toast = useToast();

    // bbs accounts (main + alts), edited separately from the main form
    const [accounts, setAccounts] = useState<IBbsAccount[]>([]);
    const [newAccount, setNewAccount] = useState({ bbs_id: "", bbs_name: "", guilde_id: "", role: "membre" as Role });
    const [accountActionLoading, setAccountActionLoading] = useState<string | null>(null); // bbs_id being processed, or "new"

    // Account being transferred to another user (as an alt)
    const [transferringBbsId, setTransferringBbsId] = useState<string | null>(null);
    const [transferTargetUserId, setTransferTargetUserId] = useState("");
    const [transferSearchQuery, setTransferSearchQuery] = useState("");

    // Local edits of an account's bbs id/name, keyed by the account's CURRENT bbs_id (before renaming).
    // Not saved on every keystroke: a dedicated button saves bbs_id and bbs_name together.
    const [accountEdits, setAccountEdits] = useState<Record<string, { bbs_id: string; bbs_name: string }>>({});

    const getAccountEditValue = (account: IBbsAccount, field: "bbs_id" | "bbs_name") =>
        accountEdits[account.bbs_id]?.[field] ?? account[field] ?? "";

    const setAccountEditValue = (account: IBbsAccount, field: "bbs_id" | "bbs_name", value: string) => {
        setAccountEdits(prev => ({
            ...prev,
            [account.bbs_id]: {
                bbs_id: field === "bbs_id" ? value : (prev[account.bbs_id]?.bbs_id ?? account.bbs_id),
                bbs_name: field === "bbs_name" ? value : (prev[account.bbs_id]?.bbs_name ?? account.bbs_name ?? "")
            }
        }));
    };

    const hasAccountIdentityEdit = (account: IBbsAccount) => {
        const edit = accountEdits[account.bbs_id];
        if (!edit) return false;
        return edit.bbs_id.trim() !== account.bbs_id || edit.bbs_name !== (account.bbs_name || "");
    };

    const primaryCardBg = useColorModeValue("purple.50", "rgba(124,58,237,0.08)");
    const primaryCardBorder = useColorModeValue("purple.200", "purple.700");
    const altCardBorder = "border.faint";
    const mutedLabel = "text.muted";
    const dashedBorder = "border.strong";

    useEffect(() => {
        if (user) {
            setAccounts(user.bbs_accounts || []);
        }
    }, [user]);

    const handleAddAccount = async () => {
        if (!user || !newAccount.bbs_id.trim()) return;
        setAccountActionLoading("new");
        try {
            const result = await addUserAccount(user._id, newAccount) as { bbs_accounts?: IBbsAccount[] };
            if (result.bbs_accounts) setAccounts(result.bbs_accounts);
            setNewAccount({ bbs_id: "", bbs_name: "", guilde_id: "", role: "membre" });
            toast({ title: "Compte bbs ajouté", status: "success", duration: 3000 });
            onUserUpdated();
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Erreur lors de l'ajout du compte",
                status: "error",
                duration: 5000
            });
        } finally {
            setAccountActionLoading(null);
        }
    };

    const handleUpdateAccount = async (bbsId: string, patch: Partial<Pick<IBbsAccount, 'guilde_id' | 'role' | 'bbs_id' | 'bbs_name'>>) => {
        if (!user) return;
        setAccountActionLoading(bbsId);
        try {
            const result = await updateUserAccount(user._id, bbsId, patch) as { bbs_accounts?: IBbsAccount[] };
            if (result.bbs_accounts) setAccounts(result.bbs_accounts);
            onUserUpdated();
            return true;
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Erreur lors de la modification du compte",
                status: "error",
                duration: 5000
            });
            return false;
        } finally {
            setAccountActionLoading(null);
        }
    };

    const handleSaveAccountIdentity = async (account: IBbsAccount) => {
        const edit = accountEdits[account.bbs_id];
        if (!edit || !edit.bbs_id.trim()) return;

        const success = await handleUpdateAccount(account.bbs_id, {
            bbs_id: edit.bbs_id.trim(),
            bbs_name: edit.bbs_name
        });

        if (success) {
            setAccountEdits(prev => {
                const next = { ...prev };
                delete next[account.bbs_id];
                return next;
            });
            toast({ title: "Compte mis à jour", status: "success", duration: 3000 });
        }
    };

    const handleRemoveAccount = async (bbsId: string) => {
        if (!user) return;
        setAccountActionLoading(bbsId);
        try {
            const result = await removeUserAccount(user._id, bbsId) as { bbs_accounts?: IBbsAccount[] };
            if (result.bbs_accounts) setAccounts(result.bbs_accounts);
            toast({ title: "Compte bbs retiré", status: "success", duration: 3000 });
            onUserUpdated();
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Erreur lors du retrait du compte",
                status: "error",
                duration: 5000
            });
        } finally {
            setAccountActionLoading(null);
        }
    };

    const handleSetPrimary = async (bbsId: string) => {
        if (!user) return;
        setAccountActionLoading(bbsId);
        try {
            const result = await setPrimaryUserAccount(user._id, bbsId) as { bbs_accounts?: IBbsAccount[] };
            if (result.bbs_accounts) setAccounts(result.bbs_accounts);
            toast({ title: "Compte principal mis à jour", status: "success", duration: 3000 });
            onUserUpdated();
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Erreur lors du changement de compte principal",
                status: "error",
                duration: 5000
            });
        } finally {
            setAccountActionLoading(null);
        }
    };

    const handleTransferAccount = async () => {
        if (!user || !transferringBbsId || !transferTargetUserId) return;
        setAccountActionLoading(transferringBbsId);
        try {
            const result = await transferUserAccount(user._id, transferringBbsId, transferTargetUserId) as { source?: { bbs_accounts?: IBbsAccount[] } };
            if (result.source?.bbs_accounts) setAccounts(result.source.bbs_accounts);
            toast({ title: "Compte transféré avec succès", status: "success", duration: 3000 });
            setTransferringBbsId(null);
            setTransferTargetUserId("");
            setTransferSearchQuery("");
            onUserUpdated();
        } catch (error) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Erreur lors du transfert du compte",
                status: "error",
                duration: 5000
            });
        } finally {
            setAccountActionLoading(null);
        }
    };

    const handleClose = () => {
        setAccountEdits({});
        setTransferringBbsId(null);
        onClose();
    };

    if (!user) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <HStack spacing={3}>
                        <Avatar
                            size="sm"
                            src={getUserAvatarUrl(user) || undefined}
                            name={user.global_name || user.username}
                        />
                        <VStack spacing={0} align="start">
                            <Text>Modifier le joueur</Text>
                            <Text fontSize="sm" color="gray.500">
                                {user.global_name || user.username || user.bbs_name}
                                {user.username && ` (@${user.username})`}
                            </Text>
                        </VStack>
                    </HStack>
                </ModalHeader>
                <ModalCloseButton />
                
                <ModalBody>
                    <VStack spacing={4}>
                        <Box w="100%">
                            <Text fontSize="sm" fontWeight="semibold" mb={1}>
                                Comptes bbs ({accounts.length})
                            </Text>
                            <Text fontSize="xs" color={mutedLabel} mb={3}>
                                Un même joueur peut avoir plusieurs comptes bbs (alts), chacun avec son propre ID/nom/guilde/rôle.
                                L'historique des scores suit automatiquement en cas de renommage de l'ID BBS.
                            </Text>

                            <VStack spacing={2.5} align="stretch" mb={4}>
                                {accounts.map((account) => (
                                    <Box
                                        key={account.bbs_id}
                                        p={3}
                                        borderWidth="1px"
                                        borderRadius="xl"
                                        bg={account.is_primary ? primaryCardBg : undefined}
                                        borderColor={account.is_primary ? primaryCardBorder : altCardBorder}
                                    >
                                        <HStack justify="space-between" mb={3} align="center">
                                            <HStack spacing={2}>
                                                <Text fontSize="sm" fontWeight="semibold">
                                                    {account.bbs_name || account.bbs_id}
                                                </Text>
                                                {account.is_primary && (
                                                    <Badge colorScheme="purple" fontSize="2xs">Principal</Badge>
                                                )}
                                            </HStack>
                                            <HStack spacing={0.5}>
                                                {!account.is_primary && (
                                                    <Tooltip label="Définir comme principal" fontSize="xs" hasArrow>
                                                        <IconButton
                                                            aria-label="Définir comme principal"
                                                            icon={<FiStar />}
                                                            size="sm"
                                                            variant="ghost"
                                                            isLoading={accountActionLoading === account.bbs_id}
                                                            onClick={() => handleSetPrimary(account.bbs_id)}
                                                        />
                                                    </Tooltip>
                                                )}
                                                <Tooltip label="Transférer vers un autre utilisateur" fontSize="xs" hasArrow>
                                                    <IconButton
                                                        aria-label="Transférer vers un autre utilisateur"
                                                        icon={<FiRepeat />}
                                                        size="sm"
                                                        variant="ghost"
                                                        isLoading={accountActionLoading === account.bbs_id}
                                                        onClick={() => setTransferringBbsId(
                                                            transferringBbsId === account.bbs_id ? null : account.bbs_id
                                                        )}
                                                    />
                                                </Tooltip>
                                                <Tooltip
                                                    label={
                                                        account.is_primary && accounts.length > 1
                                                            ? "Impossible de retirer le compte principal (définissez d'abord un autre compte comme principal)"
                                                            : "Retirer ce compte"
                                                    }
                                                    fontSize="xs" hasArrow
                                                >
                                                    <IconButton
                                                        aria-label="Retirer ce compte"
                                                        icon={<FiTrash2 />}
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="red"
                                                        isDisabled={account.is_primary && accounts.length > 1}
                                                        isLoading={accountActionLoading === account.bbs_id}
                                                        onClick={() => handleRemoveAccount(account.bbs_id)}
                                                    />
                                                </Tooltip>
                                            </HStack>
                                        </HStack>

                                        <HStack spacing={2} align="flex-end" mb={2}>
                                            <Box flex={1}>
                                                <Text fontSize="2xs" color={mutedLabel} mb={1}>ID BBS</Text>
                                                <Input
                                                    size="sm"
                                                    value={getAccountEditValue(account, "bbs_id")}
                                                    onChange={(e) => setAccountEditValue(account, "bbs_id", e.target.value)}
                                                />
                                            </Box>
                                            <Box flex={1}>
                                                <Text fontSize="2xs" color={mutedLabel} mb={1}>Nom BBS</Text>
                                                <Input
                                                    size="sm"
                                                    value={getAccountEditValue(account, "bbs_name")}
                                                    onChange={(e) => setAccountEditValue(account, "bbs_name", e.target.value)}
                                                />
                                            </Box>
                                            <Tooltip label="Enregistrer l'ID/nom" fontSize="xs" hasArrow>
                                                <IconButton
                                                    aria-label="Enregistrer l'ID/nom du compte"
                                                    icon={<FiCheck />}
                                                    size="sm"
                                                    colorScheme="green"
                                                    variant={hasAccountIdentityEdit(account) ? "solid" : "ghost"}
                                                    isDisabled={!hasAccountIdentityEdit(account) || !getAccountEditValue(account, "bbs_id").trim()}
                                                    isLoading={accountActionLoading === account.bbs_id}
                                                    onClick={() => handleSaveAccountIdentity(account)}
                                                />
                                            </Tooltip>
                                        </HStack>

                                        <HStack spacing={3} align="flex-start">
                                            <Box flex={1}>
                                                <Text fontSize="2xs" color={mutedLabel} mb={1}>Guilde</Text>
                                                <CustomSelect
                                                    placeholder="Aucune"
                                                    value={account.guilde_id || ""}
                                                    onChange={(value) => handleUpdateAccount(account.bbs_id, { guilde_id: value })}
                                                    options={guilds.map((g) => ({ value: g._id, label: g.name }))}
                                                    size="sm"
                                                />
                                            </Box>
                                            <Box flex={1}>
                                                <Text fontSize="2xs" color={mutedLabel} mb={1}>Rôle</Text>
                                                <CustomSelect
                                                    value={account.role || "membre"}
                                                    onChange={(value) => handleUpdateAccount(account.bbs_id, { role: value as Role })}
                                                    options={[
                                                        { value: "membre", label: "Membre" },
                                                        { value: "sous-chef", label: "Sous-chef" },
                                                        { value: "chef", label: "Chef" }
                                                    ]}
                                                    allowDeselect={false}
                                                    size="sm"
                                                />
                                            </Box>
                                        </HStack>

                                        {transferringBbsId === account.bbs_id && (
                                            <Box mt={3} p={2.5} borderWidth="1px" borderStyle="dashed" borderColor={dashedBorder} borderRadius="md">
                                                <Text fontSize="2xs" color={mutedLabel} mb={2}>
                                                    Transférer ce compte vers :
                                                </Text>
                                                <VStack spacing={2} align="stretch">
                                                    <UserSearchSelect
                                                        users={allUsers.filter(u => u._id !== user._id)}
                                                        selectedUserId={transferTargetUserId}
                                                        onUserSelect={setTransferTargetUserId}
                                                        searchQuery={transferSearchQuery}
                                                        onSearchChange={setTransferSearchQuery}
                                                        placeholder="Choisir l'utilisateur cible"
                                                        guilds={guilds}
                                                    />
                                                    <HStack justify="flex-end" spacing={2}>
                                                        <Button size="xs" variant="ghost" onClick={() => setTransferringBbsId(null)}>
                                                            Annuler
                                                        </Button>
                                                        <Button
                                                            size="xs"
                                                            colorScheme="blue"
                                                            isDisabled={!transferTargetUserId}
                                                            isLoading={accountActionLoading === account.bbs_id}
                                                            onClick={handleTransferAccount}
                                                        >
                                                            Confirmer le transfert
                                                        </Button>
                                                    </HStack>
                                                </VStack>
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </VStack>

                            <Box p={3} borderWidth="1px" borderStyle="dashed" borderColor={dashedBorder} borderRadius="lg">
                                <Text fontSize="xs" fontWeight="semibold" mb={2}>Ajouter un compte (alt)</Text>
                                <VStack spacing={2} align="stretch">
                                    <HStack spacing={2}>
                                        <Input
                                            size="sm"
                                            placeholder="ID BBS"
                                            value={newAccount.bbs_id}
                                            onChange={(e) => setNewAccount(prev => ({ ...prev, bbs_id: e.target.value }))}
                                        />
                                        <Input
                                            size="sm"
                                            placeholder="Nom BBS"
                                            value={newAccount.bbs_name}
                                            onChange={(e) => setNewAccount(prev => ({ ...prev, bbs_name: e.target.value }))}
                                        />
                                    </HStack>
                                    <HStack spacing={2}>
                                        <CustomSelect
                                            placeholder="Guilde"
                                            value={newAccount.guilde_id}
                                            onChange={(value) => setNewAccount(prev => ({ ...prev, guilde_id: value }))}
                                            options={guilds.map((g) => ({ value: g._id, label: g.name }))}
                                            size="sm"
                                        />
                                        <CustomSelect
                                            value={newAccount.role}
                                            onChange={(value) => setNewAccount(prev => ({ ...prev, role: value as Role }))}
                                            options={[
                                                { value: "membre", label: "Membre" },
                                                { value: "sous-chef", label: "Sous-chef" },
                                                { value: "chef", label: "Chef" }
                                            ]}
                                            allowDeselect={false}
                                            size="sm"
                                        />
                                    </HStack>
                                    <Button
                                        size="sm"
                                        leftIcon={<FiPlus />}
                                        colorScheme="blue"
                                        variant="outline"
                                        isDisabled={!newAccount.bbs_id.trim()}
                                        isLoading={accountActionLoading === "new"}
                                        onClick={handleAddAccount}
                                    >
                                        Ajouter ce compte
                                    </Button>
                                </VStack>
                            </Box>
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button colorScheme="blue" onClick={handleClose}>
                        Fermer
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EditUserModal;