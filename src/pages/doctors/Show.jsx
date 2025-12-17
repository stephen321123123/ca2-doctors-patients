import { useEffect, useState } from "react";
import axios from "@/config/api";
import { useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Show() {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patientsMap, setPatientsMap] = useState({});
  const [prescriptions, setPrescriptions] = useState([]);

  const { id } = useParams();
  const { token } = useAuth();

  const formatDate = (v) => {
    const d = new Date(Number(v) < 1e12 ? Number(v) * 1000 : Number(v));
    return isNaN(d.getTime()) ? String(v) : d.toLocaleString();
  };

  useEffect(() => {
    if (!id || !token) return;

    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`/doctors/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctor(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDoctor();
  }, [id, token]);

  useEffect(() => {
    if (!id || !token) return;

    const fetchAppointments = async () => {
      try {
        const apptRes = await axios.get(
          `/appointments?doctor_id=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const appts = Array.isArray(apptRes.data)
          ? apptRes.data.filter(a => Number(a.doctor_id) === Number(id))
          : [];

        setAppointments(appts);

        const patientIds = [...new Set(appts.map(a => a.patient_id).filter(Boolean))];
        if (patientIds.length === 0) return;

        const patientResponses = await Promise.all(
          patientIds.map(pid =>
            axios.get(`/patients/${pid}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );

        const map = {};
        patientResponses.forEach(r => {
          const p = r.data;
          if (p && p.id != null) map[p.id] = p;
        });

        setPatientsMap(prev => ({ ...prev, ...map }));
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
        const res = await axios.get(
          `/prescriptions?doctor_id=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const pres = Array.isArray(res.data)
          ? res.data.filter(p => Number(p.doctor_id) === Number(id))
          : [];

        setPrescriptions(pres);

        const patientIds = [...new Set(pres.map(p => p.patient_id).filter(Boolean))];
        const missing = patientIds.filter(pid => !patientsMap[pid]);

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
          if (p && p.id != null) newMap[p.id] = p;
        });

        setPatientsMap(prev => ({ ...prev, ...newMap }));
      } catch (err) {
        console.log(err);
      }
    };

    fetchPrescriptions();
  }, [id, token]);

  if (!doctor) {
    return <p className="text-sm text-muted-foreground">Loading doctor...</p>;
  }

  return (
    <div className=" w-full max-w-6xl space-y-8 py-4">
      {/* Doctor Details */}
      <Card className="w-full max-w-lg shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">
            {doctor.first_name} {doctor.last_name}
          </CardTitle>
          <CardDescription>{doctor.specialisation}</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-2 text-sm">
          <p><strong>Email:</strong> {doctor.email}</p>
          <p><strong>Phone:</strong> {doctor.phone}</p>
        </CardContent>
      </Card>

      {/* Appointments */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Appointments</h2>
          <p className="text-sm text-muted-foreground">
            Appointments handled by this doctor.
          </p>
        </div>

        {appointments.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-6 text-sm text-muted-foreground">
              No appointments found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {appointments.map(appt => {
              const patient = patientsMap[appt.patient_id];
              const patientName = patient
                ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || patient.name
                : `Patient #${appt.patient_id}`;

              return (
                <Card key={appt.id} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {formatDate(appt.appointment_date)}
                    </CardTitle>
                    <CardDescription>
                      Patient: {patientName}
                    </CardDescription>
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

      {/* Prescriptions */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Prescriptions</h2>
          <p className="text-sm text-muted-foreground">
            Prescriptions issued by this doctor.
          </p>
        </div>

        {prescriptions.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="py-6 text-sm text-muted-foreground">
              No prescriptions found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {prescriptions.map(pres => {
              const patient = patientsMap[pres.patient_id];
              const patientName = patient
                ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim() || patient.name
                : `Patient #${pres.patient_id}`;

              return (
                <Card key={pres.id} className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {formatDate(
                        pres.start_date ?? pres.createdAt ?? pres.updatedAt
                      )}
                    </CardTitle>
                    <CardDescription>
                      Patient: {patientName}
                    </CardDescription>
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
