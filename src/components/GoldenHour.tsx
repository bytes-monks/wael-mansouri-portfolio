import { useEffect, useState } from 'react';

// Approximate sunset in Tunis (decimal hours) by month; golden hour starts ~30 min earlier.
const SUNSET = [17.6, 18.1, 18.5, 19.0, 19.4, 19.8, 19.8, 19.4, 18.8, 18.1, 17.5, 17.3];

export default function GoldenHour() {
  const [time, setTime] = useState('18:20');
  useEffect(() => {
    const g = SUNSET[new Date().getMonth()] - 0.5;
    const h = Math.floor(g);
    const m = Math.round((g - h) * 60);
    setTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }, []);
  return <>{time}</>;
}
