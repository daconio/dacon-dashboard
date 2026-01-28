import React from 'react';
import type { Competition } from '../types';

interface CalendarViewProps {
    competitions: Competition[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ competitions }) => {
    // A real implementation would involve a full calendar library.
    // This is a placeholder to make the component functional.
    return (
        <div className="p-4 bg-white rounded-lg shadow-md border-2 border-black">
            <h2 className="text-xl font-bold mb-4">대회 캘린더 (구현 예정)</h2>
            <p className="text-gray-600 mb-4">
                이곳에 월별 달력 형태로 대회가 표시됩니다. 현재는 목록 보기만 지원됩니다.
            </p>
            <div className="max-h-96 overflow-y-auto">
                <ul>
                    {competitions.slice(0, 10).map(comp => (
                        <li key={comp.cpt_id} className="mb-2 p-2 border-b">
                            <p className="font-semibold">{comp.name}</p>
                            <p className="text-sm text-gray-500">
                                {new Date(comp.period_start).toLocaleDateString()} - {new Date(comp.period_end).toLocaleDateString()}
                            </p>
                        </li>
                    ))}
                    {competitions.length > 10 && <li className="mt-2 text-center">...외 {competitions.length - 10}개 대회</li>}
                </ul>
            </div>
        </div>
    );
};

export default CalendarView;