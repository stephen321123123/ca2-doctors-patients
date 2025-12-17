import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import axios from "@/config/api";

import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

/* SAME SCHEMA AS CREATE */
const formSchema = z.object({
  condition: z.string().min(2, "Condition is required"),
  diagnosis_date: z.string().min(1, "Diagnosis date is required"),
  patient_id: z.coerce.number().min(1, "Patient is required"),
});

export default function DiagnosesEdit() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      condition: "",
      diagnosis_date: "",
      patient_id: "",
    },
    mode: "onChange",
  });

  /* LOAD DIAGNOSIS + PATIENTS */
  useEffect(() => {
    const loadData = async () => {
      const [diagRes, patientRes] = await Promise.all([
        axios.get(`/diagnoses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/patients"),
      ]);

      setPatients(patientRes.data);
      form.reset(diagRes.data);
    };

    if (id && token) loadData();
  }, [id, token, form]);

  const submitForm = async (data) => {
    try {
      await axios.patch(`/diagnoses/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate("/diagnoses", {
        state: {
          type: "success",
          message: "Diagnosis updated successfully",
        },
      });
    } catch (err) {
      console.log(err.response?.data || err);
    }
  };

  return (
    <>
      <h1>Edit Diagnosis</h1>

      <form onSubmit={form.handleSubmit(submitForm)}>

        {/* CONDITION */}
        <Controller
          name="condition"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Condition</FieldLabel>
              <Input {...field} />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* DATE */}
        <Controller
          name="diagnosis_date"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Diagnosis Date</FieldLabel>
              <Input type="date" {...field} />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* PATIENT */}
        <Controller
          name="patient_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Patient</FieldLabel>
              <select
                {...field}
                className="border p-2 rounded w-full"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name}
                  </option>
                ))}
              </select>
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button className="mt-4" variant="outline" type="submit">
          Submit
        </Button>
      </form>
    </>
  );
}
