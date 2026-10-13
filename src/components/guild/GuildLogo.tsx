import { useState } from "react";
import { Flex, Image, Text } from "@chakra-ui/react";
import type { IGuild } from "@/interfaces";
import { bucketUrl } from "@/utils/apiRequest";

interface GuildLogoProps {
  guild: IGuild;
  size: string;
}

/** Guild logo, or its letter on a gradient when the image is missing */
export const GuildLogo = ({ guild, size }: GuildLogoProps) => {
  const [hasError, setHasError] = useState(false);

  return hasError ? (
    <Flex
      w={size}
      h={size}
      flexShrink={0}
      align="center"
      justify="center"
      bgGradient="linear(to-br, purple.500, pink.400)"
      borderRadius="lg"
    >
      <Text fontSize="sm" color="white" fontWeight="bold">
        {guild.name.charAt(0)}
      </Text>
    </Flex>
  ) : (
    <Image
      src={`${bucketUrl}/guilds/${guild.name}.png`}
      alt={guild.name}
      w={size}
      h={size}
      flexShrink={0}
      objectFit="contain"
      onError={() => setHasError(true)}
    />
  );
};
