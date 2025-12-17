import { AuthProvider } from "./hooks/useAuth";

import { BrowserRouter as Router, Routes, Route } from "react-router";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import LoginForm from "@/components/LoginForm";

import Register from "@/components/Register";
import ProtectedRoute from "@/pages/ProtectedRoute";

import DoctorsIndex from "@/pages/doctors/Index";
import DoctorsShow from "@/pages/doctors/Show";
import DoctorsCreate from "@/pages/doctors/Create";
import DoctorsEdit from "@/pages/doctors/Edit";

import PatientsIndex from "@/pages/patients/Index";
import PatientsShow from "@/pages/patients/Show";
import PatientsCreate from "@/pages/patients/Create";
import PatientsEdit from "@/pages/patients/Edit";

import AppointmentsIndex from "./pages/appointments/Index";
import AppointmentsShow from "./pages/appointments/Show";
import AppointmentsCreate from "./pages/appointments/Create";
import AppointmentsEdit from "./pages/appointments/Edit";

import PrescriptionsIndex from "@/pages/prescriptions/Index";
import PrescriptionsShow from "@/pages/prescriptions/Show";
import PrescriptionsCreate from "@/pages/prescriptions/Create";
import PrescriptionsEdit from "@/pages/prescriptions/Edit";

import DiagnosesIndex from "@/pages/diagnoses/Index";
import DiagnosesShow from "@/pages/diagnoses/Show";
import DiagnosesCreate from "@/pages/diagnoses/Create";
import DiagnosesEdit from "@/pages/diagnoses/Edit";


import FormExamples from "@/pages/examples/Forms";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SidebarProvider
          style={{
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          }}
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            {/* <Navbar onLogin={onLogin} loggedIn={loggedIn} /> */}

            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-2 py-4 md:gap-2 md:py-6 mx-6">
                  {/* Main content */}
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/doctors" element={<DoctorsIndex />} />

                    <Route path="/" element={<ProtectedRoute />}>
                      <Route path="/doctors/:id" element={<DoctorsShow />} />
                      <Route path="/doctors/:id/edit" element={<DoctorsEdit />}/>                                        
                      <Route path="/doctors/create" element={<DoctorsCreate />}/>                   
                    </Route>

                    <Route path="/" element={<ProtectedRoute />}>
                    <Route path="/patients" element={<PatientsIndex />} />
                    <Route path="/patients/:id" element={<PatientsShow />} />
                    <Route path="/patients/:id/edit" element={<PatientsEdit />} />
                    <Route path="/patients/create" element={<PatientsCreate />} />
                    </Route>

                    <Route path="/" element={<ProtectedRoute />}>
                    <Route path="/appointments" element={<AppointmentsIndex />} />
                    <Route path="/appointments/:id" element={<AppointmentsShow />} />
                    <Route path="/appointments/:id/edit" element={<AppointmentsEdit />} />
                    <Route path="/appointments/create" element={<AppointmentsCreate />} />
                    </Route>

                    <Route path="/" element={<ProtectedRoute />}>
                    <Route path="/prescriptions" element={<PrescriptionsIndex />} />
                    <Route path="/prescriptions/:id" element={<PrescriptionsShow />} />
                    <Route path="/prescriptions/:id/edit" element={<PrescriptionsEdit />} />
                    <Route path="/prescriptions/create" element={<PrescriptionsCreate />} />
                    </Route>

                    <Route path="/" element={<ProtectedRoute />}>
                    <Route path="/diagnoses" element={<DiagnosesIndex />} />
                    <Route path="/diagnoses/:id" element={<DiagnosesShow />} />
                    <Route path="/diagnoses/:id/edit" element={<DiagnosesEdit />} />
                    <Route path="/diagnoses/create" element={<DiagnosesCreate />} />
                    </Route>
                
                    <Route path="/forms" element={<FormExamples />} />
                  </Routes>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </AuthProvider>
    </Router>
  );
}
