"use client";

import { NavSidebarItem } from "./nav-sidebar-item";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from "./sidebar";

export const NavGroup = ({
  title,
  items,
  linkComponent,
}: {
  title?: string;
  items: NavSidebarItem[];
  linkComponent?: React.ComponentType<{
    href: string;
    children: React.ReactNode;
  }>;
}) => {
  if (!items?.length) return null;
  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => (
          <NavSidebarItem
            key={item.title}
            item={item}
            linkComponent={linkComponent}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};
