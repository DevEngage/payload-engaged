// "use server";

import * as React from "react";
import { LucideIcon } from "lucide-react";

import { NavGroup } from "../nav-group";
import { LinkComponentProps, NavSidebarItem } from "../nav-sidebar-item";
import { NavUser } from "../nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "../sidebar";
import { TeamSwitcher } from "../team-switcher";
import { IconName } from "../utils/icon";
import { NotificationsItem } from "../utils/notifications-item";

type Team = {
  name: string;
  logo: LucideIcon;
  plan: string;
};

type NavMainItem = {
  title: string;
  url: string;
  icon: LucideIcon | IconName;
};

type User = {
  name: string;
  email: string;
  avatar: string;
};

type AdvanceSidebarProps = React.ComponentProps<typeof Sidebar> & {
  teams?: Team[];
  navMain: NavMainItem[];
  navSecondary?: NavMainItem[];
  user?: User;
  dropdownItems?: NavMainItem[];
  logout?: () => void;
  action?: () => void;
  linkComponent?: React.ComponentType<LinkComponentProps>;
};

export async function AdvanceSidebar({
  teams,
  navMain,
  navSecondary,
  user,
  dropdownItems,
  linkComponent,
  ...props
}: AdvanceSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>{teams && <TeamSwitcher teams={teams} />}</SidebarHeader>
      <SidebarContent>
        <NavGroup items={navMain} linkComponent={linkComponent} />
        {navSecondary && (
          <NavGroup items={navSecondary} linkComponent={linkComponent} />
        )}
      </SidebarContent>
      {user && (
        <SidebarFooter>
          <SidebarMenu>
            <NavSidebarItem
              item={{
                title: "Notifications",
                url: "/dashboard/notifications",
                icon: "Bell",
                badge: "10",
              }}
            />
          </SidebarMenu>
          <NavUser user={user} dropdownItems={dropdownItems} />
        </SidebarFooter>
      )}
      <SidebarRail />
    </Sidebar>
  );
}
