import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/config/api";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";

export default function Edit() {

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",  
    address: ""         
  });

  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatient = async () => {
      const options = {
        method: "GET",
        url: `/patients/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        let response = await axios.request(options);
        let patient = response.data;

        setForm({
          first_name: patient.first_name,
          last_name: patient.last_name,
          email: patient.email,
          phone: patient.phone,
          date_of_birth: patient.date_of_birth, 
          address: patient.address              
        });

      } catch (err) {
        console.log(err);
      }
    };

    fetchPatient();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const updatePatient = async () => {
    const options = {
      method: "PATCH",
      url: `/patients/${id}`,
      headers: {
        Authorization: `Bearer ${token}`, 
      },
      data: form,
    };

    try {
      await axios.request(options);
      navigate("/patients");
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePatient();
  };

  return (
    <>
      <h1>Update Patient</h1>
      <form onSubmit={handleSubmit}>

        <Input type="text" name="first_name" value={form.first_name}
          onChange={handleChange} />

        <Input className="mt-2" type="text" name="last_name"
          value={form.last_name} onChange={handleChange} />

        <Input className="mt-2" type="email" name="email"
          value={form.email} onChange={handleChange} />

        <Input className="mt-2" type="text" name="phone"
          value={form.phone} onChange={handleChange} />

        <Input className="mt-2" type="date" name="date_of_birth"
          value={form.date_of_birth} onChange={handleChange} />

        <Input className="mt-2" type="text" name="address"
          value={form.address} onChange={handleChange} />

        <Button className="mt-4" variant="outline" type="submit">
          Submit
        </Button>
      </form>
    </>
  );
}
