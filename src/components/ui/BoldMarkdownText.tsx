import { Fragment } from "react";
import { Text } from "@chakra-ui/react";

// Renders "**text**" in bold without a markdown dependency, enough for the activity log.
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
