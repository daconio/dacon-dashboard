import React, { useState, useEffect } from 'react';

type Theme = 'glass' | 'neumorphic' | 'webtoon';

interface RealTimeClockProps {
    theme: Theme;
}

const RealTimeClock: React.FC<RealTimeClockProps> = ({ theme }) => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 10); // Update every 10 milliseconds (0.01s)
        return () => {
            clearInterval(timer);
        };
    }, []);

    const formatDateTimeWithMs = (d: Date) => {
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const hour = d.getHours().toString().padStart(2, '0');
        const minute = d.getMinutes().toString().padStart(2, '0');
        const second = d.getSeconds().toString().padStart(2, '0');
        const centisecond = Math.floor(d.getMilliseconds() / 10).toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hour}:${minute}:${second}.${centisecond}`;
    };
    
    const textColor = theme === 'glass' ? 'text-slate-400' : theme === 'neumorphic' ? 'text-gray-500' : 'text-gray-600';

    return (
        <div className={`text-xs ${textColor}`} role="timer" aria-live="off">
            <span className="whitespace-nowrap">
                실시간 데이터 기준: <span className="tabular-nums">{formatDateTimeWithMs(date)}</span>
            </span>
        </div>
    );
};

export default RealTimeClock;