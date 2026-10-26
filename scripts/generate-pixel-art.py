#!/usr/bin/env python3
"""Generate deterministic 16-bit inspired scene art for fanren-wiki."""
from __future__ import annotations

import math
import random
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SCENES_DIR = ROOT / "public" / "game" / "scenes"
ACTIONS_DIR = ROOT / "public" / "game" / "actions"
BASE_W, BASE_H, SCALE = 192, 108, 3


def hx(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def mix(a: str, b: str, t: float) -> tuple[int, int, int]:
    aa, bb = hx(a), hx(b)
    return tuple(round(aa[i] * (1 - t) + bb[i] * t) for i in range(3))


def rect(d: ImageDraw.ImageDraw, box, fill):
    d.rectangle(tuple(round(v) for v in box), fill=fill)


def line(d, points, fill, width=1):
    d.line([(round(x), round(y)) for x, y in points], fill=fill, width=width)


def poly(d, points, fill):
    d.polygon([(round(x), round(y)) for x, y in points], fill=fill)


class Scene:
    def __init__(self, name: str, palette: dict[str, str], seed: int):
        self.name = name
        self.p = palette
        self.rng = random.Random(seed)
        self.img = Image.new("RGB", (BASE_W, BASE_H), hx(palette["sky"]))
        self.d = ImageDraw.Draw(self.img, "RGBA")

    def sky(self, stars: int = 0, moon: tuple[int, int, int] | None = None, sun: tuple[int, int, int] | None = None):
        p = self.p
        bands = 8
        for i in range(bands):
            t = i / (bands - 1)
            rect(self.d, (0, i * 14, BASE_W, (i + 1) * 14 + 1), mix(p["sky"], p["horizon"], t * .72))
        for _ in range(stars):
            x, y = self.rng.randrange(BASE_W), self.rng.randrange(52)
            c = mix(p["mist"], "#ffffff", self.rng.random() * .6)
            self.d.point((x, y), fill=c)
        if moon:
            self.celestial(*moon, "moon")
        if sun:
            self.celestial(*sun, "sun")

    def celestial(self, x, y, r, kind="moon"):
        p = self.p
        glow = p.get("glow", "#d4a843")
        for rr in range(r + 8, r, -2):
            alpha = max(6, 26 - (rr - r) * 3)
            self.d.ellipse((x - rr, y - rr, x + rr, y + rr), fill=(*hx(glow), alpha))
        fill = mix(p["mist"], "#ffffff", .65) if kind == "moon" else p.get("accent", "#d4a843")
        self.d.ellipse((x - r, y - r, x + r, y + r), fill=fill)
        if kind == "moon" and r >= 8:
            self.d.ellipse((x - r // 2, y - r // 3, x + r // 5, y + r // 2), fill=mix(p["mist"], p["sky"], .25))

    def mountains(self, baseline=74, layers=3):
        p = self.p
        colors = [p["far"], p["mid"], p["near"]]
        for layer in range(layers):
            base = baseline + layer * 9
            color = colors[min(layer, len(colors) - 1)]
            points = [(0, BASE_H), (0, base + 7)]
            x = 0
            peak = 17 + layer * 5
            while x < BASE_W:
                step = self.rng.randrange(12, 25)
                y = base - self.rng.randrange(2, peak)
                points.append((x + step // 2, y))
                points.append((x + step, base + self.rng.randrange(-4, 6)))
                x += step
            points.extend([(BASE_W, BASE_H)])
            poly(self.d, points, color)
        self.mist(baseline + 2)

    def mist(self, y=74, rows=4):
        p = self.p
        for i in range(rows):
            yy = y + i * 4 + self.rng.randrange(-1, 2)
            width = self.rng.randrange(34, 110)
            x = self.rng.randrange(-20, BASE_W - 20)
            self.d.rectangle((x, yy, x + width, yy + 1), fill=(*hx(p["mist"]), 50 - i * 6))

    def ground(self, y=92, color=None):
        p = self.p
        poly(self.d, [(0, y), (35, y - 2), (76, y + 1), (123, y - 1), (164, y + 2), (192, y - 1), (192, 108), (0, 108)], color or p["ground"])
        for _ in range(25):
            x, yy = self.rng.randrange(BASE_W), self.rng.randrange(y, BASE_H)
            self.d.point((x, yy), fill=mix(p["ground"], p["highlight"], self.rng.random() * .35))

    def tree(self, x, y, scale=1.0, dead=False):
        p = self.p
        trunk = p["ink"] if dead else mix(p["near"], p["ink"], .25)
        rect(self.d, (x - 1 * scale, y - 18 * scale, x + 1 * scale, y), trunk)
        if dead:
            line(self.d, [(x, y - 14 * scale), (x - 9 * scale, y - 23 * scale)], trunk, max(1, round(scale)))
            line(self.d, [(x, y - 11 * scale), (x + 10 * scale, y - 20 * scale)], trunk, max(1, round(scale)))
        else:
            for dy, spread in [(-13, 10), (-18, 8), (-22, 5)]:
                self.d.ellipse((x - spread * scale, y + dy * scale - 4 * scale, x + spread * scale, y + dy * scale + 5 * scale), fill=mix(p["near"], p["accent"], .14))
            for _ in range(10):
                self.d.point((x + self.rng.randrange(-9, 10) * scale, y + self.rng.randrange(-25, -10) * scale), fill=p["highlight"])

    def pagoda(self, x, y, scale=1.0, lit=True):
        p = self.p
        stone = p["near"]
        roof = p["ink"]
        for i, (w, h) in enumerate([(24, 8), (19, 7), (14, 6)]):
            yy = y - (i * 10 + h) * scale
            rect(self.d, (x - w * scale / 2, yy, x + w * scale / 2, yy + h * scale), stone)
            poly(self.d, [(x - (w + 5) * scale / 2, yy), (x + (w + 5) * scale / 2, yy), (x + (w + 2) * scale / 2, yy - 3 * scale), (x - (w + 2) * scale / 2, yy - 3 * scale)], roof)
        if lit:
            rect(self.d, (x - 1 * scale, y - 8 * scale, x + 1 * scale, y - 5 * scale), p["accent"])

    def hall(self, x=96, y=95, scale=1.0):
        p = self.p
        base = p["near"]
        rect(self.d, (x - 38 * scale, y - 18 * scale, x + 38 * scale, y), base)
        for xx in range(round(x - 31 * scale), round(x + 32 * scale), round(12 * scale)):
            rect(self.d, (xx, y - 17 * scale, xx + 2 * scale, y), p["ink"])
        poly(self.d, [(x - 49 * scale, y - 18 * scale), (x + 49 * scale, y - 18 * scale), (x + 37 * scale, y - 25 * scale), (x - 37 * scale, y - 25 * scale)], p["ink"])
        rect(self.d, (x - 6 * scale, y - 13 * scale, x + 6 * scale, y - 1 * scale), p["accent"])

    def figure(self, x, y, robe=None, scale=1.0, halo=False):
        p = self.p
        robe = robe or p["highlight"]
        if halo:
            self.d.ellipse((x - 8 * scale, y - 19 * scale, x + 8 * scale, y - 2 * scale), fill=(*hx(p.get("glow", p["accent"])), 32))
        rect(self.d, (x - 3 * scale, y - 13 * scale, x + 3 * scale, y - 1 * scale), robe)
        self.d.ellipse((x - 2 * scale, y - 17 * scale, x + 2 * scale, y - 13 * scale), fill=mix(p["mist"], "#ffffff", .4))
        line(self.d, [(x - 3 * scale, y - 10 * scale), (x - 7 * scale, y - 5 * scale)], robe)
        line(self.d, [(x + 3 * scale, y - 10 * scale), (x + 7 * scale, y - 6 * scale)], robe)

    def sword(self, x, y, length=24, color=None, tilt=0.0):
        c = color or self.p["mist"]
        pts = [(x - math.sin(tilt) * length, y + math.cos(tilt) * length), (x, y), (x + math.sin(tilt) * length, y - math.cos(tilt) * length)]
        line(self.d, pts, c, 2)
        line(self.d, [(x - math.sin(tilt) * length * .2, y + math.cos(tilt) * length * .2), (x + math.sin(tilt) * length * .2, y - math.cos(tilt) * length * .2)], self.p["accent"])

    def rain(self, count=80, slant=2):
        for _ in range(count):
            x, y = self.rng.randrange(BASE_W), self.rng.randrange(BASE_H)
            line(self.d, [(x, y), (x - slant, y + self.rng.randrange(3, 8))], (*hx(self.p["mist"]), 95))

    def particles(self, count=24, color=None, ymax=96):
        color = color or self.p.get("glow", self.p["accent"])
        for _ in range(count):
            x, y = self.rng.randrange(BASE_W), self.rng.randrange(28, ymax)
            r = self.rng.choice([0, 0, 0, 1])
            self.d.ellipse((x - r, y - r, x + r, y + r), fill=(*hx(color), self.rng.randrange(100, 220)))

    def circle(self, x, y, r, color=None, width=1):
        color = color or self.p.get("glow", self.p["accent"])
        self.d.ellipse((x - r, y - r, x + r, y + r), outline=color, width=width)
        self.d.ellipse((x - r // 2, y - r // 2, x + r // 2, y + r // 2), outline=color, width=max(1, width // 2))

    def book(self, x, y, scale=1.0):
        p = self.p
        rect(self.d, (x - 10 * scale, y - 7 * scale, x + 10 * scale, y + 7 * scale), p["ink"])
        rect(self.d, (x - 8 * scale, y - 9 * scale, x, y + 7 * scale), mix(p["near"], p["ink"], .2))
        rect(self.d, (x, y - 9 * scale, x + 8 * scale, y + 7 * scale), p["near"])
        self.d.ellipse((x - 3 * scale, y - 4 * scale, x + 3 * scale, y + 2 * scale), outline=p["accent"])

    def gate(self, x, y, scale=1.0):
        p = self.p
        col = p["near"]
        rect(self.d, (x - 27 * scale, y - 55 * scale, x - 23 * scale, y), col)
        rect(self.d, (x + 23 * scale, y - 55 * scale, x + 27 * scale, y), col)
        rect(self.d, (x - 33 * scale, y - 58 * scale, x + 33 * scale, y - 53 * scale), p["ink"])
        poly(self.d, [(x - 29 * scale, y - 58 * scale), (x + 29 * scale, y - 58 * scale), (x + 22 * scale, y - 64 * scale), (x - 22 * scale, y - 64 * scale)], p["ink"])
        rect(self.d, (x - 15 * scale, y - 54 * scale, x + 15 * scale, y - 3 * scale), (*hx(p.get("glow", p["accent"])), 60))

    def boat(self, x, y, scale=1.0):
        p = self.p
        poly(self.d, [(x - 17 * scale, y), (x + 17 * scale, y), (x + 11 * scale, y + 5 * scale), (x - 11 * scale, y + 5 * scale)], p["ink"])
        line(self.d, [(x, y), (x, y - 22 * scale)], p["mist"], 2)
        poly(self.d, [(x + 1 * scale, y - 20 * scale), (x + 18 * scale, y - 6 * scale), (x + 1 * scale, y - 6 * scale)], p["near"])

    def save(self):
        SCENES_DIR.mkdir(parents=True, exist_ok=True)
        out = self.img.resize((BASE_W * SCALE, BASE_H * SCALE), Image.Resampling.NEAREST)
        out.save(SCENES_DIR / f"{self.name}.png", optimize=True)


PALETTES = {
    "green": {"sky": "#07110d", "horizon": "#173b2b", "far": "#14261d", "mid": "#0d1d16", "near": "#09130f", "ground": "#060b09", "ink": "#030706", "mist": "#8fa79a", "highlight": "#d6e2db", "glow": "#4ade9a", "accent": "#6fedb5"},
    "gold": {"sky": "#140f07", "horizon": "#4a3213", "far": "#342612", "mid": "#21180d", "near": "#151008", "ground": "#0a0704", "ink": "#050302", "mist": "#cbb98e", "highlight": "#f1dfb4", "glow": "#d4a843", "accent": "#f0c96b"},
    "blue": {"sky": "#07101b", "horizon": "#19395d", "far": "#142a43", "mid": "#0e1d2e", "near": "#08131f", "ground": "#050a10", "ink": "#020507", "mist": "#a4b8ca", "highlight": "#d8e7f1", "glow": "#6ea8fe", "accent": "#8bc4ff"},
    "violet": {"sky": "#100a19", "horizon": "#3a2455", "far": "#2a1a3d", "mid": "#1a1027", "near": "#100a18", "ground": "#08050d", "ink": "#030205", "mist": "#b5a6c8", "highlight": "#e7dcf4", "glow": "#b78bff", "accent": "#cdb0ff"},
    "red": {"sky": "#170808", "horizon": "#51201d", "far": "#341815", "mid": "#22100e", "near": "#140907", "ground": "#090403", "ink": "#040202", "mist": "#c9a09a", "highlight": "#f2d4cf", "glow": "#ef4444", "accent": "#ff7c72"},
    "jade": {"sky": "#071311", "horizon": "#21483d", "far": "#18332b", "mid": "#10231d", "near": "#091610", "ground": "#050c09", "ink": "#020605", "mist": "#9bbdb0", "highlight": "#d5eee4", "glow": "#80c8b5", "accent": "#a5ead7"},
}


def paint_wanderer(sc: Scene):
    sc.sky(stars=18, moon=(154, 26, 10)); sc.mountains(71); sc.mist(68, 5); sc.ground(91)
    for x in [25, 165]: sc.tree(x, 92, 1.1, dead=True)
    poly(sc.d, [(70, 108), (88, 73), (108, 66), (129, 108)], sc.p["far"])
    sc.figure(57, 95, robe="#39443d", scale=1.15)
    sc.figure(139, 98, robe="#786548", scale=1.0)
    rect(sc.d, (137, 96, 142, 101), sc.p["accent"])
    sc.rain(120, 2)


def paint_beast(sc: Scene):
    sc.sky(stars=34, moon=(146, 22, 9)); sc.mountains(66); sc.mist(62, 5); sc.ground(90)
    for x in [22, 44, 154, 175]: sc.tree(x, 94, .8)
    sc.tree(98, 100, 1.8)
    for x in [77, 101, 115]:
        sc.d.ellipse((x, 73, x + 4, 77), fill=(*hx(sc.p["glow"]), 220))
    sc.figure(96, 97, robe="#5f735f", scale=1.1)
    sc.particles(26, "#a7e8bb", 88)


def paint_tomb(sc: Scene):
    sc.sky(stars=20, moon=(38, 20, 8)); sc.mountains(60); sc.mist(59, 5); sc.ground(92)
    poly(sc.d, [(55, 108), (71, 36), (82, 20), (92, 58), (112, 108)], sc.p["far"])
    rect(sc.d, (80, 54, 112, 102), sc.p["near"])
    rect(sc.d, (88, 66, 105, 102), sc.p["ink"])
    for i in range(5): rect(sc.d, (91 - i, 99 + i, 102 + i, 101 + i), mix(sc.p["near"], sc.p["highlight"], .1))
    sc.particles(30, sc.p["glow"], 94)
    for x in [49, 134]: sc.tree(x, 97, .8, dead=True)


def paint_sect(sc: Scene):
    sc.sky(stars=12, moon=(150, 19, 7)); sc.mountains(67); sc.ground(92); sc.hall(96, 91, 1.25)
    rect(sc.d, (24, 34, 29, 91), sc.p["ink"]); rect(sc.d, (24, 35, 41, 50), "#5d302f")
    rect(sc.d, (163, 34, 168, 91), sc.p["ink"]); rect(sc.d, (150, 35, 167, 50), "#233d5b")
    sc.figure(78, 100, "#8f6a47", .9); sc.figure(114, 100, "#506b72", .9)
    sc.particles(18, "#f3d48a", 90)


def paint_village(sc: Scene):
    sc.sky(stars=48, moon=(42, 18, 9)); sc.mountains(64); sc.mist(61, 4); sc.ground(91)
    for x, y, s in [(55, 96, .65), (77, 99, .85), (101, 94, .55), (138, 98, .7)]:
        rect(sc.d, (x - 10*s, y - 10*s, x + 10*s, y), sc.p["near"])
        poly(sc.d, [(x - 13*s, y - 10*s), (x + 13*s, y - 10*s), (x, y - 18*s)], sc.p["ink"])
        rect(sc.d, (x - 2*s, y - 7*s, x + 2*s, y - 2*s), sc.p["accent"])
    sc.figure(169, 99, "#4b554d", 1.05)
    rect(sc.d, (163, 59, 166, 67), (*hx(sc.p["glow"]), 70))


def paint_demon(sc: Scene):
    sc.sky(stars=12, moon=(153, 18, 8)); sc.mountains(67); sc.ground(91)
    for x in [21, 42, 150, 176]: sc.tree(x, 94, .9, dead=True)
    rect(sc.d, (65, 57, 127, 98), sc.p["near"]); rect(sc.d, (61, 54, 131, 60), sc.p["ink"])
    for x in [75, 101, 119]: rect(sc.d, (x, 62, x + 2, 98), sc.p["ink"])
    sc.book(96, 83, 1.8)
    sc.particles(38, "#ef4444", 92)
    sc.figure(47, 101, "#3b3434", 1.15)


def paint_sword(sc: Scene):
    sc.sky(stars=34, moon=(147, 20, 12)); sc.mountains(68); sc.mist(66, 5); sc.ground(91)
    for i, x in enumerate([36, 57, 78, 119, 141, 162]):
        sc.sword(x, 99, 13 + (i % 3) * 4, mix(sc.p["mist"], sc.p["ink"], .2), (i - 2.5) * .16)
    sc.sword(97, 97, 35, sc.p["highlight"], .02)
    sc.figure(97, 101, "#27362f", .9)
    sc.particles(18, sc.p["glow"], 88)


def paint_pill(sc: Scene):
    sc.sky(stars=8); sc.mountains(72); sc.ground(91)
    rect(sc.d, (56, 57, 136, 101), sc.p["near"])
    rect(sc.d, (61, 59, 132, 84), sc.p["mid"])
    for x in [74, 91, 108, 122]: rect(sc.d, (x, 61, x + 2, 84), sc.p["ink"])
    sc.d.ellipse((77, 82, 115, 102), fill=sc.p["ink"])
    sc.d.ellipse((84, 86, 108, 99), fill=mix(sc.p["glow"], "#ffffff", .1))
    for _ in range(16):
        x = sc.rng.randrange(83, 110); y = sc.rng.randrange(48, 87)
        sc.d.ellipse((x, y, x + 2, y + 2), fill=(*hx(sc.p["glow"]), sc.rng.randrange(60, 180)))
    sc.figure(151, 101, "#514a3c", 1.0)
    sc.book(151, 92, .8)


def paint_array(sc: Scene):
    sc.sky(stars=38, moon=(146, 18, 8)); sc.mountains(64); sc.mist(62, 4); sc.ground(91)
    sc.circle(100, 92, 48, (*hx(sc.p["glow"]), 115), 1)
    sc.circle(100, 92, 36, sc.p["accent"], 1)
    for a in range(0, 360, 45):
        x = 100 + math.cos(math.radians(a)) * 43; y = 92 + math.sin(math.radians(a)) * 26
        line(sc.d, [(100, 92), (x, y)], (*hx(sc.p["glow"]), 55))
    sc.figure(99, 92, "#b8d7c7", .9, True)
    sc.particles(34, sc.p["glow"], 90)


def paint_rival(sc: Scene):
    sc.sky(stars=20, sun=(154, 19, 10)); sc.mountains(69); sc.ground(91)
    sc.hall(96, 70, .55)
    sc.figure(62, 99, "#4c665d", 1.0); sc.figure(130, 99, "#715144", 1.0)
    sc.sword(80, 84, 23, sc.p["highlight"], -.55); sc.sword(112, 84, 23, sc.p["highlight"], .55)
    line(sc.d, [(77, 72), (115, 72)], sc.p["ink"], 2)
    sc.particles(22, sc.p["accent"], 90)


def paint_master(sc: Scene):
    sc.sky(stars=6); sc.mountains(72); sc.ground(92)
    rect(sc.d, (40, 37, 152, 102), sc.p["near"]); rect(sc.d, (46, 43, 146, 96), sc.p["mid"])
    for y in [53, 68, 83]:
        rect(sc.d, (53, y, 139, y + 2), sc.p["ink"])
        for x in range(56, 136, 10): rect(sc.d, (x, y - 5, x + 4, y), mix(sc.p["mist"], sc.p["near"], .4))
    sc.figure(64, 98, "#7a6747", 1.0); sc.figure(132, 98, "#3d5b52", .9)
    rect(sc.d, (91, 60, 111, 84), (*hx(sc.p["glow"]), 42))
    sc.particles(14, sc.p["glow"], 88)


def paint_soul(sc: Scene):
    sc.sky(stars=44, moon=(151, 20, 9)); sc.mountains(68); sc.mist(65, 5); sc.ground(91)
    sc.circle(96, 66, 27, (*hx(sc.p["glow"]), 130), 2)
    sc.d.ellipse((82, 50, 110, 83), fill=(*hx(sc.p["near"]), 230), outline=sc.p["highlight"], width=2)
    sc.d.ellipse((91, 58, 101, 73), fill=(*hx(sc.p["glow"]), 160))
    sc.figure(96, 101, "#425467", 1.0)
    sc.particles(40, sc.p["glow"], 90)


def paint_market(sc: Scene):
    sc.sky(stars=18, moon=(151, 17, 7)); sc.mountains(68); sc.ground(91)
    for x, c in [(35, "#7b4834"), (64, "#263e56"), (101, "#6d5933"), (139, "#55305a"), (165, "#305d50")]:
        rect(sc.d, (x - 12, 69, x + 12, 96), sc.p["near"])
        rect(sc.d, (x - 14, 63, x + 14, 70), c)
        rect(sc.d, (x - 2, 73, x + 2, 79), sc.p["accent"])
    line(sc.d, [(0, 56), (192, 62)], sc.p["ink"], 2)
    for x in range(15, 190, 25):
        rect(sc.d, (x, 55 + x // 20, x + 3, 60 + x // 20), sc.p["accent"])
    sc.figure(88, 102, "#7d715b", .95); sc.figure(112, 102, "#3c5147", .85)
    sc.particles(18, "#f3d48a", 88)


def paint_war(sc: Scene):
    sc.sky(stars=8, sun=(148, 19, 12)); sc.mountains(66); sc.mist(64, 5); sc.ground(90)
    rect(sc.d, (17, 52, 175, 80), sc.p["near"])
    for x in range(22, 174, 18):
        rect(sc.d, (x, 47, x + 8, 55), sc.p["near"]); rect(sc.d, (x + 3, 42, x + 5, 47), sc.p["ink"])
    rect(sc.d, (89, 48, 103, 79), sc.p["ink"])
    sc.figure(96, 87, "#7e3f3a", 1.1)
    for x in [48, 61, 127, 143]:
        line(sc.d, [(x, 92), (x, 80)], sc.p["ink"]); sc.d.ellipse((x - 2, 78, x + 2, 82), fill=sc.p["near"])
    for _ in range(12):
        x = sc.rng.randrange(35, 160); y = sc.rng.randrange(58, 86)
        sc.particles(3, sc.p["glow"], y)


def paint_court(sc: Scene):
    sc.sky(stars=4); sc.mountains(72); sc.ground(91)
    sc.hall(96, 86, 1.12)
    rect(sc.d, (56, 71, 60, 98), sc.p["ink"]); rect(sc.d, (132, 71, 136, 98), sc.p["ink"])
    line(sc.d, [(71, 89), (121, 89)], sc.p["accent"], 2)
    sc.figure(96, 102, "#6f6557", .95)
    rect(sc.d, (91, 46, 101, 51), (*hx(sc.p["glow"]), 100))
    sc.particles(12, sc.p["glow"], 88)


def paint_vein(sc: Scene):
    sc.sky(stars=26, moon=(37, 17, 7)); sc.mountains(65); sc.ground(90)
    poly(sc.d, [(0, 108), (28, 89), (64, 93), (93, 82), (129, 88), (164, 80), (192, 90), (192, 108)], sc.p["near"])
    line(sc.d, [(8, 102), (43, 97), (76, 92), (112, 95), (145, 88), (182, 91)], sc.p["glow"], 3)
    line(sc.d, [(17, 103), (49, 99), (82, 94), (117, 97), (153, 90), (178, 93)], sc.p["accent"], 1)
    for x in [23, 68, 120, 165]: sc.particles(4, sc.p["glow"], 103)
    sc.figure(96, 86, "#6d7764", .8)


def paint_artifact(sc: Scene):
    sc.sky(stars=24, moon=(148, 20, 9)); sc.mountains(67); sc.mist(64, 5)
    poly(sc.d, [(0, 108), (0, 88), (35, 84), (69, 89), (112, 83), (152, 87), (192, 82), (192, 108)], sc.p["mid"])
    for y in [91, 95, 100]: line(sc.d, [(0, y), (42, y-2), (90, y+1), (138, y-1), (192, y+2)], (*hx(sc.p["glow"]), 90), 1)
    sc.boat(102, 91, 1.0)
    sc.d.ellipse((77, 73, 112, 93), fill=sc.p["near"], outline=sc.p["accent"], width=1)
    rect(sc.d, (83, 69, 106, 77), sc.p["near"])
    sc.figure(106, 90, "#5d5f75", .7, True)
    sc.particles(28, sc.p["glow"], 92)


def paint_gate(sc: Scene):
    sc.sky(stars=50, moon=(148, 18, 8)); sc.mountains(67); sc.mist(65, 5); sc.ground(93)
    sc.gate(96, 96, 1.15)
    for i in range(8):
        y = 93 - i * 5
        rect(sc.d, (94 - i * 2, y, 98 + i * 2, y + 2), mix(sc.p["near"], sc.p["glow"], i / 12))
    sc.figure(96, 102, "#e6d4aa", 1.0, True)
    sc.particles(48, sc.p["glow"], 92)


def paint_sea(sc: Scene):
    sc.sky(stars=22, moon=(45, 19, 9)); sc.mountains(63); sc.mist(63, 4)
    poly(sc.d, [(0, 108), (0, 82), (28, 78), (57, 84), (92, 80), (132, 83), (170, 78), (192, 81), (192, 108)], sc.p["near"])
    for y in [85, 90, 96, 103]:
        for x in range(0, 192, 16): line(sc.d, [(x, y), (x + 8, y - 1), (x + 16, y)], (*hx(sc.p["glow"]), 70))
    sc.boat(119, 89, 1.25)
    sc.figure(68, 92, "#596a69", .7)
    sc.particles(20, sc.p["glow"], 78)


def paint_tribulation(sc: Scene):
    sc.sky(stars=8, moon=(148, 19, 9)); sc.mountains(66); sc.mist(64, 5); sc.ground(91)
    for x, top in [(60, 12), (91, 6), (124, 15), (148, 8)]:
        line(sc.d, [(x, 20), (x - 7, 39), (x + 4, 44), (x - 8, 70), (x + 1, 72)], sc.p["highlight"], 2)
    sc.circle(96, 76, 40, (*hx(sc.p["glow"]), 100), 1)
    sc.figure(96, 102, "#e1d6bd", 1.0, True)
    for _ in range(28):
        x, y = sc.rng.randrange(50, 142), sc.rng.randrange(50, 92)
        sc.d.point((x, y), fill=sc.p["accent"])


def paint_cave(sc: Scene):
    sc.sky(stars=24, moon=(138, 15, 6)); sc.mountains(72); sc.ground(94)
    # Layered cave mouth: visible rock edges frame a cool, readable opening.
    poly(sc.d, [(0, 0), (0, 108), (43, 108), (48, 72), (62, 43), (82, 23), (102, 28), (119, 53), (127, 79), (134, 108), (192, 108), (192, 0)], sc.p["mid"])
    poly(sc.d, [(0, 0), (0, 108), (24, 108), (31, 66), (47, 31), (67, 13), (61, 0)], sc.p["near"])
    poly(sc.d, [(192, 0), (192, 108), (169, 108), (160, 65), (146, 34), (125, 14), (136, 0)], sc.p["near"])
    poly(sc.d, [(61, 0), (67, 13), (82, 23), (102, 28), (119, 38), (125, 14), (136, 0)], sc.p["far"])
    poly(sc.d, [(67, 13), (82, 23), (80, 42), (69, 28)], mix(sc.p["far"], sc.p["ink"], .28))
    poly(sc.d, [(102, 28), (119, 38), (119, 58), (106, 44)], mix(sc.p["far"], sc.p["ink"], .22))
    # Stalactites and a faint pool make the scene legible without flattening the blacks.
    for x, h in [(74, 16), (91, 11), (111, 19), (122, 9)]:
        poly(sc.d, [(x, 0), (x + 5, 0), (x + 2, h)], sc.p["near"])
    sc.d.ellipse((61, 86, 133, 104), fill=(*hx(sc.p["glow"]), 28))
    line(sc.d, [(70, 96), (94, 92), (118, 96), (130, 93)], sc.p["glow"], 1)
    sc.figure(96, 101, "#d8e8dd", .9, True)
    sc.circle(96, 93, 31, (*hx(sc.p["glow"]), 72), 1)
    sc.particles(34, sc.p["glow"], 88)


def paint_wilderness(sc: Scene):
    sc.sky(stars=36, moon=(151, 22, 10)); sc.mountains(63); sc.mist(63, 5); sc.ground(91)
    for x in [25, 51, 153, 176]: sc.tree(x, 95, .72, dead=x == 176)
    poly(sc.d, [(54, 108), (82, 76), (110, 69), (143, 108)], sc.p["far"])
    sc.figure(94, 95, "#607267", .9)
    sc.particles(16, sc.p["glow"], 88)


def paint_bonds(sc: Scene):
    sc.sky(stars=30, moon=(148, 18, 9)); sc.mountains(66); sc.mist(63, 4); sc.ground(91)
    sc.tree(133, 102, 1.65)
    rect(sc.d, (50, 79, 100, 94), sc.p["near"]); poly(sc.d, [(45, 79), (105, 79), (94, 70), (57, 70)], sc.p["ink"])
    sc.figure(65, 95, "#a1756d", .85); sc.figure(83, 95, "#5a7268", .85)
    sc.particles(18, "#e9b2aa", 92)


SCENE_SPECS = {
    "wanderer_debt": ("gold", paint_wanderer, 11),
    "beast_bond": ("jade", paint_beast, 12),
    "ancient_tomb": ("green", paint_tomb, 13),
    "sect_purge": ("red", paint_sect, 14),
    "mortal_kin": ("gold", paint_village, 15),
    "demonic_bargain": ("red", paint_demon, 16),
    "sword_grave": ("blue", paint_sword, 17),
    "pill_toxin": ("gold", paint_pill, 18),
    "array_legacy": ("jade", paint_array, 19),
    "rival_brother": ("red", paint_rival, 20),
    "master_secret": ("gold", paint_master, 21),
    "lost_soul": ("blue", paint_soul, 22),
    "merchant_ledger": ("gold", paint_market, 23),
    "border_war": ("red", paint_war, 24),
    "false_accusation": ("blue", paint_court, 25),
    "spirit_vein": ("jade", paint_vein, 26),
    "ancient_artifact": ("violet", paint_artifact, 27),
    "ascension_choice": ("violet", paint_gate, 28),
    "market": ("gold", paint_market, 31),
    "village": ("gold", paint_village, 32),
    "bonds": ("jade", paint_bonds, 33),
    "battle": ("red", paint_war, 34),
    "cave": ("green", paint_cave, 35),
    "sea": ("blue", paint_sea, 36),
    "tribulation": ("violet", paint_tribulation, 37),
    "sect": ("green", paint_sect, 38),
    "ruins": ("green", paint_tomb, 39),
    "medicine": ("gold", paint_pill, 40),
    "wilderness": ("blue", paint_wilderness, 41),
}


def generate_scenes():
    for name, (palette, painter, seed) in SCENE_SPECS.items():
        scene = Scene(name, PALETTES[palette], seed)
        painter(scene)
        scene.save()


ACTION_COLORS = {
    "talk": "#d4a843", "fight": "#ef6b62", "travel": "#6ea8fe",
    "cultivate": "#6fedb5", "trade": "#f0c96b", "bond": "#f09aa8",
    "heal": "#80c8b5", "risk": "#b78bff", "refuse": "#8fa79a", "observe": "#a4b8ca",
}


def generate_action_icons():
    ACTIONS_DIR.mkdir(parents=True, exist_ok=True)
    size = 24
    for key, color in ACTION_COLORS.items():
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
        c = (*hx(color), 255); soft = (*hx(color), 45); dark = hx("#07100c") + (255,)
        d.rounded_rectangle((2, 2, 21, 21), radius=3, fill=(*dark[:3], 225), outline=(*c[:3], 120))
        if key == "talk":
            d.rectangle((6, 6, 18, 14), fill=c); d.polygon([(9, 14), (7, 19), (13, 14)], fill=c)
            d.rectangle((9, 9, 15, 10), fill=dark); d.rectangle((9, 12, 14, 13), fill=dark)
        elif key == "fight":
            d.line((6, 18, 18, 6), fill=c, width=2); d.line((6, 6, 18, 18), fill=c, width=2)
            d.line((4, 17, 8, 21), fill=c, width=2); d.line((16, 21, 20, 17), fill=c, width=2)
        elif key == "travel":
            d.ellipse((4, 4, 20, 20), outline=c, width=2); d.polygon([(12, 7), (15, 15), (12, 12), (9, 15)], fill=c)
        elif key == "cultivate":
            d.ellipse((9, 4, 15, 10), fill=c); d.polygon([(6, 20), (9, 10), (15, 10), (18, 20)], fill=c)
            d.arc((3, 2, 21, 20), 110, 250, fill=(*c[:3], 120), width=1)
        elif key == "trade":
            d.ellipse((6, 7, 18, 19), fill=c); d.rectangle((5, 5, 19, 11), fill=c)
            d.rectangle((8, 9, 16, 17), fill=dark); d.rectangle((10, 11, 14, 15), fill=c)
        elif key == "bond":
            d.ellipse((3, 7, 14, 18), outline=c, width=2); d.ellipse((10, 7, 21, 18), outline=c, width=2)
        elif key == "heal":
            d.line((12, 20, 12, 7), fill=c, width=2); d.ellipse((5, 4, 12, 12), fill=c); d.ellipse((12, 8, 20, 16), fill=c)
        elif key == "risk":
            d.polygon([(5, 20), (9, 8), (12, 13), (15, 4), (20, 20)], fill=c); d.polygon([(10, 20), (12, 13), (16, 20)], fill=(*dark[:3], 220))
        elif key == "refuse":
            d.rectangle((6, 4, 18, 20), fill=c); d.ellipse((15, 11, 17, 13), fill=dark)
        elif key == "observe":
            d.arc((3, 7, 21, 17), 180, 360, fill=c, width=2); d.arc((3, 7, 21, 17), 0, 180, fill=c, width=2)
            d.ellipse((9, 9, 15, 15), fill=c); d.ellipse((11, 10, 13, 12), fill=dark)
        img.resize((48, 48), Image.Resampling.NEAREST).save(ACTIONS_DIR / f"{key}.png", optimize=True)


def main():
    generate_scenes()
    generate_action_icons()
    print(f"generated {len(SCENE_SPECS)} scenes and {len(ACTION_COLORS)} action icons")


if __name__ == "__main__":
    main()
