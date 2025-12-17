import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/config/api";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";

export default function CreatePrescription() {
  const [form, setForm] = useState({
    medication: "",
    dosage: "",
    patient_id: "",
    doctor_id: "",
    diagnosis_id: "",
    start_date: "",
    end_date: "",
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);

  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const patientRes = await axios.get("/patients", config);
        const doctorRes = await axios.get("/doctors", config);
        const diagnosisRes = await axios.get("/diagnoses", config);

        setPatients(patientRes.data);
        setDoctors(doctorRes.data);
        setDiagnoses(diagnosisRes.data);
      } catch (err) {
        console.log("STATUS:", err.response?.status);
  console.log("ERROR DATA:", err.response?.data);
      }
    };

    loadData();
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createPrescription = async () => {
    const payload = {
      ...form,
      patient_id: Number(form.patient_id),
      doctor_id: Number(form.doctor_id),
      diagnosis_id: Number(form.diagnosis_id),
    };

    try {
      await axios.post("/prescriptions", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/prescriptions", {
        state: { type: "success", message: "Prescription created" },
      });
    } catch (err) {
      console.log(err.response?.data || err);
    }
  };

  return (
    <>
      <h1>Create Prescription</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPrescription();
        }}
      >
        <Input
          placeholder="Medication"
          name="medication"
          value={form.medication}
          onChange={handleChange}
        />

        <Input
          className="mt-2"
          placeholder="Dosage"
          name="dosage"
          value={form.dosage}
          onChange={handleChange}
        />

        <Input
  className="mt-2"
  type="date"
  name="start_date"
  value={form.start_date}
  onChange={handleChange}
/>

<Input
  className="mt-2"
  type="date"
  name="end_date"
  value={form.end_date}
  onChange={handleChange}
/>


        <select
          className="mt-2 border p-2 rounded w-full"
          name="patient_id"
          value={form.patient_id}
          onChange={handleChange}
        >
          <option value="">Select Patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.first_name} {p.last_name}
            </option>
          ))}
        </select>

        <select
          className="mt-2 border p-2 rounded w-full"
          name="doctor_id"
          value={form.doctor_id}
          onChange={handleChange}
        >
          <option value="">Select Doctor</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.first_name} {d.last_name}
            </option>
          ))}
        </select>

        <select
          className="mt-2 border p-2 rounded w-full"
          name="diagnosis_id"
          value={form.diagnosis_id}
          onChange={handleChange}
        >
          <option value="">Select Diagnosis</option>
          {diagnoses.map((d) => (
            <option key={d.id} value={d.id}>
              {d.description || `Diagnosis #${d.id}`}
            </option>
          ))}
        </select>

        <Button className="mt-4" variant="outline" type="submit">
          Submit
        </Button>
      </form>
    </>
  );
}
