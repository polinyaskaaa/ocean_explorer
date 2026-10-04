import { memo } from 'react';
import { WATER_COLUMN_PX, waterColumnGradient } from '../../lib/ocean';

const WATER_GRADIENT = waterColumnGradient();

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

      <div className="ocean__vignette" />
    </div>
  );
}

export default memo(OceanBackground);
