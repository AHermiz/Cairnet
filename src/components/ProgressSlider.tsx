'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { motion, useMotionValue, useReducedMotion, type MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEntrance } from '@/lib/useEntrance';

/**
 * The 21st.dev ProgressSlider, rebuilt.
 *
 * The public shape is unchanged, so the JSX reads the same as the reference:
 * ProgressSlider > SliderContent > SliderWrapper, and SliderBtnGroup > SliderBtn.
 * The implementation underneath is different in five places, and each one is a
 * defect in the original rather than a matter of taste.
 *
 * 1. **Progress was React state written on every animation frame.** `setProgress`
 *    inside a requestAnimationFrame loop re-renders the whole slider sixty times
 *    a second. It is now a `MotionValue`, so the bar is written straight to the
 *    compositor and React re-renders once per slide instead of once per frame.
 * 2. **The fast-forward maths read a stale `progress`.** The rAF callback closed
 *    over the value from the render that created it, and the effect's deps did
 *    not include it, so the acceleration was computed against whatever `progress`
 *    happened to be when `active` last changed. Gone with the state.
 * 3. **The bar animated `width`.** That is a layout property, so every frame cost
 *    a reflow. It is `scaleX` on a left origin now, which is a transform.
 * 4. **It auto-advanced forever with no way to stop it.** Content that moves on
 *    its own for more than five seconds needs a pause mechanism, WCAG 2.2.2.
 *    Rotation now pauses on hover and on focus within, stops permanently once the
 *    reader picks a step, and never starts at all under `prefers-reduced-motion`.
 * 5. **Buttons and panes had no relationship.** They are a proper tablist now:
 *    `role="tab"` with `aria-selected` and `aria-controls`, panes as `tabpanel`,
 *    and left/right/home/end key handling. A screen reader could not previously
 *    tell that the buttons drove the panes at all.
 *
 * One more change, for layout rather than correctness: panes are stacked in a
 * single grid cell rather than mounted and unmounted. The container is therefore
 * as tall as the longest step and the height never jumps between slides, and
 * every step's copy is in the served HTML instead of appearing only after the
 * slider gets to it.
 */

type Ctx = {
  active: string;
  register: (value: string) => void;
  select: (value: string) => void;
  progress: MotionValue<number>;
  vertical: boolean;
  values: string[];
  tabId: (value: string) => string;
  panelId: (value: string) => string;
};

/**
 * Values are human strings, because that is what makes the JSX readable, and the
 * step titles here contain spaces. `aria-controls` takes an ID reference LIST, so
 * an id of "panel-A conversation" parses as two references to elements that do
 * not exist, and the whole relationship between tab and panel silently breaks.
 * Lighthouse caught it as `aria-valid-attr-value`; a screen reader would have
 * caught it as the tabs doing nothing. React's useId also returns colons, which
 * are legal in an id and awkward everywhere else, so they go too.
 */
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ProgressSliderContext = createContext<Ctx | undefined>(undefined);

export const useProgressSliderContext = (): Ctx => {
  const ctx = useContext(ProgressSliderContext);
  if (!ctx) throw new Error('useProgressSliderContext must be used within a ProgressSlider');
  return ctx;
};

export const ProgressSlider: FC<{
  children: ReactNode;
  /** Milliseconds a slide holds before advancing. */
  duration?: number;
  vertical?: boolean;
  activeSlider: string;
  className?: string;
  label?: string;
}> = ({ children, duration = 7000, vertical = false, activeSlider, className, label }) => {
  const [active, setActive] = useState(activeSlider);
  const [values, setValues] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const progress = useMotionValue(0);
  const elapsed = useRef(0);
  const baseId = useId().replace(/:/g, '');
  const tabId = useCallback((v: string) => `${baseId}-tab-${slug(v)}`, [baseId]);
  const panelId = useCallback((v: string) => `${baseId}-panel-${slug(v)}`, [baseId]);

  const reduce = useReducedMotion();
  const mayAnimate = useEntrance();
  const rotating = mayAnimate && !reduce && !stopped && !paused && values.length > 1;

  // Panes register themselves in mount order, which is DOM order. The reference
  // read `child.type === SliderContent` off React.Children instead, which breaks
  // the moment a consumer wraps a pane in anything at all.
  const register = useCallback((value: string) => {
    setValues((prev) => (prev.includes(value) ? prev : [...prev, value]));
  }, []);

  const select = useCallback((value: string) => {
    setStopped(true); // the reader has taken over; stop moving underneath them
    setActive(value);
    elapsed.current = 0;
  }, []);

  /**
   * The frame loop reads refs, not closure variables.
   *
   * The first version of this used Framer's `useAnimationFrame` and closed over
   * `rotating` and `values` directly. Those are empty and false on the first
   * render, the callback captured them, and the slider advanced to the last step
   * and then froze with the bar at zero for good. Which is the same stale closure
   * defect this component was rewritten to remove from the original, written back
   * in by hand. Refs are updated every render, so the loop always reads current
   * values and there is nothing to capture.
   */
  const rotatingRef = useRef(rotating);
  rotatingRef.current = rotating;
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const durationRef = useRef(duration);
  durationRef.current = duration;

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      raf = requestAnimationFrame(tick);

      // Paused or stopped: hold position rather than resetting, so hovering the
      // rail and moving away resumes where it was instead of starting over.
      if (!rotatingRef.current || valuesRef.current.length < 2) return;

      elapsed.current += delta;
      const fraction = Math.min(elapsed.current / durationRef.current, 1);
      progress.set(fraction);

      if (fraction >= 1) {
        elapsed.current = 0;
        progress.set(0);
        setActive((current) => {
          const list = valuesRef.current;
          const i = list.indexOf(current);
          return i === -1 ? list[0] : list[(i + 1) % list.length];
        });
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  // Picking a step by hand empties the bar; it is no longer counting down.
  useEffect(() => {
    if (stopped) progress.set(0);
  }, [stopped, progress]);

  const ctx = useMemo<Ctx>(
    () => ({ active, register, select, progress, vertical, values, tabId, panelId }),
    [active, register, select, progress, vertical, values, tabId, panelId]
  );

  return (
    <ProgressSliderContext.Provider value={ctx}>
      <div
        className={cn('relative', className)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
        }}
        aria-roledescription={rotating ? 'auto advancing steps' : undefined}
        aria-label={label}
      >
        {children}
      </div>
    </ProgressSliderContext.Provider>
  );
};

export const SliderContent: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={cn('grid', className)}>{children}</div>;

export const SliderWrapper: FC<{ children: ReactNode; value: string; className?: string }> = ({
  children,
  value,
  className,
}) => {
  const { active, register, tabId, panelId } = useProgressSliderContext();
  const isActive = active === value;

  useEffect(() => {
    register(value);
  }, [register, value]);

  return (
    <motion.div
      // Every pane sits in the same grid cell, so the block is as tall as the
      // longest step and nothing shifts when the slide changes.
      style={{ gridArea: '1 / 1' }}
      className={cn(className)}
      id={panelId(value)}
      role="tabpanel"
      aria-labelledby={tabId(value)}
      aria-hidden={!isActive}
      // visibility rather than display: the cell keeps its size, and hidden panes
      // stay out of the tab order and off the accessibility tree.
      animate={{ opacity: isActive ? 1 : 0, visibility: isActive ? 'visible' : 'hidden' }}
      initial={false}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export const SliderBtnGroup: FC<{ children: ReactNode; className?: string; label?: string }> = ({
  children,
  className,
  label,
}) => {
  const { values, active, select, vertical } = useProgressSliderContext();

  const onKeyDown = (e: React.KeyboardEvent) => {
    const next = vertical ? 'ArrowDown' : 'ArrowRight';
    const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
    const i = values.indexOf(active);
    let target: string | undefined;
    if (e.key === next) target = values[(i + 1) % values.length];
    else if (e.key === prev) target = values[(i - 1 + values.length) % values.length];
    else if (e.key === 'Home') target = values[0];
    else if (e.key === 'End') target = values[values.length - 1];
    if (!target) return;
    e.preventDefault();
    select(target);
  };

  return (
    <div role="tablist" aria-label={label} aria-orientation={vertical ? 'vertical' : 'horizontal'} onKeyDown={onKeyDown} className={cn(className)}>
      {children}
    </div>
  );
};

export const SliderBtn: FC<{
  children: ReactNode;
  value: string;
  className?: string;
  progressBarClass?: string;
  trackClass?: string;
}> = ({ children, value, className, progressBarClass, trackClass }) => {
  const { active, progress, select, vertical, tabId, panelId } = useProgressSliderContext();
  const isActive = active === value;

  return (
    <button
      type="button"
      role="tab"
      id={tabId(value)}
      aria-selected={isActive}
      aria-controls={panelId(value)}
      tabIndex={isActive ? 0 : -1}
      onClick={() => select(value)}
      className={cn('relative text-left', className)}
    >
      {/* The track. A 1px rule that is always there, so the rail reads as four
          steps rather than as one bar that grows. */}
      <span aria-hidden className={cn('absolute left-0 top-0', trackClass)} />
      {/* The fill. scaleX on a left origin, not width: a transform does not force
          layout, and this runs every frame. */}
      <motion.span
        aria-hidden
        className={cn('absolute left-0 top-0 origin-left', progressBarClass)}
        style={{
          [vertical ? 'scaleY' : 'scaleX']: isActive ? progress : 0,
          transformOrigin: vertical ? 'top' : 'left',
        }}
      />
      {children}
    </button>
  );
};
