import { useEffect } from "react";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import { useAuth } from "@/hooks/useAuth";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  IconDashboard,
  IconConfetti,
  IconTheater,
  IconMicrophone2,
  IconBrandSpotify,
} from "@tabler/icons-react";

/* Sidebar navigation config (unchanged, just without hard-coded user) */
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Doctors",
      url: "/doctors",
      icon: IconConfetti,
    },
    {
      title: "Patients",
      url: "/patients",
      icon: IconTheater,
    },
    {
      title: "Appointments",
      url: "/appointments",
      icon: IconMicrophone2,
    },
    {
      title: "Prescriptions",
      url: "/prescriptions",
      icon: IconBrandSpotify,
    },
    {
      title: "Diagnoses",
      url: "/diagnoses",
      icon: IconDashboard,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const location = useLocation();
  const { user } = useAuth();

  const message = location.state?.message;
  const type = location.state?.type;

  useEffect(() => {
    if (message) {
      if (type === "error") toast.error(message);
      else if (type === "success") toast.success(message);
      else toast(message);
    }
  }, [message, type]);

  return (
    <>
      <Toaster position="top-center" richColors />

      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5"
              />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <NavMain items={data.navMain} />
        </SidebarContent>

        <SidebarFooter>
          <NavUser
            user={{
              name: user?.first_name || "User",
              email: user?.email || "",
            }}
          />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
