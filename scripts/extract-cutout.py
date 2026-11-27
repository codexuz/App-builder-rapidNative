#!/usr/bin/env python3
"""
Clean Background Extraction & Transparent Cutout Utility (Pure Pillow / Zero Extra Deps)

Converts AI-generated assets shot on clean solid backgrounds (chroma-key green,
chroma-key magenta, pure white, or auto-detected uniform studio backdrops) into
razor-sharp, anti-aliased, spill-decontaminated, tightly auto-cropped RGBA PNGs
ready to float seamlessly on any light, dark, or gradient mobile UI surface.
"""

from __future__ import annotations

import argparse
import math
from collections import deque
from pathlib import Path
from typing import Tuple
from PIL import Image, ImageDraw, ImageFilter


def parse_hex_color(value: str) -> Tuple[int, int, int]:
    cleaned = value.lstrip("#")
    if len(cleaned) != 6:
        raise ValueError(f"Expected 6-digit hex color, got: {value}")
    return (int(cleaned[0:2], 16), int(cleaned[2:4], 16), int(cleaned[4:6], 16))


def sample_border_color(img: Image.Image) -> Tuple[int, int, int]:
    """Sample median RGB across the 4 edges of the image."""
    w, h = img.size
    px = img.load()
    rs, gs, bs = [], [], []
    step_x = max(1, w // 40)
    step_y = max(1, h // 40)

    for x in range(0, w, step_x):
        for y in (0, 1, h - 2, h - 1):
            r, g, b = px[x, y][:3]
            rs.append(r)
            gs.append(g)
            bs.append(b)
    for y in range(0, h, step_y):
        for x in (0, 1, w - 2, w - 1):
            r, g, b = px[x, y][:3]
            rs.append(r)
            gs.append(g)
            bs.append(b)

    rs.sort()
    gs.sort()
    bs.sort()
    mid = len(rs) // 2
    return (rs[mid], gs[mid], bs[mid])


def detect_mode(bg: Tuple[int, int, int]) -> str:
    r, g, b = bg
    if g > 140 and g - max(r, b) > 55:
        return "chroma-green"
    if r > 140 and b > 140 and min(r, b) - g > 55:
        return "chroma-magenta"
    if r > 225 and g > 225 and b > 225:
        return "white"
    return "solid"


def color_dist(a: Tuple[int, int, int], b: Tuple[int, int, int]) -> float:
    dr = a[0] - b[0]
    dg = a[1] - b[1]
    db = a[2] - b[2]
    return math.sqrt(dr * dr + dg * dg + db * db)


def is_green_key(r: int, g: int, b: int, bg: Tuple[int, int, int], tol: float) -> bool:
    # Either close to sampled bg OR strongly green-dominant (handles subtle studio lighting gradients)
    if color_dist((r, g, b), bg) <= tol:
        return True
    green_dom = g - max(r, b)
    return g > 110 and green_dom > 45 and color_dist((r, g, b), bg) <= tol * 1.9


def is_magenta_key(r: int, g: int, b: int, bg: Tuple[int, int, int], tol: float) -> bool:
    if color_dist((r, g, b), bg) <= tol:
        return True
    mag_dom = min(r, b) - g
    return r > 110 and b > 110 and mag_dom > 45 and color_dist((r, g, b), bg) <= tol * 1.9


def extract_cutout(
    input_path: Path,
    output_path: Path,
    mode: str = "auto",
    bg_hex: str | None = None,
    tolerance: float = 72.0,
    feather: float = 36.0,
    pad_ratio: float = 0.04,
    max_size: int = 512,
    preview_path: Path | None = None,
) -> dict:
    src = Image.open(input_path).convert("RGBA")
    w, h = src.size
    px = src.load()

    bg = parse_hex_color(bg_hex) if bg_hex else sample_border_color(src)
    resolved_mode = detect_mode(bg) if mode == "auto" else mode

    # 1. Border-connected flood fill to identify exterior background region
    visited = bytearray(w * h)
    bg_mask = bytearray(w * h)  # 1 = definite exterior background
    q: deque[Tuple[int, int]] = deque()

    def matches_bg(r: int, g: int, b: int, tol: float) -> bool:
        if resolved_mode == "chroma-green":
            return is_green_key(r, g, b, bg, tol)
        if resolved_mode == "chroma-magenta":
            return is_magenta_key(r, g, b, bg, tol)
        return color_dist((r, g, b), bg) <= tol

    # Seed from all 4 image edges
    for x in range(w):
        for y in (0, h - 1):
            idx = y * w + x
            if not visited[idx]:
                r, g, b, _ = px[x, y]
                if matches_bg(r, g, b, tolerance):
                    visited[idx] = 1
                    bg_mask[idx] = 1
                    q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            idx = y * w + x
            if not visited[idx]:
                r, g, b, _ = px[x, y]
                if matches_bg(r, g, b, tolerance):
                    visited[idx] = 1
                    bg_mask[idx] = 1
                    q.append((x, y))

    while q:
        cx, cy = q.popleft()
        for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny * w + nx
                if not visited[nidx]:
                    r, g, b, _ = px[nx, ny]
                    if matches_bg(r, g, b, tolerance):
                        visited[nidx] = 1
                        bg_mask[nidx] = 1
                        q.append((nx, ny))

    # For chroma-key backgrounds, also remove enclosed holes (e.g., between trophy handles or legs)
    # where pixels are unmistakable pure chroma green/magenta.
    if resolved_mode in ("chroma-green", "chroma-magenta"):
        strict_tol = tolerance * 0.72
        for y in range(h):
            row_off = y * w
            for x in range(w):
                idx = row_off + x
                if bg_mask[idx]:
                    continue
                r, g, b, _ = px[x, y]
                if resolved_mode == "chroma-green":
                    if g > 140 and (g - max(r, b)) > 65 and color_dist((r, g, b), bg) <= strict_tol * 1.6:
                        bg_mask[idx] = 1
                else:
                    if r > 140 and b > 140 and (min(r, b) - g) > 65 and color_dist((r, g, b), bg) <= strict_tol * 1.6:
                        bg_mask[idx] = 1

    # 2. Identify a 3px boundary band around bg_mask for soft alpha + despill
    dist_to_bg = bytearray(w * h)  # 0 = interior, 1 = bg, 2..4 = border rings
    frontier: list[Tuple[int, int]] = []
    for y in range(h):
        row_off = y * w
        for x in range(w):
            idx = row_off + x
            if bg_mask[idx]:
                dist_to_bg[idx] = 1
                continue
            # Check 4-neighbors
            if (
                (x > 0 and bg_mask[idx - 1])
                or (x < w - 1 and bg_mask[idx + 1])
                or (y > 0 and bg_mask[idx - w])
                or (y < h - 1 and bg_mask[idx + w])
            ):
                dist_to_bg[idx] = 2
                frontier.append((x, y))

    for ring in (3, 4):
        next_frontier: list[Tuple[int, int]] = []
        for cx, cy in frontier:
            for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                if 0 <= nx < w and 0 <= ny < h:
                    nidx = ny * w + nx
                    if dist_to_bg[nidx] == 0:
                        dist_to_bg[nidx] = ring
                        next_frontier.append((nx, ny))
        frontier = next_frontier

    # 3. Compute RGBA output with soft matte & chroma spill decontamination
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    opx = out.load()

    hi = tolerance + feather
    for y in range(h):
        row_off = y * w
        for x in range(w):
            idx = row_off + x
            d_ring = dist_to_bg[idx]
            if d_ring == 1:
                continue  # transparent background

            r, g, b, a = px[x, y]

            if d_ring >= 2:
                # Soft alpha on fringe pixels close to bg color
                d = color_dist((r, g, b), bg)
                if resolved_mode == "chroma-green":
                    green_excess = g - max(r, b)
                    if d_ring == 2 and (green_excess > 18 or d < hi):
                        # Smooth ramp based on green dominance and bg distance
                        t_dist = max(0.0, min(1.0, (d - tolerance * 0.75) / max(1.0, feather * 1.4)))
                        t_green = max(0.0, min(1.0, 1.0 - (green_excess - 10.0) / 55.0))
                        alpha = int(round(255 * min(t_dist, t_green)))
                    elif d_ring == 3 and green_excess > 24:
                        alpha = int(round(255 * max(0.0, min(1.0, 1.0 - (green_excess - 20.0) / 50.0))))
                    else:
                        alpha = 255

                    # Broadcast chroma-green despill on boundary rings
                    max_rb = max(r, b)
                    if g > max_rb:
                        spill = g - max_rb
                        # Suppress green spill; subtly restore warm luminance so edges never look gray
                        g = max_rb
                        r = min(255, int(r + spill * 0.12))
                        b = min(255, int(b + spill * 0.06))
                elif resolved_mode == "chroma-magenta":
                    mag_excess = min(r, b) - g
                    if d_ring == 2 and (mag_excess > 18 or d < hi):
                        t_dist = max(0.0, min(1.0, (d - tolerance * 0.75) / max(1.0, feather * 1.4)))
                        t_mag = max(0.0, min(1.0, 1.0 - (mag_excess - 10.0) / 55.0))
                        alpha = int(round(255 * min(t_dist, t_mag)))
                    else:
                        alpha = 255
                    if r > g and b > g and mag_excess > 0:
                        r = max(g, r - int(mag_excess * 0.6))
                        b = max(g, b - int(mag_excess * 0.6))
                else:
                    if d_ring == 2 and d < hi:
                        t = max(0.0, min(1.0, (d - tolerance * 0.8) / max(1.0, feather)))
                        alpha = int(round(255 * t))
                    else:
                        alpha = 255
                    # Decontaminate white/solid halo on semi-transparent pixels
                    if 0 < alpha < 255:
                        af = alpha / 255.0
                        r = max(0, min(255, int((r - bg[0] * (1.0 - af)) / af)))
                        g = max(0, min(255, int((g - bg[1] * (1.0 - af)) / af)))
                        b = max(0, min(255, int((b - bg[2] * (1.0 - af)) / af)))

                opx[x, y] = (r, g, b, alpha)
            else:
                # Interior pixel: also softly despill any stray green bounce on edges of white fur
                if resolved_mode == "chroma-green":
                    max_rb = max(r, b)
                    if g > max_rb + 18 and g > 130:
                        g = int(max_rb + (g - max_rb) * 0.25)
                opx[x, y] = (r, g, b, 255)

    # 4. Very subtle 0.6px anti-alias polish on alpha channel (removes jagged stair-stepping)
    r_ch, g_ch, b_ch, a_ch = out.split()
    a_smooth = a_ch.filter(ImageFilter.GaussianBlur(radius=0.55))
    # Keep interior solid and exterior clean zero while smoothing only edge transitions
    apx_orig = a_ch.load()
    apx_sm = a_smooth.load()
    for y in range(h):
        for x in range(w):
            orig = apx_orig[x, y]
            sm = apx_sm[x, y]
            if orig == 0 and sm < 28:
                apx_sm[x, y] = 0
            elif orig == 255 and sm > 225:
                apx_sm[x, y] = 255
    out = Image.merge("RGBA", (r_ch, g_ch, b_ch, a_smooth))

    # 5. Tight bounding-box auto-crop (ignore stray specks alpha < 20)
    alpha_mask = out.getchannel("A").point(lambda v: 255 if v >= 20 else 0)
    bbox = alpha_mask.getbbox()
    if bbox:
        cropped = out.crop(bbox)
        cw, ch = cropped.size
        side = max(cw, ch)
        pad = int(round(side * pad_ratio))
        canvas_size = side + pad * 2
        square = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
        square.paste(cropped, ((canvas_size - cw) // 2, (canvas_size - ch) // 2), cropped)
        out = square

    # 6. Downscale cleanly with LANCZOS for crisp mobile Retina PNG
    if max_size > 0 and max(out.size) > max_size:
        out.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    out.save(output_path, format="PNG", optimize=True)

    # Optional 2x2 verification sheet on blue, orange, midnight, and white cards
    if preview_path is not None:
        tile = 256
        sheet = Image.new("RGB", (tile * 2, tile * 2), (255, 255, 255))
        draw = ImageDraw.Draw(sheet)
        swatches = [
            ((0, 0), (30, 136, 255)),      # Skyburst Blue
            ((tile, 0), (249, 115, 22)),   # Quest Orange
            ((0, tile), (17, 24, 39)),     # Midnight Stadium
            ((tile, tile), (242, 246, 253)),  # Cloud White
        ]
        thumb = out.copy()
        thumb.thumbnail((tile - 32, tile - 32), Image.Resampling.LANCZOS)
        for (ox, oy), col in swatches:
            draw.rectangle([ox, oy, ox + tile, oy + tile], fill=col)
            tx = ox + (tile - thumb.width) // 2
            ty = oy + (tile - thumb.height) // 2
            sheet.paste(thumb, (tx, ty), thumb)
        preview_path.parent.mkdir(parents=True, exist_ok=True)
        sheet.save(preview_path, format="PNG")

    return {
        "input": str(input_path),
        "output": str(output_path),
        "detectedBg": f"#{bg[0]:02x}{bg[1]:02x}{bg[2]:02x}",
        "mode": resolved_mode,
        "width": out.width,
        "height": out.height,
        "bytes": output_path.stat().st_size,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract clean transparent PNG cutout from solid background.")
    parser.add_argument("input", type=Path, help="Input image path")
    parser.add_argument("output", type=Path, help="Output RGBA PNG path")
    parser.add_argument("--mode", choices=["auto", "chroma-green", "chroma-magenta", "white", "solid"], default="auto")
    parser.add_argument("--bg-color", default=None, help="Override background hex color (e.g. #00FF00)")
    parser.add_argument("--tolerance", type=float, default=72.0, help="RGB flood-fill tolerance")
    parser.add_argument("--feather", type=float, default=36.0, help="Edge soft-alpha transition width")
    parser.add_argument("--pad", type=float, default=0.04, help="Uniform square padding ratio")
    parser.add_argument("--max-size", type=int, default=512, help="Max output dimension in px")
    parser.add_argument("--preview", type=Path, default=None, help="Optional 2x2 swatch QA sheet output path")
    args = parser.parse_args()

    result = extract_cutout(
        input_path=args.input,
        output_path=args.output,
        mode=args.mode,
        bg_hex=args.bg_color,
        tolerance=args.tolerance,
        feather=args.feather,
        pad_ratio=args.pad,
        max_size=args.max_size,
        preview_path=args.preview,
    )
    print(
        f"CUTOUT_OK {result['output']} ({result['width']}x{result['height']}, "
        f"{result['bytes'] // 1024}KB, bg={result['detectedBg']}, mode={result['mode']})"
    )


if __name__ == "__main__":
    main()
