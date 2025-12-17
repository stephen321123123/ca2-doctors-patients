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
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";    //ui cards componentss

export default function Index() {
  const [diagnoses, setDiagnoses] = useState([]);
  const [patients, setPatients] = useState([]);       //list of all patients
  const navigate = useNavigate();          //for changing routes
  const { token } = useAuth();

  
  const formatDate = (v) => {                                                          // convert timestamp to human string
    const d = new Date(Number(v) < 1e12 ? Number(v) * 1000 : Number(v));              // support seconds or ms
    return isNaN(d.getTime()) ? String(v) : d.toLocaleString();                       // fallback to raw value
  };

  useEffect(() => {
    const fetchDiagnoses = async () => {
      const options = {
        method: "GET",
        url: "/diagnoses",      
        headers: {
          Authorization: `Bearer ${token}`,   //token attached
        },
      };

      try {
        let response = await axios.request(options);     //send the request to api
        console.log(response.data);
        setDiagnoses(response.data);                 //Diagnoses set into a state
      } catch (err) {
        console.log(err);               //error log
      }
    };

    fetchDiagnoses();
  }, []);           //run once on mount

  useEffect(() => {
  const fetchPatients = async () => {
    try {
      const res = await axios.get("/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (token) fetchPatients();
}, [token]);

  const onDeleteCallback = (id) => {
    toast.success("Diagnose deleted successfully");           //show toast confirmation
    setDiagnoses(diagnoses.filter((diagnose) => diagnose.id !== id));      //remove the deleted Diagnose localy
  };

  const getPatientName = (patientId) => {
  const patient = patients.find((p) => p.id === patientId);
  return patient
    ? `${patient.first_name} ${patient.last_name}`
    : `Patient #${patientId}`;
};


  return (
    <>
      {token && (
        <Button asChild variant="outline" className="mb-4 mr-auto block">   
          <Link size="sm" to={`/diagnoses/create`}>
            Create New Diagnoses
          </Link>
        </Button> //show create IF authenticated
      )}

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {diagnoses.map((diagnose) => (
          <Card key={diagnose.id} className="shadow-sm">
            <CardHeader>
               <SplitText
                  text={`Diagnosis Date: ${formatDate(diagnose.diagnosis_date)}`}
                  splitType="chars"
                  delay={20}
                  duration={0.2}
                  from={{ opacity: 0 }}
                  to={{ opacity: 1 }}
                  ease="power3.out"
                />
            </CardHeader>

            <CardContent className="text-sm space-y-1">
                
              <p>
                <strong>Patient:</strong> {getPatientName(diagnose.patient_id)}
              </p>
              <p>
                <strong>Condition:</strong> {diagnose.condition}
              </p>
            </CardContent>

            {token && (
              <CardFooter className="flex gap-2">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <Button
                  variant="outline"
                  onClick={() => navigate(`/diagnoses/${diagnose.id}`)}
                >
                  View
                </Button>
                </motion.div>
                

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/diagnoses/${diagnose.id}/edit`)}
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
                  resource="diagnoses"
                  id={diagnose.id}
                  onDeleteCallback={onDeleteCallback}
                />
                </AnimatedContent>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
