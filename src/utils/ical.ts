import { EPOCH_TARGET_MS, icsDate } from "./epoch";

const encoder = new TextEncoder();

const escapeText = (text: string) =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

const fold = (line: string) => {
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    if (bytes + size > (parts.length ? 74 : 75)) {
      parts.push(current);
      current = "";
      bytes = 0;
    }
    current += ch;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
};

const TEXT = {
  en: {
    summary: "Epochalypse: 32-bit Unix time runs out",
    description:
      "At 03:14:07 UTC on 19 January 2038, a signed 32-bit time_t reaches 2,147,483,647 seconds and wraps around to a date in 1901. Systems that still count time that way will misbehave.\nLive countdown: https://www.cybai.re/projects/epochalypse",
    location: "Everywhere a 32-bit time_t still lives",
    tomorrow: "Epochalypse is tomorrow",
    hour: "Epochalypse in one hour",
    calendar: "Epochalypse",
    calendarDescription: "The day 32-bit Unix time overflows.",
  },
  fr: {
    summary: "Epochalypse : le temps Unix 32 bits arrive à terme",
    description:
      "Le 19 janvier 2038 à 03:14:07 UTC, un time_t signé sur 32 bits atteint 2 147 483 647 secondes puis repasse à une date de 1901. Les systèmes qui comptent encore le temps ainsi se comporteront mal.\nCompte à rebours en direct : https://www.cybai.re/projects/epochalypse",
    location: "Partout où un time_t 32 bits survit encore",
    tomorrow: "L'Epochalypse, c'est demain",
    hour: "L'Epochalypse dans une heure",
    calendar: "Epochalypse",
    calendarDescription: "Le jour où le temps Unix 32 bits déborde.",
  },
} as const;

export const epochalypseCalendar = (lang: string) => {
  const t = TEXT[lang === "fr" ? "fr" : "en"];
  const language = lang === "fr" ? "fr" : "en";
  const alarm = (trigger: string, description: string) => [
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `TRIGGER:${trigger}`,
    `DESCRIPTION:${escapeText(description)}`,
    "END:VALARM",
  ];
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//cybai.re//Epochalypse//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(t.calendar)}`,
    `X-WR-CALDESC:${escapeText(t.calendarDescription)}`,
    "REFRESH-INTERVAL;VALUE=DURATION:P7D",
    "X-PUBLISHED-TTL:P7D",
    "BEGIN:VEVENT",
    "UID:epochalypse-2038@cybai.re",
    "DTSTAMP:20261015T000000Z",
    `DTSTART:${icsDate(EPOCH_TARGET_MS)}`,
    `DTEND:${icsDate(EPOCH_TARGET_MS + 60_000)}`,
    `SUMMARY;LANGUAGE=${language}:${escapeText(t.summary)}`,
    `DESCRIPTION;LANGUAGE=${language}:${escapeText(t.description)}`,
    `LOCATION;LANGUAGE=${language}:${escapeText(t.location)}`,
    "URL:https://www.cybai.re/projects/epochalypse",
    "CATEGORIES:Epochalypse,Unix,Y2K38",
    "STATUS:CONFIRMED",
    "TRANSP:TRANSPARENT",
    "SEQUENCE:0",
    ...alarm("-P1D", t.tomorrow),
    ...alarm("-PT1H", t.hour),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
};
