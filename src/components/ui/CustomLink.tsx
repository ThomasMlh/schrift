import React from 'react';
import NextLink from 'next/link';
import { Link, useColorModeValue, Text } from '@chakra-ui/react';
import type { SystemStyleObject } from '@chakra-ui/react';
import { useAuth } from '@/providers/AuthProvider';

const RAINBOW_GRADIENT = "linear-gradient(90deg, #ff6b6b, #ffa07a, #ffd966, #90ee90, #87ceeb, #9370db)";

interface CustomLinkProps {
    to: string;
    text: string;
    textSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    sx?: SystemStyleObject;
    rainbow?: boolean;
    requireAuth?: boolean;
}

const CustomLink: React.FC<CustomLinkProps> = ({ to, text, textSize = "sm", sx, rainbow = false, requireAuth = false }) => {
    const linkColor = useColorModeValue("black", "white");
    const { isLoggedIn } = useAuth();

    if (requireAuth && !isLoggedIn) {
        return (
            <Text
                color={linkColor}
                fontWeight="medium"
                fontSize={textSize}
                sx={sx}
                {...(rainbow && {
                    bgGradient: "linear(90deg, #ff6b6b, #ffa07a, #ffd966, #90ee90, #87ceeb, #9370db)",
                    backgroundSize: "300% 300%",
                    backgroundClip: "text",
                    sx: {
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        animation: "rainbow 6s ease infinite",
                        "@keyframes rainbow": {
                            "0%": { backgroundPosition: "0% 50%" },
                            "50%": { backgroundPosition: "100% 50%" },
                            "100%": { backgroundPosition: "0% 50%" }
                        },
                        ...sx,
                    }
                })}
            >
                {text}
            </Text>
        );
    }

    return <Link
        as={NextLink}
        href={to}
        color={linkColor}
        _hover={rainbow ? {
            "&::after": { opacity: 1 }
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
            ...(rainbow && {
                bgGradient: "linear(90deg, #ff6b6b, #ffa07a, #ffd966, #90ee90, #87ceeb, #9370db)",
                backgroundSize: "300% 300%",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "rainbow 6s ease infinite",
                position: "relative",
                "&::after": {
                    content: '""',
                    position: "absolute",
                    left: "0",
                    right: "0",
                    bottom: "0",
                    height: "2px",
                    background: RAINBOW_GRADIENT,
                    backgroundSize: "300% 300%",
                    animation: "rainbow 6s ease infinite",
                    opacity: 0,
                    transition: "opacity 0.2s ease"
                },
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