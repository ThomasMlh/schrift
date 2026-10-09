import { Fragment } from "react";
import { Text } from "@chakra-ui/react";

// Rend "**texte**" en gras, sans dépendance markdown — juste ce qu'il faut pour le journal d'activité.
export const BoldMarkdownText = ({ text }: { text: string }) => (
  <>
    {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <Text as="b" key={i}>{part.slice(2, -2)}</Text>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      )
    )}
  </>
);
