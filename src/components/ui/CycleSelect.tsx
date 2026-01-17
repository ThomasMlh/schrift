import { Text, HStack, Badge } from "@chakra-ui/react";
import { CustomSelect } from "./CustomSelect";
import type { ICycle } from "../../interfaces";
import type { ReactNode } from "react";

interface SelectOption {
    value: string;
    label: string;
    content?: ReactNode;
    group?: string;
}

interface CycleSelectProps {
    cycles: ICycle[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    isDisabled?: boolean;
    allowDeselect?: boolean;
    valueKey?: '_id' | 'name';
    showRotationCount?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export const CycleSelect = ({
    cycles,
    value,
    onChange,
    placeholder = "Sélectionner un cycle",
    isDisabled = false,
    allowDeselect = true,
    valueKey = '_id',
    showRotationCount = false,
    size = 'md'
}: CycleSelectProps) => {
    // Grouper les cycles par année
    const cyclesByYear = cycles.reduce((acc, cycle) => {
        const year = cycle.year || 'Année inconnue';
        if (!acc[year]) acc[year] = [];
        acc[year].push(cycle);
        return acc;
    }, {} as Record<string | number, ICycle[]>);

    // Trier les années par ordre décroissant
    const sortedYears = Object.entries(cyclesByYear)
        .sort(([a], [b]) => Number(b) - Number(a));

    // Créer les options avec grouping par année
    const options: SelectOption[] = [];
    sortedYears.forEach(([year, cyclesInYear]) => {
        // Trier les cycles dans chaque année par date de création décroissante (plus récent en premier)
        const sortedCyclesInYear = [...cyclesInYear].sort((a, b) => {
            if (a.created_at && b.created_at) {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            return 0;
        });

        sortedCyclesInYear
            .filter(cycle => (valueKey === '_id' ? cycle._id : cycle.name))
            .forEach((cycle) => {
                const cycleValue = (valueKey === '_id' ? cycle._id : cycle.name) as string;

                options.push({
                    value: cycleValue,
                    label: cycle.name,
                    group: String(year),
                    content: (
                        <HStack spacing={2} w="100%" justify="space-between">
                            <Text fontWeight="medium">
                                {cycle.name}
                            </Text>
                            {showRotationCount && (
                                <Badge colorScheme="purple" fontSize="xs">
                                    {cycle.rotations?.length || 0} rot.
                                </Badge>
                            )}
                        </HStack>
                    )
                });
            });
    });

    // Fonction pour rendre l'option sélectionnée avec l'année
    const renderSelected = (option: SelectOption) => {
        const selectedCycle = cycles.find(c => 
            (valueKey === '_id' ? c._id : c.name) === option.value
        );

        return (
            <HStack spacing={2} w="100%">
                <Text fontWeight="medium">
                    {selectedCycle?.name || option.label}
                </Text>
                {selectedCycle?.year && (
                    <Badge colorScheme="blue" fontSize="xs">
                        {selectedCycle.year}
                    </Badge>
                )}
                {showRotationCount && selectedCycle && (
                    <Badge colorScheme="purple" fontSize="xs">
                        {selectedCycle.rotations?.length || 0} rot.
                    </Badge>
                )}
            </HStack>
        );
    };

    return (
        <CustomSelect
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            isDisabled={isDisabled}
            allowDeselect={allowDeselect}
            renderSelected={renderSelected}
            size={size}
        />
    );
};
