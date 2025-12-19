import { useEffect, useState } from "react";

export default function DateTimeWidget() {
  const [now, setNow] = useState(new Date());
  const [holiday, setHoliday] = useState(null);     //store api data

 
  useEffect(() => {
    const time = setInterval(() => setNow(new Date()), 1000);  //live time update
    return () => clearInterval(time);
  }, []);

  useEffect(() => {
    // Fetch today's public holiday from Calendarific
    const fetchHoliday = async () => {
      try {
        // Get today's date values
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // months are zero-based
        const day = today.getDate();

        // Call Calendarific API using API key from .env
        const res = await fetch(
          `https://calendarific.com/api/v2/holidays?api_key=${
            import.meta.env.VITE_CALENDARIFIC_API_KEY
          }&country=IE&year=${year}&month=${month}&day=${day}`
        );

        const data = await res.json();  //turn to JSON data

        // Extract holidays array from API response
        const holidays = data?.response?.holidays;

        // If a holiday exists today, store its name in state
        if (holidays && holidays.length > 0) {
          setHoliday(holidays[0].name);
        }
      } catch (err) {
        console.log("Calendarific error:", err);
      }
    };
    fetchHoliday();
  }, []);

  return (
    <div className="text-right">
      <div className="text-sm">
        {now.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>

      <div className="text-lg font-semibold">
        {now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>

      {/* Display holiday info if returned from API */}
      <div className="text-xs text-muted-foreground">
        {holiday ? `Holiday today: ${holiday}` : "No public holiday today"}
      </div>
    </div>
  );
}
