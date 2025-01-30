"use client";

import { usePathname } from "next/navigation";

import { Breadcrumbs } from "../breadcrumb";

// Broken right now. This needs to take the current url path and generate the breadcrumbs from that.
// it needs to be able to handle nested paths like /dashboard/sources/new and dynamic segments like [id]
export function autoBreadcrumbs() {
  const pathname = usePathname();
  if (!pathname) return [];

  const segments = pathname.split("/").filter(Boolean);
  return segments.reduce(
    (acc: { title: string; url: string }[], segment, index) => {
      const url = "/" + segments.slice(0, index + 1).join("/");
      const title =
        segment.startsWith("[") && segment.endsWith("]")
          ? "Details" // Replace with a more appropriate title for dynamic segments
          : segment.charAt(0).toUpperCase() + segment.slice(1);
      acc.push({ title, url });
      return acc;
    },
    [],
  );
}

// export function autoBreadcrumbs() {
//   const pathname = usePathname();
//   return pathname
//     ?.split("/")
//     .reverse()
//     .reduce((acc: { title: string; url: string }[], segment) => {
//       const url = acc.length > 0 ? `${acc[0]?.url}/${segment}` : `/${segment}`;
//       acc.unshift({ title: segment, url });
//       return acc;
//     }, []);
// }

export function AutoBreadcrumbs() {
  const links = autoBreadcrumbs();
  return <Breadcrumbs links={links} />;
}
