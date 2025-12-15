import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/config/api";
import { useNavigate } from "react-router";
import { useParams } from "react-router";   //route param helper
import { useAuth } from "@/hooks/useAuth";

export default function Edit() {
  const [form, setForm] = useState({
    first_name: "",    //controlled form
    last_name: "",
    email: "",
    phone: "",
    specialisation: "",
  });

  const { token } = useAuth();   //token needed
  const { id } = useParams();

  useEffect(() => {
    const fetchDoctor = async () => {
      const options = {
        method: "GET",
        url: `/doctors/${id}`,     //fetches single doctor
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        let response = await axios.request(options);    //request sent 
        let doctor = response.data;
        console.log(doctor);

        setForm({
          first_name: doctor.first_name,    //populating the form fields
          last_name: doctor.last_name,
          email: doctor.email,
          phone: doctor.phone,
          specialisation: doctor.specialisation,
        });

      } catch (err) {
        console.log(err);       
      }
    };

    fetchDoctor();
  }, []);          //again runs once on mount (initial render)

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,    //update the form fields
    });
  };

  const updateDoctor = async () => {
    const options = {
      method: "PATCH",
      url: `/doctors/${id}`,    //endpoint to update doctor on id
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: form,    //send the updated data
    };

    try {
      let response = await axios.request(options);
      console.log(response.data);
      navigate("/doctors");       //navigate back to doctors on success
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();       //prevents a default form submission
    updateDoctor();     //updates api data
  };

  return (
    <>
      <h1>Update Doctor</h1>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="First Name"
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
        />
        <Input
          className="mt-2"
          type="text"
          placeholder="Last Name"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
        />
        <Input
          className="mt-2"
          type="email"
          placeholder="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        <Input
          className="mt-2"
          type="text"
          placeholder="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />
        <Input
          className="mt-2"
          type="text"
          placeholder="Specialisation"
          name="specialisation"
          value={form.specialisation}
          onChange={handleChange}
        />
        <Button className="mt-4 cursor-pointer" variant="outline" type="submit">
          Submit
        </Button>
      </form>
    </>
  );
}
