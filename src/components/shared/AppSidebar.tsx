"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/redux/hooks";
import { TPermission } from "@/interface/auth.interface";
import { sidebarGroups, TSidebarItem } from "./sidebarMenus";

// Length of the matched prefix, or -1 when the link does not cover the path.
const matchLength = (path: string, link: string) => {
  if (link === "/") return path === "/" ? 1 : -1;
  return path === link || path.startsWith(link + "/") ? link.length : -1;
};

const canRead = (item: TSidebarItem, permissions?: TPermission[]) =>
  !item.feature ||
  !!permissions?.find((p) => p.feature === item.feature)?.access.read;

function visibleItems(items: TSidebarItem[], permissions?: TPermission[]) {
  return items.reduce<TSidebarItem[]>((acc, item) => {
    if (item.children?.length) {
      const children = item.children.filter((c) => canRead(c, permissions));
      if (children.length) acc.push({ ...item, children });
      return acc;
    }
    if (canRead(item, permissions)) acc.push(item);
    return acc;
  }, []);
}

function CollapsibleMenu({
  menu,
  activeLink,
}: {
  menu: TSidebarItem;
  activeLink: string | null;
}) {
  const parentActive = !!menu.children?.some((c) => c.link === activeLink);
  const [open, setOpen] = useState(parentActive);

  // Deep-linking into a child (e.g. from a notification) expands its parent.
  useEffect(() => {
    if (parentActive) setOpen(true);
  }, [parentActive]);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className={cn(
        "group/collapsible",
        parentActive && "bg-secondary/10 rounded-md",
      )}
    >
      <CollapsibleTrigger asChild>
        <SidebarMenuButton
          tooltip={menu.title}
          className="group/collapsible-trigger"
        >
          <menu.icon
            className="text-black group-hover/collapsible-trigger:text-sidebar-accent-foreground"
            size={18}
          />
          <span className="text-black group-hover/collapsible-trigger:text-sidebar-accent-foreground">
            {menu.title}
          </span>
          <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
        </SidebarMenuButton>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {menu.children?.map((item) => {
            const active = item.link === activeLink;
            return (
              <SidebarMenuSubItem
                key={item.link}
                className="group/sub-menu-item"
              >
                <SidebarMenuSubButton
                  asChild
                  isActive={active}
                  className={
                    active
                      ? "hover:bg-transparent hover:text-pure-white"
                      : "text-dark-gray"
                  }
                >
                  <Link href={item.link} className="flex items-center gap-2">
                    <item.icon
                      className="text-dark group-hover/sub-menu-item:text-pure-white"
                      size={18}
                    />
                    {item.title}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            );
          })}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AppSidebar() {
  const pathName = usePathname();
  const { state } = useSidebar();
  const { theme } = useTheme();
  const { permissions } = useAppSelector((s) => s.auth);

  const groups = useMemo(() => {
    return sidebarGroups
      .map((group) => ({
        ...group,
        items: visibleItems(group.items, permissions),
      }))
      .filter((group) => group.items.length > 0);
  }, [permissions]);

  // Most specific leaf wins, so /products/create highlights Create Product rather than All Products.
  const activeLink = useMemo(() => {
    let best: string | null = null;
    let bestLength = 0;
    groups.forEach((group) =>
      group.items.forEach((item) => {
        const leaves = item.children?.length ? item.children : [item];
        leaves.forEach((leaf) => {
          const length = matchLength(pathName, leaf.link);
          if (length > bestLength) {
            bestLength = length;
            best = leaf.link;
          }
        });
      }),
    );
    return best;
  }, [pathName, groups]);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent active:bg-transparent"
            >
              <Link
                href={"/"}
                className="flex shrink-0 flex-col gap-0.5 leading-none"
              >
                <Image
                  src={
                    theme !== "dark"
                      ? "/logo/dailyit-logo-black.png"
                      : "/logo/dailyit-logo-white.png"
                  }
                  width={320}
                  height={170}
                  className={cn("w-full h-12", {
                    "h-[34px]": state === "collapsed",
                  })}
                  alt="logo"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((menu) => {
                  const active = menu.link === activeLink;
                  return (
                    <SidebarMenuItem
                      key={menu.link}
                      className={
                        active && !menu.children?.length
                          ? "bg-sidebar-primary text-sidebar-accent-foreground hover:text-sidebar-accent-foreground"
                          : ""
                      }
                    >
                      {menu.children?.length ? (
                        <CollapsibleMenu menu={menu} activeLink={activeLink} />
                      ) : (
                        <SidebarMenuButton
                          className={cn(
                            active
                              ? "hover:bg-transparent hover:text-pure-white"
                              : "",
                            "group/menu-item",
                          )}
                          tooltip={menu.title}
                          asChild
                        >
                          <Link
                            href={menu.link}
                            className="flex items-center gap-2"
                          >
                            <menu.icon
                              className={cn(
                                "text-black group-hover/menu-item:text-pure-white",
                                active && "text-sidebar-accent-foreground",
                              )}
                              size={18}
                            />
                            {menu.title}
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
