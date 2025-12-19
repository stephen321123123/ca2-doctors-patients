import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from "@/config/api";
import { useNavigate } from 'react-router';
import { Link } from "react-router";
import { Toaster } from "@/components/ui/sonner";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function Signup() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Email and password are required");
      return;
    }

    try {
      setSubmitting(true);

      await axios.post("/register", form);

      navigate("/login", {
        state: {
          type: "success",
          message: "Account created successfully. Please log in."
        }
      });
    } catch (err) {
      alert(
        err.response
          ? err.response.data.message || "Signup failed"
          : err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md"> {/* same boxed card styling as login */}
      <Toaster />
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Fill the form below to register</CardDescription>
      </CardHeader>

      <CardContent>
        <form id="register-form-example" onSubmit={handleSubmit} className="space-y-2">
          <Input
            name="first_name"
            placeholder="First Name (optional)"
            value={form.first_name}
            onChange={handleChange}
          />

          <Input
            name="last_name"
            placeholder="Last Name (optional)"
            value={form.last_name}
            onChange={handleChange}
          />

          <Input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
        </form>
      </CardContent>

      <CardFooter className="flex-col gap-2">
        <Button
          variant="outline"
          form="register-form-example"
          type="submit"
          className="w-full cursor-pointer"
          disabled={submitting}
        >
          {submitting ? "Creating account..." : "Sign Up"}
        </Button>

        <Button variant="outline" className="w-full" asChild>
          <Link to="/login">Log in</Link>
        </Button>
        </CardFooter>
    </Card>
  );
}