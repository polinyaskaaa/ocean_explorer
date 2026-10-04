import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLayoutEffect, useMemo, useRef } from 'react';
import {
  MAX_DEPTH,
  SCROLL_SCREENS,
  layerWeights,
  lightAt,
  progressToDepth,
  waterColumnOffset,
} from '../../lib/ocean';
import { selectCreature } from '../../store/creaturesSlice';
import { setAbove, setDepth } from '../../store/diveSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import CreatureMarker from './CreatureMarker';
import Hud from './Hud';
import OceanBackground from './OceanBackground';

gsap.registerPlugin(ScrollTrigger);

const DEPTH_DISPATCH_STEP = 4;

export default function DiveScene() {
  const dispatch = useAppDispatch();
  const creatures = useAppSelector((state) => state.creatures.items);
  const completedIds = useAppSelector((state) => state.auth.completedCreatureIds);
  const isModalOpen = useAppSelector((state) => state.creatures.selectedId !== null);

  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const lastDispatchedDepth = useRef(0);

  const completed = useMemo(() => new Set(completedIds), [completedIds]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!trackRef.current || !root) return undefined;

    const ocean = root.querySelector<HTMLElement>('.ocean')!;
    const surface = root.querySelector<HTMLElement>('.surface');

    const context = gsap.context(() => {
      const column = root.querySelector<HTMLElement>('[data-water-column]')!;
      const setColumnY = gsap.quickSetter(column, 'y', 'px');

      const toggleLayer = (className: string, active: boolean) =>
        ocean.classList.toggle(className, active);

      const written = new Map<string, number>();
      const setVar = (target: HTMLElement, name: string, value: number) => {
        const quantized = Math.round(value * 100) / 100;
        if (written.get(name) === quantized) return;
        written.set(name, quantized);
        target.style.setProperty(name, String(quantized));
      };

      const applyDepth = (depth: number) => {
        setColumnY(waterColumnOffset(depth, window.innerHeight));

        const weights = layerWeights(depth);
        const light = lightAt(depth);
        setVar(ocean, '--light', light);
        setVar(ocean, '--w-surface', weights.surface);
        setVar(ocean, '--w-shallow', weights.shallow);
        setVar(ocean, '--w-mid', weights.mid);
        setVar(ocean, '--w-deep', weights.deep);

        toggleLayer('ocean--sunlit', light > 0.02);
        toggleLayer('ocean--surface', weights.surface > 0.02);
        toggleLayer('ocean--populated', weights.shallow > 0.02 || weights.mid > 0.02);
        toggleLayer('ocean--abyssal', weights.deep > 0.02);

        if (Math.abs(depth - lastDispatchedDepth.current) >= DEPTH_DISPATCH_STEP) {
          lastDispatchedDepth.current = depth;
          dispatch(setDepth(depth));
        }
      };

      const depthTrigger = ScrollTrigger.create({
        trigger: trackRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => applyDepth(progressToDepth(self.progress)),
      });

      let wasAbove = true;
      if (surface) {
        const surfaceTrigger = ScrollTrigger.create({
          trigger: surface,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
          onUpdate: (self) => applyDescent(self.progress),
        });
        applyDescent(surfaceTrigger.progress);
      }

      function applyDescent(progress: number) {
        if (surface) setVar(surface, '--descent', progress);

        const above = progress < 0.9;
        if (above !== wasAbove) {
          wasAbove = above;
          dispatch(setAbove(above));
        }
      }

      gsap.utils.toArray<HTMLElement>('.creature').forEach((element) => {
        gsap.fromTo(
          element,
          { opacity: 0, y: 34, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.5,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 88%',
              end: 'bottom 12%',
              toggleActions: 'play reverse play reverse',
              onToggle: (self) => element.classList.toggle('creature--onscreen', self.isActive),
            },
          },
        );
      });

      applyDepth(progressToDepth(depthTrigger.progress));
    }, rootRef);

    return () => context.revert();
  }, [dispatch, creatures]);

  return (
    <div ref={rootRef} className={`dive ${isModalOpen ? 'dive--paused' : ''}`}>
      <OceanBackground />

      <Hud />

      <div ref={trackRef} className="dive__track" style={{ height: `${SCROLL_SCREENS * 100}vh` }}>
        {creatures.map((creature, index) => (
          <CreatureMarker
            key={creature.id}
            creature={creature}
            index={index}
            completed={completed.has(creature.id)}
            onSelect={() => dispatch(selectCreature(creature.id))}
          />
        ))}

        <div className="dive__floor">
          <div className="ocean-haze" aria-hidden="true" />
          <div className="ocean-floor" aria-hidden="true" />
          <div className="dive__floor-text">
            <h2>Дно досягнуто</h2>
            <p className="muted">
              Ви опустилися на {MAX_DEPTH.toLocaleString('uk-UA')} метрів. У MVP 2 тут зʼявиться
              вибір іншого океану.
            </p>
            <p className="dive__floor-hint">А внизу, здається, хтось таки живе…</p>
          </div>
        </div>
      </div>
    </div>
  );
}
