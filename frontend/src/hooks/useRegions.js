import { useQuery } from "@tanstack/react-query";

export const useRegions = () => {
  return useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const res = await fetch(
        "http://apis.digital.gob.cl/dpa/regiones"
      );
      return res.json();
    },
  });
};