import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link, useColorModeValue } from '@chakra-ui/react';

interface CustomLinkProps {
    to: string;
    text: string;
    textSize?: "xs" | "sm" | "md" | "lg" | "xl";
}

const CustomLink: React.FC<CustomLinkProps> = ({ to, text, textSize = "sm" }) => {
    const linkColor = useColorModeValue("black", "white");

    return <Link as={RouterLink} to={to} color={linkColor} _hover={{
        textDecoration: "underline",
        color: linkColor
    }}
        _focus={{
            outline: "1px solid",
            outlineColor: linkColor,
            outlineOffset: "2px"
        }} fontWeight="medium" fontSize={textSize}>{text}</Link>;
};

export default CustomLink;