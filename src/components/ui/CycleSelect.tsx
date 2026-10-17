import { Text, HStack, Badge } from "@chakra-ui/react";
import { CustomSelect } from "./CustomSelect";
import type { ICycle } from "../../interfaces";
import type { ReactNode } from "react";
import { isCycleActive } from "../../utils/cycleHelpers";
import type { SelectVariant } from "@/hooks/useSelectTheme";

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
    showActiveBadge?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: SelectVariant;
    w?: string | object;
}

export const CycleSelect = ({
    cycles,
    value,
    onChange,
    placeholder = "Sélectionner un cycle",
    isDisabled = false,
    allowDeselect = true,
    valueKey = '_id',
    showActiveBadge = false,
    size = 'md',
    variant = 'default',
    w
}: CycleSelectProps) => {
    const cyclesByYear = cycles.reduce((acc, cycle) => {
        const year = cycle.year || 'Année inconnue';
        if (!acc[year]) acc[year] = [];
        acc[year].push(cycle);
        return acc;
    }, {} as Record<string | number, ICycle[]>);

    const sortedYears = Object.entries(cyclesByYear)
        .sort(([a], [b]) => Number(b) - Number(a));

    // Options grouped by year
    const options: SelectOption[] = [];
    sortedYears.forEach(([year, cyclesInYear]) => {
        // Most recently created cycle first within each year
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
                        <HStack spacing={2} w="100%" minW={0} justify="space-between">
                            <Text fontWeight="medium" isTruncated minW={0}>
                                {cycle.name}
                            </Text>
                            <HStack spacing={1} flexShrink={0}>
                                {showActiveBadge && (
                                    <>
                                        {isCycleActive(cycle) ? (
                                            <Badge colorScheme="green" fontSize="xs">
                                                Actif
                                            </Badge>
                                        ) : (
                                            <Badge colorScheme="purple" fontSize="xs" variant="subtle">
                                                {cycle.rotations?.length || 0} rot.
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </HStack>
                        </HStack>
                    )
                });
            });
    });

    const renderSelected = (option: SelectOption) => {
        const selectedCycle = cycles.find(c => 
            (valueKey === '_id' ? c._id : c.name) === option.value
        );

        return (
            <HStack spacing={2} w="100%" minW={0}>
                <Text fontWeight="medium" isTruncated minW={0} flex="1 1 auto">
                    {selectedCycle?.name || option.label}
                </Text>
                {selectedCycle?.year && (
                    <Badge colorScheme="blue" fontSize="xs" flexShrink={0}>
                        {selectedCycle.year}
                    </Badge>
                )}
                {showActiveBadge && selectedCycle && isCycleActive(selectedCycle) && (
                    <Badge colorScheme="green" fontSize="xs" flexShrink={0}>
                        Actif
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
            variant={variant}
            w={w}
        />
    );
};
