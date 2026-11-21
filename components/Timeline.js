'use client';

import { CYCLES } from '@/lib/model';

export default function Timeline({ selectedYear, range, onSelectYear }) {
  const [min, max] = range === 'full' ? [1924, 2059] : [1990, 2045];
  const x = (year) => 150 + ((year - min) / (max - min)) * 850;

  const ticks = [];
  for (let year = Math.ceil(min / 5) * 5; year <= max; year += 5) ticks.push(year);

  const selected = selectedYear >= min && selectedYear <= max;

  return (
    <div style={{ minWidth: 700, width: '100%' }}>
      <svg
        viewBox="0 0 1040 260"
        role="group"
        aria-label={`Three separate Benner calendar reference rows, ${min} to ${max}`}
      >
        {ticks.map((year) => (
          <g key={`tick-${year}`}>
            <line x1={x(year)} y1={20} x2={x(year)} y2={220} stroke="#d1c4a9" strokeDasharray="3 6" />
            <text x={x(year)} y={246} textAnchor="middle" fill="#7a6e5c" fontSize={13}>
              {year}
            </text>
          </g>
        ))}

        {selected && (
          <>
            <rect x={x(selectedYear) - 15} y={10} width={30} height={210} rx={10} fill="#8b5e3c" opacity={0.1} />
            <line x1={x(selectedYear)} y1={10} x2={x(selectedYear)} y2={220} stroke="#8b5e3c" strokeDasharray="4 5" />
          </>
        )}

        {CYCLES.map((cycle, index) => {
          const y = 48 + index * 73;
          return (
            <g key={cycle.id}>
              <text x={0} y={y + 5} fill={cycle.color} fontSize={14}>
                {cycle.id} · {cycle.label.replace(' reference', '')}
              </text>
              <line x1={150} x2={1000} y1={y} y2={y} stroke="#d1c4a9" />
              {cycle.years
                .filter((yr) => yr >= min && yr <= max)
                .map((yr) => (
                  <g
                    key={yr}
                    className="marker"
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectYear(yr)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectYear(yr);
                      }
                    }}
                    aria-label={`${yr}: ${cycle.label}`}
                  >
                    <title>{yr}: {cycle.label}</title>
                    <circle cx={x(yr)} cy={y} r={15} fill="transparent" />
                    <circle cx={x(yr)} cy={y} r={yr === selectedYear ? 7 : 5} fill={cycle.color} />
                    <text x={x(yr)} y={y - 18} textAnchor="middle" fill={cycle.color} fontSize={14}>
                      {yr}
                    </text>
                  </g>
                ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
