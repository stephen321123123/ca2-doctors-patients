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
  
  IconNurse,
  IconMoodSick,
  IconCalendarWeekFilled,
  IconMedicineSyrup,
  IconVirus,
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
      icon: IconNurse,
      items: [
        { title: "View Doctors", url: "/doctors" },
        { title: "Create Doctor", url: "/doctors/create" },
      ],
    },
    {
      title: "Patients",
      icon: IconMoodSick,
      items: [
        { title: "View Patients", url: "/patients" },
        { title: "Create Patient", url: "/patients/create" },
      ],
    },
    {
      title: "Appointments",
      icon: IconCalendarWeekFilled,
      items: [
        { title: "View Appointments", url: "/appointments" },
        { title: "Create Appointment", url: "/appointments/create" },
      ],
    },
    {
      title: "Prescriptions",
      icon: IconMedicineSyrup,
      items: [
        { title: "View Prescriptions", url: "/prescriptions" },
        { title: "Create Prescription", url: "/prescriptions/create" },
      ],
    },
    {
      title: "Diagnoses",
      icon: IconVirus,
      items: [
        { title: "View Diagnoses", url: "/diagnoses" },
        { title: "Create Diagnosis", url: "/diagnoses/create" },
      ],
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
