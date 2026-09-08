"use client";

import React, { useMemo, useState } from "react";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { EAppModules, TModulePermission } from "@/interface/auth.interface";
import { TPermissionCatalog } from "@/redux/api/rolesApi";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type TProps = {
  catalog: TPermissionCatalog;
  value: TModulePermission[];
  onChange?: (next: TModulePermission[]) => void;
  readOnly?: boolean;
};

const PermissionMatrix = ({ catalog, value, onChange, readOnly }: TProps) => {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const grantedFor = (module: EAppModules) =>
    value.find((v) => v.module === module)?.permissions ?? {};

  const setModule = (
    module: EAppModules,
    permissions: Record<string, boolean>,
  ) => {
    if (!onChange) return;
    const rest = value.filter((v) => v.module !== module);
    onChange([...rest, { module, permissions }]);
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return catalog;
    return catalog
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (p) =>
            p.label.toLowerCase().includes(term) ||
            p.key.toLowerCase().includes(term),
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [catalog, search]);

  return (
    <div className="flex flex-col gap-3">
      {!readOnly && (
        <Input
          placeholder="Search permissions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      <div className="flex max-h-[45vh] flex-col gap-2 overflow-y-auto pr-1">
        {filtered.map((group) => {
          const granted = grantedFor(group.module);
          const grantedCount = group.permissions.filter(
            (p) => granted[p.key],
          ).length;
          const allGranted = grantedCount === group.permissions.length;
          const isCollapsed = collapsed[group.module];

          return (
            <div key={group.module} className="rounded-md bg-background p-3">
              <div className="mb-2 flex items-center justify-between border-b border-border-color pb-2">
                <button
                  type="button"
                  onClick={() =>
                    setCollapsed((prev) => ({
                      ...prev,
                      [group.module]: !prev[group.module],
                    }))
                  }
                  className="flex items-center gap-1 font-semibold"
                >
                  {isCollapsed ? (
                    <ChevronRight size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {group.label}
                </button>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-sm",
                      grantedCount ? "text-primary" : "text-gray",
                    )}
                  >
                    {grantedCount}/{group.permissions.length}
                  </span>
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setModule(
                          group.module,
                          Object.fromEntries(
                            group.permissions.map((p) => [p.key, !allGranted]),
                          ),
                        )
                      }
                    >
                      {allGranted ? "Revoke all" : "Grant all"}
                    </Button>
                  )}
                </div>
              </div>

              {!isCollapsed && (
                <div className="flex flex-col gap-1">
                  {group.permissions.map((p) => (
                    <div
                      key={p.key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray">{p.label}</span>
                      <Switch
                        checked={granted[p.key] === true}
                        disabled={readOnly}
                        onCheckedChange={() =>
                          setModule(group.module, {
                            ...granted,
                            [p.key]: !granted[p.key],
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionMatrix;
