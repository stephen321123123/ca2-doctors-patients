import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from "@/config/api";
import { useNavigate } from 'react-router';
import { useAuth } from "@/hooks/useAuth";

export default function Create() {
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',  
        address: ''          
    });

    const navigate = useNavigate();
    const { token } = useAuth();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const createPatient = async () => {
        const options = {
            method: "POST",
            url: `/patients`,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
            },
            data: form
        };

        try {
            let response = await axios.request(options);
            navigate('/patients', { 
                state: {
                    type: 'success',
                    message: `Patient "${response.data.first_name}" created successfully`
                }
            });
        } catch (err) {
            console.log(err);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createPatient();
    };

    return (
        <>
            <h1>Create a new Patient</h1>
            <form onSubmit={handleSubmit}>

                <Input type="text" placeholder="First Name" name="first_name"
                    value={form.first_name} onChange={handleChange} />

                <Input className="mt-2" type="text" placeholder="Last Name" name="last_name"
                    value={form.last_name} onChange={handleChange} />

                <Input className="mt-2" type="email" placeholder="Email" name="email"
                    value={form.email} onChange={handleChange} />

                <Input className="mt-2" type="text" placeholder="Phone (10 digits)" name="phone"
                    value={form.phone} onChange={handleChange} />

                <Input className="mt-2" type="date" name="date_of_birth"     //type data turns it unto calendar picker
                    value={form.date_of_birth} onChange={handleChange} />

                <Input className="mt-2" type="text" placeholder="Address" name="address"
                    value={form.address} onChange={handleChange} />

                <Button className="mt-4" variant="outline" type="submit">Submit</Button>
            </form>
        </>
    );
}
