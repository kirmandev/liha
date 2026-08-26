"use client";

import { useState } from "react";

import { EVENT_TYPES } from "@/content/corporate";
import { site } from "@/content/site";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Field, Select, TextArea, TextInput } from "./FormControls";
import { ScallopFrame } from "./ScallopFrame";
import { Button, WhatsAppIcon } from "./ui";

type Errors = Partial<Record<"name" | "organisation" | "quantity", string>>;

export function CorporateForm() {
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [eventType, setEventType] = useState<string>(EVENT_TYPES[0]);
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "She needs a name to reply to.";
    if (!organisation.trim()) next.organisation = "Which company or school?";
    if (!quantity.trim()) next.quantity = "Roughly how many? An estimate is fine.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      document.getElementById(Object.keys(next)[0])?.focus();
      return;
    }
    window.open(
      buildWhatsAppUrl({
        kind: "corporate",
        name: name.trim(),
        organisation: organisation.trim(),
        eventType,
        quantity: quantity.trim(),
        date: date || undefined,
        details: details.trim() || undefined,
      }),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <ScallopFrame size={28} className="bg-butter" innerClassName="bg-cream" variant="outline">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 px-1 py-2 sm:px-5 sm:py-4">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Your name" htmlFor="name" error={errors.name}>
            <TextInput
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              error={errors.name}
            />
          </Field>

          <Field label="Company or organisation" htmlFor="organisation" error={errors.organisation}>
            <TextInput
              id="organisation"
              value={organisation}
              onChange={(event) => setOrganisation(event.target.value)}
              autoComplete="organization"
              error={errors.organisation}
            />
          </Field>

          <Field label="What kind of order" htmlFor="eventType">
            <Select
              id="eventType"
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
              options={EVENT_TYPES}
            />
          </Field>

          <Field label="Roughly how many" htmlFor="quantity" error={errors.quantity}>
            <TextInput
              id="quantity"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="60 boxes, or a table for 120"
              error={errors.quantity}
            />
          </Field>

          <Field
            label="Date"
            htmlFor="date"
            hint="Leave it blank if the date is not fixed yet."
            className="sm:col-span-2 sm:max-w-xs"
          >
            <TextInput
              id="date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </Field>
        </div>

        <Field
          label="Anything else"
          htmlFor="details"
          hint="Branding requirements, dietary needs, delivery address, budget."
        >
          <TextArea
            id="details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
          />
        </Field>

        <div className="border-t border-wine/10 pt-6">
          <Button type="submit" variant="wine">
            <WhatsAppIcon className="size-4" />
            Send the enquiry
          </Button>
          <p className="mt-4 text-xs leading-relaxed text-ink-soft">
            Opens WhatsApp to {site.phone.display} with your enquiry written out. Nothing is sent
            from this page and nothing is stored.
          </p>
        </div>
      </form>
    </ScallopFrame>
  );
}
