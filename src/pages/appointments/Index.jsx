import { useEffect, useState } from "react";
import axios from "@/config/api";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import DeleteBtn from "@/components/DeleteBtn";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import SplitText from "@/components/SplitText";
import AnimatedContent from "@/components/AnimatedContent";
import { motion } from "motion/react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function AppointmentsIndex() {

  const [doctors, setDoctors] = useState([]);       //list of all doctors
  const [patients, setPatients] = useState([]);       //list of all patients
  const [appointments, setAppointments] = useState([]); //list of all appointments
  const navigate = useNavigate();
  const { token } = useAuth();

  
  
  const formatDate = (v) => { // handles seconds vs ms and formats or falls back
    const d = new Date(Number(v) < 1e12 ? Number(v) * 1000 : Number(v)); // seconds->ms else assume ms
    return isNaN(d.getTime()) ? String(v) : d.toLocaleString(); // readable or fallback
  };

 useEffect(() => {
  const fetchData = async () => {      //wanted to use promise (shorter code) axios was easier
    try {
      // Fetch appointments
      const apptRes = await axios.get("/appointments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(apptRes.data);    //store my appointments

      // Fetch doctors
      const docRes = await axios.get("/doctors", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(docRes.data);    //store doctors

      // Fetch patients
      const patRes = await axios.get("/patients", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(patRes.data);    //store patients

    } catch (err) {
      console.log(err);
    }
  };

  fetchData();
}, []);


  const onDeleteCallback = (id) => {   //delete appt after delete
    toast.success("Appointment deleted successfully");
    setAppointments(appointments.filter((a) => a.id !== id));  //remove from a state
  };

  return (
    <>
      {token && (
        <Button asChild variant="outline" className="mb-4 mr-auto block">
          <Link to="/appointments/create">Create Appointment</Link>
        </Button>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {appointments.map((appt) => {   //render each card

        //find doctor & patient objects by ID
          const doctor = doctors.find((d) => d.id === appt.doctor_id);
          const patient = patients.find((p) => p.id === appt.patient_id);

          return (
            <Card key={appt.id}>
              <CardHeader>
                <SplitText          
                  text={`Appointment # ${appt.id}`}     //react bit for animation
                  splitType="chars"
                  delay={20}
                  duration={2}
                  from={{ opacity: 0 }}
                  to={{ opacity: 1 }}
                  ease="power3.out"
                />
              </CardHeader>

              <CardContent className="space-y-1">
                 <p><strong>Date:</strong> {formatDate(appt.appointment_date)}</p> {/* calls formatDate */}
      

                {/* <p><strong>Doctor ID:</strong> {appt.doctor_id}</p> */}     {/* only showed the id, took it out */}
                {/* <p><strong>Patient ID:</strong> {appt.patient_id}</p> */}
                <p>
                  <strong>Doctor:</strong>{" "}
                  {doctor ? `${doctor.first_name} ${doctor.last_name}` : "Loading..."}   {/* shows full name */}
                </p>

                <p>
                  <strong>Patient:</strong>{" "}
                  {patient ? `${patient.first_name} ${patient.last_name}` : "Loading..."}   {/* shows full name */}
                </p>
              </CardContent>

              <CardFooter className="flex gap-2">
                
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}    //button animation
                >
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/appointments/${appt.id}/edit`)}
                  >
                    Edit
                  </Button>
                </motion.div>

                <AnimatedContent
                playOnMount
                  distance={50}
                  direction="horizontal"
                  reverse={false}
                  duration={1.2}
                  ease="bounce.out"
                  initialOpacity={1}
                  animateOpacity
                  scale={1}
                  delay={0.1}
                >
                <DeleteBtn
                  resource="appointments"
                  id={appt.id}
                  onDeleteCallback={onDeleteCallback}
                />
                </AnimatedContent>
              </CardFooter>
            </Card>
          );
        })}

      </div>
    </>
  );
}
