#!/usr/bin/env python3
"""Normalize evidence captured from 1in8b.life into one auditable sampling set.

The raw files are never modified.  This script only distinguishes official-site
samples from any future replica-engine data by emitting sourceMode explicitly.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "docs" / "research" / "1in8b-official-sampling"
RAW = OUT / "raw"
LEGACY_DIR = OUT / "original-six"

LEGACY = [
    ("01", "1in8b-official-run-01.json", "Salma Rashid"),
    ("02", "1in8b-official-run-02.json", "Erlinda Gonzales"),
    ("03", "1in8b-official-run-04.json", "Farah Hussein"),
    ("04", "1in8b-official-run-04b-Nasreen.json", "Nasreen Ansari"),
    ("05", "1in8b-official-Suresh-Das.json", "Suresh Das"),
    ("06", "1in8b-official-Tamar-Amar.json", "Tamar Amar"),
]

TAP_TYPES = {"dec", "big", "death", "warm", "loss", "bad", "note", "comp", "ms"}


def read_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def section(text: str, start: str, ends: list[str]) -> str:
    text = clean(text)
    if start not in text:
        return ""
    tail = text.split(start, 1)[1]
    positions = [tail.find(e) for e in ends if e in tail]
    if positions:
        tail = tail[: min(positions)]
    return tail.strip(" :：·-\n\t")


def parse_choices(feed: list[dict[str, Any]]) -> list[dict[str, Any]]:
    choices = []
    for item in feed:
        typ = clean(item.get("type"))
        if typ.startswith("dec"):
            text = clean(item.get("text")).replace("☆ 值得记住的时刻", "").strip()
            choice = text.split("抉择：", 1)[1] if "抉择：" in text else ""
            prompt = text.split("抉择：", 1)[0].strip() if "抉择：" in text else text
            choices.append({"age": clean(item.get("age")), "event": prompt, "choice": choice})
    return choices


def parse_focus(record: dict[str, Any]) -> dict[str, Any]:
    focus = record.get("focus")
    if isinstance(focus, dict):
        current = {
            "selected": focus.get("selected", ""),
            "chosen": focus.get("chosen", ""),
            "options": focus.get("chips", []),
        }
    else:
        current = {"selected": "", "chosen": clean(focus), "options": []}
    death = record.get("death") or {}
    summary = death.get("summary") or {}
    allocation = summary.get("成年后时间花在哪里") or {}
    return {
        "definition": "正式站点按年度自动选择重心；结局保留最终重心与成年后时间分配。",
        "current": current,
        "adultTimeAllocation": clean(allocation.get("value") or allocation.get("note") or ""),
    }


def normalize_legacy(sample_id: str, filename: str, expected_name: str) -> dict[str, Any]:
    path = LEGACY_DIR / filename
    record = read_json(path)
    feed = record.get("feed") or []
    birth = record.get("birth") or {}
    death = record.get("death") or {}
    summary = death.get("summary") or {}
    death_text = clean(death.get("certificate"))
    lived_text = " ".join(clean(item.get("text")) for item in feed)
    if "难忘的时刻" in lived_text:
        memorable = parse_memorable_moments(lived_text, feed)
        remembered_source = "site-memorable-section"
    else:
        remembered = [
            {
                "age": clean(item.get("age")),
                "type": clean(item.get("type")),
                "text": clean(item.get("text")).replace("☆ 值得记住的时刻", "").strip(),
            }
            for item in feed
            if clean(item.get("type")).split()[0] in {"big", "loss", "death", "comp"}
        ]
        memorable = remembered
        remembered_source = "derived-from-life-milestones"
    cause = clean(death.get("cause")).removeprefix("死因").strip()
    return {
        "sampleId": f"official-{sample_id}",
        "sourceMode": "official-site",
        "provenance": {
            "site": "https://1in8b.life",
            "shareUrl": record.get("url"),
            "capturedAt": record.get("scrapedAt"),
            "rawFile": f"docs/research/1in8b-official-sampling/original-six/{filename}",
            "evidenceStatus": "captured-from-live-site",
        },
        "identity": {
            "name": record.get("name") or expected_name,
            "ageAtCapture": record.get("age"),
            "yearLabel": record.get("year"),
            "identityRecord": record.get("identity"),
            "status": record.get("status"),
        },
        "birth": {
            "story": birth.get("story"),
            "fields": birth.get("fields"),
            "odds": birth.get("odds"),
            "pace": birth.get("pace"),
            "peers": birth.get("peers"),
            "certificate": birth.get("certificate"),
        },
        "choices": parse_choices(feed),
        "events": [
            {
                "age": clean(item.get("age")),
                "type": clean(item.get("type")),
                "text": clean(item.get("text")).replace("☆ 值得记住的时刻", "").strip(),
                "note": clean(item.get("note")),
                "remembered": "☆ 值得记住的时刻" in clean(item.get("text")),
            }
            for item in feed
        ],
        "annualFocus": parse_focus(record),
        "attributes": record.get("stats") or {},
        "relationships": {
            "family": record.get("family"),
            "sceneWho": record.get("sceneWho"),
            "peersNow": record.get("peersNow"),
        },
        "achievements": {
            "rememberedMoments": memorable,
            "rememberedMomentsSource": remembered_source,
            "theme": death.get("theme"),
            "summary": summary,
        },
        "death": {
            "age": record.get("age"),
            "cause": cause,
            "span": death.get("span"),
            "context": death.get("context"),
            "certificate": death.get("certificate"),
        },
        "lifeSummary": {
            "summary": summary,
            "reflection": death.get("look"),
            "farewellContext": death.get("farewell"),
            "money": record.get("money"),
        },
        "texture": {
            "axes": death.get("texture") or [],
            "near": death.get("textureNear"),
            "raw": death_text,
        },
        "completeness": completeness({
            "birth": birth.get("story"),
            "choices": parse_choices(feed),
            "events": feed,
            "focus": parse_focus(record),
            "attributes": record.get("stats"),
            "relationships": record.get("family"),
            "summary": summary,
            "texture": death.get("texture"),
        }, record.get("age")),
    }



def parse_memorable_moments(death_body: str, events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    text = clean(death_body)
    marker = "难忘的时刻"
    if marker in text:
        tail = text.split(marker, 1)[1]
        for end in ["这一生的更多细节", "完整人生纪录", "点一下画面就会继续"]:
            if end in tail:
                tail = tail.split(end, 1)[0]
        ages = re.findall(r"(\d+岁)\s+([^\d]{4,}?)(?=\s+\d+岁\s+|$)", tail)
        if ages:
            return [{"age": age, "text": content.strip()} for age, content in ages]
    return [
        {"age": event.get("age", ""), "text": event.get("text", "")}
        for event in events
        if event.get("remembered")
        or str(event.get("type", "")).split()[0] in {"big", "loss", "death", "comp"}
    ]


DEATH_SUMMARY_LABELS = [
    "死因", "最高学历", "最后的工作", "在身边的人", "子女", "送最后一程的人",
    "最幸福的一年", "住过的国家与地区", "兴趣", "留下的财产（以中国大陆物价计）",
    "成年后时间花在哪里", "这段人生的纹理", "四组词语的意思",
]


def extract_death_summary(text: str) -> dict[str, dict[str, str]]:
    compact = clean(text)
    starts = []
    for label in DEATH_SUMMARY_LABELS:
        idx = compact.find(label)
        if idx >= 0:
            starts.append((idx, label))
    starts.sort()
    result: dict[str, dict[str, str]] = {}
    for i, (idx, label) in enumerate(starts):
        if label in {"死因", "四组词语的意思"}:
            continue
        start = idx + len(label)
        end = starts[i + 1][0] if i + 1 < len(starts) else len(compact)
        value = compact[start:end].strip(" ：·")
        if value:
            result[label] = {"note": "", "value": value}
    return result


def parse_raw_record(path: Path) -> dict[str, Any]:
    record = read_json(path)
    rows = record.get("fullLog") or []
    if not rows:
        # Older extractor shape used feed.
        rows = record.get("feed") or []
    death_body = clean(record.get("deathBody") or record.get("body") or record.get("bodyHead"))
    identity = record.get("identity") or {}
    name = clean(record.get("name")) or clean(re.search(r"\n([^\n]+)\n20\d{2}\s*–", "\n" + death_body).group(1) if re.search(r"\n([^\n]+)\n20\d{2}\s*–", "\n" + death_body) else "")
    age = clean(record.get("age")) or (re.search(r"享年\s*(\d+)岁", death_body).group(1) if re.search(r"享年\s*(\d+)岁", death_body) else "")
    span = clean(record.get("span"))
    if not span:
        m = re.search(r"20\d{2}\s*–\s*\d{4}\s*·\s*享年\s*\d+岁[^\n]*", death_body)
        span = clean(m.group(0)) if m else ""
    cause = section(death_body, "死因", ["在", "在这个人生模拟里", "最高学历"])
    choices = []
    for row in rows:
        text = clean(row.get("text"))
        if "抉择：" in text:
            prompt, choice = text.split("抉择：", 1)
            choices.append({
                "age": clean(row.get("age")) or (re.match(r"(\d+岁)", text).group(1) if re.match(r"(\d+岁)", text) else ""),
                "event": prompt.replace("▸", "").strip(),
                "choice": choice.strip(),
            })
    birth_story = ""
    for row in rows:
        text = clean(row.get("text"))
        if "出生" in text and re.search(r"20\d{2}年\d+月", text):
            birth_story = re.sub(r"^\d+岁\s*", "", text)
            break
    focus_distribution = section(death_body, "成年后时间花在哪里", ["这段人生的纹理", "纹理是用四组词语"])
    texture_raw = section(death_body, "这段人生的纹理", ["今日主题", "回首", "留给"])
    events = [
        {
            "age": clean(item.get("age")),
            "type": clean(item.get("className")),
            "text": clean(item.get("text")),
            "remembered": bool(item.get("remembered")),
        }
        for item in rows
    ]
    summary = extract_death_summary(death_body)
    if focus_distribution:
        summary["成年后时间花在哪里"] = {"note": "", "value": focus_distribution}
    if texture_raw:
        summary["这段人生的纹理"] = {"note": "", "value": texture_raw}
    memorable = parse_memorable_moments(death_body, events)
    birth = record.get("birth") or {}
    return {
        "sampleId": f"official-{path.stem.split('-')[1] if path.stem.startswith('official-') else 'raw'}",
        "sourceMode": "official-site",
        "provenance": {
            "site": "https://1in8b.life",
            "shareUrl": record.get("shareUrl"),
            "capturedAt": record.get("capturedAt"),
            "rawFile": str(path.relative_to(ROOT)),
            "evidenceStatus": "captured-from-live-site",
        },
        "identity": {
            "name": name,
            "ageAtCapture": f"{age}岁" if age else "",
            "yearLabel": span,
            "identityRecord": identity,
        },
        "birth": {
            "story": birth.get("story") or birth_story,
            "fields": birth.get("fields") or clean(birth.get("certificate")),
            "odds": birth.get("odds"),
            "pace": birth.get("pace"),
            "peers": birth.get("peers"),
            "certificate": birth.get("certificate"),
        },
        "choices": choices,
        "events": events,
        "annualFocus": {
            "definition": "正式站点按年度自动选择重心；结局保留最终重心与成年后时间分配。",
            "current": {
                "selected": next((c.get("text") for c in record.get("focusChips", []) if c.get("selected")), ""),
                "chosen": clean(record.get("focusPanel")),
                "options": record.get("focusChips") or [],
            },
            "adultTimeAllocation": focus_distribution,
        },
        "attributes": record.get("stats") or {},
        "relationships": {
            "family": record.get("family"),
            "scene": record.get("scene"),
        },
        "achievements": {
            "rememberedMoments": memorable,
            "rememberedMomentsSource": "site-memorable-section" if "难忘的时刻" in death_body else "derived-from-life-milestones",
            "theme": section(death_body, "今日主题", ["留给", "这段人生遇上这个主题的时刻"]),
            "summary": summary,
        },
        "death": {
            "age": f"{age}岁" if age else "",
            "cause": cause,
            "span": span,
            "certificate": death_body,
        },
        "lifeSummary": {
            "summary": summary,
            "reflection": section(death_body, "回首", ["今日主题"]),
            "reflectionAlt": "",
            "money": record.get("money"),
        },
        "texture": {"axes": [], "near": "", "raw": texture_raw},
        "completeness": completeness({
            "birth": birth.get("story") or birth_story,
            "choices": choices,
            "events": events,
            "focus": focus_distribution,
            "attributes": record.get("stats"),
            "relationships": record.get("family"),
            "summary": summary,
            "texture": texture_raw,
        }, age),
    }


def completeness(data: dict[str, Any], age_value: Any = None) -> dict[str, Any]:
    age_match = re.search(r"\d+", str(age_value or ""))
    age = int(age_match.group(0)) if age_match else None
    minor_death = age is not None and age < 18
    checks = {
        "birth": bool(data.get("birth")),
        "actualChoices": data.get("choices") is not None,
        "events": bool(data.get("events")),
        "annualFocus": bool(data.get("focus")) or minor_death,
        "attributes": bool(data.get("attributes")),
        "relationships": bool(data.get("relationships")),
        "lifeSummary": bool(data.get("summary")),
        "texture": bool(data.get("texture")) or minor_death,
    }
    not_applicable = []
    if minor_death and not data.get("focus"):
        not_applicable.append("annualFocus:未满18岁，正式站点不生成成年时间分配")
    if minor_death and not data.get("texture"):
        not_applicable.append("texture:未满18岁，正式站点不生成人生纹理")
    return {"checks": checks, "notApplicable": not_applicable, "complete": all(checks.values())}


def build() -> dict[str, Any]:
    OUT.mkdir(parents=True, exist_ok=True)
    RAW.mkdir(parents=True, exist_ok=True)
    samples = [normalize_legacy(*item) for item in LEGACY]
    raw_files = sorted(RAW.glob("official-*.json"))
    for raw in raw_files:
        try:
            sample = parse_raw_record(raw)
        except Exception as exc:  # keep evidence visible even if parser needs work
            print(f"WARN raw parse failed {raw}: {exc}")
            continue
        if any(s["provenance"]["shareUrl"] == sample["provenance"]["shareUrl"] and sample["provenance"]["shareUrl"] for s in samples):
            continue
        samples.append(sample)
    samples.sort(key=lambda s: s["sampleId"])
    for i, sample in enumerate(samples, 1):
        sample["officialIndex"] = i
    data = {
        "schemaVersion": "1.0.0",
        "sourceMode": "official-site-only",
        "excludedSourceModes": ["public-replica-engine"],
        "requiredFields": [
            "birth", "choices", "events", "annualFocus", "attributes", "relationships",
            "achievements.rememberedMoments", "death.cause", "lifeSummary", "texture",
        ],
        "targetCount": 20,
        "capturedCount": len(samples),
        "remainingCount": max(0, 20 - len(samples)),
        "samples": samples,
    }
    (OUT / "official-20.unified.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    progress = {
        "target": 20,
        "captured": len(samples),
        "remaining": max(0, 20 - len(samples)),
        "sourceMode": "official-site-only",
        "slots": [
            {
                "index": i,
                "sampleId": sample["sampleId"],
                "name": sample["identity"]["name"],
                "age": sample["identity"]["ageAtCapture"],
                "shareUrl": sample["provenance"]["shareUrl"],
                "complete": sample["completeness"]["complete"],
            }
            for i, sample in enumerate(samples, 1)
        ],
    }
    (OUT / "progress.json").write_text(json.dumps(progress, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return progress


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--print", action="store_true", dest="print_progress")
    args = parser.parse_args()
    progress = build()
    if args.print_progress:
        print(json.dumps(progress, ensure_ascii=False, indent=2))
