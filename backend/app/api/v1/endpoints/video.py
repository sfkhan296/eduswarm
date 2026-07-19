"""
Video Generation Endpoint

Accepts a video script (plain text, formatted as scenes), generates:
  - Per-scene TTS audio via gTTS
  - Per-scene slide image via Pillow  (rich AI-style design)
  - Stitches everything into an MP4 via moviepy

Returns the MP4 as a streaming binary response.
"""

import io
import logging
import math
import os
import random
import re
import tempfile
import textwrap
import time
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.core.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Design themes ─────────────────────────────────────────────────────────────
THEMES = {
    "animated": {
        "bg_top":      (10,  8,   30),   # deep indigo-black
        "bg_bottom":   (25,  15,  55),   # rich purple-navy
        "glow":        (139, 92,  246),  # violet-500
        "glow2":       (59,  130, 246),  # blue-500
        "accent":      (167, 139, 250),  # violet-300
        "title_fg":    (255, 255, 255),
        "body_fg":     (220, 215, 255),
        "dim_fg":      (120, 100, 180),
        "badge_bg":    (80,  50,  160),
        "badge_fg":    (220, 200, 255),
        "bar_left":    (139, 92,  246),
        "bar_right":   (59,  130, 246),
    },
    "original": {
        "bg_top":      (5,   15,  35),
        "bg_bottom":   (10,  30,  60),
        "glow":        (59,  130, 246),  # blue-500
        "glow2":       (16,  185, 129),  # emerald-500
        "accent":      (147, 197, 253),  # blue-300
        "title_fg":    (255, 255, 255),
        "body_fg":     (210, 225, 255),
        "dim_fg":      (80,  110, 160),
        "badge_bg":    (30,  70,  140),
        "badge_fg":    (180, 210, 255),
        "bar_left":    (59,  130, 246),
        "bar_right":   (16,  185, 129),
    },
    # ── Cartoon / Animation themes ────────────────────────────────────────────
    "anime": {
        "bg_top":      (20,  5,   5),
        "bg_bottom":   (50,  10,  10),
        "glow":        (239, 68,  68),   # red-500
        "glow2":       (251, 191, 36),   # amber-400
        "accent":      (252, 165, 165),  # red-300
        "title_fg":    (255, 255, 255),
        "body_fg":     (255, 220, 220),
        "dim_fg":      (160, 80,  80),
        "badge_bg":    (127, 29,  29),
        "badge_fg":    (254, 202, 202),
        "bar_left":    (239, 68,  68),
        "bar_right":   (251, 191, 36),
    },
    "tomjerry": {
        "bg_top":      (25,  20,  5),
        "bg_bottom":   (50,  40,  10),
        "glow":        (234, 179, 8),    # yellow-500
        "glow2":       (249, 115, 22),   # orange-500
        "accent":      (253, 224, 71),   # yellow-300
        "title_fg":    (255, 255, 255),
        "body_fg":     (255, 245, 200),
        "dim_fg":      (140, 120, 40),
        "badge_bg":    (113, 63,  18),
        "badge_fg":    (254, 240, 138),
        "bar_left":    (234, 179, 8),
        "bar_right":   (249, 115, 22),
    },
    "dora": {
        "bg_top":      (5,   20,  40),
        "bg_bottom":   (10,  40,  80),
        "glow":        (249, 115, 22),   # orange-500
        "glow2":       (234, 179, 8),    # yellow-500
        "accent":      (253, 186, 116),  # orange-300
        "title_fg":    (255, 255, 255),
        "body_fg":     (255, 235, 210),
        "dim_fg":      (140, 90,  40),
        "badge_bg":    (124, 45,  18),
        "badge_fg":    (254, 215, 170),
        "bar_left":    (249, 115, 22),
        "bar_right":   (234, 179, 8),
    },
    "doraemon": {
        "bg_top":      (5,   15,  40),
        "bg_bottom":   (10,  35,  80),
        "glow":        (59,  130, 246),  # blue-500
        "glow2":       (147, 197, 253),  # blue-300
        "accent":      (147, 197, 253),
        "title_fg":    (255, 255, 255),
        "body_fg":     (210, 235, 255),
        "dim_fg":      (70,  110, 170),
        "badge_bg":    (30,  64,  175),
        "badge_fg":    (191, 219, 254),
        "bar_left":    (59,  130, 246),
        "bar_right":   (96,  165, 250),
    },
    "heidi": {
        "bg_top":      (5,   20,  10),
        "bg_bottom":   (10,  45,  20),
        "glow":        (34,  197, 94),   # green-500
        "glow2":       (134, 239, 172),  # green-300
        "accent":      (134, 239, 172),
        "title_fg":    (255, 255, 255),
        "body_fg":     (210, 255, 225),
        "dim_fg":      (60,  120, 80),
        "badge_bg":    (20,  83,  45),
        "badge_fg":    (187, 247, 208),
        "bar_left":    (34,  197, 94),
        "bar_right":   (16,  185, 129),
    },
}


# ── Font loader ───────────────────────────────────────────────────────────────

def _get_font(size: int):
    from PIL import ImageFont
    candidates = [
        "C:/Windows/Fonts/segoeui.ttf",
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def _get_bold_font(size: int):
    from PIL import ImageFont
    candidates = [
        "C:/Windows/Fonts/segoeuib.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return _get_font(size)


# ── Drawing helpers ───────────────────────────────────────────────────────────

def _lerp_color(c1: tuple, c2: tuple, t: float) -> tuple:
    """Linear interpolate between two RGB tuples."""
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def _draw_gradient_bg(img, theme: dict):
    """Vertical gradient background."""
    from PIL import Image
    w, h = img.size
    pixels = img.load()
    for y in range(h):
        t = y / h
        c = _lerp_color(theme["bg_top"], theme["bg_bottom"], t)
        for x in range(w):
            pixels[x, y] = c


def _draw_glow_circle(draw, cx: int, cy: int, radius: int, color: tuple, alpha_max: int = 60):
    """Draw a soft radial glow blob."""
    from PIL import Image, ImageDraw
    steps = 8
    for i in range(steps, 0, -1):
        r = int(radius * i / steps)
        alpha = int(alpha_max * (1 - i / steps))
        overlay_color = color + (alpha,)
        # Use a temporary RGBA layer
        layer = Image.new("RGBA", draw.im.size, (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        ld.ellipse([cx - r, cy - r, cx + r, cy + r], fill=overlay_color)
        # Flatten onto the base (draw is on RGB image so we composite manually)
        base = Image.frombytes("RGB", draw.im.size, draw.im.tobytes())
        base = Image.alpha_composite(base.convert("RGBA"), layer).convert("RGB")
        draw.im.paste(base.tobytes(), (0, 0))


def _draw_particles(draw, w: int, h: int, color: tuple, seed: int = 0):
    """Scatter small glowing dots as background particles."""
    rng = random.Random(seed)
    for _ in range(28):
        x = rng.randint(0, w)
        y = rng.randint(0, h)
        r = rng.randint(1, 3)
        alpha = rng.randint(40, 140)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=color + (alpha,))


def _draw_progress_bar(draw, w: int, h: int, scene_idx: int, total: int, theme: dict):
    """Thin gradient progress bar at the very bottom."""
    bar_h = 5
    y = h - bar_h
    # Background track
    draw.rectangle([0, y, w, h], fill=(30, 30, 60))
    # Filled portion
    progress = (scene_idx + 1) / max(total, 1)
    fill_w = int(w * progress)
    if fill_w > 0:
        # Simulate gradient with steps
        steps = max(fill_w, 1)
        for x in range(fill_w):
            t = x / steps
            c = _lerp_color(theme["bar_left"], theme["bar_right"], t)
            draw.line([(x, y), (x, h)], fill=c)


def _draw_scene_badge(draw, x: int, y: int, label: str, theme: dict):
    """Pill-shaped scene number badge."""
    font = _get_font(20)
    # Measure text
    bbox = draw.textbbox((0, 0), label, font=font)
    tw = bbox[2] - bbox[0]
    pad_x, pad_y = 14, 7
    bw = tw + pad_x * 2
    bh = (bbox[3] - bbox[1]) + pad_y * 2
    # Draw rounded pill (approximate with rectangle + ellipses)
    draw.rectangle([x, y, x + bw, y + bh], fill=theme["badge_bg"])
    draw.text((x + pad_x, y + pad_y), label, font=font, fill=theme["badge_fg"])


def _draw_top_accent_line(draw, w: int, theme: dict):
    """Thin multi-colour accent line at top."""
    draw.rectangle([0, 0, w // 2, 3], fill=theme["glow"])
    draw.rectangle([w // 2, 0, w, 3], fill=theme["glow2"])


def _draw_eduswarm_brand(draw, w: int, h: int, theme: dict):
    """EduSwarm branding — bottom-right, dim."""
    font = _get_font(18)
    text = "✦ EduSwarm"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text((w - tw - 28, h - 34), text, font=font, fill=theme["dim_fg"])


def _render_slide(
    scene: dict,
    scene_idx: int,
    total_scenes: int,
    width: int,
    height: int,
    theme: dict,
) -> "Image":
    """Render a rich AI-style slide for one scene."""
    from PIL import Image, ImageDraw

    # ── Base canvas ──────────────────────────────────────────────────────────
    img = Image.new("RGB", (width, height), theme["bg_top"])
    _draw_gradient_bg(img, theme)

    # ── RGBA overlay layer for glows + particles ─────────────────────────────
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)

    # Glow blobs
    _draw_particles(odraw, width, height, theme["glow"], seed=scene_idx)
    # Two large glow circles off-canvas edges
    odraw.ellipse([-120, -120, 340, 340],
                  fill=theme["glow"] + (18,))
    odraw.ellipse([width - 300, height - 300, width + 150, height + 150],
                  fill=theme["glow2"] + (22,))
    # Subtle centre glow
    cx, cy = width // 2, height // 2
    for r, a in [(360, 8), (220, 14), (120, 20)]:
        odraw.ellipse([cx - r, cy - r, cx + r, cy + r],
                      fill=theme["glow"] + (a,))

    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

    draw = ImageDraw.Draw(img)

    # ── Top accent line ──────────────────────────────────────────────────────
    _draw_top_accent_line(draw, width, theme)

    # ── Scene badge ──────────────────────────────────────────────────────────
    _draw_scene_badge(draw, 48, 28, scene["label"].upper(), theme)

    # ── Visual / title block ─────────────────────────────────────────────────
    title_font = _get_bold_font(42)
    sub_font   = _get_font(27)
    body_font  = _get_font(25)

    margin = 64
    y = 100

    # Title: first 60 chars of visual description, wrapped to 2 lines
    title_text = scene["visual"][:90]
    title_lines = textwrap.wrap(title_text, width=46)[:2]
    for line in title_lines:
        draw.text((margin, y), line, font=title_font, fill=theme["title_fg"])
        y += 52
    y += 10

    # Glowing underline beneath title
    underline_w = min(width - margin * 2, 500)
    for thickness, color, alpha in [(4, theme["glow"], 255), (10, theme["glow"], 80), (20, theme["glow"], 30)]:
        draw.rectangle(
            [margin, y, margin + underline_w, y + thickness],
            fill=color + (alpha,) if len(color) == 3 else color,
        )
    y += 30

    # ── Narrator body text ───────────────────────────────────────────────────
    narrator_clean = re.sub(r"\s+", " ", scene["narrator"]).strip()
    body_lines = textwrap.wrap(narrator_clean, width=72)

    # How many lines fit before hitting progress bar area
    max_lines = min(len(body_lines), 7)
    for line in body_lines[:max_lines]:
        draw.text((margin, y), line, font=body_font, fill=theme["body_fg"])
        y += 38

    # ── Progress bar ────────────────────────────────────────────────────────
    _draw_progress_bar(draw, width, height, scene_idx, total_scenes, theme)

    # ── EduSwarm brand ───────────────────────────────────────────────────────
    _draw_eduswarm_brand(draw, width, height, theme)

    return img


# ── Scene parser ──────────────────────────────────────────────────────────────

def _parse_scenes(script: str) -> list[dict]:
    scenes: list[dict] = []
    blocks = re.split(r"\[Scene\s*\d+\]|Scene\s*\d+[:\.]", script, flags=re.IGNORECASE)
    blocks = [b.strip() for b in blocks if b.strip()]

    for i, block in enumerate(blocks):
        visual_match = re.search(
            r"Visual[:\s]+(.+?)(?=Narrator|NARRATOR|\[|$)", block,
            re.IGNORECASE | re.DOTALL,
        )
        narrator_match = re.search(
            r"(?:Narrator|NARRATOR)(?:\s*\([^)]*\))?[:\s]+(.+?)(?=\[Transition\]|\[Scene|\n\n|$)",
            block,
            re.IGNORECASE | re.DOTALL,
        )

        visual   = visual_match.group(1).strip()   if visual_match   else block[:120].strip()
        narrator = narrator_match.group(1).strip() if narrator_match else block.strip()

        visual   = visual.split("|")[0].strip()
        narrator = narrator.split("|")[0].strip()

        if not narrator:
            continue

        scenes.append({
            "label":    f"Scene {i + 1}",
            "visual":   visual or f"Scene {i + 1}",
            "narrator": narrator,
        })

    if not scenes:
        scenes = [{"label": "Scene 1", "visual": "EduSwarm", "narrator": script.strip()}]

    return scenes


# ── Video builder ─────────────────────────────────────────────────────────────

def _make_video(scenes: list[dict], language: str, style: str, tmp_dir: str) -> str:
    from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips
    from gtts import gTTS

    theme = THEMES.get(style, THEMES["animated"])
    width, height = 1280, 720
    total = len(scenes)
    clips = []

    for idx, scene in enumerate(scenes):
        # TTS audio
        tts_path = os.path.join(tmp_dir, f"audio_{idx}.mp3")
        try:
            gTTS(text=scene["narrator"], lang=language, slow=False).save(tts_path)
        except Exception as exc:
            logger.warning("gTTS failed scene %d (%s): %s", idx, language, exc)
            try:
                gTTS(text=scene["narrator"], lang="en", slow=False).save(tts_path)
            except Exception:
                tts_path = None

        # Slide image
        slide_path = os.path.join(tmp_dir, f"slide_{idx}.png")
        slide_img = _render_slide(scene, idx, total, width, height, theme)
        slide_img.save(slide_path)

        # Assemble clip
        if tts_path and os.path.exists(tts_path):
            audio_clip = AudioFileClip(tts_path)
            clip = ImageClip(slide_path, duration=audio_clip.duration).set_audio(audio_clip)
        else:
            clip = ImageClip(slide_path, duration=4.0)

        clips.append(clip.set_fps(24))

    if not clips:
        raise ValueError("No clips generated — script may be empty.")

    final = concatenate_videoclips(clips, method="compose")
    output_path = os.path.join(tmp_dir, "output.mp4")
    final.write_videofile(
        output_path,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        logger=None,
        threads=2,
    )
    for c in clips:
        try:
            c.close()
        except Exception:
            pass
    final.close()
    return output_path


# ── Schemas ───────────────────────────────────────────────────────────────────

class VideoRequest(BaseModel):
    script: str  = Field(..., min_length=10)
    language: str = Field(default="en")
    style: str    = Field(default="animated")
    topic: str    = Field(default="lesson")


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/", summary="Generate an MP4 video from a script", response_class=StreamingResponse)
async def generate_video(
    body: VideoRequest,
    current_user: dict = Depends(get_current_user),
) -> StreamingResponse:
    user_id = current_user.get("sub", "anonymous")
    logger.info("Video request user=%s style=%s lang=%s", user_id, body.style, body.language)

    lang = body.language.lower().split("-")[0]
    gtts_lang_code = {"zh": "zh-CN"}.get(lang, lang)

    scenes = _parse_scenes(body.script)[:20]
    if not scenes:
        raise HTTPException(status_code=422, detail="Could not parse scenes from the script.")

    try:
        with tempfile.TemporaryDirectory() as tmp_dir:
            output_path = _make_video(scenes, gtts_lang_code, body.style, tmp_dir)
            with open(output_path, "rb") as f:
                video_bytes = f.read()
    except Exception as exc:
        logger.exception("Video generation failed for user=%s", user_id)
        raise HTTPException(status_code=500, detail=f"Video generation failed: {exc}") from exc

    # Clean timestamp-based filename — never exposes the user's prompt
    timestamp = int(time.time())
    filename = f"eduswarm_video_{timestamp}.mp4"

    return StreamingResponse(
        io.BytesIO(video_bytes),
        media_type="video/mp4",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(video_bytes)),
            "Cache-Control": "no-store",
        },
    )
