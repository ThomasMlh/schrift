import {
    Card,
    CardBody,
    VStack,
    Text,
    HStack,
    IconButton,
    Input,
    Badge,
    useColorModeValue
} from "@chakra-ui/react";
import { DeleteIcon, DragHandleIcon } from "@chakra-ui/icons";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { ICycleRotation } from "../../interfaces";
import { handleAttackType } from "../../utils/attackTypes";
import { AlterationImage } from "../ui/AlterationImage";
import { CustomSelect } from "../ui/CustomSelect";

interface SelectedRotationsListProps {
    rotations: ICycleRotation[];
    onDragEnd: (result: DropResult) => void;
    onUpdateRotation: (index: number, field: keyof ICycleRotation, value: string) => void;
    onRemoveRotation: (index: number) => void;
}

const SelectedRotationsList = ({
    rotations,
    onDragEnd,
    onUpdateRotation,
    onRemoveRotation
}: SelectedRotationsListProps) => {
    const cardBg = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
    const draggingBg = useColorModeValue('blue.50', 'blue.900');
    const normalBg = useColorModeValue('gray.50', 'gray.800');

    return (
        <Card bg={cardBg} borderColor={borderColor}>
            <CardBody>
                <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                        <Text fontSize="lg" fontWeight="semibold">
                            Rotations sélectionnées
                        </Text>
                        <Badge
                            colorScheme={rotations.length === 20 ? "green" : "orange"}
                            fontSize="sm"
                        >
                            {rotations.length}/20
                        </Badge>
                    </HStack>

                    {rotations.length === 0 ? (
                        <Text color="gray.500" textAlign="center" py={8}>
                            Aucune rotation sélectionnée. Ajoutez des rotations depuis les templates ci-dessus.
                        </Text>
                    ) : (
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="rotations">
                                {(provided) => (
                                    <VStack
                                        spacing={2}
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        align="stretch"
                                    >
                                        {rotations.map((rotation, index) => (
                                            <Draggable
                                                key={rotation.rotation_id}
                                                draggableId={rotation.rotation_id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <Card
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        variant="outline"
                                                        size="sm"
                                                    bg={snapshot.isDragging ? draggingBg : normalBg}
                                                        shadow={snapshot.isDragging ? 'lg' : 'sm'}
                                                        transform={snapshot.isDragging ? 'rotate(2deg)' : 'none'}
                                                        transition="all 0.2s"
                                                    >
                                                        <CardBody p={3}>
                                                            <HStack spacing={3}>
                                                                <IconButton
                                                                    {...provided.dragHandleProps}
                                                                    aria-label="Déplacer"
                                                                    icon={<DragHandleIcon />}
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    cursor="grab"
                                                                    _active={{ cursor: "grabbing" }}
                                                                />

                                                                <Text fontSize="sm" fontWeight="medium" minW="30px">
                                                                    #{index + 1}
                                                                </Text>

                                                                <VStack spacing={2} flex={1}>
                                                                    <HStack spacing={2} w="full">
                                                                        <VStack spacing={1} flex={1}>
                                                                            <Text fontSize="xs" color="gray.500">Killer</Text>
                                                                            <Text fontSize="sm" fontWeight="medium">{rotation.killer}</Text>
                                                                        </VStack>
                                                                        <VStack spacing={1} flex={1}>
                                                                            <Text fontSize="xs" color="gray.500">Attack</Text>
                                                                            <Badge 
                                                                                colorScheme={rotation.attack === "R" ? "red" : rotation.attack === "B" ? "blue" : "orange"} 
                                                                                size="sm"
                                                                            >
                                                                                {handleAttackType(rotation)}
                                                                            </Badge>
                                                                        </VStack>
                                                                        <VStack spacing={1} flex={1}>
                                                                            <Text fontSize="xs" color="gray.500">Alteration</Text>
                                                                            <AlterationImage 
                                                                                alteration={rotation.alteration} 
                                                                                size="20px" 
                                                                                showLabel={true} 
                                                                            />
                                                                        </VStack>
                                                                    </HStack>

                                                                    <HStack spacing={2} w="full">
                                                                        <VStack spacing={1} flex={1}>
                                                                            <Text fontSize="xs" color="gray.500">Début</Text>
                                                                            <Input
                                                                                size="sm"
                                                                                type="date"
                                                                                value={rotation.start_date ? rotation.start_date.split('/').reverse().join('-') : ''}
                                                                                onChange={(e) => {
                                                                                    const isoDate = e.target.value;
                                                                                    const [year, month, day] = isoDate.split('-');
                                                                                    const displayDate = `${day}/${month}/${year}`;
                                                                                    onUpdateRotation(index, 'start_date', displayDate);
                                                                                }}
                                                                            />
                                                                        </VStack>
                                                                        <VStack spacing={1} flex={1}>
                                                                            <Text fontSize="xs" color="gray.500">Fin</Text>
                                                                            <Input
                                                                                size="sm"
                                                                                type="date"
                                                                                value={rotation.end_date ? rotation.end_date.split('/').reverse().join('-') : ''}
                                                                                onChange={(e) => {
                                                                                    const isoDate = e.target.value;
                                                                                    const [year, month, day] = isoDate.split('-');
                                                                                    const displayDate = `${day}/${month}/${year}`;
                                                                                    onUpdateRotation(index, 'end_date', displayDate);
                                                                                }}
                                                                            />
                                                                        </VStack>
                                                                        <VStack spacing={1} flex={1}>
                                                                            <Text fontSize="xs" color="gray.500">Période</Text>
                                                                            <CustomSelect
                                                                                size="sm"
                                                                                value={rotation.period}
                                                                                onChange={(val) => onUpdateRotation(index, 'period', val)}
                                                                                options={[
                                                                                    { value: "Mardi-Jeudi", label: "Mardi-Jeudi" },
                                                                                    { value: "Vendredi-Dimanche", label: "Vendredi-Dimanche" },
                                                                                ]}
                                                                                allowDeselect={false}
                                                                            />
                                                                        </VStack>
                                                                    </HStack>
                                                                </VStack>

                                                                <IconButton
                                                                    aria-label="Supprimer"
                                                                    icon={<DeleteIcon />}
                                                                    size="sm"
                                                                    colorScheme="red"
                                                                    variant="ghost"
                                                                    onClick={() => onRemoveRotation(index)}
                                                                />
                                                            </HStack>
                                                        </CardBody>
                                                    </Card>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </VStack>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )}
                </VStack>
            </CardBody>
        </Card>
    );
}

export { SelectedRotationsList };