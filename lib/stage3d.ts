import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { front, greedy } from "@/lib/pareto";
import { flagship } from "@/lib/profile";

/* ═══════════════════════════════════════════════════════════════════════════
   STAGE 3D
   The opening tablet as a real object: it rolls upright with the scroll like
   the CSS stage it replaces, turns under a drag, and opens by shattering its
   screen. The five biggest shards carry the orbit projects on their backs and
   fly out to where the CSS design puts those cards; the rest are dark glass.

   Layout is read, not restated. Every frame takes the HTML tablet's layout box
   and the HTML orbit cards' settled boxes, so the object lands where the
   design does at every breakpoint, and the invisible HTML stays the source of
   truth for the caption, the fallback, and the accessible names.

   Loaded on demand by components/Stage3D.tsx, never on the first paint.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Device proportions, from the CSS: 2.6% bezel, a 4:3 screen, 5% corners. */
const BEZEL = 0.026;
const SCREEN_W = 1 - 2 * BEZEL;
const SCREEN_H = SCREEN_W * 0.75;
const DEVICE_H = SCREEN_H + 2 * BEZEL;
const DEPTH = 0.034;
/** The screen glass the shards are cut from: thin, so a shard reads as glass
    and not as a slice of the whole device. */
const GLASS = 0.007;
const FOV = 30;

type Card = { href: HTMLAnchorElement; slot: HTMLElement; img: string; name: string };

export type StageHandles = {
  destroy: () => void;
  setOpen: (open: boolean) => void;
  setLive: (live: boolean) => void;
};

type Poly = [number, number][];

/* ── Fracture ───────────────────────────────────────────────────────────────
   Voronoi cells of the screen rectangle by half-plane clipping: every cell
   starts as the whole screen and is cut by the bisector against every other
   site. Quadratic, and n is 16, so it costs nothing and needs no library. */
function clip(poly: Poly, [ax, ay]: [number, number], [bx, by]: [number, number]): Poly {
  // Keep the side of the bisector nearer a.
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const nx = bx - ax;
  const ny = by - ay;
  const side = (p: [number, number]) => (p[0] - mx) * nx + (p[1] - my) * ny;
  const out: Poly = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const sp = side(p);
    const sq = side(q);
    if (sp <= 0) out.push(p);
    if (sp * sq < 0) {
      const t = sp / (sp - sq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  }
  return out;
}

function fracture(n: number, seed: number) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const w = SCREEN_W / 2;
  const h = SCREEN_H / 2;
  // Jittered grid, so the cells are even enough that the big ones can hold a
  // capture and the small ones read as debris rather than slivers.
  const cols = 5;
  const rows = Math.ceil(n / cols);
  const sites: [number, number][] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols && sites.length < n; c++)
      sites.push([
        -w + ((c + 0.2 + rnd() * 0.6) / cols) * SCREEN_W,
        -h + ((r + 0.2 + rnd() * 0.6) / rows) * SCREEN_H,
      ]);
  const rect: Poly = [[-w, -h], [w, -h], [w, h], [-w, h]];
  return sites.map((site, i) => {
    let poly = rect;
    sites.forEach((other, j) => {
      if (i !== j) poly = clip(poly, site, other);
    });
    let area = 0;
    let cx = 0;
    let cy = 0;
    poly.forEach(([x, y], k) => {
      const [x2, y2] = poly[(k + 1) % poly.length];
      const a = x * y2 - x2 * y;
      area += a;
      cx += (x + x2) * a;
      cy += (y + y2) * a;
    });
    area /= 2;
    return { poly, area: Math.abs(area), cx: cx / (6 * area), cy: cy / (6 * area) };
  });
}

/* ── Easing ─────────────────────────────────────────────────────────────── */
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export async function mountStage(root: HTMLElement): Promise<StageHandles | null> {
  const stage = root.closest(".stage") as HTMLElement | null;
  const figure = stage?.querySelector(".stage-device") as HTMLElement | null;
  const device = figure?.querySelector(".device") as HTMLElement | null;
  if (!stage || !figure || !device) return null;

  const cards: Card[] = [...stage.querySelectorAll<HTMLLIElement>(".stage-card")].map((li) => {
    const a = li.querySelector("a") as HTMLAnchorElement;
    const img = li.querySelector("img") as HTMLImageElement;
    return { href: a, slot: li, img: img.currentSrc || img.src, name: a.dataset.previewLabel ?? "" };
  });
  const screenImg = device.querySelector("img") as HTMLImageElement;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const canvas = renderer.domElement;
  canvas.className = "stage-3d-canvas";
  canvas.setAttribute("aria-hidden", "true");
  root.appendChild(canvas);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  // The lantern: the one warm light, raking the edge the way clay marks the
  // page. A cool key from above keeps the alloy reading as metal.
  const key = new THREE.DirectionalLight(0xcfe6ea, 1.4);
  key.position.set(-3, 5, 6);
  const lantern = new THREE.PointLight(0xe38f6c, 14, 12, 1.6);
  lantern.position.set(3.2, -1.2, 2.4);
  scene.add(key, lantern, new THREE.AmbientLight(0x2b6a78, 0.35));
  // The light that escapes when the screen breaks: bright for a moment at
  // the start of the flight, then gone.
  const flash = new THREE.PointLight(0xffe2cf, 0, 6, 1.4);
  scene.add(flash);

  const loader = new THREE.TextureLoader();
  const load = (src: string) =>
    loader.loadAsync(src).then((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return t;
    });
  let screenTex: THREE.Texture;
  let cardTex: THREE.Texture[];
  try {
    [screenTex, ...cardTex] = await Promise.all([
      load(screenImg.currentSrc || screenImg.src),
      ...cards.map((c) => load(c.img)),
    ]);
  } catch {
    // A capture failed to load: leave the HTML stage as it is.
    env.dispose();
    pmrem.dispose();
    renderer.dispose();
    canvas.remove();
    return null;
  }

  // ── The device ────────────────────────────────────────────────────────────
  const tablet = new THREE.Group();
  // A rounded slab with a small bevel: the corners are 5% of the width like the
  // CSS device, which a rounded box this thin cannot do (its radius is capped
  // at half the depth).
  const bodyGeo = new THREE.ExtrudeGeometry(roundedRect(1 - 0.012, DEVICE_H - 0.012, 0.044), {
    depth: DEPTH - 0.012,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 4,
    curveSegments: 16,
  });
  bodyGeo.translate(0, 0, -(DEPTH - 0.012) / 2);
  const body = new THREE.Mesh(
    bodyGeo,
    new THREE.MeshPhysicalMaterial({
      color: 0x3a474c,
      metalness: 0.92,
      roughness: 0.32,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
    })
  );
  const glassShape = roundedRect(1 - 0.012, DEVICE_H - 0.012, 0.042);
  const glass = new THREE.Mesh(
    new THREE.ShapeGeometry(glassShape, 12),
    new THREE.MeshPhysicalMaterial({ color: 0x05090b, metalness: 0, roughness: 0.08, clearcoat: 1 })
  );
  glass.position.z = DEPTH / 2 + 0.0006;

  // Cover-fit the capture to 4:3, anchored to the top like the CSS.
  const coverV = (t: THREE.Texture) => {
    const img = t.image as { width: number; height: number };
    const r = (img.width / img.height) * 0.75; // visible fraction of height
    return Math.min(1, r);
  };
  const vScreen = coverV(screenTex);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN_W, SCREEN_H),
    new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false })
  );
  remapUV(screen.geometry, (x, y) => [x / SCREEN_W + 0.5, 1 - (0.5 - y / SCREEN_H) * vScreen]);
  screen.position.z = DEPTH / 2 + 0.0012;

  // What the shatter reveals: the numbers under the interface. The Deep GA's
  // Pareto front, the same data as the case study's chart, drawn into the
  // screen as the shards leave it.
  const reveal = drawReveal();
  const inner = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN_W, SCREEN_H),
    new THREE.MeshBasicMaterial({ map: reveal.texture, toneMapped: false })
  );
  inner.position.z = DEPTH / 2 + 0.0009;
  tablet.add(body, glass, inner, screen);
  scene.add(tablet);

  // ── Shards ────────────────────────────────────────────────────────────────
  const cells = fracture(16, 7);
  const byArea = [...cells.keys()].sort((a, b) => cells[b].area - cells[a].area);
  // Dark and matte. A bright rim read as a separate floating line whenever a
  // shard turned edge-on; a dark one reads as the thickness of the glass.
  // (Not transmissive: sixteen transmissive edges would each cost the
  // renderer an extra pass.)
  const edge = new THREE.MeshStandardMaterial({ color: 0x24363c, metalness: 0.2, roughness: 0.45 });
  const hidden = new THREE.MeshBasicMaterial({ visible: false });
  edge.emissive = new THREE.Color(0x9fe6ee);
  edge.emissiveIntensity = 0;
  // The fracture lines: drawn on the intact screen before it comes apart,
  // then carried on each piece as a glowing rim that fades as they settle.
  const crackMat = new THREE.LineBasicMaterial({
    color: 0xcff4f7,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const fronts: THREE.MeshBasicMaterial[] = [];
  // A soft halo behind every piece, the glow of the light escaping around
  // it: one radial gradient, added on top of whatever is behind.
  const halo = document.createElement("canvas");
  halo.width = halo.height = 128;
  const hctx = halo.getContext("2d")!;
  const grad = hctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  hctx.fillStyle = grad;
  hctx.fillRect(0, 0, 128, 128);
  const haloTex = new THREE.CanvasTexture(halo);
  const haloMat = new THREE.SpriteMaterial({
    map: haloTex,
    color: 0x9fe6ee,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  // Debris backs are the device's glass seen from behind: dark, but glossy
  // enough to catch the key light and the lantern as they turn.
  const debrisBack = new THREE.MeshPhysicalMaterial({ color: 0x1b2a30, metalness: 0.6, roughness: 0.12, clearcoat: 1 });

  type Shard = {
    mesh: THREE.Group;
    home: THREE.Vector3;
    card?: number;
    bbox: { w: number; h: number };
    // exploded pose, recomputed from layout
    to: THREE.Vector3;
    spin: THREE.Euler;
    toScale: number;
    delay: number;
    phase: number;
    /** Play: offset from the orbit slot and its velocity, in tablet space,
        and a spin on top of the pose. All spring back to rest. */
    off: THREE.Vector3;
    vel: THREE.Vector3;
    tilt: THREE.Vector2;
    tiltVel: THREE.Vector2;
  };

  const shards: Shard[] = cells.map((cell, i) => {
    const local: Poly = cell.poly.map(([x, y]) => [x - cell.cx, y - cell.cy]);
    const shape = new THREE.Shape(local.map(([x, y]) => new THREE.Vector2(x, y)));
    const xs = local.map((p) => p[0]);
    const ys = local.map((p) => p[1]);
    const bbox = { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
    const g = new THREE.Group();

    const front = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false })
    );
    remapUV(front.geometry, (x, y) => [
      (x + cell.cx) / SCREEN_W + 0.5,
      1 - (0.5 - (y + cell.cy) / SCREEN_H) * vScreen,
    ]);
    front.position.z = GLASS / 2 + 0.0004;

    const cardIndex = byArea.indexOf(i);
    const card = cardIndex >= 0 && cardIndex < cards.length ? cardIndex : undefined;
    let backMat: THREE.Material = debrisBack;
    const back = new THREE.Mesh(new THREE.ShapeGeometry(shape), backMat);
    if (card !== undefined) {
      const tex = cardTex[card];
      const img = tex.image as { width: number; height: number };
      // Cover-fit the capture to the shard's bounding box.
      const ar = img.width / img.height;
      const br = bbox.w / bbox.h;
      const [sw, sh] = br > ar ? [1, ar / br] : [br / ar, 1];
      const x0 = Math.min(...xs);
      const y0 = Math.min(...ys);
      backMat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
      back.material = backMat;
      // Not mirrored: the back is turned once on its own and once more with
      // the shard, so it faces the viewer the right way round.
      remapUV(back.geometry, (x, y) => [
        0.5 + ((x - x0) / bbox.w - 0.5) * sw,
        0.5 + ((y - y0) / bbox.h - 0.5) * sh,
      ]);
    }
    back.rotation.y = Math.PI;
    back.position.z = -GLASS / 2 - 0.0004;

    const side = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { depth: GLASS, bevelEnabled: false }),
      [hidden, edge]
    );
    side.position.z = -GLASS / 2;

    const rim = new THREE.LineLoop(
      new THREE.BufferGeometry().setFromPoints(local.map(([x, y]) => new THREE.Vector3(x, y, GLASS / 2 + 0.0009))),
      crackMat
    );
    fronts.push(front.material as THREE.MeshBasicMaterial);

    const glowSprite = new THREE.Sprite(haloMat);
    glowSprite.scale.set(bbox.w * 1.9, bbox.h * 1.9, 1);
    glowSprite.position.z = -0.01;

    g.add(glowSprite, front, back, side, rim);
    g.position.set(cell.cx, cell.cy, DEPTH / 2 - GLASS / 2 + 0.0008);
    g.visible = false;
    tablet.add(g);

    return {
      mesh: g,
      home: new THREE.Vector3(cell.cx, cell.cy, DEPTH / 2 - GLASS / 2 + 0.0008),
      card,
      bbox,
      to: new THREE.Vector3(),
      spin: new THREE.Euler(),
      toScale: 1,
      delay: (Math.hypot(cell.cx, cell.cy) / 0.6) * 0.18 + (card !== undefined ? 0 : 0.05),
      phase: i * 1.7,
      off: new THREE.Vector3(),
      vel: new THREE.Vector3(),
      tilt: new THREE.Vector2(),
      tiltVel: new THREE.Vector2(),
    };
  });

  // ── Layout ────────────────────────────────────────────────────────────────
  let W = 0;
  let H = 0;
  let unit = 1; // world units per CSS pixel at z = 0
  const pinned =
    CSS.supports("animation-timeline: view()") &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches;

  const toWorld = (px: number, py: number, r: DOMRect) =>
    new THREE.Vector3((px - r.left - W / 2) * unit, -(py - r.top - H / 2) * unit, 0);

  const resize = (r: DOMRect) => {
    if (r.width === W && r.height === H) return;
    W = r.width;
    H = r.height;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    unit = (2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / H;
  };

  // Seeded scatter for the debris, so the layout is identical on every visit.
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const debrisAngle = shards.map(() => rnd());
  const debrisDist = shards.map(() => rnd());
  // A tilt of at most ±35° per axis: enough to catch the light, never enough
  // to turn a piece edge-on, where it reads as a stick rather than glass.
  const TILT = 0.6;
  const debrisSpin = shards.map(
    () => new THREE.Euler((rnd() - 0.5) * 2 * TILT, (rnd() - 0.5) * 2 * TILT, (rnd() - 0.5) * 2 * TILT)
  );

  const place = (deviceW: number, rootRect: DOMRect) => {
    // Exploded poses, in the tablet's frame (it is upright and unrotated at
    // rest, so tablet space is screen space scaled by deviceW).
    const s = 1 / (deviceW * unit);
    shards.forEach((sh, i) => {
      if (sh.card !== undefined) {
        const slot = cards[sh.card].slot.getBoundingClientRect();
        const c = toWorld(slot.left + slot.width / 2, slot.top + slot.height / 2, rootRect);
        const centre = tablet.position;
        sh.to.set((c.x - centre.x) * s, (c.y - centre.y) * s, 0.12 + sh.card * 0.02);
        // Fit inside the card's box both ways: the cells are irregular, and
        // matching width alone let the tall ones overlap their neighbours.
        sh.toScale = 0.92 * Math.min(slot.width / sh.bbox.w, slot.height / sh.bbox.h) * unit * s;
        sh.spin.set(0.05 * (i % 2 ? 1 : -1), Math.PI, 0.06 * (sh.card % 2 ? 1 : -1));
      } else {
        const a = debrisAngle[i] * Math.PI * 2;
        const d = 0.62 + debrisDist[i] * 0.3;
        sh.to.set(Math.cos(a) * d * 1.15, Math.sin(a) * d * 0.72, -0.25 - debrisDist[i] * 0.4);
        sh.toScale = 0.7 + debrisDist[i] * 0.5;
        sh.spin.copy(debrisSpin[i]);
      }
    });
  };

  // ── Interaction ───────────────────────────────────────────────────────────
  let open = 0; // 0 assembled … 1 exploded, time-driven
  let openTarget = 0;
  let openFrom = 0;
  let openStart = 0;
  let userSet = false;
  let live = false;
  let yaw = 0;
  let pitch = 0;
  let vYaw = 0;
  let vPitch = 0;
  let dragging = false;
  let moved = 0;
  let lx = 0;
  let ly = 0;
  let hover: Shard | null = null;
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const label = document.createElement("span");
  label.className = "stage-3d-label";
  label.setAttribute("aria-hidden", "true");
  root.appendChild(label);

  const announce = () =>
    window.dispatchEvent(new CustomEvent("stage3d:state", { detail: { open: openTarget === 1 } }));

  const setOpen = (v: boolean) => {
    const t = v ? 1 : 0;
    if (t === openTarget) return;
    openFrom = open;
    openTarget = t;
    openStart = performance.now();
    announce();
  };

  const pick = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const shown = (o: THREE.Object3D | null): boolean => !o || (o.visible && shown(o.parent));
    const hits = ray.intersectObject(tablet, true).filter((h) => shown(h.object));
    if (!hits.length) return { hit: false as const };
    const shard = shards.find((sh) => sh.mesh === hits[0].object.parent || sh.mesh === hits[0].object);
    return { hit: true as const, shard };
  };

  // Once it is open the pieces are there to be played with: grab one and
  // throw it, and it springs back to its place; move the pointer through
  // them and they drift out of the way. A drag on anything else still turns
  // the whole thing.
  let held: Shard | null = null;
  const deviceWidth = () => device!.offsetWidth;
  const settled = () => open > 0.9 && openTarget === 1;
  /** Pointer position in the tablet's own plane (it is near upright once open). */
  const local = (x: number, y: number) => {
    const r = root.getBoundingClientRect();
    const w = toWorld(x, y, r).sub(tablet.position).divideScalar(tablet.scale.x);
    return new THREE.Vector2(w.x, w.y);
  };

  const onDown = (e: PointerEvent) => {
    if (live || e.button !== 0) return;
    moved = 0;
    lx = e.clientX;
    ly = e.clientY;
    const p = pick(e);
    if (settled() && p.shard) {
      held = p.shard;
      held.vel.set(0, 0, 0);
      canvas.style.cursor = "grabbing";
    } else {
      dragging = true;
      vYaw = vPitch = 0;
    }
    canvas.setPointerCapture(e.pointerId);
  };
  const onMove = (e: PointerEvent) => {
    const dx = e.clientX - lx;
    const dy = e.clientY - ly;
    lx = e.clientX;
    ly = e.clientY;
    if (held) {
      moved += Math.abs(dx) + Math.abs(dy);
      const k = 1 / (deviceWidth() || 1);
      held.off.x += dx * k;
      held.off.y -= dy * k;
      held.vel.set(dx * k, -dy * k, 0);
      // It swings as it is carried, tilting into the direction of travel.
      held.tiltVel.set(-dy * 0.004, dx * 0.004);
      hideLabel();
      return;
    }
    if (dragging) {
      moved += Math.abs(dx) + Math.abs(dy);
      vYaw = dx * 0.006;
      vPitch = e.pointerType === "touch" ? 0 : dy * 0.004;
      yaw += vYaw;
      pitch = Math.max(-0.7, Math.min(0.7, pitch + vPitch));
      return;
    }
    // Moving through the pieces nudges them aside.
    if (settled() && e.pointerType === "mouse") {
      const at = local(e.clientX, e.clientY);
      shards.forEach((sh) => {
        const pos = new THREE.Vector2(sh.to.x + sh.off.x, sh.to.y + sh.off.y);
        const d = pos.distanceTo(at);
        if (d > 0.16 || d === 0) return;
        const push = (0.16 - d) * 0.04;
        const dir = pos.sub(at).normalize();
        sh.vel.x += dir.x * push;
        sh.vel.y += dir.y * push;
        sh.tiltVel.x += -dir.y * push * 6;
        sh.tiltVel.y += dir.x * push * 6;
      });
    }
    const p = pick(e);
    const next = p.hit && p.shard?.card !== undefined && settled() ? p.shard : null;
    if (next !== hover) {
      hover = next;
      label.textContent = hover ? `${cards[hover.card!].name} ↗` : "";
      label.classList.toggle("is-on", !!hover);
    }
    canvas.style.cursor = p.shard && settled() ? "grab" : p.hit && !live ? "pointer" : "grab";
    if (hover) {
      const r = root.getBoundingClientRect();
      label.style.transform = `translate(${e.clientX - r.left + 14}px, ${e.clientY - r.top + 14}px)`;
    }
  };
  const onUp = (e: PointerEvent) => {
    if (held) {
      const sh = held;
      held = null;
      canvas.style.cursor = "grab";
      if (moved > 6) {
        // A throw lands like a dropped card: a splash with sound on, and a
        // signal into the synapse layer from where it was let go.
        window.dispatchEvent(new CustomEvent("buoy:drop", { detail: { x: e.clientX, y: e.clientY } }));
        return;
      }
      if (sh.card !== undefined) {
        // Opens the same live preview the HTML card does: LivePreview listens
        // for clicks on preview links by delegation.
        cards[sh.card].href.click();
      } else {
        // A tap on a loose piece sets it spinning.
        sh.tiltVel.set((Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3);
      }
      return;
    }
    if (!dragging) return;
    dragging = false;
    if (moved > 6) return;
    const p = pick(e);
    if (!p.hit || p.shard) return;
    userSet = true;
    setOpen(openTarget === 0);
  };
  const hideLabel = () => {
    hover = null;
    label.classList.remove("is-on");
  };
  const onLeave = hideLabel;
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", () => {
    dragging = false;
    held = null;
  });
  canvas.addEventListener("pointerleave", onLeave);

  // ── Loop ──────────────────────────────────────────────────────────────────
  let raf = 0;
  let visible = true;
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(frame);
  });
  io.observe(stage);

  // Long enough to follow each piece: expo-out over 1.5s finished most of
  // the flight, flip included, in the first few frames.
  const DURATION = 2800;
  /** Share of the opening spent on the cracks, before anything moves. */
  const CRACK = 0.14;
  /** Scroll positions in the (taller) 3D pin: upright by, and break at. */
  const ROLL_END = 0.23; // ~1 screen of scrolling to stand up
  const SHATTER_AT = 0.535; // then ~1.3 screens intact; the rest is to play
  const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
  const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const t0 = performance.now();

  function frame(now: number) {
    raf = 0;
    if (!visible) return;
    raf = requestAnimationFrame(frame);

    const rootRect = root.getBoundingClientRect();
    resize(rootRect);
    // The device's own layout box: offsets ignore the CSS roll's transform,
    // and the figure around it is as wide as the caption, not the tablet.
    const fig = figure!.getBoundingClientRect();
    const deviceW = device!.offsetWidth;
    const deviceX = fig.left + device!.offsetLeft;
    const deviceY = fig.top + device!.offsetTop;

    // Scroll. The pin is taller with the 3D on (see .stage-3d-on .stage): the
    // tablet rolls upright over the first third, then holds, face on, for
    // most of a screen of scrolling so the reader can take in Intelli-Factory
    // before it breaks, unless the reader has opened or closed it already.
    const sr = stage!.getBoundingClientRect();
    const p = pinned ? clamp01(-sr.top / Math.max(1, sr.height - innerHeight)) : 1;
    const roll = clamp01(p / ROLL_END); // linear, like the CSS keyframes it replaces
    if (!userSet && !live) setOpen(p > SHATTER_AT);

    // Opening is two beats: the cracks light up across the intact screen,
    // then the pieces fly. Reopening mid-flight skips the cracks.
    const t = clamp01((now - openStart) / DURATION);
    const delay = openTarget && openFrom < 0.001 ? CRACK : 0;
    const cracked = delay ? clamp01(t / delay) : 1;
    const flight = openTarget ? clamp01((t - delay) / (1 - delay)) : t;
    open = lerp(openFrom, openTarget, openTarget ? easeOutCubic(flight) : easeInOut(flight));

    // Drag: momentum, then a spring home.
    if (!dragging) {
      yaw += vYaw;
      pitch = Math.max(-0.7, Math.min(0.7, pitch + vPitch));
      vYaw *= 0.92;
      vPitch *= 0.92;
      if (Math.abs(vYaw) < 0.002) yaw *= 0.94;
      if (Math.abs(vPitch) < 0.002) pitch *= 0.94;
    }
    if (live) {
      yaw *= 0.8;
      pitch *= 0.8;
    }

    const paused = document.documentElement.classList.contains("motion-paused");
    const time = paused ? 0 : (now - t0) / 1000;

    const centre = toWorld(deviceX + deviceW / 2, deviceY + (deviceW * DEVICE_H) / 2, rootRect);
    const k = 1 - roll;
    tablet.position.set(centre.x, centre.y + k * (innerHeight * 0.17) * unit + Math.sin(time * 0.9) * 0.012, 0);
    tablet.scale.setScalar(deviceW * unit * lerp(1, 0.74, k));
    tablet.rotation.set(
      THREE.MathUtils.degToRad(-62) * k + pitch + Math.sin(time * 0.7) * 0.01,
      yaw + Math.sin(time * 0.5) * 0.015,
      THREE.MathUtils.degToRad(13) * k
    );

    // Glow: the cracks come up, the rims burn through the flight and cool as
    // the pieces land; a flash escapes as the screen gives way.
    const cracking = openTarget === 1 && cracked > 0;
    const glow = openTarget ? (cracked < 1 ? cracked : 1 - easeOutCubic(flight) * 0.85) : open * 0.15;
    crackMat.opacity = glow;
    edge.emissiveIntensity = glow * 1.6;
    fronts.forEach((m) => m.color.setScalar(1 + glow * 0.7));
    // The halo is warm at the break, cooling to the water's cyan in flight.
    haloMat.opacity = glow * 0.55;
    haloMat.color.setHex(0x9fe6ee).lerp(new THREE.Color(0xffc9ad), cracked < 1 ? 0.7 : Math.max(0, 0.7 - flight * 2));
    flash.intensity = openTarget ? Math.max(0, 1 - Math.abs(flight - 0.06) / 0.25) * 40 : 0;
    flash.position.copy(tablet.position).setZ(0.6);

    let playing = !!held;
    const shattered = open > 0.001 || cracking;
    if (shattered) place(deviceW, rootRect);
    if (hover && open < 0.9) {
      hover = null;
      label.classList.remove("is-on");
    }
    screen.visible = !shattered;
    shards.forEach((sh) => {
      sh.mesh.visible = shattered;
      if (!shattered) return;
      const e = clamp01((open - sh.delay * 0.35) / (1 - sh.delay * 0.35));
      sh.mesh.position.lerpVectors(sh.home, sh.to, e);
      // An arc: shards lift toward the viewer on the way out.
      sh.mesh.position.z += Math.sin(e * Math.PI) * 0.35;
      const f = e > 0.98 ? 1 : 0;
      const bob = Math.sin(time * 0.8 + sh.phase) * 0.012 * f;
      sh.mesh.position.y += bob;
      // The turn eases in and out across the whole flight, so the project
      // shards roll over steadily instead of snapping to their backs. Once
      // settled, debris keeps tumbling, slowly.
      const r = easeInOut(e);
      // A slow sway rather than a spin, faded in as the piece lands, so
      // nothing jumps when the flight ends.
      const settle = sh.card === undefined ? clamp01((e - 0.85) / 0.15) : 0;
      const sway = Math.sin(time * 0.35 + sh.phase) * 0.25 * settle;
      // Play: a damped spring pulls each piece back to its slot, and its
      // swing back to rest. Scaled by the flight, so closing folds it away.
      if (sh !== held) {
        sh.vel.addScaledVector(sh.off, -0.012).multiplyScalar(0.9);
        sh.off.add(sh.vel);
      }
      sh.tiltVel.addScaledVector(sh.tilt, -0.02).multiplyScalar(0.9);
      sh.tilt.add(sh.tiltVel);
      // A swing, never a flip: past ~25° a thin piece reads edge-on as a stick.
      sh.tilt.clampScalar(-0.45, 0.45);
      if (sh.off.lengthSq() + sh.vel.lengthSq() + sh.tilt.lengthSq() + sh.tiltVel.lengthSq() > 1e-9) playing = true;
      sh.mesh.position.addScaledVector(sh.off, e);
      sh.mesh.rotation.set(
        sh.spin.x * r + sway + sh.tilt.x * e,
        sh.spin.y * r + sway * 0.6 + sh.tilt.y * e,
        sh.spin.z * r
      );
      const lift = hover === sh ? 1.08 : 1;
      sh.mesh.scale.setScalar(lerp(1, sh.toScale * lift, e));
    });
    inner.visible = shattered;
    if (shattered) reveal.draw(clamp01((open - 0.25) / 0.75));

    tablet.visible = !live;
    // Nothing moved (motion paused, tablet at rest, no scroll): keep the last
    // frame rather than redraw an identical one.
    const key = `${W},${H},${deviceX},${deviceY},${deviceW},${p},${open},${glow},${yaw.toFixed(4)},${pitch.toFixed(4)},${time},${live},${hover?.card}`;
    if (key === lastKey && !playing) return;
    lastKey = key;
    renderer.render(scene, camera);
  }
  let lastKey = "";
  raf = requestAnimationFrame(frame);

  const onHidden = () => {
    if (!document.hidden && visible && !raf) raf = requestAnimationFrame(frame);
  };
  document.addEventListener("visibilitychange", onHidden);

  return {
    setOpen: (v) => {
      userSet = true;
      setOpen(v);
    },
    setLive: (v) => {
      live = v;
      if (v) setOpen(false);
    },
    destroy: () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onHidden);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((mat) => mat.dispose());
      });
      [screenTex, ...cardTex, env, reveal.texture, haloTex].forEach((t) => t.dispose());
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
      label.remove();
    },
  };
}

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function remapUV(geo: THREE.BufferGeometry, fn: (x: number, y: number) => [number, number]) {
  const pos = geo.getAttribute("position");
  const uv = geo.getAttribute("uv");
  for (let i = 0; i < pos.count; i++) {
    const [u, v] = fn(pos.getX(i), pos.getY(i));
    uv.setXY(i, u, v);
  }
  uv.needsUpdate = true;
}

/* ── The reveal ─────────────────────────────────────────────────────────────
   A 2D canvas texture, redrawn only while its progress changes: the axes
   first, then the front traced left to right, then the knee point and the
   figures. Fonts are read from the page, so the screen speaks in the same
   Plex as everything around it. */
function drawReveal() {
  const c = document.createElement("canvas");
  c.width = 1366;
  c.height = 1024;
  const ctx = c.getContext("2d")!;
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const probe = document.querySelector(".readout") ?? document.body;
  const mono = getComputedStyle(probe).fontFamily;
  const sans = getComputedStyle(document.body).fontFamily;
  const css = getComputedStyle(document.documentElement);
  const tok = (n: string, f: string) => css.getPropertyValue(n).trim() || f;
  const ink = tok("--color-ink", "#e6eeee");
  const fog = tok("--color-fog", "#8fa6ab");
  const line = tok("--color-line-2", "#2e4c56");
  const clay = tok("--color-clay", "#e38f6c");

  const P = { l: 150, r: 90, t: 330, b: 150 };
  const tMin = 2.5, tMax = 9, cMin = 15, cMax = 65;
  const X = (t: number) => P.l + ((t - tMin) / (tMax - tMin)) * (c.width - P.l - P.r);
  const Y = (v: number) => c.height - P.b - ((v - cMin) / (cMax - cMin)) * (c.height - P.t - P.b);

  let last = -1;
  const draw = (p: number) => {
    const q = Math.round(p * 200) / 200;
    if (q === last) return;
    last = q;
    ctx.fillStyle = "#0b1a20";
    ctx.fillRect(0, 0, c.width, c.height);

    const axes = clamp01(q / 0.25);
    ctx.globalAlpha = axes;
    ctx.fillStyle = fog;
    ctx.font = `500 30px ${mono}`;
    ctx.fillText("DEEP GA · PARETO FRONT", P.l, 110);
    ctx.fillStyle = ink;
    ctx.font = `600 64px ${sans}`;
    ctx.fillText("Cost against delivery time", P.l, 188);

    ctx.strokeStyle = line;
    ctx.lineWidth = 2;
    ctx.font = `400 24px ${mono}`;
    ctx.fillStyle = fog;
    for (const v of [20, 30, 40, 50, 60]) {
      ctx.beginPath();
      ctx.moveTo(P.l, Y(v));
      ctx.lineTo(c.width - P.r, Y(v));
      ctx.stroke();
      ctx.fillText(String(v), P.l - 60, Y(v) + 8);
    }
    for (const t of [3, 4, 5, 6, 7, 8, 9]) ctx.fillText(`${t}d`, X(t) - 14, c.height - P.b + 48);

    // The front, traced.
    const trace = clamp01((q - 0.2) / 0.55);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = clay;
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.beginPath();
    const n = front.length - 1;
    const upto = trace * n;
    front.forEach((pt, i) => {
      if (i > Math.ceil(upto)) return;
      const f = Math.min(1, upto - (i - 1));
      const prev = front[Math.max(0, i - 1)];
      const x = i === 0 ? X(pt.t) : X(prev.t) + (X(pt.t) - X(prev.t)) * f;
      const y = i === 0 ? Y(pt.c) : Y(prev.c) + (Y(pt.c) - Y(prev.c)) * f;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    if (trace > 0) ctx.stroke();
    ctx.fillStyle = clay;
    front.forEach((pt, i) => {
      if (i > upto) return;
      ctx.beginPath();
      ctx.arc(X(pt.t), Y(pt.c), 9, 0, Math.PI * 2);
      ctx.fill();
    });

    // Knee point, the greedy baseline, and the headline figures.
    const late = clamp01((q - 0.72) / 0.28);
    ctx.globalAlpha = late;
    const knee = front.find((pt) => pt.knee)!;
    ctx.strokeStyle = clay;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(X(knee.t), Y(knee.c), 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = ink;
    ctx.font = `500 26px ${mono}`;
    ctx.fillText("knee · selected", X(knee.t) + 40, Y(knee.c) - 20);
    ctx.fillStyle = fog;
    ctx.beginPath();
    ctx.arc(X(greedy.t), Y(greedy.c), 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText("greedy baseline", X(greedy.t) - 250, Y(greedy.c) + 10);

    // Two readouts under the title, each value over its label.
    const [lead, faster] = flagship.metrics;
    [lead, faster].forEach((m, i) => {
      const x = P.l + i * 330;
      ctx.fillStyle = ink;
      ctx.font = `500 60px ${mono}`;
      ctx.fillText(m.value, x, 268);
      ctx.fillStyle = fog;
      ctx.font = `400 22px ${mono}`;
      // The profile's label up to its qualifier: "composite fitness vs greedy
      // baseline" → "composite fitness", "faster delivery (8.02 → 4.67 days)"
      // → "faster delivery".
      ctx.fillText(m.label.split(/ vs | \(/)[0], x, 302);
    });
    ctx.globalAlpha = 1;
    texture.needsUpdate = true;
  };
  draw(0);
  return { texture, draw };
}
