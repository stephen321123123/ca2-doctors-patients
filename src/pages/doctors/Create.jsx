import { useState } from 'react';
import axios from "@/config/api";


import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

import { useNavigate } from 'react-router';
import { useAuth } from "@/hooks/useAuth";

export default function Create() {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        specialisation: ''
    });

    const navigate = useNavigate();
    const { token } = useAuth();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name] : e.target.value
        });
    };

    const createDoctor = async () => {
        const options = {
            method: "POST",
            url: `/doctors`,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            data: form
        };

        try {
            let response = await axios.request(options);
            console.log(response.data);
            navigate('/doctors', { state: {
                type: 'success',
                message: `Doctor "${response.data.first_name}" created successfully`
            }});
        } catch (err) {
            console.log(err);
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(form);
        createDoctor();
    };

  return (
    <>
        <h1>Create a new Doctor</h1>
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
           <Select
    onValueChange={(value) =>
        setForm({ ...form, specialisation: value })
    }
    value={form.specialisation}
>
    <SelectTrigger className="mt-2">
        <SelectValue placeholder="Choose Specialisation" />
    </SelectTrigger>

    <SelectContent>
        <SelectItem value="Podiatrist">Podiatrist</SelectItem>
        <SelectItem value="Dermatologist">Dermatologist</SelectItem>
        <SelectItem value="Pediatrician">Pediatrician</SelectItem>
        <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
        <SelectItem value="General Practitioner">General Practitioner</SelectItem>
    </SelectContent>
</Select>

            <Button 
                className="mt-4 cursor-pointer" 
                variant="outline" 
                type="submit" 
            >Submit</Button>
        </form>
    </>
  );
}
