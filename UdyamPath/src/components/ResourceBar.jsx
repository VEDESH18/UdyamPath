export default function ResourceBar({ label, value, max = 100, color = 'saffron', icon, prefix = '' }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorMap = {
    saffron: { bar: '#FF6B35', glow: 'rgba(255,107,53,0.4)', bg: 'rgba(255,107,53,0.1)' },
    blue: { bar: '#3b82f6', glow: 'rgba(59,130,246,0.4)', bg: 'rgba(59,130,246,0.1)' },
    green: { bar: '#22c55e', glow: 'rgba(34,197,94,0.4)', bg: 'rgba(34,197,94,0.1)' },
    gold: { bar: '#ffd700', glow: 'rgba(255,215,0,0.4)', bg: 'rgba(255,215,0,0.1)' },
    purple: { bar: '#a855f7', glow: 'rgba(168,85,247,0.4)', bg: 'rgba(168,85,247,0.1)' },
  };

  const c = colorMap[color] || colorMap.saffron;
  const isLow = percentage < 25;
  const isMed = percentage < 50;

  const barColor = isLow ? '#ef4444' : isMed ? '#f59e0b' : c.bar;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <span className="font-medium text-white/80 font-poppins">{label}</span>
        </div>
        <span className="font-bold font-mono" style={{ color: barColor }}>
          {prefix}{typeof value === 'number' && prefix === '₹'
            ? value.toLocaleString('en-IN')
            : Math.round(value)}{prefix !== '₹' && '%'}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full resource-fill transition-all duration-1000"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${barColor}, ${barColor}dd)`,
            boxShadow: `0 0 6px ${barColor}80`,
          }}
        />
      </div>
      {isLow && (
        <div className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠️</span>
          <span>Critical level — take action!</span>
        </div>
      )}
    </div>
  );
}
