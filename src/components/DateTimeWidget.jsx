import { useEffect, useState } from "react";

export default function DateTimeWidget() {
  const [now, setNow] = useState(new Date());   //current date time state

  useEffect(() => {
    const time = setInterval(() => setNow(new Date()), 1000);   //update every second
    return () => clearInterval(time);    //cleanup on unmount
  }, []);   //run once on mount

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
    </div>
  );
}
