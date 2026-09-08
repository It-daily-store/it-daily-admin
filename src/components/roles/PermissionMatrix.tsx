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
  inPage?: boolean;
  showExpandControls?: boolean;
};

const PermissionMatrix = ({
  catalog,
  value,
  onChange,
  readOnly,
  inPage,
  showExpandControls,
}: TProps) => {
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

  const searchInput = readOnly ? null : (
    <Input
      placeholder="Search permissions..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      {showExpandControls ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {searchInput ? <div className="flex-1">{searchInput}</div> : null}
          <div className="flex gap-2 sm:ml-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray hover:text-primary"
              onClick={() => setCollapsed({})}
            >
              Expand all
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-gray hover:text-primary"
              onClick={() =>
                setCollapsed(
                  Object.fromEntries(catalog.map((g) => [g.module, true])),
                )
              }
            >
              Collapse all
            </Button>
          </div>
        </div>
      ) : (
        searchInput
      )}

      <div
        className={cn(
          "flex flex-col gap-6",
          !inPage && "max-h-[45vh] overflow-y-auto pr-1",
        )}
      >
        {filtered.map((group) => {
          const granted = grantedFor(group.module);
          const grantedCount = group.permissions.filter(
            (p) => granted[p.key],
          ).length;
          const allGranted = grantedCount === group.permissions.length;
          const isCollapsed = collapsed[group.module];

          return (
            <div key={group.module} className="flex flex-col">
              <div
                role="button"
                tabIndex={0}
                onClick={() =>
                  setCollapsed((prev) => ({
                    ...prev,
                    [group.module]: !prev[group.module],
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setCollapsed((prev) => ({
                      ...prev,
                      [group.module]: !prev[group.module],
                    }));
                  }
                }}
                className="flex cursor-pointer select-none items-center gap-2 bg-accent px-4 py-3 outline-none"
              >
                {isCollapsed ? (
                  <ChevronRight size={15} className="shrink-0 text-gray" />
                ) : (
                  <ChevronDown size={15} className="shrink-0 text-gray" />
                )}

                <span className="font-semibold text-black">{group.label}</span>

                <span
                  className={cn(
                    "text-xs",
                    grantedCount ? "text-primary" : "text-gray",
                  )}
                >
                  {grantedCount} of {group.permissions.length}
                </span>

                {!readOnly && (
                  <Button
                    type="button"
                    variant="plain"
                    size="base"
                    className="ml-auto text-sm font-medium text-gray hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModule(
                        group.module,
                        Object.fromEntries(
                          group.permissions.map((p) => [p.key, !allGranted]),
                        ),
                      );
                    }}
                  >
                    {allGranted ? "Revoke all" : "Grant all"}
                  </Button>
                )}
              </div>

              {!isCollapsed && (
                <div className="flex flex-col px-4">
                  {group.permissions.map((p) => (
                    <div
                      key={p.key}
                      className="flex items-center justify-between gap-4 border-b border-border-color py-3.5 last:border-b-0"
                    >
                      <span className="text-sm text-dark-gray">{p.label}</span>
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
