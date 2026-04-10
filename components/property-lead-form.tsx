"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PropertyLeadFormProps = {
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  whatsappPhone: string | null;
};

type FieldErrors = {
  fullName?: string;
  phone?: string;
  email?: string;
  consentContact?: string;
};

export function PropertyLeadForm({
  propertyId,
  propertySlug,
  propertyTitle,
  whatsappPhone,
}: PropertyLeadFormProps) {
  const [values, setValues] = useState({
    fullName: "",
    phone: "",
    email: "",
    message: "",
    meetingInterest: true,
    consentContact: false,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setFieldErrors({});
    setMessage(null);

    const response = await fetch("/api/public-leads", {
      method: "POST",
      body: new FormData(event.currentTarget),
    });

    const payload = (await response.json()) as {
      ok: boolean;
      redirectUrl?: string;
      message?: string;
      fieldErrors?: FieldErrors;
    };

    if (!response.ok || !payload.ok || !payload.redirectUrl) {
      setFieldErrors(payload.fieldErrors ?? {});
      setMessage(payload.message ?? "No pudimos procesar la solicitud.");
      setIsPending(false);
      return;
    }

    window.location.assign(payload.redirectUrl);
  }

  return (
    <div className="lead-card">
      <div>
        <p className="eyebrow">Contacto inmediato</p>
        <h2 className="section-title" style={{ fontSize: "2rem" }}>
          Registra el lead antes de salir a WhatsApp.
        </h2>
        <p className="muted">
          El formulario alimenta Supabase primero y luego abre la conversacion comercial sobre{" "}
          {propertyTitle}.
        </p>
      </div>

      <form className="lead-form" onSubmit={handleSubmit}>
        <input type="hidden" name="propertyId" value={propertyId} />
        <input type="hidden" name="propertySlug" value={propertySlug} />

        <label className="lead-form__field">
          <Label tone="inverse">Nombre completo</Label>
          <Input
            aria-invalid={Boolean(fieldErrors.fullName)}
            name="fullName"
            placeholder="Ej. Carlos Realto"
            tone="inverse"
            type="text"
            value={values.fullName}
            onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))}
          />
          {fieldErrors.fullName ? <small className="lead-form__error">{fieldErrors.fullName}</small> : null}
        </label>

        <div className="lead-form__split">
          <label className="lead-form__field">
            <Label tone="inverse">Telefono</Label>
            <Input
              aria-invalid={Boolean(fieldErrors.phone)}
              name="phone"
              placeholder="+1 809 555 0101"
              tone="inverse"
              type="tel"
              value={values.phone}
              onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
            />
            {fieldErrors.phone ? <small className="lead-form__error">{fieldErrors.phone}</small> : null}
          </label>

          <label className="lead-form__field">
            <Label tone="inverse">Email opcional</Label>
            <Input
              aria-invalid={Boolean(fieldErrors.email)}
              name="email"
              placeholder="nombre@correo.com"
              tone="inverse"
              type="email"
              value={values.email}
              onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
            />
            {fieldErrors.email ? <small className="lead-form__error">{fieldErrors.email}</small> : null}
          </label>
        </div>

        <label className="lead-form__field">
          <Label tone="inverse">Mensaje</Label>
          <Textarea
            name="message"
            placeholder="Cuentanos si quieres una cita, rango de fechas o contexto de compra."
            rows={4}
            tone="inverse"
            value={values.message}
            onChange={(event) => setValues((current) => ({ ...current, message: event.target.value }))}
          />
        </label>

        <label className="lead-form__check">
          <input
            checked={values.meetingInterest}
            name="meetingInterest"
            type="checkbox"
            onChange={(event) =>
              setValues((current) => ({ ...current, meetingInterest: event.target.checked }))
            }
          />
          <span>Quiero que el broker proponga una cita o llamada.</span>
        </label>

        <label className="lead-form__check">
          <input
            checked={values.consentContact}
            name="consentContact"
            type="checkbox"
            onChange={(event) =>
              setValues((current) => ({ ...current, consentContact: event.target.checked }))
            }
          />
          <span>
            Autorizo que me contacten para esta propiedad y que la consulta quede registrada en el
            CRM.
          </span>
        </label>
        {fieldErrors.consentContact ? (
          <small className="lead-form__error">{fieldErrors.consentContact}</small>
        ) : null}

        {message ? <p className="lead-form__message">{message}</p> : null}

        <Button className="lead-form__submit" disabled={isPending} type="submit" variant="surface">
          {isPending ? "Guardando consulta..." : "Solicitar informacion y abrir WhatsApp"}
        </Button>

        <p className="lead-form__meta">
          WhatsApp de destino: 8299619147
        </p>
      </form>
    </div>
  );
}
