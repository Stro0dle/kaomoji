import { clamp, createSpring2D, project, rubberband } from '../motion.js';
import { keys, readJSON, writeJSON } from '../storage.js';

const MARGIN = 12;
const DRAG_THRESHOLD = 6;
const MAX_THROW_SPEED = 2500;
const THROW_BOUNCE_SPEED = 400;
const VELOCITY_WINDOW = 100;

export function createFloatingButton(button, { onActivate, onMove, onSaveError }) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const spring = createSpring2D(position => {
    button.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
    onMove();
  });
  let drag = null;
  let suppressClick = false;

  function limits() {
    const spanX = Math.max(0, window.innerWidth - button.offsetWidth);
    const spanY = Math.max(0, window.innerHeight - button.offsetHeight);
    const marginX = Math.min(MARGIN, spanX / 2);
    const marginY = Math.min(MARGIN, spanY / 2);
    return { spanX, spanY, minX: marginX, maxX: spanX - marginX, minY: marginY, maxY: spanY - marginY };
  }

  function clampToScreen(x, y) {
    const box = limits();
    return [clamp(x, box.minX, box.maxX), clamp(y, box.minY, box.maxY)];
  }

  function save(x, y) {
    const { spanX, spanY } = limits();
    const saved = writeJSON(keys.position, { x: spanX ? x / spanX : 0, y: spanY ? y / spanY : 0 });
    if (!saved) onSaveError();
  }

  function restore() {
    const box = limits();
    const saved = readJSON(keys.position);
    const valid = saved && Number.isFinite(saved.x) && Number.isFinite(saved.y);
    const x = valid ? saved.x * box.spanX : box.maxX;
    const y = valid ? saved.y * box.spanY : box.spanY * 0.5;
    spring.jump(...clampToScreen(x, y));
  }

  function releaseVelocity(samples, now) {
    const recent = samples.filter(sample => now - sample.t < VELOCITY_WINDOW);
    if (recent.length < 2) return { x: 0, y: 0 };
    const first = recent[0];
    const last = recent[recent.length - 1];
    const seconds = (last.t - first.t) / 1000;
    if (seconds <= 0) return { x: 0, y: 0 };
    const vx = (last.x - first.x) / seconds;
    const vy = (last.y - first.y) / seconds;
    const scale = Math.min(1, MAX_THROW_SPEED / (Math.hypot(vx, vy) || 1));
    return { x: vx * scale, y: vy * scale };
  }

  function endDrag(event, cancelled) {
    const { moved, samples } = drag;
    const velocity = cancelled || !moved ? { x: 0, y: 0 } : releaseVelocity(samples, event.timeStamp);
    drag = null;
    button.classList.remove('dragging');
    const [x, y] = clampToScreen(spring.current.x + project(velocity.x), spring.current.y + project(velocity.y));
    if (reducedMotion.matches) {
      spring.jump(x, y);
    } else {
      const thrown = Math.hypot(velocity.x, velocity.y) > THROW_BOUNCE_SPEED;
      spring.animate(x, y, { vx: velocity.x, vy: velocity.y, damping: thrown ? 0.8 : 1 });
    }
    if (moved) save(x, y);
    return moved;
  }

  button.addEventListener('pointerdown', event => {
    if (event.button !== 0 || drag) return;
    suppressClick = false;
    spring.stop();
    drag = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: spring.current.x,
      y: spring.current.y,
      moved: false,
      samples: [{ x: event.clientX, y: event.clientY, t: event.timeStamp }],
    };
    button.setPointerCapture(event.pointerId);
  });

  button.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    drag.samples.push({ x: event.clientX, y: event.clientY, t: event.timeStamp });
    if (drag.samples.length > 12) drag.samples.shift();
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!drag.moved) {
      drag.moved = true;
      button.classList.add('dragging');
    }
    const box = limits();
    spring.jump(
      rubberband(drag.x + dx, box.minX, box.maxX, window.innerWidth),
      rubberband(drag.y + dy, box.minY, box.maxY, window.innerHeight),
    );
  });

  button.addEventListener('pointerup', event => {
    if (!drag || drag.id !== event.pointerId) return;
    suppressClick = endDrag(event, false);
  });

  button.addEventListener('pointercancel', event => {
    if (!drag || drag.id !== event.pointerId) return;
    endDrag(event, true);
    suppressClick = false;
  });

  button.addEventListener('click', () => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    onActivate();
  });

  button.addEventListener('keydown', event => {
    const step = event.shiftKey ? 30 : 10;
    const direction = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }[event.key];
    if (!direction) return;
    event.preventDefault();
    const [x, y] = clampToScreen(spring.target.x + direction[0], spring.target.y + direction[1]);
    spring.jump(x, y);
    save(x, y);
  });

  window.addEventListener('resize', () => spring.jump(...clampToScreen(spring.target.x, spring.target.y)));

  restore();

  return {
    get position() {
      return spring.current;
    },
    get size() {
      return button.offsetWidth;
    },
    setExpanded(expanded) {
      button.setAttribute('aria-expanded', String(expanded));
    },
    setLabels({ label, title }) {
      button.title = title;
      button.setAttribute('aria-label', label);
    },
    focus() {
      button.focus({ preventScroll: true });
    },
  };
}
