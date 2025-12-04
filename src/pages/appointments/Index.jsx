import { useEffect, useState } from "react";
import axios from "@/config/api";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import DeleteBtn from "@/components/DeleteBtn";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function AppointmentsIndex() {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get("/appointments", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchAppointments();
  }, []);

  const onDeleteCallback = (id) => {
    toast.success("Appointment deleted successfully");
    setAppointments(appointments.filter(a => a.id !== id));
  };

  return (
    <>
      {token && (
        <Button asChild variant="outline" className="mb-4 mr-auto block">
          <Link to="/appointments/create">Create Appointment</Link>
        </Button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((appt) => (
          <Card key={appt.id}>
            <CardHeader>
              <CardTitle>Appointment #{appt.id}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-1">
              <p><strong>Date:</strong> {appt.appointment_date}</p>
              <p><strong>Doctor ID:</strong> {appt.doctor_id}</p>
              <p><strong>Patient ID:</strong> {appt.patient_id}</p>
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/appointments/${appt.id}`)}>
                View
              </Button>

              <Button variant="outline" onClick={() => navigate(`/appointments/${appt.id}/edit`)}>
                Edit
              </Button>

              <DeleteBtn
                resource="appointments"
                id={appt.id}
                onDeleteCallback={onDeleteCallback}
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
