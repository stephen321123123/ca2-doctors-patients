import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import axios from "@/config/api";

import { useForm, Controller } from "react-hook-form";                      
import * as z from "zod";                                                 
import { zodResolver } from "@hookform/resolvers/zod";                    

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";      // same UI as Login

// ---------------- ZOD VALIDATION (matches API exactly) ------------------
const formSchema = z.object({
  email: z.string().email("Invalid email address"),                          // required
  first_name: z.string().min(2, "Min 2 characters").max(255, "Max 255"),     // required
  last_name: z.string().min(2, "Min 2 characters").max(255, "Max 255"),      // required
  phone: z.string().length(10, "Phone must be exactly 10 digits"),           // required 10 characters
  specialisation: z.enum([                                                   // backend spelling required
    "Podiatrist",
    "Dermatologist",
    "Pediatrician",
    "Psychiatrist",
    "General Practitioner"
  ], {
    errorMap: () => ({ message: "Please choose a specialisation" })          // custom error message
  })
});

export default function CreateDoctor() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const form = useForm({
    resolver: zodResolver(formSchema),                                       // enables Zod validation
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      specialisation: ""                                                     // starts blank
    },
    mode: "onChange"                                                         // instant validation
  });

  const submitForm = async (data) => {                                       // only runs if valid
    try {
      const response = await axios.post("/doctors", data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate("/doctors", {
        state: {
          type: "success",
          message: `Doctor "${response.data.first_name}" created successfully`
        }
      });
    } catch (err) {
      console.log("BACKEND ERROR:", err.response?.data);                     // show API errors
    }
  };

  return (
    <>
      <h1>Create a New Doctor</h1>

      <form onSubmit={form.handleSubmit(submitForm)}>                       {/* RHF submit */}

        <div className="grid gap-2">
 {/* EMAIL FIELD */}
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>                       {/* highlights red */}
              <FieldLabel>Email</FieldLabel>
              <Input {...field} placeholder="doctor@example.com" />         {/* controlled input */}
              {fieldState.error && <FieldError errors={[fieldState.error]} />}  {/* instant error */}
            </Field>
          )}
        />
            </div>

            <div className="grid gap-2">
             {/* FIRST NAME */}
        <Controller
          name="first_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>First Name</FieldLabel>
              <Input {...field} placeholder="First Name" />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
            </div>

            <div className="grid gap-2">
            
            </div>

            <div className="grid gap-2">
             {/* LAST NAME */}
        <Controller
          name="last_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Last Name</FieldLabel>
              <Input {...field} placeholder="Last Name" />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
            </div>

            <div className="grid gap-2">
            {/* PHONE NUMBER */}
        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Phone (10 digits)</FieldLabel>
              <Input {...field} placeholder="0871234567" />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
            </div>

             <div className="grid gap-2">    {/**This shows errors as the user types (name must be 2 characters min etc) */}
        <Controller
          name="specialisation"                                              // matches backend
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Specialisation</FieldLabel>

              <Select
                value={field.value}                                          // controlled by RHF
                onValueChange={field.onChange}                               // updates RHF
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose Specialisation" />         {/* default text */}
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Podiatrist">Podiatrist</SelectItem>
                  <SelectItem value="Dermatologist">Dermatologist</SelectItem>
                  <SelectItem value="Pediatrician">Pediatrician</SelectItem>
                  <SelectItem value="Psychiatrist">Psychiatrist</SelectItem>
                  <SelectItem value="General Practitioner">General Practitioner</SelectItem>
                </SelectContent>
              </Select>

              {fieldState.error && <FieldError errors={[fieldState.error]} />} {/* instant error */}
            </Field>
          )}
        />
            </div>


       

       

       

        

       

        {/* SUBMIT BUTTON */}
        <Button
          className="mt-4 cursor-pointer"
          variant="outline"
          type="submit"                                                      // triggers validation
        >
          Submit
        </Button>

      </form>
    </>
  );
}
