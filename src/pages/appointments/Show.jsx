import { useEffect, useState } from "react";
import axios from "@/config/api";
import { useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function ShowAppointment() {
  const [appointment, setAppointment] = useState(null);
  const { id } = useParams();
  const { token } = useAuth();

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await axios.get(`/appointments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setAppointment(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchAppointment();
  }, []);

  if (!appointment) return <p>Loading...</p>;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Appointment #{appointment.id}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        <p><strong>Date:</strong> {appointment.appointment_date}</p>
        <p><strong>Doctor ID:</strong> {appointment.doctor_id}</p>
        <p><strong>Patient ID:</strong> {appointment.patient_id}</p>
      </CardContent>
    </Card>
  );
}
