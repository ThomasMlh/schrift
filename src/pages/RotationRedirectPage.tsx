import { Navigate, useParams } from "react-router-dom";
import { Container, Skeleton } from "@chakra-ui/react";
import { useCycles } from "@/hooks/useAPI";
import { cycleFromSlug } from "@/utils/cycleHelpers";
import { rotationUrl } from "@/utils/rotationPassages";

// Old address /cycle/:cycleId/rotation/:position (cycle slug or id): sends to the rotation page on that cycle
const RotationRedirectPage = () => {
  const { cycleId = "", position = "" } = useParams<{ cycleId: string; position: string }>();
  const { cycles, isLoading } = useCycles({ limit: 100 });
  if (isLoading) {
    return <Container maxW="container.xl" py={6}><Skeleton h="300px" borderRadius="2xl" /></Container>;
  }
  const cycle = cycleFromSlug(cycles, cycleId) ?? cycles.find((c) => c._id === cycleId);
  const rotation = cycle?.rotations.find((r) => String(r.position) === position);
  if (!cycle || !rotation) return <Navigate to="/cycles" replace />;
  return <Navigate to={rotationUrl(rotation, cycle)} replace />;
};

export default RotationRedirectPage;
