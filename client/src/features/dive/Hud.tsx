import { MAX_DEPTH, formatDepth, formatPressure, formatTemperature, zoneAt } from '../../lib/ocean';
import { useAppSelector } from '../../store/hooks';

export default function Hud() {
  const depth = useAppSelector((state) => state.dive.depth);
  const above = useAppSelector((state) => state.dive.above);
  const zone = zoneAt(depth);
  const progress = Math.min(100, (depth / MAX_DEPTH) * 100);

  return (
    <aside className="hud" aria-live="polite">
      <div className="hud__zone">{above ? 'Поверхня' : zone.name}</div>
      <div className="hud__zone-sub">{above ? 'Над водою' : zone.subtitle}</div>

      <div className="hud__row">
        <span className="hud__label">Глибина</span>
        <span className="hud__value hud__value--depth">{formatDepth(depth)}</span>
      </div>
      <div className="hud__row">
        <span className="hud__label">Температура</span>
        <span className="hud__value">{formatTemperature(depth)}</span>
      </div>
      <div className="hud__row">
        <span className="hud__label">Тиск</span>
        <span className="hud__value">{formatPressure(depth)}</span>
      </div>

      <div className="hud__scale">
        <div className="hud__scale-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="hud__progress">{progress.toFixed(0)}% шляху до дна</div>
    </aside>
  );
}
