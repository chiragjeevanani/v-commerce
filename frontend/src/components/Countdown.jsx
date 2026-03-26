import React, { useEffect, useState, useRef } from "react";

// Countdown component
// Props:
// - hours: number of hours for the countdown duration (default 96)
// - endTimestamp: optional absolute timestamp (ms) to count down to; if provided, overrides hours
const Countdown = ({ hours = 96, endTimestamp = null, className = "" }) => {
    const computeInitialRemaining = () => {
        const end = endTimestamp ? endTimestamp : Date.now() + hours * 3600 * 1000;
        return Math.max(0, Math.floor((end - Date.now()) / 1000));
    };

    const [remaining, setRemaining] = useState(() => computeInitialRemaining());

    const endRef = useRef(null);

    useEffect(() => {
        endRef.current = endTimestamp ? endTimestamp : Date.now() + hours * 3600 * 1000;

        const tick = () => {
            const sec = Math.max(0, Math.floor((endRef.current - Date.now()) / 1000));
            setRemaining(sec);
        };

        const iv = setInterval(tick, 1000);
        return () => clearInterval(iv);
    }, [endTimestamp, hours]);

    const format = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(h)} : ${pad(m)} : ${pad(s)}`;
    };

    return (
        <span className={className} title={remaining <= 0 ? "Delivered" : `Delivery in ${format(remaining)}`}>
            {remaining <= 0 ? "00 : 00 : 00" : format(remaining)}
        </span>
    );
};

export default Countdown;
