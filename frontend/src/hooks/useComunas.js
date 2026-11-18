import { useQuery } from "@tanstack/react-query";

export const useComunas = (region) => {
  return useQuery({
    queryKey: ["comunas", region],
    enabled: !!region,
    queryFn: async () => {
      const res = await fetch(
        `http://apis.digital.gob.cl/dpa/regiones/${region}/comunas`,
      );
      return res.json();
    },
  });
};
