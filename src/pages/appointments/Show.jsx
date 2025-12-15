import { useEffect, useState } from "react"; // react hooks
import axios from "@/config/api";
import { useParams } from "react-router"; 
import { useAuth } from "@/hooks/useAuth"; 

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"; // ui card components

export default function ShowAppointment() {
  const [appointment, setAppointment] = useState(null); 
  const [doctor, setDoctor] = useState(null); 
  const [patient, setPatient] = useState(null); 
  const { id } = useParams(); 
  const { token } = useAuth(); // auth token for api requests

  const formatDate = (v) => { // convert timestamp to human readable string
    const d = new Date(Number(v) < 1e12 ? Number(v) * 1000 : Number(v)); 
    return isNaN(d.getTime()) ? String(v) : d.toLocaleString(); 
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`/appointments/${id}`, { headers: { Authorization: `Bearer ${token}` } }); // fetch appointment
        const appt = res.data; // extracted appointment
        setAppointment(appt); // store appointment

        const [docRes, patRes] = await Promise.all([ 
          axios.get(`/doctors/${appt.doctor_id}`, { headers: { Authorization: `Bearer ${token}` } }), // fetch doctor
          axios.get(`/patients/${appt.patient_id}`, { headers: { Authorization: `Bearer ${token}` } }), // fetch patient
        ]);

        setDoctor(docRes.data); // store doctor
        setPatient(patRes.data); // store patient
      } catch (err) {
        console.log(err); 
      }
    };

    if (id && token) fetchAll(); // only run when id + token present
  }, [id, token]); 

  if (!appointment || !doctor || !patient) return <p>Loading...</p>; // loading state

  return (
    <Card className="w-full max-w-md"> 
      <CardHeader>
        <CardTitle>Appointment #{appointment.id}</CardTitle> 
      </CardHeader>

      <CardContent className="space-y-2">
        <p><strong>Date:</strong> {formatDate(appointment.appointment_date)}</p> {/* formatted date/time */}
        <p>
          <strong>Doctor:</strong>{" "}
          {doctor.first_name ? `${doctor.first_name} ${doctor.last_name}` : doctor.name || `#${doctor.id}`}
        </p>
        <p>
          <strong>Patient:</strong>{" "}
          {patient.first_name ? `${patient.first_name} ${patient.last_name}` : patient.name || `#${patient.id}`} 
        </p>
      </CardContent>
    </Card>
  );
}