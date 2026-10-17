import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay,
  Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter,
  ModalHeader, ModalOverlay, VStack,
} from "@chakra-ui/react";
import type { IGuild, Role } from "@/interfaces";
import { useUsers } from "@/hooks/useAPI";
import { UserSearchSelect } from "@/components/ui/UserSearchSelect";
import { CustomSelect } from "@/components/ui/CustomSelect";


interface GuildNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  initialName?: string;
  onSubmit: (name: string) => Promise<void>;
}

export const GuildNameModal = ({ isOpen, onClose, title, submitLabel, initialName = "", onSubmit }: GuildNameModalProps) => {
  const [name, setName] = useState(initialName);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setName(initialName);
  }, [isOpen, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onSubmit(name.trim());
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit}>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isRequired>
            <FormLabel fontSize="sm">Nom de la guilde</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex : F" autoFocus />
          </FormControl>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" colorScheme="purple" isLoading={isSaving} isDisabled={!name.trim() || name.trim() === initialName}>
            {submitLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};


interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  guild: IGuild;
  guilds: IGuild[];
  onSubmit: (userId: string, role: Role) => Promise<void>;
}

export const AddMemberModal = ({ isOpen, onClose, guild, guilds, onSubmit }: AddMemberModalProps) => {
  const [userId, setUserId] = useState("");
  const [search, setSearch] = useState("");
  // Server-side search (debounced): the full list is larger than one page
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);
  const { users } = useUsers({ authenticated: true, enabled: isOpen, limit: 50, ...(debouncedSearch && { search: debouncedSearch }) });
  const [role, setRole] = useState<Role>("membre");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUserId("");
      setSearch("");
      setRole("membre");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      await onSubmit(userId, role);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Ajouter un membre à Schrift {guild.name}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="sm">Joueur</FormLabel>
              <UserSearchSelect
                users={users}
                guilds={guilds}
                selectedUserId={userId}
                onUserSelect={setUserId}
                searchQuery={search}
                onSearchChange={setSearch}
                placeholder="Rechercher un joueur"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm">Rôle</FormLabel>
              <CustomSelect
                value={role}
                onChange={(val) => setRole(val as Role)}
                options={[
                  { value: "membre", label: "Membre" },
                  { value: "sous-chef", label: "Sous-chef" },
                  { value: "chef", label: "Chef" },
                ]}
                allowDeselect={false}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button colorScheme="purple" onClick={handleSubmit} isLoading={isSaving} isDisabled={!userId}>
            Ajouter
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};


interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  body: ReactNode;
  confirmLabel: string;
  colorScheme?: string;
  onConfirm: () => Promise<void>;
}

export const ConfirmDialog = ({ isOpen, onClose, title, body, confirmLabel, colorScheme = "red", onConfirm }: ConfirmDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleConfirm = async () => {
    setIsBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>{title}</AlertDialogHeader>
          <AlertDialogBody>{body}</AlertDialogBody>
          <AlertDialogFooter gap={2}>
            <Button ref={cancelRef} variant="ghost" onClick={onClose}>Annuler</Button>
            <Button colorScheme={colorScheme} onClick={handleConfirm} isLoading={isBusy}>{confirmLabel}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
