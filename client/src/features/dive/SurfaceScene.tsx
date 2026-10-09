import { memo } from 'react';

const CLOUDS = [
  { top: 8, left: -10, width: 320, height: 70, duration: 150, delay: -20, opacity: 0.85 },
  { top: 20, left: 30, width: 240, height: 54, duration: 190, delay: -90, opacity: 0.7 },
  { top: 4, left: 62, width: 380, height: 82, duration: 220, delay: -140, opacity: 0.6 },
  { top: 27, left: 84, width: 200, height: 46, duration: 170, delay: -60, opacity: 0.55 },
];

const DOLPHINS = [
  { left: 52, width: 108, duration: 13, delay: 0 },
  { left: 58, width: 86, duration: 13, delay: -1.1 },
  { left: 64, width: 72, duration: 13, delay: -2.2 },
];

const FLYERS = [
  { left: 4, bottom: 26, width: 74, duration: 17, delay: -3 },
  { left: 12, bottom: 12, width: 58, duration: 21, delay: -12 },
];

const GULLS = [
  { top: 22, left: 24, scale: 1, duration: 26, delay: 0 },
  { top: 15, left: 38, scale: 0.7, duration: 32, delay: -9 },
  { top: 29, left: 63, scale: 0.85, duration: 29, delay: -17 },
];

function SurfaceScene() {
  return (
    <section className="surface">
      <div className="surface__stage">
        <div className="surface__above">
          <div className="surface__sky" />
          <div className="surface__sun" />

          <div className="surface__clouds" aria-hidden="true">
            {CLOUDS.map((cloud, index) => (
              <span
                key={index}
                style={{
                  top: `${cloud.top}%`,
                  left: `${cloud.left}%`,
                  width: cloud.width,
                  height: cloud.height,
                  opacity: cloud.opacity,
                  animationDuration: `${cloud.duration}s`,
                  animationDelay: `${cloud.delay}s`,
                }}
              />
            ))}
          </div>

          <div className="surface__gulls" aria-hidden="true">
            {GULLS.map((gull, index) => (
              <svg
                key={index}
                viewBox="0 0 60 20"
                style={{
                  top: `${gull.top}%`,
                  left: `${gull.left}%`,
                  width: 60 * gull.scale,
                  animationDuration: `${gull.duration}s`,
                  animationDelay: `${gull.delay}s`,
                }}
              >
                <path
                  d="M2 14C10 4 18 4 26 12c8-8 16-8 24 2"
                  fill="none"
                  stroke="rgba(38, 62, 84, 0.65)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            ))}
          </div>

          <img className="surface__island" src="/textures/island.svg" alt="" aria-hidden="true" />

          <div className="surface__sea">
            <div className="surface__glitter" />
          </div>

          <div className="surface__whale" aria-hidden="true">
            <img className="surface__spout" src="/textures/spout.svg" alt="" />
            <img className="surface__whale-back" src="/textures/whale-back.svg" alt="" />
          </div>

          <div className="surface__dolphins" aria-hidden="true">
            {DOLPHINS.map((dolphin, index) => {
              const timing = {
                animationDuration: `${dolphin.duration}s`,
                animationDelay: `${dolphin.delay}s`,
              };
              return (
                <span
                  key={index}
                  className="surface__dolphin"
                  style={{ left: `${dolphin.left}%`, width: dolphin.width, ...timing }}
                >
                  <img src="/creatures/dolphin.svg" alt="" style={timing} />
                </span>
              );
            })}
          </div>

          <div className="surface__flyers" aria-hidden="true">
            {FLYERS.map((flyer, index) => {
              const timing = {
                animationDuration: `${flyer.duration}s`,
                animationDelay: `${flyer.delay}s`,
              };
              return (
                <span
                  key={index}
                  className="surface__flyer"
                  style={{
                    left: `${flyer.left}%`,
                    bottom: `${flyer.bottom}%`,
                    width: flyer.width,
                    ...timing,
                  }}
                >
                  <img src="/creatures/flying-fish.svg" alt="" style={timing} />
                </span>
              );
            })}
          </div>

          <div className="surface__boat">
            <img src="/textures/boat.svg" alt="Дослідницький катер" />
            <span className="surface__wake" aria-hidden="true" />
          </div>

          <div className="surface__waterline" />
        </div>

        <div className="surface__intro">
          <p className="surface__eyebrow">Атлантичний океан · 0 м</p>
          <h1>Дослідження починається тут</h1>
          <p>
            Ви на палубі дослідницького катера. Гортайте вниз — і разом із камерою пірнете під
            воду, до мешканців океану на їхніх глибинах.
          </p>
          <div className="scroll-hint">
            <span>Гортайте вниз</span>
            <span className="scroll-hint__arrow" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(SurfaceScene);
