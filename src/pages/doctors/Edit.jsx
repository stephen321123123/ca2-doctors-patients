import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "@/config/api";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";

import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

/* SAME schema as Create */
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z.string().min(2, "Min 2 characters").max(255),
  last_name: z.string().min(2, "Min 2 characters").max(255),
  phone: z.string().length(10, "Phone must be exactly 10 digits"),
  specialisation: z.enum(
    [
      "Podiatrist",
      "Dermatologist",
      "Pediatrician",
      "Psychiatrist",
      "General Practitioner",
    ],
    {
      error: () => ({ message: "Please choose a specialisation" }),
    }
  ),
});

export default function Edit() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      specialisation: "",
    },
    mode: "onChange",
  });

  /* LOAD DOCTOR + PREFILL FORM */
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await axios.get(`/doctors/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        form.reset(res.data); // populate React hook form form
      } catch (err) {
        console.log(err);
      }
    };

    if (token && id) fetchDoctor();
  }, [token, id, form]);

  const submitForm = async (data) => {
    try {
      await axios.patch(`/doctors/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/doctors");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <h1>Update Doctor</h1>

      <form onSubmit={form.handleSubmit(submitForm)}>
        {/* FIRST NAME */}
        <Controller
          name="first_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>First Name</FieldLabel>
              <Input {...field} />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* LAST NAME */}
        <Controller
          name="last_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Last Name</FieldLabel>
              <Input {...field} />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* EMAIL */}
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Email</FieldLabel>
              <Input {...field} />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* PHONE */}
        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Phone</FieldLabel>
              <Input {...field} />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* SPECIALISATION DROPDOWN (same as Create) */}
        <Controller
          name="specialisation"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Specialisation</FieldLabel>

              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose Specialisation" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Podiatrist">Podiatrist</SelectItem>
                  <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                  <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                  <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                  <SelectItem value="General Practitioner">
                    General Practitioner
                  </SelectItem>
                </SelectContent>
              </Select>

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button className="mt-4 cursor-pointer" variant="outline" type="submit">
          Submit
        </Button>
      </form>
    </>
  );
}
