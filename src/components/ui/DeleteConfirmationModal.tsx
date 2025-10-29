import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
    Box
} from "@chakra-ui/react";
import { useRef } from "react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
    title: string;
    description: string;
    itemDetails?: React.ReactNode;
}

export const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    title,
    description,
    itemDetails
}: DeleteConfirmationModalProps) => {
    const cancelRef = useRef<HTMLButtonElement>(null);

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        {title}
                    </AlertDialogHeader>

                    <AlertDialogBody>
                        {description}
                        {itemDetails && (
                            <Box mt={3} p={3} bg="red.50" _dark={{ bg: "red.900" }} borderRadius="md">
                                {itemDetails}
                            </Box>
                        )}
                    </AlertDialogBody>

                    <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                            Annuler
                        </Button>
                        <Button
                            colorScheme="red"
                            onClick={onConfirm}
                            ml={3}
                            isLoading={isDeleting}
                            loadingText="Suppression..."
                        >
                            Supprimer
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};