import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link, useColorModeValue } from '@chakra-ui/react';
import type { SystemStyleObject } from '@chakra-ui/react';

interface CustomLinkProps {
    to: string;
    text: string;
    textSize?: "xs" | "sm" | "md" | "lg" | "xl";
    sx?: SystemStyleObject;
}

const CustomLink: React.FC<CustomLinkProps> = ({ to, text, textSize = "sm", sx }) => {
    const linkColor = useColorModeValue("black", "white");
    
    // Si le lien a un gradient rainbow, on adapte le hover
    const hasRainbowGradient = sx?.bgGradient || sx?.backgroundImage;

    return <Link 
        as={RouterLink} 
        to={to} 
        color={linkColor}
        _hover={hasRainbowGradient ? {
            "&::after": {
                opacity: 1
            }
        } : {
            textDecoration: "underline",
            color: linkColor
        }}
        _focus={{
            outline: "1px solid",
            outlineColor: linkColor,
            outlineOffset: "2px"
        }} 
        fontWeight="medium" 
        fontSize={textSize} 
        sx={{
            ...sx,
            position: hasRainbowGradient ? "relative" : sx?.position,
            ...(hasRainbowGradient && {
                "&::after": {
                    content: '""',
                    position: "absolute",
                    left: "0",
                    right: "0",
                    bottom: "0",
                    height: "2px",
                    background: sx?.bgGradient || "linear-gradient(90deg, #ff6b6b, #ffa07a, #ffd966, #90ee90, #87ceeb, #9370db)",
                    backgroundSize: "300% 300%",
                    animation: "rainbow 6s ease infinite",
                    opacity: 0,
                    transition: "opacity 0.2s ease"
                }
            }),
            "@keyframes rainbow": {
                "0%": { backgroundPosition: "0% 50%" },
                "50%": { backgroundPosition: "100% 50%" },
                "100%": { backgroundPosition: "0% 50%" }
            }
        }}
    >
        {text}
    </Link>;
};

export default CustomLink;