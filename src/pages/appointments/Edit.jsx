import { useState, useEffect } from "react";                // React hooks for state + lifecycle
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/config/api";                            // Axios instance with base URL
import { useNavigate, useParams } from "react-router";     // Routing helpers
import { useAuth } from "@/hooks/useAuth";                  // Access auth token

export default function EditAppointment() {
  const [form, setForm] = useState({
    appointment_date: "",                                   // Controlled input for datetime-local
    doctor_id: "",                                          // String for <select> compatibility
    patient_id: "",
  });

  const [doctors, setDoctors] = useState([]);               // Options for doctor dropdown
  const [patients, setPatients] = useState([]);             // Options for patient dropdown

  const navigate = useNavigate();                           // Redirect after successful update
  const { id } = useParams();                               // Appointment ID from URL
  const { token } = useAuth();                              // JWT token for protected API calls

  useEffect(() => {
    const loadData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${token}` },    // Auth header required by API
        };

        // Load dropdown data (same pattern as Create page)
        const doctorRes = await axios.get("/doctors", config);
        const patientRes = await axios.get("/patients", config);

        setDoctors(doctorRes.data);                          // Populate doctor dropdown
        setPatients(patientRes.data);                        // Populate patient dropdown

        // Load appointment being edited
        const apptRes = await axios.get(`/appointments/${id}`, config);

        // Convert API datetime format → datetime-local format
        const apiDate = apptRes.data.appointment_date ?? "";
        const inputDate = apiDate
          ? apiDate.replace(" ", "T").slice(0, 16)           // "YYYY-MM-DD HH:mm:ss" → "YYYY-MM-DDTHH:mm"
          : "";

        setForm({
          appointment_date: inputDate,                       // Pre-fill date input
          doctor_id: String(apptRes.data.doctor_id),          // Convert number → string for <select>
          patient_id: String(apptRes.data.patient_id),
        });
      } catch (err) {
        console.log("Load error:", err.response?.data || err); // Log API or network errors
      }
    };

    if (token && id) loadData();                              // Only run when auth + ID are available
  }, [token, id]);                                           // Re-run if token or route param changes

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });   // Generic handler for all inputs
  };

  const updateAppointment = async () => {
    const payload = {
      appointment_date: form.appointment_date.replace("T", " "), // Convert back to API format
      doctor_id: Number(form.doctor_id),                          // Convert string → number
      patient_id: Number(form.patient_id),
    };

    try {
      await axios.patch(`/appointments/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },        // Auth required for update
      });

      navigate("/appointments", {                              // Redirect after successful update
        state: { type: "success", message: "Appointment updated" },
      });
    } catch (err) {
      console.log("Update error:", err.response?.data || err); // Log update failures
    }
  };

  return (
    <>
      <h1>Edit Appointment</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();                                 // Prevent default form submit
          updateAppointment();                                // Run PATCH request
        }}
      >
        <label>Date</label>
        <Input
          type="datetime-local"
          name="appointment_date"
          value={form.appointment_date}                        // Controlled input value
          onChange={handleChange}
        />

        <label className="mt-4 block">Doctor</label>
        <select
          name="doctor_id"
          className="border p-2 rounded w-full"
          value={form.doctor_id}                               // Must match option values exactly
          onChange={handleChange}
        >
          <option value="">Select doctor</option>
          {doctors.map((d) => (
            <option key={d.id} value={String(d.id)}>           {/* Ensure option values are strings */}
              {d.first_name} {d.last_name}
            </option>
          ))}
        </select>

        <label className="mt-4 block">Patient</label>
        <select
          name="patient_id"
          className="border p-2 rounded w-full"
          value={form.patient_id}
          onChange={handleChange}
        >
          <option value="">Select patient</option>
          {patients.map((p) => (
            <option key={p.id} value={String(p.id)}>
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
