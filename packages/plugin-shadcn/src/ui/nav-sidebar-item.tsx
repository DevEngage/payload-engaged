"use client";

import { Fragment } from "react";
import { ChevronRight, LucideIcon, MoreHorizontal } from "lucide-react";

import { cn } from ".";
import { Badge, BadgeProps } from "./badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "./sidebar";
import Icon, { IconName } from "./utils/icon";

const renderIcon = (
  icon?: LucideIcon | React.ReactNode | IconName,
  badge?: string,
  badgeVariant?: BadgeProps["variant"],
  isOpen?: boolean,
) => {
  if (!icon) return null;
  if (typeof icon === "string")
    return (
      <div className={cn(badge && "relative")}>
        <Icon name={icon as IconName} size={16} />
        {badge && isOpen && (
          <Badge
            variant={badgeVariant}
            onIcon
            className="absolute -right-2 -top-2"
          >
            {badge}
          </Badge>
        )}
      </div>
    );
  return icon as React.ReactNode;
};

export type NavSidebarItem = {
  title: string;
  url: string;
  icon?: LucideIcon | IconName;
  badge?: string;
  badgePosition?: "left" | "right";
  badgeVariant?: BadgeProps["variant"];
  isActive?: boolean;
  separator?: boolean;
  menuType?: "collapsible" | "dropdown";
  items?: NavSidebarItem[];
};

export type LinkComponentProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  passHref?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export type NavSidebarItemProps = {
  item: NavSidebarItem;
  linkComponent?: React.ComponentType<LinkComponentProps>;
};

export const NavSidebarItem = ({
  item,
  linkComponent,
}: NavSidebarItemProps) => {
  const LinkComponent = linkComponent ?? "a";
  const badgePosition = item.badgePosition ?? "right";
  const { open } = useSidebar();

  return (
    <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={item.title}>
          <LinkComponent
            href={item.url}
            className={cn(
              "flex justify-between gap-2",
              badgePosition === "left" && "justify-start",
            )}
          >
            <div className="flex items-center gap-2">
              {renderIcon(item.icon, item.badge, item.badgeVariant, !open)}
              <span>{item.title}</span>
            </div>
            {item.badge && <Badge>{item.badge}</Badge>}
          </LinkComponent>
        </SidebarMenuButton>
        {item.items?.length &&
        (item.menuType === "collapsible" || !item.menuType) ? (
          <>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction className="data-[state=open]:rotate-90">
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton asChild>
                      <LinkComponent href={subItem.url}>
                        {renderIcon(
                          subItem.icon,
                          subItem.badge,
                          subItem.badgeVariant,
                          !open,
                        )}
                        <span>{subItem.title}</span>
                        {subItem.badge && <Badge>{subItem.badge}</Badge>}
                      </LinkComponent>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </>
        ) : item.menuType === "dropdown" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction showOnHover>
                <MoreHorizontal />
                <span className="sr-only">More</span>
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" side="bottom" align="end">
              {item?.items?.map((subItem) => (
                <Fragment key={subItem.title}>
                  {subItem.separator && <DropdownMenuSeparator />}
                  <DropdownMenuItem>
                    <LinkComponent href={subItem.url}>
                      {renderIcon(
                        subItem.icon,
                        subItem.badge,
                        subItem.badgeVariant,
                        !open,
                      )}
                      <span>{subItem.title}</span>
                      {subItem.badge && <Badge>{subItem.badge}</Badge>}
                    </LinkComponent>
                  </DropdownMenuItem>
                </Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        {item.separator && <DropdownMenuSeparator />}
      </SidebarMenuItem>
    </Collapsible>
  );
};
