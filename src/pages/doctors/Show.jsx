import { useEffect, useState } from "react";             
import axios from "@/config/api";                  
import { useParams } from 'react-router';                
import { useAuth } from "@/hooks/useAuth";             
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";                             // UI card components

export default function Show() {
  const [doctor, setDoctor] = useState(null);              // Stores doctor details
  const [appointments, setAppointments] = useState([]);   
  const [patientsMap, setPatientsMap] = useState({});     // Maps patient_id → patient object
  const [prescriptions, setPrescriptions] = useState([]); // Stores prescriptions for this doctor

  const { id } = useParams();                              // Doctor ID from route
  const { token } = useAuth();                             // Auth token for API calls

  
  const formatDate = (v) => {
    const d = new Date(Number(v) < 1e12 ? Number(v) * 1000 : Number(v));
    return isNaN(d.getTime()) ? String(v) : d.toLocaleString();
  };

  // Fetch doctor details
  useEffect(() => {
    if (!id || !token) return;                             // Prevent API call if missing data

    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`/doctors/${id}`, {
          headers: { Authorization: `Bearer ${token}` },  
        });
        setDoctor(res.data);                               // Save doctor data
      } catch (err) {
        console.log(err);                                  // Log any error
      }
    };

    fetchDoctor();
  }, [id, token]);                                        // Re-run if id or token changes

  // Fetch appointments and related patients
  useEffect(() => {
    if (!id || !token) return;

    const fetchAppointments = async () => {
      try {
        const apptRes = await axios.get(
          `/appointments?doctor_id=${id}`,                 // Get appointments for doctor
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const appts = Array.isArray(apptRes.data)
          ? apptRes.data.filter(a => Number(a.doctor_id) === Number(id)) // Ensure correct doctor_id, this code is vital
          : [];

        setAppointments(appts);                            // Store appointments

        const patientIds = [
          ...new Set(appts.map(a => a.patient_id).filter(Boolean)),
        ];                                                 // Unique patient IDs

        if (patientIds.length === 0) return;

        const patientResponses = await Promise.all(
          patientIds.map(pid =>
            axios.get(`/patients/${pid}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );                                                 // Fetch each patient

        const map = {};
        patientResponses.forEach(r => {
          const p = r.data;
          if (p && p.id != null) map[p.id] = p;            // Build patient map
        });

        setPatientsMap(prev => ({ ...prev, ...map }));     // Merge into existing map
      } catch (err) {
        console.log(err);
      }
    };

    fetchAppointments();
  }, [id, token]);

  // Fetch prescriptions and any missing patient records
  useEffect(() => {
    if (!id || !token) return;

    const fetchPrescriptions = async () => {
      try {
        const res = await axios.get(
          `/prescriptions?doctor_id=${id}`,                // Get prescriptions for doctor
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const pres = Array.isArray(res.data) 
        ? res.data.filter(a => Number(a.doctor_id) === Number(id)) // Ensure correct doctor_id, this code is vital
        : [];
        setPrescriptions(pres);                            // Store prescriptions

        const patientIds = [
          ...new Set(pres.map(p => p.patient_id).filter(Boolean)),
        ];                                                 // Unique patient IDs

        const missing = patientIds.filter(
          pid => !(patientsMap && patientsMap[pid])
        );                                                 // Only fetch patients not already loaded

        if (missing.length === 0) return;

        const responses = await Promise.all(
          missing.map(pid =>
            axios.get(`/patients/${pid}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );

        const newMap = {};
        responses.forEach(r => {
          const p = r.data;
          if (p && p.id != null) newMap[p.id] = p;         // Build new patient entries
        });

        setPatientsMap(prev => ({ ...prev, ...newMap }));  // Merge into map
      } catch (err) {
        console.log(err);
      }
    };

    fetchPrescriptions();
   
  }, [id, token]);                                     

  if (!doctor) return <p>Loading doctor...</p>;            // Loading state

  return (
    <>
      {/* Doctor details */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {doctor.first_name} {doctor.last_name}
          </CardTitle>
          <CardDescription>
            {doctor.specialisation}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p><strong>Email:</strong> {doctor.email}</p>
          <p><strong>Phone:</strong> {doctor.phone}</p>
        </CardContent>
      </Card>

     
          <CardTitle>Appointments</CardTitle>
     

        <CardContent className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            appointments.map(appt => {
              const patient = patientsMap[appt.patient_id];
              const patientName = patient
                ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || patient.name
                : `Patient #${appt.patient_id}`;

              return (
                <Card key={appt.id}>
                  <CardHeader>
                    <CardTitle>
                      {formatDate(appt.appointment_date)}
                    </CardTitle>
                    <CardDescription>
                      Patient: {patientName}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {appt.notes && (
                      <p><strong>Notes:</strong> {appt.notes}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
  
<CardTitle>Prescriptions</CardTitle>
      {/* Prescriptions list */}
     
        

        <CardContent className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {prescriptions.length === 0 ? (
            <p>No prescriptions found.</p>
          ) : (
            prescriptions.map(pres => {
              const patient = patientsMap[pres.patient_id];
              const patientName = patient
                ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || patient.name
                : `Patient #${pres.patient_id}`;

              return (
                <Card key={pres.id}>
                  <CardHeader>
                    <CardTitle>
                      {formatDate(
                        pres.start_date ?? pres.createdAt ?? pres.updatedAt
                      )}
                    </CardTitle>
                    <CardDescription>
                      Patient: {patientName}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p><strong>Medication:</strong> {pres.medication}</p>
                    {pres.dosage && (
                      <p><strong>Dosage:</strong> {pres.dosage}</p>
                    )}
                    {pres.notes && (
                      <p><strong>Notes:</strong> {pres.notes}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      
    </>
  );
}
