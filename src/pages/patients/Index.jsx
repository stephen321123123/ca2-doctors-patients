import { useEffect, useState } from "react";
import axios from "@/config/api";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import DeleteBtn from "@/components/DeleteBtn";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import SplitText from "@/components/SplitText";
import AnimatedContent from "@/components/AnimatedContent";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function Index() {
  const [patients, setPatients] = useState([]);   //list for all patients
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const fetchPatients = async () => {
      const options = {
        method: "GET",
        url: "/patients",
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      };

      try {
        let response = await axios.request(options);
        setPatients(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPatients();
  }, []);

  const onDeleteCallback = (id) => {
    toast.success("Patient deleted successfully");

    setPatients(patients.filter((patient) => patient.id !== id));
  };

  return (
    <>
      {token && (
        <Button asChild variant="outline" className="mb-4 mr-auto block">
          <Link to={`/patients/create`}>Create New Patient</Link>
        </Button>
      )}

      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => (
          <Card key={patient.id} className="shadow-sm">

            <CardHeader>
              <CardTitle>
                <SplitText
                  text={`${patient.first_name} ${patient.last_name}`}
                  splitType="chars"
                  delay={20}
                  duration={0.2}
                  from={{ opacity: 0 }}
                  to={{ opacity: 1 }}
                  ease="power3.out"
                />
              </CardTitle>
            </CardHeader>

            

            

            <CardContent className="text-sm space-y-1">
              <p><strong>Email:</strong> {patient.email}</p>
              <p><strong>Phone:</strong> {patient.phone}</p>
            </CardContent>

            {token && (
              <CardFooter className="flex gap-2">
                <Button variant="outline"
                  onClick={() => navigate(`/patients/${patient.id}`)}>
                  View
                </Button>

                <Button variant="outline"
                  onClick={() => navigate(`/patients/${patient.id}/edit`)}>
                  Edit
                </Button>

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
                  resource="patients"
                  id={patient.id}
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
