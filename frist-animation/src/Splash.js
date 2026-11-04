// Each drop: angle (deg, 0 = up), how far it flies, size, and whether it's a teardrop or a dot
const DROPS = [
  { angle: 20, dist: 70, size: 1.6, type: 'drop' },
  { angle: 75, dist: 48, size: 0.5, type: 'dot' },
  { angle: 110, dist: 62, size: 1.0, type: 'drop' },
  { angle: 160, dist: 40, size: 0.4, type: 'dot' },
  { angle: 210, dist: 72, size: 1.4, type: 'drop' },
  { angle: 250, dist: 35, size: 0.6, type: 'dot' },
  { angle: 290, dist: 58, size: 0.9, type: 'drop' },
  { angle: 335, dist: 45, size: 0.5, type: 'dot' },
];

// Teardrop with its point facing the center (bottom) and its round head leading outward
const TEARDROP = 'M0,12 C-4,6 -7,0 -7,-4 A7,7 0 0 1 7,-4 C7,0 4,6 0,12Z';

export default function Splash({ className = '', color = '#bfe0ff', spread = 1, size = 200 }) {
  return (
    <svg className={`splash ${className}`} viewBox="-100 -100 200 200" width={size} height={size}>
      {DROPS.map((d, i) => (
        <g key={i} transform={`rotate(${d.angle})`}>
          <g className="drop" data-dist={d.dist * spread}>
            {d.type === 'drop'
              ? <path d={TEARDROP} transform={`scale(${d.size})`} fill={color} />
              : <circle r={6 * d.size} fill={color} />}
          </g>
        </g>
      ))}
    </svg>
  );
}