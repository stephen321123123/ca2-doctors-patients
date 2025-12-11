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
  const [appointment, setAppointment] = useState(null); // appointment object from API
  const [doctor, setDoctor] = useState(null); // doctor record fetched by id
  const [patient, setPatient] = useState(null); // patient record fetched by id
  const { id } = useParams(); // appointment id from route
  const { token } = useAuth(); // auth token for API requests

  
  const formatDate = (v) => { // handles seconds vs ms and formats or falls back
    const d = new Date(Number(v) < 1e12 ? Number(v) * 1000 : Number(v)); // seconds->ms else assume ms
    return isNaN(d.getTime()) ? String(v) : d.toLocaleString(); // readable or fallback
  };


  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`/appointments/${id}`, { headers: { Authorization: `Bearer ${token}` } }); // fetch appointment
        const appt = res.data; // extract appointment data
        setAppointment(appt); // store appointment data

        
        // fetch doctor and patient in parallel using IDs from the appointment
        const [docRes, patRes] = await Promise.all([
          axios.get(`/doctors/${appt.doctor_id}`, { headers: { Authorization: `Bearer ${token}` } }), // fetch doctor
          axios.get(`/patients/${appt.patient_id}`, { headers: { Authorization: `Bearer ${token}` } }), // fetch patient
        ]);

        setDoctor(docRes.data); // store doctor record
        setPatient(patRes.data); // store patient record
      } catch (err) {
        console.log(err); // log any errors
      }
    };

    if (id && token) fetchAll(); // only run when id and token are available
  }, [id, token]);

  if (!appointment || !doctor || !patient) return <p>Loading...</p>; // simple loading state

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Appointment #{appointment.id}</CardTitle> {/* show appointment id */}
      </CardHeader>

      <CardContent className="space-y-2">
        <p><strong>Date:</strong> {formatDate(appointment.appointment_date)}</p> {/* calls formatDate */}
        <p>
          <strong>Doctor:</strong>{" "}
          {doctor.first_name ? `${doctor.first_name} ${doctor.last_name}` : doctor.name || `#${doctor.id}`} {/* show doctor's full name */}
        </p>
        <p>
          <strong>Patient:</strong>{" "}
          {patient.first_name ? `${patient.first_name} ${patient.last_name}` : patient.name || `#${patient.id}`} {/* show patient's full name */}
        </p>
      </CardContent>
    </Card>
  );
}
