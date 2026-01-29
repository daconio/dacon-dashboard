import React, { useState, useEffect, useRef, useMemo } from 'react';

type Theme = 'glass' | 'neumorphic' | 'webtoon';

interface DateRange {
    start: string | null;
    end: string | null;
}

interface DateRangePickerProps {
    value: DateRange;
    onChange: (newValue: DateRange) => void;
    theme: Theme;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange, theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    const handlePresetClick = (preset: 'today' | '7d' | '1m' | '3m' | '1y') => {
        const end = new Date();
        const start = new Date();

        switch (preset) {
            case 'today':
                break;
            case '7d':
                start.setDate(end.getDate() - 6); // inclusive of today
                break;
            case '1m':
                start.setMonth(end.getMonth() - 1);
                break;
            case '3m':
                start.setMonth(end.getMonth() - 3);
                break;
            case '1y':
                start.setFullYear(end.getFullYear() - 1);
                break;
        }
        onChange({ start: formatDate(start), end: formatDate(end) });
        setIsOpen(false);
    };

    const handleClear = () => {
        onChange({ start: null, end: null });
        setIsOpen(false);
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const displayValue = useMemo(() => {
        const { start, end } = value;

        if (!start && !end) {
            return '기간';
        }

        const formatDateForDisplay = (dateStr: string) => dateStr.replace(/-/g, '.');

        if (start && end) {
            if (start === end) {
                return formatDateForDisplay(start);
            }
            return `${formatDateForDisplay(start)} ~ ${formatDateForDisplay(end)}`;
        }
        if (start) {
            return `${formatDateForDisplay(start)} ~`;
        }
        if (end) {
            return `~ ${formatDateForDisplay(end)}`;
        }
        return '기간';
    }, [value]);

    const isDateSet = value.start || value.end;
    const isGlass = theme === 'glass';
    const isNeumorphic = theme === 'neumorphic';

    const buttonClasses = isGlass
        ? `inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold transition-all duration-200 border ${
              isDateSet
                  ? 'bg-sky-500/40 text-white border-sky-400/50'
                  : 'bg-slate-700/30 text-slate-200 border-slate-600/50 hover:bg-slate-600/50'
          }`
        : isNeumorphic
        ? `inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-semibold transition-all duration-300 transform ${
              isDateSet
                  ? 'shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] text-blue-600'
                  : 'shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-gray-700 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1'
          }`
        : `inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-bold transition-all duration-200 border-2 border-black ${
            isDateSet
                ? 'bg-blue-500 text-white shadow-[3px_3px_0_#000]'
                : 'bg-white text-black hover:bg-gray-100'
        }`;

    const popupClasses = isGlass
        ? "origin-top-right absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-2xl bg-slate-800/80 backdrop-blur-lg border border-slate-500/30 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
        : isNeumorphic
        ? "origin-top-right absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] bg-[#e0e5ec] focus:outline-none z-50"
        : "origin-top-right absolute right-0 mt-2 w-72 sm:w-80 rounded-lg shadow-[4px_4px_0_#000] bg-white border-2 border-black focus:outline-none z-50";
    
    const inputClasses = isGlass
        ? "mt-1 w-full p-2 bg-slate-900/70 rounded-lg border border-slate-600/50 focus:outline-none text-slate-100 text-sm"
        : isNeumorphic
        ? "mt-1 w-full p-2 bg-[#e0e5ec] rounded-lg shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] focus:outline-none text-gray-700 text-sm"
        : "mt-1 w-full p-2 bg-white rounded-md border-2 border-black focus:outline-none text-black text-sm";

    const labelClasses = isGlass ? "block text-sm font-medium text-slate-300" : isNeumorphic ? "block text-sm font-medium text-gray-600" : "block text-sm font-bold text-black";

    const getPresetButtonClasses = () => {
        if (isGlass) return "px-2 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 bg-slate-700/50 text-slate-200 border border-slate-600/50 hover:bg-slate-600/50";
        if (isNeumorphic) return "px-2 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 transform shadow-[3px_3px_6px_#a3b1c6,-3px_-3px_6px_#ffffff] text-gray-700 hover:shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] hover:-translate-y-0.5 active:shadow-[inset_3px_3px_6px_#a3b1c6,inset_-3px_-3px_6px_#ffffff]";
        return "px-2 py-1.5 text-xs font-bold rounded-md transition-all duration-200 border-2 border-black bg-white text-black hover:bg-gray-100 active:bg-gray-200";
    };
    
    const clearButtonClasses = isGlass
        ? "px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200 bg-slate-700/30 text-slate-200 border border-slate-600/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
        : isNeumorphic
        ? "px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-300 transform shadow-[5px_5px_10px_#a3b1c6,-5px_-5px_10px_#ffffff] text-gray-700 hover:shadow-[8px_8px_16px_#a3b1c6,-8px_-8px_16px_#ffffff] hover:-translate-y-1 active:shadow-[inset_5px_5px_10px_#a3b1c6,inset_-5px_-5px_10px_#ffffff] disabled:opacity-50 disabled:cursor-not-allowed"
        : "px-3 py-1.5 text-sm font-bold rounded-md transition-all duration-200 border-2 border-black bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100";
    
    const presets = [
        { label: '오늘', value: 'today' as const },
        { label: '최근 7일', value: '7d' as const },
        { label: '최근 1개월', value: '1m' as const },
        { label: '최근 3개월', value: '3m' as const },
        { label: '최근 1년', value: '1y' as const },
    ];
    
    const separatorClasses = isGlass ? "border-slate-700/50" : isNeumorphic ? "border-gray-300/50" : "border-black border-dashed";

    return (
        <div className="relative inline-block text-left" ref={pickerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={buttonClasses}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="truncate max-w-[200px]">{displayValue}</span>
            </button>

            {isOpen && (
                <div
                    className={popupClasses}
                    role="menu"
                    aria-orientation="vertical"
                >
                    <div className="p-4 space-y-4">
                        <div>
                            <p className={`${labelClasses} mb-2`}>빠른 설정</p>
                            <div className="grid grid-cols-3 gap-2">
                                {presets.map(p => (
                                    <button key={p.value} onClick={() => handlePresetClick(p.value)} className={getPresetButtonClasses()}>
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <hr className={separatorClasses} />

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="start-date" className={labelClasses}>시작일</label>
                                <input
                                    id="start-date"
                                    type="date"
                                    value={value.start || ''}
                                    onChange={(e) => onChange({ ...value, start: e.target.value || null })}
                                    className={inputClasses}
                                    aria-label="Filter by start date"
                                />
                            </div>
                            <div>
                                <label htmlFor="end-date" className={labelClasses}>종료일</label>
                                <input
                                    id="end-date"
                                    type="date"
                                    value={value.end || ''}
                                    onChange={(e) => onChange({ ...value, end: e.target.value || null })}
                                    min={value.start || undefined}
                                    className={inputClasses}
                                    aria-label="Filter by end date"
                                />
                            </div>
                        </div>
                        
                        <div className="text-right pt-2">
                             <button
                                onClick={handleClear}
                                className={clearButtonClasses}
                                aria-label="Clear date range filter"
                                disabled={!isDateSet}
                            >
                                날짜 초기화
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;