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
} from "@/components/ui/card";

export default function Index() {
  const [prescriptions, setPrescriptions] = useState([]);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const fetchPrescriptions = async () => {
      const options = {
        method: "GET",
        url: "/prescriptions",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        let response = await axios.request(options);
        console.log(response.data);
        setPrescriptions(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPrescriptions();
  }, []);

  const onDeleteCallback = (id) => {
    toast.success("Prescription deleted successfully");
    setPrescriptions(prescriptions.filter((prescription) => prescription.id !== id));
  };

  return (
    <>
      {token && (
        <Button asChild variant="outline" className="mb-4 mr-auto block">
          <Link size="sm" to={`/prescriptions/create`}>
            Create New Prescription
          </Link>
        </Button>
      )}

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prescriptions.map((prescription) => (
          <Card key={prescription.id} className="shadow-sm">
            <CardHeader>
              <CardTitle>
                <SplitText
                  text={`${prescription.medication} `}
                  splitType="chars"
                  delay={20}
                  duration={0.2}
                  from={{ opacity: 0 }}
                  to={{ opacity: 1 }}
                  ease="power3.out"
                />
              </CardTitle>
              <CardDescription>{prescription.dosage}</CardDescription> {/* show dosage */}
            </CardHeader>

            

            

            <CardContent className="text-sm space-y-1">
              <p>
                <strong>Patient ID:</strong> {prescription.patient_id} {/* patient_id */}
              </p>
              <p>
                <strong>Doctor ID:</strong> {prescription.doctor_id} {/* doctor_id */}
              </p>
              <p>
                <strong>Diagnosis ID:</strong> {prescription.diagnosis_id} {/* diagnosis_id */}
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
                  onClick={() => navigate(`/${prescription.id}`)}
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
                    onClick={() => navigate(`/prescriptions/${prescription.id}/edit`)}
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
                  resource="prescriptions"
                  id={prescription.id}
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
