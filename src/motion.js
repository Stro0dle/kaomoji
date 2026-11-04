export function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

export function rubberband(value, min, max, dimension) {
  const resist = overshoot => (overshoot * dimension * 0.55) / (dimension + 0.55 * overshoot);
  if (value < min) return min - resist(min - value);
  if (value > max) return max + resist(value - max);
  return value;
}

export function project(speed, decelerationRate = 0.99) {
  return (speed / 1000) * decelerationRate / (1 - decelerationRate);
}

export function createSpring2D(onFrame) {
  const current = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  const velocity = { x: 0, y: 0 };
  let coefficients = null;
  let frame = 0;
  let lastFrame = 0;

  function step(now) {
    let elapsed = clamp((now - lastFrame) / 1000, 0, 1 / 30);
    lastFrame = now;
    while (elapsed > 0) {
      const dt = Math.min(elapsed, 1 / 240);
      for (const axis of ['x', 'y']) {
        const force = -coefficients.stiffness * (current[axis] - target[axis]) - coefficients.damping * velocity[axis];
        velocity[axis] += force * dt;
        current[axis] += velocity[axis] * dt;
      }
      elapsed -= dt;
    }
    const settled = ['x', 'y'].every(axis =>
      Math.abs(current[axis] - target[axis]) < 0.5 && Math.abs(velocity[axis]) < 10
    );
    if (settled) {
      current.x = target.x;
      current.y = target.y;
      velocity.x = velocity.y = 0;
      frame = 0;
    } else {
      frame = requestAnimationFrame(step);
    }
    onFrame(current);
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    target.x = current.x;
    target.y = current.y;
    velocity.x = velocity.y = 0;
  }

  return {
    current,
    target,
    stop,
    jump(x, y) {
      stop();
      current.x = target.x = x;
      current.y = target.y = y;
      onFrame(current);
    },
    animate(x, y, { vx = 0, vy = 0, damping = 1, response = 0.4 } = {}) {
      target.x = x;
      target.y = y;
      velocity.x = vx;
      velocity.y = vy;
      const omega = (2 * Math.PI) / response;
      coefficients = { stiffness: omega * omega, damping: 2 * damping * omega };
      if (!frame) {
        lastFrame = performance.now();
        frame = requestAnimationFrame(step);
      }
    },
  };
}
