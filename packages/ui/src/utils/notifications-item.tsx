import { Bell } from "lucide-react";

import { Badge } from "../badge";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../sidebar";

export function NotificationsItem({ count = 0 }: { count?: number }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Notifications">
            <a href="#" className="flex justify-between gap-2">
              <div className="flex gap-2">
                <Bell className="h-6 w-6" />
                <span className="hide">Notifications</span>
              </div>
              {count > 0 && <Badge>{count}</Badge>}
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
