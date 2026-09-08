"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { sidebarGroups, TSidebarItem } from "./sidebarMenus";
import { useGetSingleRoleQuery } from "@/redux/api/rolesApi";
import { useGetOrderByIdQuery } from "@/redux/api/orderApi";
import { useGetSingleProductQuery } from "@/redux/api/productApi";
import { useGetSingleDealQuery } from "@/redux/api/dealsApi";
import { useGetSingleUserQuery } from "@/redux/api/usersApi";
import { useGetTemplateQuery } from "@/redux/api/bannerApi";

const matchLength = (path: string, link: string) => {
  if (link === "/") return path === "/" ? 1 : -1;
  return path === link || path.startsWith(link + "/") ? link.length : -1;
};

const toTitle = (segment: string) =>
  segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Resolve current path to the sidebar trail: [Home, ...parent, leaf].
const findTrail = (path: string): { link: string; title: string }[] => {
  type LeafMatch = {
    leaf: TSidebarItem;
    parent: TSidebarItem | null;
    length: number;
  };

  const matches: LeafMatch[] = [];
  sidebarGroups.forEach((group) =>
    group.items.forEach((item) => {
      const leaves = item.children?.length ? item.children : [item];
      leaves.forEach((leaf) => {
        matches.push({
          leaf,
          parent: item,
          length: matchLength(path, leaf.link),
        });
      });
    }),
  );

  const best = matches.reduce<LeafMatch | undefined>(
    (acc, m) => (!acc || m.length > acc.length ? m : acc),
    undefined,
  );

  if (!best) return [];

  const trail: { link: string; title: string }[] = [
    { link: "/", title: "Home" },
  ];
  if (
    best.parent &&
    best.parent.children?.length &&
    best.parent.link !== best.leaf.link
  ) {
    trail.push({ link: best.parent.link, title: best.parent.title });
  }
  trail.push({ link: best.leaf.link, title: best.leaf.title });
  return trail;
};

// Fetch the entity title for a detail route. All hooks run unconditionally
// with skip so non-detail pages pay no network cost (RTK Query shared cache
// dedupes against the page's own query on detail pages).
const useDetailLabel = (pathname: string): string | null => {
  const roleId = pathname.match(/^\/roles\/([^/]+)$/)?.[1];
  const orderNo = pathname.match(/^\/orders\/([^/]+)$/)?.[1];
  const productId =
    pathname.match(/^\/products\/([^/]+)\/edit$/)?.[1] ??
    pathname.match(/^\/products\/([^/]+)$/)?.[1];
  const dealId = pathname.match(/^\/deals\/([^/]+)$/)?.[1];
  const userId = pathname.match(/^\/users\/admins\/([^/]+)$/)?.[1];
  const templateId = pathname.match(
    /^\/storefront\/banner-builder\/([^/]+)$/,
  )?.[1];

  const { data: roleData } = useGetSingleRoleQuery(roleId ?? "", {
    skip: !roleId,
  });
  const { data: orderData } = useGetOrderByIdQuery(orderNo ?? "", {
    skip: !orderNo,
  });
  const { data: productData } = useGetSingleProductQuery(productId ?? "", {
    skip: !productId,
  });
  const { data: dealData } = useGetSingleDealQuery(dealId ?? "", {
    skip: !dealId,
  });
  const { data: userData } = useGetSingleUserQuery(
    { id: userId ?? "", userType: "admin" },
    { skip: !userId },
  );
  const { data: templateData } = useGetTemplateQuery(templateId ?? "", {
    skip: !templateId,
  });

  if (roleId) return roleData?.data?.role ?? null;
  if (orderNo)
    return orderData?.data?.orderNumber
      ? `#${orderData.data.orderNumber}`
      : null;
  if (productId) return productData?.data?.name ?? null;
  if (dealId) return dealData?.data?.title ?? null;
  if (userId) return userData?.data?.fullName ?? null;
  if (templateId) return templateData?.data?.name ?? null;
  return null;
};

const PageBreadcrumb = () => {
  const pathname = usePathname();
  const detailLabel = useDetailLabel(pathname);
  const trail = findTrail(pathname);

  if (!trail.length) return null;

  const current = trail[trail.length - 1];
  const onCurrentPage = pathname === current.link;
  const leafIsDetail =
    !onCurrentPage && pathname.startsWith(current.link + "/");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {trail.map((item, i) => {
          const last = i === trail.length - 1;
          const showAsLink = !last || !onCurrentPage;
          return (
            <BreadcrumbItem key={item.link}>
              {showAsLink ? (
                <BreadcrumbLink asChild>
                  <Link href={item.link}>{item.title}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              )}
              {!last && <BreadcrumbSeparator />}
            </BreadcrumbItem>
          );
        })}
        {leafIsDetail && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {detailLabel ??
                  toTitle(pathname.split("/").filter(Boolean).pop() ?? "")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default PageBreadcrumb;
