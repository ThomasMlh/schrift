'use client';
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Box, Button, Container } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const NotFound = () => {
    const router = useRouter();
    const { t } = useTranslation();
    return (
        <Box w="100%">
            <Container maxW="container.xl" py={8}>
                <Box textAlign="center" py={10} px={6}>
                    {/* <Image justifySelf={"center"} src="https://i.ibb.co/My0N1yHG/rangiku.gif" width={"50%"} alt="Page not found" /> */}
                    <Box fontSize="6xl" fontWeight="bold">
                        404
                    </Box>
                    <Box fontSize="2xl" mt={4} mb={2}>
                        {t("pages.notFound.title")}
                    </Box>
                    <Box color="gray.500" mb={6}>
                        {t("pages.notFound.message")}
                    </Box>
                <Button
                    leftIcon={<ArrowBackIcon />}
                    variant="outline"
                    alignSelf="flex-start"
                    onClick={() => router.push('/')}
                >
                    {t("pages.notFound.backHome")}
                </Button>
                </Box>
            </Container>
        </Box>  
    )
}

export default NotFound;