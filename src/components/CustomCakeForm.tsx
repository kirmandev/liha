"use client";

import { useMemo, useState } from "react";

import { BASE_FLAVOURS, BUDGET_BANDS, OCCASIONS, SERVING_SIZES } from "@/content/custom";
import { site } from "@/content/site";
import { earliestOrderDate, formatLongDate } from "@/lib/format";
import { buildMailtoUrl, buildWhatsAppUrl, composeMessage } from "@/lib/whatsapp";
import { Field, Select, TextArea, TextInput } from "./FormControls";
import { ScallopFrame } from "./ScallopFrame";
import { Button, WhatsAppIcon } from "./ui";

type Errors = Partial<Record<"name" | "date", string>>;

/**
 * Submits nowhere. It validates, composes the brief through
 * `lib/whatsapp.ts`, and hands the visitor off to WhatsApp with the whole
 * message already written — so her first message is complete rather than a
 * game of twenty questions.
 */
export function CustomCakeForm() {
  // Computed once per mount from the browser clock; the lead time is her rule,
  // not a suggestion, so it becomes the input's `min` rather than a footnote.
  const minDate = useMemo(
    () => earliestOrderDate(new Date(), site.customLeadTimeDays),
    [],
  );

  const [name, setName] = useState("");
  const [occasion, setOccasion] = useState<string>(OCCASIONS[0]);
  const [servings, setServings] = useState<string>(SERVING_SIZES[0]);
  const [flavour, setFlavour] = useState<string>(BASE_FLAVOURS[0]);
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState<string>(BUDGET_BANDS[0]);
  const [details, setDetails] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [copied, setCopied] = useState(false);

  const payload = {
    kind: "custom" as const,
    name: name.trim(),
    occasion,
    servings,
    flavour,
    date,
    budget,
    details: details.trim() || undefined,
  };

  function validate(): Errors {
    const next: Errors = {};
    if (!name.trim()) next.name = "She needs a name to reply to.";
    if (!date) {
      next.date = "Pick the date you need it.";
    } else if (date < minDate) {
      next.date = `Custom cakes need ${site.customLeadTimeDays} days. The earliest is ${formatLongDate(minDate)}.`;
    }
    return next;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    window.open(buildWhatsAppUrl(payload), "_blank", "noopener,noreferrer");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(composeMessage(payload));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  const mailto = buildMailtoUrl(payload);

  return (
    <ScallopFrame size={28} className="bg-blush" innerClassName="bg-cream" variant="outline">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 px-1 py-2 sm:px-5 sm:py-4">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Your name" htmlFor="name" error={errors.name}>
            <TextInput
              id="name"
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Who is this for?"
              autoComplete="name"
              error={errors.name}
            />
          </Field>

          <Field label="Occasion" htmlFor="occasion">
            <Select
              id="occasion"
              value={occasion}
              onChange={(event) => setOccasion(event.target.value)}
              options={OCCASIONS}
            />
          </Field>

          <Field label="How many people" htmlFor="servings">
            <Select
              id="servings"
              value={servings}
              onChange={(event) => setServings(event.target.value)}
              options={SERVING_SIZES}
            />
          </Field>

          <Field
            label="Base flavour"
            htmlFor="flavour"
            hint="Fillings and finishes get worked out with you afterwards."
          >
            <Select
              id="flavour"
              value={flavour}
              onChange={(event) => setFlavour(event.target.value)}
              options={BASE_FLAVOURS}
            />
          </Field>

          <Field
            label="Date you need it"
            htmlFor="date"
            error={errors.date}
            hint={`Custom cakes are made to order, so she needs ${site.customLeadTimeDays} days. Earliest available: ${formatLongDate(minDate)}.`}
          >
            <TextInput
              id="date"
              type="date"
              min={minDate}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              error={errors.date}
            />
          </Field>

          <Field label="Budget" htmlFor="budget">
            <Select
              id="budget"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              options={BUDGET_BANDS}
            />
          </Field>
        </div>

        <Field
          label="Design notes"
          htmlFor="details"
          hint="Colours, theme, a message to pipe on top, anything to avoid. You can send reference pictures straight into the WhatsApp chat afterwards."
        >
          <TextArea
            id="details"
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder="Pistachio and gold, single tier, 'Happy 30th Ayesha' on top…"
          />
        </Field>

        <div className="flex flex-col gap-3 border-t border-wine/10 pt-6 sm:flex-row sm:items-center">
          <Button type="submit" variant="wine" className="sm:w-auto">
            <WhatsAppIcon className="size-4" />
            Send the brief on WhatsApp
          </Button>

          <Button type="button" variant="outline" onClick={handleCopy} className="sm:w-auto">
            {copied ? "Copied" : "Copy the brief"}
          </Button>

          {mailto ? (
            <a href={mailto} className="text-sm font-semibold text-rust underline underline-offset-4">
              Email it instead
            </a>
          ) : null}
        </div>

        <p className="text-xs leading-relaxed text-ink-soft">
          Nothing is sent from this page and nothing is stored. The button opens WhatsApp with your
          brief already written out — you send it yourself, to {site.phone.display}.
        </p>
      </form>
    </ScallopFrame>
  );
}
