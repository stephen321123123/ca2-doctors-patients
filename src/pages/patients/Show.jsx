import { useEffect, useState } from "react";
import axios from "@/config/api";
import { useParams } from 'react-router';
import { useAuth } from "@/hooks/useAuth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Show() {
  const [patient, setPatient] = useState({});

  const { id } = useParams();
  const { token } = useAuth();

  useEffect(() => {
    const fetchPatient = async () => {
      const options = {
        method: "GET",
        url: `/patients/${id}`,
        headers: {
          Authorization: `Bearer ${token}` 
        }
      };

      try {
        let response = await axios.request(options);
        setPatient(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPatient();
  }, []);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {patient.first_name} {patient.last_name}
        </CardTitle>
        <CardDescription>Patient Details</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <p><strong>Email:</strong> {patient.email}</p>
        <p><strong>Phone:</strong> {patient.phone}</p>

        <p><strong>Date of Birth:</strong> {patient.date_of_birth}</p>
        <p><strong>Address:</strong> {patient.address}</p>
      </CardContent>
    </Card>
  );
}
