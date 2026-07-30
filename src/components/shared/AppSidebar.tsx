"use client";

import React, {
  ForwardRefExoticComponent,
  RefAttributes,
  useEffect,
  useState,
} from "react";
import {
  ChevronRight,
  Computer,
  LayoutDashboard,
  LucideProps,
  Package,
  Settings,
  ShoppingBasket,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import {
  DiamondPlusIcon,
  GalleryVertical,
  HardDriveUpload,
  LayoutGrid,
  ListTodo,
  ShoppingCart,
  SlidersHorizontal,
  Tags,
  UserCog,
  UserPen,
  Users,
  UsersRound,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TMenu {
  id: number;
  title: string;
  link: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  children?: TMenu[];
}

const menus: TMenu[] = [
  {
    id: 1,
    title: "Dashboard",
    link: "/",
    icon: LayoutGrid,
  },
  {
    id: 2,
    title: "Details Category",
    link: "/details-category",
    icon: LayoutDashboard,
  },
  {
    id: 3,
    title: "Brand",
    link: "/brand",
    icon: Tags,
  },
  {
    id: 4,
    title: "Category",
    icon: ListTodo,
    link: "/category",
  },

  {
    id: 5,
    title: "Product",
    icon: ShoppingCart,
    link: "/product",
    children: [
      {
        id: 1,
        title: "Create Product",
        link: "/product/create-product",
        icon: DiamondPlusIcon,
      },
      {
        id: 4,
        title: "Product Filters",
        link: "/product/filters",
        icon: SlidersHorizontal,
      },
      {
        id: 2,
        title: "All Products",
        link: "/product/all-products",
        icon: GalleryVertical,
      },
      {
        id: 3,
        title: "Bulk Upload",
        link: "/product/bulk-upload",
        icon: HardDriveUpload,
      },
    ],
  },
  {
    id: 22,
    title: "Orders",
    link: "/orders",
    icon: ShoppingBasket,
  },
  {
    id: 8,
    title: "Offers",
    link: "/offers",
    icon: Package,
    children: [
      {
        id: 1,
        title: "Deals",
        link: "/offers/deals",
        icon: UserPen,
      },
    ],
  },
  {
    id: 6,
    title: "Roles",
    link: "/roles",
    icon: UserCog,
  },
  {
    id: 7,
    title: "Users",
    link: "/users",
    icon: Users,
    children: [
      {
        id: 1,
        title: "Admins",
        link: "/users/admins",
        icon: UserPen,
      },
      {
        id: 2,
        title: "Customers",
        link: "/users/customers",
        icon: UsersRound,
      },
    ],
  },
  {
    id: 8,
    title: "Settings",
    link: "/settings",
    icon: Settings,
    children: [
      {
        id: 1,
        title: "PC Builder",
        link: "/settings/pc-builder",
        icon: Computer,
      },
    ],
  },
  // {
  //   id: 11,
  //   title: "Shop",
  //   icon: Store,
  //   link: "/shop",
  //   children: [
  //     {
  //       id: 1,
  //       title: "Banner Builder",
  //       link: "/shop/banner-builder",
  //       icon: GalleryHorizontalEnd,
  //     },
  //   ],
  // },
];

export function AppSidebar() {
  const pathName = usePathname();
  const [, setOpenRoute] = useState<number[]>([]);
  const { state } = useSidebar();

  useEffect(() => {
    menus.forEach((menu) => {
      if (pathName.includes(menu.link)) {
        setOpenRoute([menu.id]);
      }
    });
  }, [pathName]);

  const isLinkActive = (link: string) => {
    if (link === "/" && pathName === "/") {
      return true;
    }
    return pathName.substring(1) === link.substring(1);
  };

  function renderMenu(menu: TMenu) {
    const active = isLinkActive(menu.link);
    const parentActive = pathName.includes(menu.link);
    return (
      <SidebarMenuItem
        key={menu.id}
        className={`${active ? "bg-sidebar-primary text-sidebar-accent-foreground hover:text-sidebar-accent-foreground" : ""}`}
      >
        {menu.children && menu?.children.length > 0 ? (
          <Collapsible
            className={cn(
              "group/collapsible",
              parentActive && "bg-secondary/10 rounded-md",
            )}
            defaultOpen={parentActive}
          >
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={menu.title}>
                <menu.icon className="text-inherit" size={18} />
                <span className="text-inherit">{menu.title}</span>
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent
              className={active ? "hover:bg-transparent" : ""}
            >
              <SidebarMenuSub>
                {menu.children.map((item) => (
                  <SidebarMenuSubItem key={item.id}>
                    {renderMenu(item)}
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <SidebarMenuButton
            className={
              active ? "hover:bg-transparent hover:text-pure-white" : ""
            }
            tooltip={menu.title}
            asChild
          >
            <Link href={menu.link} className="block">
              <SidebarMenuSubItem className="flex gap-2">
                <menu.icon className="text-inherit" size={18} />
                {menu.title}
              </SidebarMenuSubItem>
            </Link>
          </SidebarMenuButton>
        )}
      </SidebarMenuItem>
    );
  }

  const { theme } = useTheme();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent active:bg-transparent"
            >
              {/* <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                                <GalleryVerticalEnd className='size-4' />
                            </div> */}
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
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>{menus.map((menu) => renderMenu(menu))}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
