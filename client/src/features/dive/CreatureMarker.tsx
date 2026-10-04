import { memo } from 'react';
import { creatureWidth, depthToProgress, formatDepth } from '../../lib/ocean';
import type { Creature } from '../../types';

interface Props {
  creature: Creature;
  index: number;
  completed: boolean;
  onSelect: () => void;
}

function CreatureMarker({ creature, index, completed, onSelect }: Props) {
  const ratio = depthToProgress(creature.depth);

  const horizontal = 30 + ((index * 41) % 44);

  const bodyDelay = -((index * 1.7) % 7);
  const driftDelay = -((index * 2.9) % 13);
  const driftDuration = 16 + ((index * 5) % 9);

  const facesLeft = index % 2 === 1;

  return (
    <button
      type="button"
      className="creature"
      data-motion={creature.motion}
      onClick={onSelect}
      style={{
        top: `calc(${ratio} * (100% - 100vh) + 50vh)`,
        left: `${horizontal}%`,
        width: creatureWidth(creature.size),
        transform: 'translate(-50%, -50%)',
      }}
      aria-label={`${creature.name}, глибина ${formatDepth(creature.depth)}. Відкрити картку`}
    >
      <span
        className="creature__drift"
        style={{ animationDuration: `${driftDuration}s`, animationDelay: `${driftDelay}s` }}
      >
        <span className="creature__body" style={{ animationDelay: `${bodyDelay}s` }}>
          <img
            className="creature__image"
            src={creature.imageUrl}
            alt={creature.name}
            loading="lazy"
            style={facesLeft ? { transform: 'scaleX(-1)' } : undefined}
          />
        </span>
      </span>

      <span className="creature__caption">
        {creature.name}
        <span className="creature__depth">{formatDepth(creature.depth)}</span>
        {completed && (
          <span className="creature__done" title="Квіз пройдено">
            ✓
          </span>
        )}
      </span>
    </button>
  );
}

export default memo(CreatureMarker);
