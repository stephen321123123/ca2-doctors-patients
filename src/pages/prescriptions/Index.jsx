import { useEffect, useState } from "react";
import axios from "@/config/api";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import DeleteBtn from "@/components/DeleteBtn";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
                {prescription.medication || `Prescription #${prescription.id}`} {/* use medication as title or fallback to id */}
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
              <p>
                <strong>Start:</strong> {prescription.start_date} {/* start_date */}
              </p>
              <p>
                <strong>End:</strong> {prescription.end_date} {/* end_date */}
              </p>
              <p>
                <strong>Created:</strong> {String(prescription.createdAt)} {/* createdAt */}
              </p>
              <p>
                <strong>Updated:</strong> {String(prescription.updatedAt)} {/* updatedAt */}
              </p>
            </CardContent>

            {token && (
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/prescriptions/${prescription.id}`)}
                >
                  View
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate(`/prescriptions/${prescription.id}/edit`)}
                >
                  Edit
                </Button>

                <DeleteBtn
                  resource="prescriptions"
                  id={prescription.id}
                  onDeleteCallback={onDeleteCallback}
                />
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
