import { FormControl, FormLabel, Textarea } from "@chakra-ui/react";
import { memo } from "react";

interface DescriptionTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

export const DescriptionTextarea = memo(({ value, onChange }: DescriptionTextareaProps) => {
  return (
    <FormControl>
      <FormLabel>Description (optionnel)</FormLabel>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Décrivez votre stratégie, les atouts de cette team..."
        rows={3}
        minH="150px"
      />
    </FormControl>
  );
});