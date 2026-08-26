/**
 * Only questions we can answer truthfully from confirmed facts. Anything
 * depending on unconfirmed details (hours, delivery charges) points the reader
 * at WhatsApp rather than guessing a number.
 */

import { site } from "./site";

export type FaqEntry = { question: string; answer: string };

export const faqs: FaqEntry[] = [
  {
    question: "How far in advance do I need to order a custom cake?",
    answer: `At least ${site.customLeadTimeDays} days. Custom cakes are designed and baked to your brief rather than pulled from a case, and the ${site.customLeadTimeDays}-day window is what makes that possible. For anything elaborate — tiered cakes, sculpted work, large numbers — give her a week or more if you can.`,
  },
  {
    question: "What flavours can I choose from?",
    answer:
      "Nine base flavours: Chocolate, Chocolate Malt, Chocolate Fudge, Lotus, Pistachio, Caramel, Honey, Red Velvet and Vanilla. Fillings and finishes are worked out with you when you send the brief.",
  },
  {
    question: "How do I order something off the menu?",
    answer:
      "Cakes, loaves, shot boxes, brownies and cookies are all on Foodpanda, which is the fastest route — delivery is handled and you skip the back-and-forth. If you would rather message, WhatsApp works too.",
  },
  {
    question: "How do I order a custom cake?",
    answer:
      "Use the custom cake form. It collects everything she needs in one go and opens WhatsApp with your brief already written out, so the first message is complete rather than a game of twenty questions.",
  },
  {
    question: "Where are you based?",
    answer: `${site.address.locality}, ${site.address.city}. For delivery to your area, message on WhatsApp at ${site.phone.display} and she will confirm.`,
  },
  {
    question: "Do you take corporate and event orders?",
    answer:
      "Yes — hampers, dessert tables, branded boxes and bulk orders for offices, schools and events. There is a separate page for it with a form that asks the right questions.",
  },
  {
    question: "Can you handle allergies or dietary requirements?",
    answer:
      "Ask before ordering. Everything is baked in one kitchen that handles wheat, dairy, eggs and nuts, so cross-contact cannot be ruled out. She will tell you honestly what she can and cannot promise.",
  },
];
