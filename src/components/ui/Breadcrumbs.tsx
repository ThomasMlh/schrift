import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";

export interface BreadcrumbEntry {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbEntry[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  const mutedColor = useColorModeValue("gray.400", "whiteAlpha.400");
  const linkColor = useColorModeValue("gray.500", "whiteAlpha.600");
  const activeColor = "text.strong";

  return (
    <Breadcrumb
      spacing={1}
      separator={<ChevronRightIcon color={mutedColor} boxSize={3} />}
      fontSize="sm"
      mb={4}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <BreadcrumbItem key={idx} isCurrentPage={isLast}>
            {!isLast && item.to ? (
              <BreadcrumbLink
                as={Link}
                to={item.to}
                color={linkColor}
                _hover={{ color: activeColor, textDecoration: "none" }}
                fontSize="sm"
              >
                {item.label}
              </BreadcrumbLink>
            ) : (
              <Text as="span" color={activeColor} fontWeight="medium" fontSize="sm">
                {item.label}
              </Text>
            )}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};
