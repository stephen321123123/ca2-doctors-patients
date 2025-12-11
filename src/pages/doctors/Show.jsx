import { useEffect, useState } from "react"; // React hooks
import axios from "@/config/api"; // axios instance with baseURL etc
import { useParams } from 'react-router'; // get :id from route
import { useAuth } from "@/hooks/useAuth"; // auth token
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // UI components

export default function Show() {
  const [doctor, setDoctor] = useState(null); // doctor object
  const [appointments, setAppointments] = useState([]); // list of appointments for this doctor
  const [patientsMap, setPatientsMap] = useState({}); // map patientId -> patient object
  const { id } = useParams(); // doctor id from route
  const { token } = useAuth(); // auth token for API requests

  // small helper to format timestamps (handles seconds vs ms) // comment to right
  const formatDate = (v) => { const d = new Date(Number(v) < 1e12 ? Number(v) * 1000 : Number(v)); return isNaN(d.getTime()) ? String(v) : d.toLocaleString(); }; // reduced helper

  useEffect(() => {
    if (!id || !token) return; // wait for id/token // comment to right
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`/doctors/${id}`, { headers: { Authorization: `Bearer ${token}` } }); // fetch doctor
        setDoctor(res.data); // store doctor
      } catch (err) {
        console.log(err); // log error
      }
    };
    fetchDoctor(); // call fetch
  }, [id, token]); // re-run if id/token changes

  useEffect(() => {
    if (!id || !token) return; // wait for id/token // comment to right
    const fetchAppointmentsAndPatients = async () => {
      try {
        // fetch appointments for this doctor (endpoint may vary; this uses a query param) // comment to right
        const apptRes = await axios.get(`/appointments?doctor_id=${id}`, { headers: { Authorization: `Bearer ${token}` } }); // fetch appointments
        const appts = Array.isArray(apptRes.data) ? apptRes.data : []; // normalize // comment to right
        setAppointments(appts); // store appointments

        // collect unique patient ids to avoid duplicate requests // comment to right
        const patientIds = [...new Set(appts.map(a => a.patient_id).filter(Boolean))]; // unique ids
        if (patientIds.length === 0) return; // nothing to fetch // comment to right

        // fetch all patients in parallel and build a map id->patient // comment to right
        const patientResponses = await Promise.all(patientIds.map(pid => axios.get(`/patients/${pid}`, { headers: { Authorization: `Bearer ${token}` } })));
        const map = {};
        patientResponses.forEach(r => { const p = r.data; if (p && p.id != null) map[p.id] = p; });
        setPatientsMap(map); // store map
      } catch (err) {
        console.log(err); // log errors
      }
    };
    fetchAppointmentsAndPatients(); // call fetcher
  }, [id, token]); // re-run if id/token changes

  if (!doctor) return <p>Loading doctor...</p>; // wait for doctor // comment to right

  return (
    <>
      {/* Doctor card (unchanged) */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{doctor.first_name} {doctor.last_name}</CardTitle> {/* doctor name */}
          <CardDescription>{doctor.specialisation}</CardDescription> {/* specialization */}
        </CardHeader>

        <CardContent>
          <p><strong>Email:</strong> {doctor.email}</p> {/* email */}
          <p><strong>Phone:</strong> {doctor.phone}</p> {/* phone */}
        </CardContent>
      </Card>

      {/* Appointments list: outside the doctor Card */}
      <Card className="mt-6 w-full max-w-md ">
        <CardHeader>
          <CardTitle>Appointments</CardTitle>
        </CardHeader>


        <CardContent className="space-y-2">
          {appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            appointments.map((appt) => {
              const patient = patientsMap[appt.patient_id];
              const patientName = patient
                ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || patient.name
                : `Patient #${appt.patient_id}`;

              return (
                <Card key={appt.id} className="w-full">
                  <CardHeader>
                    <CardTitle>{formatDate(appt.appointment_date)}</CardTitle>
                    <CardDescription>Patient: {patientName}</CardDescription>
                  </CardHeader>
                  <CardContent>{appt.notes && <p><strong>Notes:</strong> {appt.notes}</p>}</CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>
    </>
  );
}

