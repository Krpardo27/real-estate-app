import { useQuery } from "@tanstack/react-query";
import { getPropertyById } from "../api/properties.js";

export function useProperty(id) {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => getPropertyById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}
