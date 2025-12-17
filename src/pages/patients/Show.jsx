import { useEffect, useState } from "react";                                         // react hooks
import axios from "@/config/api";                                                    // configured axios instance
import { useParams } from "react-router";                                            // route params
import { useAuth } from "@/hooks/useAuth";                                           // auth token

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";                                                       // ui card components

export default function Show() {
  const [patient, setPatient] = useState(null);                                       // patient record state
  const [prescriptions, setPrescriptions] = useState([]);                             // prescriptions list for patient
  const [appointments, setAppointments] = useState([]);                               // appointments list for patient
  const [doctorsMap, setDoctorsMap] = useState({});                                   // cache: doctor_id -> doctor object

  const { id } = useParams();                                                         // patient id from url
  const { token } = useAuth();                                                        // api auth token

  const formatDate = (v) => {                                                          // convert timestamp to human string
    const d = new Date(Number(v) < 1e12 ? Number(v) * 1000 : Number(v));              // support seconds or ms
    return isNaN(d.getTime()) ? String(v) : d.toLocaleString();                       // fallback to raw value
  };

  useEffect(() => {
    if (!id || !token) return;

    const fetchPatient = async () => {
      try {
        const res = await axios.get(`/patients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPatient(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPatient();
  }, [id, token]);

  useEffect(() => {
    if (!id || !token) return;

    const fetchAppointments = async () => {
      try {
        const apptRes = await axios.get(`/appointments?patient_id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const appts = Array.isArray(apptRes.data)
          ? apptRes.data.filter((a) => Number(a.patient_id) === Number(id))
          : [];

        setAppointments(appts);

        const doctorIds = [...new Set(appts.map((a) => a.doctor_id).filter(Boolean))];
        if (doctorIds.length === 0) return;

        const doctorResponses = await Promise.all(
          doctorIds.map((did) =>
            axios.get(`/doctors/${did}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );

        const map = {};
        doctorResponses.forEach((r) => {
          const d = r.data;
          if (d && d.id != null) map[d.id] = d;
        });

        setDoctorsMap((prev) => ({ ...prev, ...map }));
      } catch (err) {
        console.log(err);
      }
    };

    fetchAppointments();
  }, [id, token]);

  useEffect(() => {
    if (!id || !token) return;

    const fetchPrescriptions = async () => {
      try {
        const res = await axios.get(`/prescriptions?patient_id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const pres = Array.isArray(res.data)
          ? res.data.filter((p) => Number(p.patient_id) === Number(id))
          : [];

        setPrescriptions(pres);

        const doctorIds = [...new Set(pres.map((p) => p.doctor_id).filter(Boolean))];

        const missing = doctorIds.filter((did) => !doctorsMap[did]);
        if (missing.length === 0) return;

        const responses = await Promise.all(
          missing.map((did) =>
            axios.get(`/doctors/${did}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );

        const newMap = {};
        responses.forEach((r) => {
          const d = r.data;
          if (d && d.id != null) newMap[d.id] = d;
        });

        setDoctorsMap((prev) => ({ ...prev, ...newMap }));
      } catch (err) {
        console.log(err);
      }
    };

    fetchPrescriptions();
  }, [id, token]);

  if (!patient) return <p className="text-sm text-muted-foreground">Loading patient...</p>;

  return (
    <div className="w-full max-w-6xl space-y-8 py-4">
      {/* Patient Details */}
      <Card className="w-full max-w-lg shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">
            {patient.first_name} {patient.last_name}
          </CardTitle>
          <CardDescription>Patient Details</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-2 text-sm">
          <p><strong>Email:</strong> {patient.email}</p>
          <p><strong>Phone:</strong> {patient.phone}</p>
          <p><strong>Date of Birth:</strong> {patient.date_of_birth}</p>
          <p><strong>Address:</strong> {patient.address}</p>
        </CardContent>
      </Card>

      {/* Appointments Section */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Appointments</h2>
          <p className="text-sm text-muted-foreground">Appointments linked to this patient.</p>
        </div>

        {appointments.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-6 text-sm text-muted-foreground">
              No appointments found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map((appt) => {
              const doc = doctorsMap[appt.doctor_id];
              const doctorName = doc
                ? `${doc.first_name || ""} ${doc.last_name || ""}`.trim() || doc.name
                : `Doctor #${appt.doctor_id}`;

              return (
                <Card key={appt.id} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {formatDate(appt.appointment_date)}
                    </CardTitle>
                    <CardDescription>Doctor: {doctorName}</CardDescription>
                  </CardHeader>

                  {appt.notes && (
                    <CardContent className="pt-0 text-sm">
                      <p><strong>Notes:</strong> {appt.notes}</p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Prescriptions Section */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Prescriptions</h2>
          <p className="text-sm text-muted-foreground">Prescriptions linked to this patient.</p>
        </div>

        {prescriptions.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-6 text-sm text-muted-foreground">
              No prescriptions found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prescriptions.map((pres) => {
              const doc = doctorsMap[pres.doctor_id];
              const doctorName = doc
                ? `${doc.first_name || ""} ${doc.last_name || ""}`.trim() || doc.name
                : `Doctor #${pres.doctor_id}`;

              return (
                <Card key={pres.id} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {formatDate(pres.start_date ?? pres.createdAt ?? pres.updatedAt)}
                    </CardTitle>
                    <CardDescription>Prescribed by: {doctorName}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0 text-sm space-y-1">
                    <p><strong>Medication:</strong> {pres.medication}</p>
                    {pres.dosage && <p><strong>Dosage:</strong> {pres.dosage}</p>}
                    {pres.notes && <p><strong>Notes:</strong> {pres.notes}</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
