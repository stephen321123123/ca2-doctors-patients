import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/config/api";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";

export default function EditAppointment() {
  const [form, setForm] = useState({
    appointment_date: "",
    doctor_id: "",
    patient_id: ""
  });

  //lists needed for dropdowns
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        //Load dropdown data
        const doctorRes = await axios.get("/doctors");
        const patientRes = await axios.get("/patients");
        const apptRes = await axios.get(`/appointments/${id}`);

        setDoctors(doctorRes.data);
        setPatients(patientRes.data);

        //Pre-fill form with appointment data
        setForm({
          appointment_date: apptRes.data.appointment_date,
          doctor_id: apptRes.data.doctor_id,
          patient_id: apptRes.data.patient_id
        });
      } catch (err) {
        console.log(err);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <>
      <h1>Edit Appointment</h1>

      <form onSubmit={(e) => { e.preventDefault(); updateAppointment(); }}>

        
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
          {doctors.map(d => (
            <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
          ))}
        </select>

      
        <label className="mt-4 block">Patient</label>
        <select
          name="patient_id"
          className="border p-2 rounded w-full"
          value={form.patient_id}
          onChange={handleChange}
        >
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
          ))}
        </select>

        <Button className="mt-4" variant="outline" type="submit">
          Submit
        </Button>
      </form>
    </>
  );

  async function updateAppointment() {
    try {
      await axios.patch(`/appointments/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate("/appointments");
    } catch (err) {
      console.log(err);
    }
  }
}
