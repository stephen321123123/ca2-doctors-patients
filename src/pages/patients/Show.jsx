import { useEffect, useState } from "react";                                         // react hooks
import axios from "@/config/api";                                                      // configured axios instance
import { useParams } from "react-router";                                             // route params
import { useAuth } from "@/hooks/useAuth";                                            // auth token

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";                                                         // ui card components

export default function Show() {
  const [patient, setPatient] = useState(null);                                       // patient record state
  const [prescriptions, setPrescriptions] = useState([]);                             // prescriptions list for patient
  const [appointments, setAppointments] = useState([]);                               // appointments list for patient
  const [doctorsMap, setDoctorsMap] = useState({});                                   // cache: doctor_id -> doctor object

  const { id } = useParams();                                                          // patient id from url
  const { token } = useAuth();                                                         // api auth token

  const formatDate = (v) => {                                                          // convert timestamp to human string
    const d = new Date(Number(v) < 1e12 ? Number(v) * 1000 : Number(v));              // support seconds or ms
    return isNaN(d.getTime()) ? String(v) : d.toLocaleString();                       // fallback to raw value
  };

  // fetch patient record; effect re-runs when id or token change
  useEffect(() => {
    if (!id || !token) return;                                                        // require id + token

    const fetchPatient = async () => {
      try {
        const res = await axios.get(`/patients/${id}`, {                              // request patient by id
          headers: { Authorization: `Bearer ${token}` },                              // attach token
        });
        setPatient(res.data);                                                         // store patient
      } catch (err) {
        console.log(err);                                                             // log errors
      }
    };

    fetchPatient();                                                                   // invoke fetch
  }, [id, token]);                                                                    // deps: re-run when id or token change

  // fetch appointments and any referenced doctor records; effect re-runs when id or token change
  useEffect(() => {
    if (!id || !token) return;                                                        // require id + token

    const fetchAppointments = async () => {
      try {
        const apptRes = await axios.get(`/appointments?patient_id=${id}`, {           // query appointments by patient_id
          headers: { Authorization: `Bearer ${token}` },                              // attach token
        });

        const appts = Array.isArray(apptRes.data)                                    // ensure array
          ? apptRes.data.filter(a => Number(a.patient_id) === Number(id))            // only keep this patient's records
          : [];

        setAppointments(appts);                                                       // store appointments

        const doctorIds = [                                                          // collect doctor ids referenced by appointments
          ...new Set(appts.map(a => a.doctor_id).filter(Boolean)),                    // dedupe and remove falsy
        ];

        if (doctorIds.length === 0) return;                                          // nothing to fetch

        const doctorResponses = await Promise.all(                                   // fetch each referenced doctor
          doctorIds.map(did =>
            axios.get(`/doctors/${did}`, { headers: { Authorization: `Bearer ${token}` } })
          )
        );

        const map = {};                                                               // build map of id -> doctor object
        doctorResponses.forEach(r => {
          const d = r.data;
          if (d && d.id != null) map[d.id] = d;                                      // add doctor to map
        });

        setDoctorsMap(prev => ({ ...prev, ...map }));                                // merge into cache to avoid duplicate calls
      } catch (err) {
        console.log(err);                                                             // log errors
      }
    };

    fetchAppointments();                                                              // invoke fetch
  }, [id, token]);                                                                    // deps: re-run when id or token change

  // fetch prescriptions and any referenced doctor records; effect re-runs when id or token change
  useEffect(() => {
    if (!id || !token) return;                                                        // require id + token

    const fetchPrescriptions = async () => {
      try {
        const res = await axios.get(`/prescriptions?patient_id=${id}`, {              // query prescriptions by patient_id
          headers: { Authorization: `Bearer ${token}` },                              // attach token
        });

        const pres = Array.isArray(res.data)                                         // ensure array
          ? res.data.filter(p => Number(p.patient_id) === Number(id))                // only keep this patient's records
          : [];

        setPrescriptions(pres);                                                       // store prescriptions

        const doctorIds = [                                                          // collect doctor ids referenced by prescriptions
          ...new Set(pres.map(p => p.doctor_id).filter(Boolean)),                     // dedupe and remove falsy
        ];

        const missing = doctorIds.filter(did => !doctorsMap[did]);                   // only fetch doctors not already cached
        if (missing.length === 0) return;                                            // nothing to fetch

        const responses = await Promise.all(                                         // fetch missing doctor records
          missing.map(did =>
            axios.get(`/doctors/${did}`, { headers: { Authorization: `Bearer ${token}` } })
          )
        );

        const newMap = {};                                                            // build new map of fetched doctors
        responses.forEach(r => {
          const d = r.data;
          if (d && d.id != null) newMap[d.id] = d;                                   // add doctor to new map
        });

        setDoctorsMap(prev => ({ ...prev, ...newMap }));                             // merge fetched doctors into existing cache
      } catch (err) {
        console.log(err);                                                             // log errors
      }
    };

    fetchPrescriptions();                                                             // invoke fetch
  }, [id, token]);                                                                    // deps: re-run when id or token change

  if (!patient) return <p>Loading patient...</p>;                                     // show loading while patient is null

  return (
    <>
      <Card className="w-full max-w-md">                                             
        <CardHeader>
          <CardTitle>
            {patient.first_name} {patient.last_name}                                 
          </CardTitle>
          <CardDescription>Patient Details</CardDescription>                         
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          <p><strong>Email:</strong> {patient.email}</p>                              
          <p><strong>Phone:</strong> {patient.phone}</p>                          
          <p><strong>Date of Birth:</strong> {patient.date_of_birth}</p>              
          <p><strong>Address:</strong> {patient.address}</p>                          
        </CardContent>
      </Card>

                                        
        <CardHeader>
          <CardTitle>Appointments</CardTitle>                                      
        </CardHeader>

        <CardContent className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {appointments.length === 0 ? (                                              // conditional render when empty
            <p>No appointments found.</p>
          ) : (
            appointments.map(appt => {                                                // iterate appointments
              const doc = doctorsMap[appt.doctor_id];                                 // lookup doctor in cache
              const doctorName = doc                                                  // build doctor display name
                ? `${doc.first_name || ""} ${doc.last_name || ""}`.trim() || doc.name
                : `Doctor #${appt.doctor_id}`;

              return (
                <Card key={appt.id}>                                                  
                  <CardHeader>
                    <CardTitle>{formatDate(appt.appointment_date)}</CardTitle>      
                    <CardDescription>Doctor: {doctorName}</CardDescription>         
                  </CardHeader>

                  <CardContent>
                    {appt.notes && <p><strong>Notes:</strong> {appt.notes}</p>}       
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>


                                            
        <CardHeader>
          <CardTitle>Prescriptions</CardTitle>                                   
        </CardHeader>

        <CardContent className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {prescriptions.length === 0 ? (                                             // conditional render when empty
            <p>No prescriptions found.</p>
          ) : (
            prescriptions.map(pres => {                                               // iterate prescriptions
              const doc = doctorsMap[pres.doctor_id];                                 // lookup prescribing doctor
              const doctorName = doc                                                  // build doctor display name
                ? `${doc.first_name || ""} ${doc.last_name || ""}`.trim() || doc.name
                : `Doctor #${pres.doctor_id}`;

              return (
                <Card key={pres.id}>                                               
                  <CardHeader>
                    <CardTitle>
                      {formatDate(pres.start_date ?? pres.createdAt ?? pres.updatedAt)} 
                    </CardTitle>
                    <CardDescription>Prescribed by: {doctorName}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <p><strong>Medication:</strong> {pres.medication}</p>              
                    {pres.dosage && <p><strong>Dosage:</strong> {pres.dosage}</p>}    
                    {pres.notes && <p><strong>Notes:</strong> {pres.notes}</p>}      
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      
    </>
  );
}