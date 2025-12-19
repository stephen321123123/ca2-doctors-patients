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

export default function ShowPrescription() {
  const [prescription, setPrescription] = useState(null); 
  const [doctor, setDoctor] = useState(null); // doctor record fetched by id
  const [patient, setPatient] = useState(null); // patient record fetched by id
  const { id } = useParams(); 
  const { token } = useAuth(); 




  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`/prescriptions/${id}`, { headers: { Authorization: `Bearer ${token}` } }); // fetch prescription
        const pres = res.data; // extract prescription data
        setPrescription(pres); // store prescription data

        // fetch doctor and patient in parallel using IDs from the prescription
        const [docRes, patRes] = await Promise.all([
          axios.get(`/doctors/${pres.doctor_id}`, { headers: { Authorization: `Bearer ${token}` } }), // fetch doctor
          axios.get(`/patients/${pres.patient_id}`, { headers: { Authorization: `Bearer ${token}` } }), // fetch patient
        ]);

        setDoctor(docRes.data); // store doctor record
        setPatient(patRes.data); // store patient record
      } catch (err) {
        console.log(err); // log any errors
      }
    };

    if (id && token) fetchAll(); // only run when id and token are available
  }, [id, token]);

  if (!prescription || !doctor || !patient) return <p>Loading...</p>; // simple loading state

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Prescription #{prescription.id}</CardTitle> {/* show prescription id */}
      </CardHeader>

      <CardContent className="space-y-2">
        <p>
          <strong>Medication:</strong> {prescription.medication}
        </p>
        <p>
          <strong>Dosage:</strong> {prescription.dosage}
        </p>

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
