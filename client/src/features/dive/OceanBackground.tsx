import { memo } from 'react';
import { WATER_COLUMN_PX, waterColumnGradient } from '../../lib/ocean';

const WATER_GRADIENT = waterColumnGradient();

const BUBBLES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37 + (i % 5) * 7) % 100,
  size: 4 + ((i * 13) % 16),
  rise: 13 + ((i * 7) % 16),
  sway: 3.5 + ((i * 3) % 4),
  delay: -((i * 5) % 24),
}));

const MOTES = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 29 + (i % 7) * 11) % 100,
  size: 1.5 + ((i * 13) % 4),
  duration: 18 + ((i * 7) % 22),
  delay: -((i * 11) % 30),
  opacity: 0.2 + ((i * 17) % 55) / 100,
}));

const SPARKS = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 43 + (i % 3) * 13) % 100,
  top: (i * 31 + (i % 5) * 9) % 100,
  size: 3 + ((i * 5) % 5),
  duration: 3.5 + ((i * 7) % 9),
  delay: -((i * 3) % 12),
  hue: i % 3 === 0 ? '#9fe8ff' : i % 3 === 1 ? '#8fb8ff' : '#b79dff',
}));

function OceanBackground() {
  return (
    <div className="ocean" aria-hidden="true">
      <div className="ocean__water">
        <div
          className="ocean__column"
          data-water-column
          style={{ height: WATER_COLUMN_PX, background: WATER_GRADIENT }}
        />
      </div>

      <div className="ocean__flow" />

      <div className="ocean__caustics ocean__caustics--far" />
      <div className="ocean__caustics ocean__caustics--near" />

      <div className="ocean__rays" />

      <div className="ocean__surface">
        <div className="ocean__surface-wave" />
        <div className="ocean__surface-wave ocean__surface-wave--back" />
      </div>

      <div className="ocean__kelp ocean__kelp--left">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} style={{ animationDelay: `${-i * 1.4}s`, left: `${i * 26}px`, height: `${190 + i * 46}px` }} />
        ))}
      </div>
      <div className="ocean__kelp ocean__kelp--right">
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ animationDelay: `${-i * 1.9}s`, right: `${i * 30}px`, height: `${210 + i * 40}px` }} />
        ))}
      </div>

      <div className="ocean__school ocean__school--far" />
      <div className="ocean__school ocean__school--near" />

      <div className="ocean__motes">
        {MOTES.map((mote, index) => (
          <span
            key={index}
            style={{
              left: `${mote.left}%`,
              width: mote.size,
              height: mote.size,
              opacity: mote.opacity,
              animationDuration: `${mote.duration}s`,
              animationDelay: `${mote.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="ocean__bubbles">
        {BUBBLES.map((bubble, index) => (
          <span
            key={index}
            className="bubble"
            style={{
              left: `${bubble.left}%`,
              animationDuration: `${bubble.rise}s`,
              animationDelay: `${bubble.delay}s`,
            }}
          >
            <i
              style={{
                width: bubble.size,
                height: bubble.size,
                animationDuration: `${bubble.sway}s`,
              }}
            />
          </span>
        ))}
      </div>

      <div className="ocean__sparks">
        {SPARKS.map((spark, index) => (
          <span
            key={index}
            style={{
              left: `${spark.left}%`,
              top: `${spark.top}%`,
              width: spark.size,
              height: spark.size,
              background: `radial-gradient(circle, ${spark.hue}, transparent 70%)`,
              transform: 'scale(3)',
              animationDuration: `${spark.duration}s`,
              animationDelay: `${spark.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="ocean__vignette" />
    </div>
  );
}

export default memo(OceanBackground);
