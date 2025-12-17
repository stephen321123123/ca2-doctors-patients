import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/config/api";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";


export default function EditPrescription() {
  const [form, setForm] = useState({
    medication: "",
    dosage: "",
    patient_id: "",
    doctor_id: "",
    diagnosis_id: "",
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);

  const { token } = useAuth();
  const { id } = useParams();
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
        const prescriptionRes = await axios.get(`/prescriptions/${id}`, config);

        setPatients(patientRes.data);
        setDoctors(doctorRes.data);
        setDiagnoses(diagnosisRes.data);

        setForm({
          medication: prescriptionRes.data.medication,
          dosage: prescriptionRes.data.dosage,
          patient_id: String(prescriptionRes.data.patient_id),
          doctor_id: String(prescriptionRes.data.doctor_id),
          diagnosis_id: String(prescriptionRes.data.diagnosis_id),
        });
      } catch (err) {
        console.log(err);
      }
    };

    loadData();
  }, [token, id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const updatePrescription = async () => {
    const payload = {
      ...form,
      patient_id: Number(form.patient_id),
      doctor_id: Number(form.doctor_id),
      diagnosis_id: Number(form.diagnosis_id),
    };

    try {
      await axios.patch(`/prescriptions/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

    

      navigate("/prescriptions", {
        state: { type: "success", message: "Prescription updated successfully" },
      });
    } catch (err) {
      console.log(err.response?.data || err);
    }
  };

  return (
    <>
      <h1>Edit Prescription</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updatePrescription();
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
