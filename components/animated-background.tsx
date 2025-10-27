"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

type NormalizedRect = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type Pointer = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  lastT: number;
  obstacle?: NormalizedRect;
};

type UniformMap = Record<string, WebGLUniformLocation | null>;

type ProgramBundle = {
  program: WebGLProgram;
  uniforms: UniformMap;
};

type RenderTarget = {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
};

type DoubleRenderTarget = {
  read: RenderTarget;
  write: RenderTarget;
  swap: () => void;
};

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

const CONFIG = {
  SIM_SCALE: 0.42,
  PRESSURE_ITERATIONS: 18,
  DENSITY_DISSIPATION: 0.996,
  VELOCITY_DISSIPATION: 0.992,
  CURL: 26,
  BUOYANCY: 0.04,
  UP_DRIFT: 0.0,
  INJECT_RADIUS_PX: 18,
  DENSITY_AMOUNT: 0.38,
  VELOCITY_SCALE: 1.75,
  IDLE_INTERVAL_MS: 1400,
  BASE_NOISE: 0.22
} as const;

const quadVertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fluidRef = useRef<WebGLFluid | null>(null);
  const pointersRef = useRef<Map<number, Pointer>>(new Map());
  const animationRef = useRef<number | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [fallbackActive, setFallbackActive] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);

  const mediaQuery = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.matchMedia(reducedMotionQuery);
  }, []);

  useEffect(() => {
    const mq = mediaQuery;
    if (!mq) return;
    const update = () => setIsReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [mediaQuery]);

  useEffect(() => {
    const updateThemeState = () => {
      if (typeof document === "undefined") return;
      setIsDarkTheme(document.documentElement.classList.contains("dark"));
    };
    updateThemeState();
    if (typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(updateThemeState);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    }
  }, []);

  const updatePointer = useCallback((event: PointerEvent) => {
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    const fluid = fluidRef.current;
    if (!canvas || !fluid) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const normX = clamp01((event.clientX - rect.left) / rect.width);
    const normY = clamp01((event.clientY - rect.top) / rect.height);
    const pointers = pointersRef.current;
    const existing = pointers.get(event.pointerId);
    if (!existing) {
      pointers.set(event.pointerId, {
        id: event.pointerId,
        x: normX,
        y: normY,
        vx: 0,
        vy: 0,
        lastT: event.timeStamp
      });
      return;
    }
    const dt = Math.max((event.timeStamp - existing.lastT) / 1000, 1 / 120);
    const dx = normX - existing.x;
    const dy = normY - existing.y;
    const vx = (dx / dt) * CONFIG.VELOCITY_SCALE;
    const vy = (dy / dt) * CONFIG.VELOCITY_SCALE;
    existing.vx = vx;
    existing.vy = vy;
    existing.x = normX;
    existing.y = normY;
    existing.lastT = event.timeStamp;
    fluid.addSplat(normX, normY, vx, vy, -0.85);
    const element = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement | null;
    const target = element?.closest("[data-steam-obstacle]") as HTMLElement | null;
    const previous = existing.obstacle;
    if (target && target !== canvas) {
      const normalized = normalizeRect(target.getBoundingClientRect(), rect);
      if (normalized) {
        if (previous && !obstacleEquals(previous, normalized)) {
          fluid.releaseObstacle(previous);
        }
        fluid.carveNormalizedObstacle(normalized);
        existing.obstacle = { ...normalized };
      }
    } else if (previous) {
      fluid.releaseObstacle(previous);
      existing.obstacle = undefined;
    }
  }, []);

  const removePointer = useCallback((event: PointerEvent) => {
    const pointer = pointersRef.current.get(event.pointerId);
    if (pointer && pointer.obstacle) {
      const fluid = fluidRef.current;
      if (fluid) {
        fluid.releaseObstacle(pointer.obstacle);
      }
    }
    pointersRef.current.delete(event.pointerId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;

    let fluid: WebGLFluid | null = null;

    try {
      fluid = new WebGLFluid(canvas);
      fluidRef.current = fluid;
      setFallbackActive(false);
    } catch (error) {
      console.error("Steam background fallback:", error);
      fluidRef.current = null;
      setFallbackActive(true);
      runNoiseFallback(canvas);
      return;
    }

    const handleResize = () => {
      fluid?.resize();
    };
    window.addEventListener("resize", handleResize);

    const loop = (time: number) => {
      if (fluidRef.current) {
        const pointers = pointersRef.current;
        pointers.forEach((pointer) => {
          pointer.vx *= CONFIG.VELOCITY_DISSIPATION;
          pointer.vy *= CONFIG.VELOCITY_DISSIPATION;
          if (Math.abs(pointer.vx) + Math.abs(pointer.vy) < 0.001) {
            pointer.vx = 0;
            pointer.vy = 0;
          }
        });
        fluidRef.current.step(time, pointers, isReducedMotion);
      }
      animationRef.current = requestAnimationFrame(loop);
    };
    animationRef.current = requestAnimationFrame(loop);

    const idleTimer = window.setInterval(() => {
      fluid?.addIdleSwirl();
    }, CONFIG.IDLE_INTERVAL_MS);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      window.clearInterval(idleTimer);
      fluid?.dispose();
      fluidRef.current = null;
    };
  }, [isReducedMotion]);

  useEffect(() => {
    if (isReducedMotion || fallbackActive) {
      return;
    }
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerdown", updatePointer);
    window.addEventListener("pointerup", removePointer);
    window.addEventListener("pointercancel", removePointer);

    return () => {
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", updatePointer);
      window.removeEventListener("pointerup", removePointer);
      window.removeEventListener("pointercancel", removePointer);
    };
  }, [updatePointer, removePointer, isReducedMotion, fallbackActive]);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas || !isReducedMotion || fallbackActive) return;
    renderReducedMotion(canvas);
  }, [isReducedMotion, fallbackActive]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="h-full w-full pointer-events-auto"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-90 transition-colors duration-500 ease-out"
        style={{
          background: isDarkTheme
            ? "linear-gradient(180deg,#0c0c0c,#060606)"
            : "linear-gradient(180deg,#dfefff,#b9d9ff)"
        }}
      />
    </div>
  );
}

function runNoiseFallback(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const draw = () => {
    const { width, height } = canvas;
    ctx.fillStyle = "#090909";
    ctx.fillRect(0, 0, width, height);
    const imageData = ctx.createImageData(width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const value = 200 + Math.random() * 30;
      imageData.data[i] = value;
      imageData.data[i + 1] = value;
      imageData.data[i + 2] = value;
      imageData.data[i + 3] = 28;
    }
    ctx.putImageData(imageData, 0, 0);
  };
  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    draw();
  };
  resize();
  window.addEventListener("resize", resize);
}

function renderReducedMotion(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const draw = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(226,226,226,0.06)";
    for (let i = 0; i < 240; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const w = Math.random() * 180 + 120;
      const h = Math.random() * 90 + 60;
      ctx.beginPath();
      ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  draw();
  window.addEventListener("resize", draw);
}

class WebGLFluid {
  private gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private velocity: DoubleRenderTarget;
  private density: DoubleRenderTarget;
  private pressure: DoubleRenderTarget;
  private divergence: RenderTarget;
  private curl: RenderTarget;
  private quadVAO: WebGLVertexArrayObject;
  private lastTime = performance.now();
  private programs: {
    advection: ProgramBundle;
    divergence: ProgramBundle;
    pressure: ProgramBundle;
    gradient: ProgramBundle;
    curl: ProgramBundle;
    vorticity: ProgramBundle;
    buoyancy: ProgramBundle;
    splat: ProgramBundle;
    composite: ProgramBundle;
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      powerPreference: "high-performance"
    }) as WebGL2RenderingContext | null;
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;

    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(this.canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));
    this.canvas.width = width;
    this.canvas.height = height;

    if (!gl.getExtension("EXT_color_buffer_float")) {
      throw new Error("EXT_color_buffer_float unsupported");
    }
    const linearFiltering =
      gl.getExtension("OES_texture_float_linear") ||
      gl.getExtension("OES_texture_half_float_linear");

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.STENCIL_TEST);
    gl.disable(gl.CULL_FACE);

    this.quadVAO = gl.createVertexArray() as WebGLVertexArrayObject;
    const vbo = gl.createBuffer();
    gl.bindVertexArray(this.quadVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    this.programs = createPrograms(gl);
    this.velocity = this.createDoubleFBO(gl.RG16F, gl.RG, linearFiltering ? gl.LINEAR : gl.NEAREST);
    this.density = this.createDoubleFBO(gl.RGBA16F, gl.RGBA, linearFiltering ? gl.LINEAR : gl.NEAREST);
    this.pressure = this.createDoubleFBO(gl.R16F, gl.RED, gl.NEAREST);
    this.divergence = this.createFBO(gl.R16F, gl.RED, gl.NEAREST);
    this.curl = this.createFBO(gl.R16F, gl.RED, gl.NEAREST);

    this.fillDensity(CONFIG.BASE_NOISE);
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(this.canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));
    if (width === this.canvas.width && height === this.canvas.height) return;
    this.canvas.width = width;
    this.canvas.height = height;
    const gl = this.gl;
    const linearFiltering =
      gl.getExtension("OES_texture_float_linear") ||
      gl.getExtension("OES_texture_half_float_linear");
    const filter = linearFiltering ? gl.LINEAR : gl.NEAREST;

    destroyDouble(gl, this.velocity);
    destroyDouble(gl, this.density);
    destroyDouble(gl, this.pressure);
    destroyFBO(gl, this.divergence);
    destroyFBO(gl, this.curl);

    this.velocity = this.createDoubleFBO(gl.RG16F, gl.RG, filter);
    this.density = this.createDoubleFBO(gl.RGBA16F, gl.RGBA, filter);
    this.pressure = this.createDoubleFBO(gl.R16F, gl.RED, gl.NEAREST);
    this.divergence = this.createFBO(gl.R16F, gl.RED, gl.NEAREST);
    this.curl = this.createFBO(gl.R16F, gl.RED, gl.NEAREST);
    this.fillDensity(CONFIG.BASE_NOISE);
  }

  dispose() {
    const gl = this.gl;
    destroyDouble(gl, this.velocity);
    destroyDouble(gl, this.density);
    destroyDouble(gl, this.pressure);
    destroyFBO(gl, this.divergence);
    destroyFBO(gl, this.curl);
  }

  addIdleSwirl() {
    const x = 0.2 + Math.random() * 0.6;
    const y = 0.25 + Math.random() * 0.5;
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.001 + Math.random() * 0.002;
    const vx = Math.cos(angle) * speed * 180;
    const vy = Math.sin(angle) * speed * 180;
    this.addSplat(x, y, vx, vy);
  }

  addSplat(normX: number, normY: number, forceX: number, forceY: number, densityScale = 1) {
    const gl = this.gl;
    const { splat } = this.programs;
    gl.useProgram(splat.program);
    const speed = Math.hypot(forceX, forceY);
    const radiusBase = (CONFIG.INJECT_RADIUS_PX * (window.devicePixelRatio || 1)) /
      Math.max(this.canvas.width, this.canvas.height);
    const radius = radiusBase * (0.6 + Math.min(speed * 0.01, 0.8));
    gl.uniform1f(splat.uniforms.uRadius!, radius);
    gl.uniform2f(splat.uniforms.uPoint!, normX, 1.0 - normY);
    gl.uniform1f(splat.uniforms.uAspect!, this.canvas.width / this.canvas.height);

    const velocityStrength = 0.35 + Math.min(speed * 0.02, 0.9);
    gl.uniform3f(splat.uniforms.uColor!, forceX * velocityStrength, -forceY * velocityStrength, 0.0);
    gl.uniform1f(splat.uniforms.uAlpha!, 0.0);
    gl.uniform1i(splat.uniforms.uTarget!, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
    drawTo(gl, splat.program, this.velocity.write, this.quadVAO);
    this.velocity.swap();

    const densityAmount = CONFIG.DENSITY_AMOUNT * (0.7 + Math.min(speed * 0.02, 0.9)) * densityScale;
    gl.uniform3f(splat.uniforms.uColor!, 0.0, 0.0, 0.0);
    gl.uniform1f(splat.uniforms.uAlpha!, densityAmount);
    gl.uniform1i(splat.uniforms.uTarget!, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.density.read.texture);
    drawTo(gl, splat.program, this.density.write, this.quadVAO);
    this.density.swap();
  }

  carveObstacle(elementRect: DOMRect, canvasRect: DOMRect) {
    const normalized = normalizeRect(elementRect, canvasRect);
    if (!normalized) return;
    this.carveNormalizedObstacle(normalized);
  }

  carveNormalizedObstacle(bounds: NormalizedRect) {
    const { left, right, top, bottom } = bounds;
    const cx = (left + right) * 0.5;
    const cy = (top + bottom) * 0.5;
    const width = Math.max(0.0005, right - left);
    const height = Math.max(0.0005, bottom - top);

    this.addSplat(cx, cy, 0, 0, -1.0);

    const push = 260;
    this.addSplat(cx, top, 0, -push * height, 0);
    this.addSplat(cx, bottom, 0, push * height, 0);
    this.addSplat(left, cy, -push * width, 0, 0);
    this.addSplat(right, cy, push * width, 0, 0);
  }

  releaseObstacle(bounds: NormalizedRect) {
    const { left, right, top, bottom } = bounds;
    const cx = (left + right) * 0.5;
    const cy = (top + bottom) * 0.5;
    this.addSplat(cx, cy, 0, 0, 0.2);
  }

  private applyBackgroundDrift(time: number) {
    const period = time * 0.00025;
    const patterns = [
      {
        x: 0.35 + 0.25 * Math.sin(period * 0.9 + 0.3),
        y: 0.45 + 0.18 * Math.cos(period * 1.1 + 0.8),
        vx: Math.cos(period) * 0.8,
        vy: Math.sin(period * 1.2) * 0.8
      },
      {
        x: 0.65 + 0.2 * Math.cos(period * 0.7 + 1.6),
        y: 0.55 + 0.22 * Math.sin(period * 0.6 + 0.5),
        vx: -Math.sin(period * 0.6) * 0.7,
        vy: Math.cos(period * 0.8) * 0.7
      },
      {
        x: 0.5 + 0.3 * Math.sin(period * 0.5),
        y: 0.35 + 0.15 * Math.cos(period * 0.4 + 1.2),
        vx: Math.sin(period * 0.9) * 0.6,
        vy: -Math.cos(period * 0.9) * 0.6
      }
    ];

    for (const pattern of patterns) {
      const forceX = pattern.vx * 40;
      const forceY = pattern.vy * 40;
      this.addSplat(pattern.x, pattern.y, forceX, forceY, 0.25);
    }
  }

  step(time: number, pointers: Map<number, Pointer>, reduced: boolean) {
    const gl = this.gl;
    const dt = Math.min((time - this.lastTime) / 1000, 0.016);
    this.lastTime = time;

    if (reduced) {
      this.render();
      return;
    }

    this.applyBackgroundDrift(time);

    advect(gl, this.programs.advection, this.velocity, this.velocity.read.texture, dt, CONFIG.VELOCITY_DISSIPATION, this.quadVAO);
    computeCurl(gl, this.programs.curl, this.velocity, this.curl, this.quadVAO);
    applyVorticity(gl, this.programs.vorticity, this.velocity, this.curl, dt, CONFIG.CURL, this.quadVAO);
    applyBuoyancy(gl, this.programs.buoyancy, this.velocity, this.density, CONFIG.BUOYANCY, CONFIG.UP_DRIFT, this.quadVAO);
    advect(gl, this.programs.advection, this.density, this.velocity.read.texture, dt, CONFIG.DENSITY_DISSIPATION, this.quadVAO);

    computeDivergence(gl, this.programs.divergence, this.velocity, this.divergence, this.quadVAO);
    clearPressure(gl, this.pressure);
    for (let i = 0; i < CONFIG.PRESSURE_ITERATIONS; i++) {
      solvePressure(gl, this.programs.pressure, this.pressure, this.divergence, this.quadVAO);
    }
    subtractGradient(gl, this.programs.gradient, this.velocity, this.pressure, this.quadVAO);

    this.render();
  }

  private render() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0.04, 0.04, 0.04, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const { composite } = this.programs;
    gl.useProgram(composite.program);
    gl.uniform1i(composite.uniforms.uDensity!, 0);
    gl.uniform2f(composite.uniforms.uResolution!, this.density.read.width, this.density.read.height);
    gl.uniform1f(composite.uniforms.uTime!, this.lastTime * 0.001);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.density.read.texture);
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
  }

  private createFBO(internalFormat: number, format: number, filter: number): RenderTarget {
    const gl = this.gl;
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(this.canvas.width * CONFIG.SIM_SCALE));
    const height = Math.max(1, Math.floor(this.canvas.height * CONFIG.SIM_SCALE));
    const texture = gl.createTexture();
    if (!texture) throw new Error("texture create failed");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, gl.HALF_FLOAT, null);
    const framebuffer = gl.createFramebuffer();
    if (!framebuffer) throw new Error("framebuffer create failed");
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, width, height);
    gl.clearColor(CONFIG.BASE_NOISE, CONFIG.BASE_NOISE, CONFIG.BASE_NOISE, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      framebuffer,
      texture,
      width,
      height,
      texelSizeX: 1 / width,
      texelSizeY: 1 / height
    };
  }

  private createDoubleFBO(internalFormat: number, format: number, filter: number): DoubleRenderTarget {
    const read = this.createFBO(internalFormat, format, filter);
    const write = this.createFBO(internalFormat, format, filter);
    return {
      read,
      write,
      swap() {
        const tmp = this.read;
        this.read = this.write;
        this.write = tmp;
      }
    };
  }

  private fillDensity(amount: number) {
    const gl = this.gl;
    const { splat } = this.programs;
    gl.useProgram(splat.program);
    const passes = 28;
    for (let i = 0; i < passes; i++) {
      const x = Math.random();
      const y = Math.random();
      const radius = (CONFIG.INJECT_RADIUS_PX * 0.6) / Math.max(this.canvas.width, this.canvas.height);
      gl.uniform1f(splat.uniforms.uRadius!, radius);
      gl.uniform2f(splat.uniforms.uPoint!, x, 1 - y);
      gl.uniform1f(splat.uniforms.uAspect!, this.canvas.width / this.canvas.height);
      gl.uniform3f(splat.uniforms.uColor!, 0.0, 0.0, 0.0);
      gl.uniform1f(splat.uniforms.uAlpha!, amount);
      gl.uniform1i(splat.uniforms.uTarget!, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.density.read.texture);
      drawTo(gl, splat.program, this.density.write, this.quadVAO);
      this.density.swap();
    }
  }
}

function drawTo(gl: WebGL2RenderingContext, program: WebGLProgram, target: RenderTarget | null, vao: WebGLVertexArrayObject) {
  if (target) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
    gl.viewport(0, 0, target.width, target.height);
  } else {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.bindVertexArray(null);
}

function destroyFBO(gl: WebGL2RenderingContext, target: RenderTarget) {
  gl.deleteFramebuffer(target.framebuffer);
  gl.deleteTexture(target.texture);
}

function destroyDouble(gl: WebGL2RenderingContext, target: DoubleRenderTarget) {
  destroyFBO(gl, target.read);
  destroyFBO(gl, target.write);
}

function normalizeRect(rect: DOMRect, canvasRect: DOMRect): NormalizedRect | null {
  const left = clamp01((rect.left - canvasRect.left) / canvasRect.width);
  const right = clamp01((rect.right - canvasRect.left) / canvasRect.width);
  const top = clamp01((rect.top - canvasRect.top) / canvasRect.height);
  const bottom = clamp01((rect.bottom - canvasRect.top) / canvasRect.height);
  if (right <= left || bottom <= top) {
    return null;
  }
  return { left, right, top, bottom };
}

function obstacleEquals(a: NormalizedRect, b: NormalizedRect) {
  const eps = 0.02;
  return (
    Math.abs(a.left - b.left) < eps &&
    Math.abs(a.right - b.right) < eps &&
    Math.abs(a.top - b.top) < eps &&
    Math.abs(a.bottom - b.bottom) < eps
  );
}

function advect(
  gl: WebGL2RenderingContext,
  program: ProgramBundle,
  target: DoubleRenderTarget,
  velocityTex: WebGLTexture,
  dt: number,
  dissipation: number,
  vao: WebGLVertexArrayObject
) {
  gl.useProgram(program.program);
  gl.uniform1i(program.uniforms.uVelocity!, 0);
  gl.uniform1i(program.uniforms.uSource!, 1);
  gl.uniform2f(program.uniforms.uTexelSize!, target.read.texelSizeX, target.read.texelSizeY);
  gl.uniform1f(program.uniforms.uDissipation!, dissipation);
  gl.uniform1f(program.uniforms.uDt!, dt);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, velocityTex);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, target.read.texture);
  drawTo(gl, program.program, target.write, vao);
  target.swap();
}

function computeCurl(
  gl: WebGL2RenderingContext,
  program: ProgramBundle,
  velocity: DoubleRenderTarget,
  curl: RenderTarget,
  vao: WebGLVertexArrayObject
) {
  gl.useProgram(program.program);
  gl.uniform1i(program.uniforms.uVelocity!, 0);
  gl.uniform2f(program.uniforms.uTexelSize!, velocity.read.texelSizeX, velocity.read.texelSizeY);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
  drawTo(gl, program.program, curl, vao);
}

function applyVorticity(
  gl: WebGL2RenderingContext,
  program: ProgramBundle,
  velocity: DoubleRenderTarget,
  curl: RenderTarget,
  dt: number,
  curlStrength: number,
  vao: WebGLVertexArrayObject
) {
  gl.useProgram(program.program);
  gl.uniform1i(program.uniforms.uVelocity!, 0);
  gl.uniform1i(program.uniforms.uCurl!, 1);
  gl.uniform2f(program.uniforms.uTexelSize!, velocity.read.texelSizeX, velocity.read.texelSizeY);
  gl.uniform1f(program.uniforms.uCurlStrength!, curlStrength);
  gl.uniform1f(program.uniforms.uDt!, dt);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, curl.texture);
  drawTo(gl, program.program, velocity.write, vao);
  velocity.swap();
}

function applyBuoyancy(
  gl: WebGL2RenderingContext,
  program: ProgramBundle,
  velocity: DoubleRenderTarget,
  density: DoubleRenderTarget,
  buoyancy: number,
  upDrift: number,
  vao: WebGLVertexArrayObject
) {
  gl.useProgram(program.program);
  gl.uniform1i(program.uniforms.uVelocity!, 0);
  gl.uniform1i(program.uniforms.uDensity!, 1);
  gl.uniform1f(program.uniforms.uBuoyancy!, buoyancy);
  gl.uniform1f(program.uniforms.uUpdrift!, upDrift);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, density.read.texture);
  drawTo(gl, program.program, velocity.write, vao);
  velocity.swap();
}

function computeDivergence(
  gl: WebGL2RenderingContext,
  program: ProgramBundle,
  velocity: DoubleRenderTarget,
  divergence: RenderTarget,
  vao: WebGLVertexArrayObject
) {
  gl.useProgram(program.program);
  gl.uniform1i(program.uniforms.uVelocity!, 0);
  gl.uniform2f(program.uniforms.uTexelSize!, velocity.read.texelSizeX, velocity.read.texelSizeY);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
  drawTo(gl, program.program, divergence, vao);
}

function clearPressure(gl: WebGL2RenderingContext, pressure: DoubleRenderTarget) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, pressure.write.framebuffer);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  pressure.swap();
}

function solvePressure(
  gl: WebGL2RenderingContext,
  program: ProgramBundle,
  pressure: DoubleRenderTarget,
  divergence: RenderTarget,
  vao: WebGLVertexArrayObject
) {
  gl.useProgram(program.program);
  gl.uniform1i(program.uniforms.uPressure!, 0);
  gl.uniform1i(program.uniforms.uDivergence!, 1);
  gl.uniform2f(program.uniforms.uTexelSize!, pressure.read.texelSizeX, pressure.read.texelSizeY);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, pressure.read.texture);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, divergence.texture);
  drawTo(gl, program.program, pressure.write, vao);
  pressure.swap();
}

function subtractGradient(
  gl: WebGL2RenderingContext,
  program: ProgramBundle,
  velocity: DoubleRenderTarget,
  pressure: DoubleRenderTarget,
  vao: WebGLVertexArrayObject
) {
  gl.useProgram(program.program);
  gl.uniform1i(program.uniforms.uVelocity!, 0);
  gl.uniform1i(program.uniforms.uPressure!, 1);
  gl.uniform2f(program.uniforms.uTexelSize!, velocity.read.texelSizeX, velocity.read.texelSizeY);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, velocity.read.texture);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, pressure.read.texture);
  drawTo(gl, program.program, velocity.write, vao);
  velocity.swap();
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("shader create failed");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info || "shader compile failed");
  }
  return shader;
}

function linkProgram(gl: WebGL2RenderingContext, vertex: string, fragment: string, uniforms: string[]): ProgramBundle {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertex);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!program) throw new Error("program create failed");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(info || "program link failed");
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  const uniformMap: UniformMap = {};
  uniforms.forEach((name) => {
    uniformMap[name] = gl.getUniformLocation(program, name);
  });
  return { program, uniforms: uniformMap };
}

function createPrograms(gl: WebGL2RenderingContext) {
  const vertex = `#version 300 es
    precision highp float;
    layout(location = 0) in vec2 aPosition;
    out vec2 vUv;
    void main() {
      vUv = 0.5 * (aPosition + 1.0);
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }`;

  const advection = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 uTexelSize;
    uniform float uDissipation;
    uniform float uDt;
    void main() {
      vec2 vel = texture(uVelocity, vUv).xy;
      vec2 coord = vUv - uDt * vel * uTexelSize;
      coord = clamp(coord, vec2(0.002), vec2(0.998));
      vec4 result = texture(uSource, coord);
      fragColor = result * uDissipation;
    }`;

  const divergence = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;
    void main() {
      float l = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
      float r = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
      float b = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
      float t = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
      float div = 0.5 * (r - l + t - b);
      fragColor = vec4(div, 0.0, 0.0, 1.0);
    }`;

  const pressure = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    uniform vec2 uTexelSize;
    void main() {
      float l = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
      float r = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
      float b = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
      float t = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
      float divergence = texture(uDivergence, vUv).x;
      float pressure = (l + r + b + t - divergence) * 0.25;
      fragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }`;

  const gradient = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform sampler2D uPressure;
    uniform vec2 uTexelSize;
    void main() {
      float l = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
      float r = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
      float b = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
      float t = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
      vec2 vel = texture(uVelocity, vUv).xy - vec2(r - l, t - b) * 0.5;
      vel *= 0.999;
      fragColor = vec4(vel, 0.0, 1.0);
    }`;

  const curl = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;
    void main() {
      float l = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
      float r = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
      float b = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
      float t = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
      float c = r - l - (t - b);
      fragColor = vec4(vec3(c), 1.0);
    }`;

  const vorticity = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform vec2 uTexelSize;
    uniform float uCurlStrength;
    uniform float uDt;
    void main() {
      float l = texture(uCurl, vUv - vec2(uTexelSize.x, 0.0)).x;
      float r = texture(uCurl, vUv + vec2(uTexelSize.x, 0.0)).x;
      float b = texture(uCurl, vUv - vec2(0.0, uTexelSize.y)).x;
      float t = texture(uCurl, vUv + vec2(0.0, uTexelSize.y)).x;
      float c = texture(uCurl, vUv).x;
      vec2 force = normalize(vec2(abs(t) - abs(b), abs(r) - abs(l)) + 1e-5) * uCurlStrength * c;
      vec2 velocity = texture(uVelocity, vUv).xy + force * uDt;
      fragColor = vec4(velocity, 0.0, 1.0);
    }`;

  const buoyancy = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform sampler2D uDensity;
    uniform float uBuoyancy;
    uniform float uUpdrift;
    void main() {
      vec2 velocity = texture(uVelocity, vUv).xy;
      float density = texture(uDensity, vUv).a;
      velocity.y += density * uBuoyancy + uUpdrift;
      fragColor = vec4(velocity, 0.0, 1.0);
    }`;

const splat = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uTarget;
    uniform vec2 uPoint;
    uniform vec3 uColor;
    uniform float uAlpha;
    uniform float uRadius;
    uniform float uAspect;
    void main() {
      vec2 diff = vUv - uPoint;
      diff.x *= uAspect;
      float influence = exp(-dot(diff, diff) / uRadius);
      vec4 base = texture(uTarget, vUv);
      vec3 rgb = base.rgb + uColor * influence;
      float alpha = base.a + uAlpha * influence;
      fragColor = vec4(rgb, alpha);
    }`;

  const composite = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uDensity;
    uniform vec2 uResolution;
    uniform float uTime;

    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
    vec3 aces(vec3 x) {
      float a = 2.51;
      float b = 0.03;
      float c = 2.43;
      float d = 0.59;
      float e = 0.14;
      return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
    }

    void main() {
      vec2 texel = 1.0 / uResolution;
      float c = texture(uDensity, vUv).a;
      float x1 = texture(uDensity, vUv + vec2(texel.x, 0.0)).a;
      float x2 = texture(uDensity, vUv - vec2(texel.x, 0.0)).a;
      float y1 = texture(uDensity, vUv + vec2(0.0, texel.y)).a;
      float y2 = texture(uDensity, vUv - vec2(0.0, texel.y)).a;
      float blur = c * 0.45 + (x1 + x2 + y1 + y2) * 0.125;
      float mist = smoothstep(0.1, 0.8, blur);

  float wallDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
  float wallGlow = smoothstep(0.12, 0.015, wallDist);

  vec3 base = mix(vec3(0.14), vec3(0.2), pow(vUv.y, 1.3));
  base = mix(base, vec3(0.1), wallGlow * 0.35);

  vec3 steam = vec3(0.65) * mist;
  steam += vec3(wallGlow) * 0.08;
  steam += (hash(vUv * uResolution.xy + uTime * 0.2) - 0.5) * 0.05;

  vec3 color = aces(mix(base, steam + vec3(0.6), mist));
      fragColor = vec4(color, 1.0);
    }`;

  return {
    advection: linkProgram(gl, vertex, advection, ["uVelocity", "uSource", "uTexelSize", "uDissipation", "uDt"]),
    divergence: linkProgram(gl, vertex, divergence, ["uVelocity", "uTexelSize"]),
    pressure: linkProgram(gl, vertex, pressure, ["uPressure", "uDivergence", "uTexelSize"]),
    gradient: linkProgram(gl, vertex, gradient, ["uVelocity", "uPressure", "uTexelSize"]),
    curl: linkProgram(gl, vertex, curl, ["uVelocity", "uTexelSize"]),
    vorticity: linkProgram(gl, vertex, vorticity, ["uVelocity", "uCurl", "uTexelSize", "uCurlStrength", "uDt"]),
    buoyancy: linkProgram(gl, vertex, buoyancy, ["uVelocity", "uDensity", "uBuoyancy", "uUpdrift"]),
    splat: linkProgram(gl, vertex, splat, ["uTarget", "uPoint", "uColor", "uAlpha", "uRadius", "uAspect"]),
    composite: linkProgram(gl, vertex, composite, ["uDensity", "uResolution", "uTime"])
  };
}
