import { useAppSelector } from "@/redux/hooks";
import { TPermissionKey } from "@/interface/auth.interface";
import { useCallback, useMemo } from "react";

// Keys are globally unique across modules, so call sites never name the module.
export const useCan = () => {
  const { permissions } = useAppSelector((s) => s.auth);

  const granted = useMemo(
    () =>
      new Set(
        permissions?.flatMap((m) =>
          Object.entries(m.permissions ?? {})
            .filter(([, value]) => value)
            .map(([key]) => key),
        ) ?? [],
      ),
    [permissions],
  );

  return useCallback((key: TPermissionKey) => granted.has(key), [granted]);
};
