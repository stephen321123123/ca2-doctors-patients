import { useState, useEffect } from "react";                
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/config/api";                            // Axios instance with base URL
import { useNavigate, useParams } from "react-router";     
import { useAuth } from "@/hooks/useAuth";                 

export default function EditAppointment() {
  const [form, setForm] = useState({
    appointment_date: "",                                   
    doctor_id: "",                                          
    patient_id: "",
  });

  const [doctors, setDoctors] = useState([]);              
  const [patients, setPatients] = useState([]);           

  const navigate = useNavigate();                           // Redirect after successful update
  const { id } = useParams();                              
  const { token } = useAuth();                            

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
          ? apiDate.replace(" ", "T").slice(0, 16)           
          : "";

        setForm({
          appointment_date: inputDate,                       // Pre-fill date input
          doctor_id: String(apptRes.data.doctor_id),          // Convert number → string for <select>
          patient_id: String(apptRes.data.patient_id),
        });
      } catch (err) {
        console.log("Load error:", err.response?.data || err); // Log any loading errors
      }
    };

    if (token && id) loadData();                              // Only run when auth + ID are available
  }, [token, id]);                                          

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
          updateAppointment();                                // Run the update request
        }}
      >
        <label>Date</label>
        <Input
          type="datetime-local"
          name="appointment_date"
          value={form.appointment_date}                        
          onChange={handleChange}
        />

        <label className="mt-4 block">Doctor</label>
        <select
          name="doctor_id"
          className="border p-2 rounded w-full"
          value={form.doctor_id}                               
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
