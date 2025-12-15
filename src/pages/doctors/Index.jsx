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
} from "@/components/ui/card";    //ui cards componentss

export default function Index() {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();          //for changing routes
  const { token } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      const options = {
        method: "GET",
        url: "/doctors",      
        headers: {
          Authorization: `Bearer ${token}`,   //token attached
        },
      };

      try {
        let response = await axios.request(options);     //send the request to api
        console.log(response.data);
        setDoctors(response.data);                 //doctors set into a state
      } catch (err) {
        console.log(err);               //error log
      }
    };

    fetchDoctors();
  }, []);           //run once on mount

  const onDeleteCallback = (id) => {
    toast.success("Doctor deleted successfully");           //show toast confirmation
    setDoctors(doctors.filter((doctor) => doctor.id !== id));      //remove the deleted doctor localy
  };

  return (
    <>
      {token && (
        <Button asChild variant="outline" className="mb-4 mr-auto block">   
          <Link size="sm" to={`/doctors/create`}>
            Create New Doctor
          </Link>
        </Button> //show create IF authenticated
      )}

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="shadow-sm">
            <CardHeader>
              <CardTitle>
                {doctor.first_name} {doctor.last_name}
              </CardTitle>
              <CardDescription>{doctor.specialisation}</CardDescription>
            </CardHeader>

            <CardContent className="text-sm space-y-1">
              <p>
                <strong>Email:</strong> {doctor.email}
              </p>
              <p>
                <strong>Phone:</strong> {doctor.phone}
              </p>
            </CardContent>

            {token && (
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/doctors/${doctor.id}`)}
                >
                  View
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate(`/doctors/${doctor.id}/edit`)}
                >
                  Edit
                </Button>

                <DeleteBtn
                  resource="doctors"
                  id={doctor.id}
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
