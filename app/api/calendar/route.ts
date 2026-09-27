export async function GET(){
  const ics=[
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Midwest Marriage Consortium//Once Upon a Covenant 2027//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:once-upon-a-covenant-2027@onceuponacovenant.org",
    "DTSTAMP:20260927T000000Z",
    "DTSTART;VALUE=DATE:20271008",
    "DTEND;VALUE=DATE:20271011",
    "SUMMARY:Once Upon a Covenant — 2027 Midwest Marriage Retreat",
    "LOCATION:Embassy Suites Noblesville Indianapolis Conference Center\\, 13700 Conference Center Drive South\\, Noblesville\\, IN 46060",
    "DESCRIPTION:A Love Story Written by God. 2027 Midwest Marriage Retreat.",
    "URL:https://onceuponacovenant.org",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  return new Response(ics,{
    headers:{
      "content-type":"text/calendar; charset=utf-8",
      "content-disposition":"attachment; filename=\"once-upon-a-covenant-2027.ics\""
    }
  });
}
