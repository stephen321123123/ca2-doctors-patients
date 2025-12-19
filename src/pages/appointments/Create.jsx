import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/config/api";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";

export default function CreateAppointment() {
  const [form, setForm] = useState({
    appointment_date: "",
    doctor_id: "",
    patient_id: ""
  });

  const [doctors, setDoctors] = useState([]);     //populates doctor dropdown
  const [patients, setPatients] = useState([]);    //populates patient dropdown

  const navigate = useNavigate();
  const { token } = useAuth();      //POST methods need auth token

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load doctor + patient lists for dropdowns
        const doctorRes = await axios.get("/doctors");
        const patientRes = await axios.get("/patients");

        setDoctors(doctorRes.data);
        setPatients(patientRes.data);
      } catch (err) {
        console.log(err);
      }
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const createAppointment = async () => {
    const formattedDate = form.appointment_date.replace("T", " "); //T places a space between date and time

    const payload = {
      appointment_date: formattedDate, 
      doctor_id: Number(form.doctor_id),  // Ensure number
      patient_id: Number(form.patient_id)
    };

    try {
      await axios.post("/appointments", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate("/appointments", { 
        state: { type: "success", message: "Appointment created" } 
      });

    } catch (err) {
      console.log("API error:", err.response?.data || err);
    }
  };

  return (
    <>
      <h1>Create Appointment</h1>

      <form onSubmit={(e) => { e.preventDefault(); createAppointment(); }}>

        {/* DATETIME PICKER */}
        <label>Date</label>
        <Input
          type="datetime-local"
          name="appointment_date"
          value={form.appointment_date}
          onChange={handleChange}
        />

        {/* DOCTOR DROPDOWN */}
        <label className="mt-4 block">Doctor</label>
        <select
          name="doctor_id"
          className="border p-2 rounded w-full"
          value={form.doctor_id}
          onChange={handleChange}
        >
          <option value="">Select doctor</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.first_name} {d.last_name}
            </option>
          ))}
        </select>

        {/* PATIENT DROPDOWN */}
        <label className="mt-4 block">Patient</label>
        <select
          name="patient_id"
          className="border p-2 rounded w-full"
          value={form.patient_id}
          onChange={handleChange}
        >
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.first_name} {p.last_name}
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
