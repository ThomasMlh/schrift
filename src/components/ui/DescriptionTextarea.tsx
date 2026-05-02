import { FormControl, FormLabel, Textarea } from "@chakra-ui/react";
import { memo } from "react";
import { useTranslation } from "react-i18next";

interface DescriptionTextareaProps {
  value: string;
  onChange: (value: string) => void;
}

export const DescriptionTextarea = memo(({ value, onChange }: DescriptionTextareaProps) => {
  const { t } = useTranslation();
  return (
    <FormControl>
      <FormLabel>{t("components.descriptionTextarea.label")}</FormLabel>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("components.descriptionTextarea.placeholder")}
        rows={3}
        minH="150px"
      />
    </FormControl>
  );
});