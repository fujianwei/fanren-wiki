#!/usr/bin/env python3
"""Compute descriptive statistics for the 20 official-site lives."""
from __future__ import annotations

import json
import re
import statistics
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "docs" / "research" / "1in8b-official-sampling"
SOURCE = DATA / "official-20.unified.json"
OUT = DATA / "analysis-summary.json"


def age_number(value: str) -> int:
    match = re.search(r"\d+", value or "")
    return int(match.group(0)) if match else 0


def parse_gender(sample: dict) -> str:
    text = " ".join([
        str((sample.get("identity") or {}).get("identityRecord") or ""),
        str((sample.get("death") or {}).get("certificate") or ""),
    ])
    match = re.search(r"性别\s*(男性|女性)|([^\s]+) · (男|女)性", text)
    if not match:
        return "未知"
    return "男" if (match.group(0) or "").find("男") >= 0 and "女" not in (match.group(0) or "") else "女"


def parse_allocation(text: str) -> Counter:
    result = Counter()
    for part in (text or "").split(" · "):
        match = re.match(r"(.+?)(\d+)年$", part.strip())
        if match:
            result[match.group(1).strip()] += int(match.group(2))
    return result


LANDMARKS = [
    "巴布亚新几内亚", "刚果民主共和国", "孟加拉国", "埃塞俄比亚", "阿尔及利亚",
    "巴基斯坦", "摩洛哥", "菲律宾", "以色列", "伊拉克", "土耳其", "埃及",
    "印度", "中国",
]


def parse_birth_country(sample: dict) -> str:
    fields = sample.get("birth", {}).get("fields") or ""
    if isinstance(fields, dict):
        fields = " ".join(str(value) for value in fields.values())
    match = re.search(r"出生国家／地区(.+?)(出生地|种姓类别|家境|父母年龄)", str(fields))
    if match:
        return match.group(1).strip()
    story = sample.get("birth", {}).get("story") or ""
    span = sample.get("death", {}).get("span") or ""
    for landmark in LANDMARKS:
        if story.startswith("20") and f"出生在{landmark}" in story:
            return landmark
        if landmark in span:
            return landmark
    return "未知"


def parse_texture_axes(sample: dict) -> dict[str, str]:
    body = re.sub(r"\s+", " ", (sample.get("death") or {}).get("certificate") or "")
    if "这段人生的纹理" not in body:
        return {}
    tail = body.split("这段人生的纹理", 1)[1]
    match = re.search(
        r"陪伴\s*工作\s*(.+?)\s*根\s*风\s*(.+?)\s*平静\s*浪潮\s*(.+?)\s*今天\s*明天\s*(.+?)(?:四组词语的意思|$)",
        tail,
    )
    if not match:
        return {}
    return {
        "companionshipVsWork": match.group(1).strip(" 。"),
        "rootVsWind": match.group(2).strip(" 。"),
        "calmVsWave": match.group(3).strip(" 。"),
        "todayVsTomorrow": match.group(4).strip(" 。"),
    }


def parse_texture_name(sample: dict) -> str:
    body = (sample.get("death") or {}).get("certificate") or ""
    normalized = re.sub(r"\s+", " ", body)
    marker = "纹理是用四组词语，表示一段人生偏向哪一边流去。"
    if "这段人生的纹理" in normalized:
        tail = normalized.split("这段人生的纹理", 1)[1]
        if marker in tail:
            tail = tail.split(marker, 1)[1]
        else:
            tail = tail.replace(marker, "")
        for end_marker in ["从四组词语来看", "陪伴工作"]:
            if end_marker in tail:
                tail = tail.split(end_marker, 1)[0]
                break
        tail = tail.strip(" 。")
        if "没有替它取名字" in tail or "曾被迫离开家园" in tail:
            return "未命名纹理"
        if "没有收拢成一个名字" in tail:
            return "无法收拢成一个名字的纹理"
        if tail:
            return tail[:40]
    legacy = (((sample.get("lifeSummary") or {}).get("summary") or {}).get("这段人生的纹理") or {})
    if isinstance(legacy, dict):
        return re.sub(r"\s+", " ", str(legacy.get("value") or "")).strip()
    return ""


def summary_value(sample: dict, label: str) -> str:
    legacy = ((sample.get("lifeSummary") or {}).get("summary") or {}).get(label)
    if isinstance(legacy, dict):
        return str(legacy.get("value") or "")
    body = (sample.get("death") or {}).get("certificate") or ""
    pattern = r"(?:^|\n)" + re.escape(label) + r"\n([^\n]+)"
    match = re.search(pattern, body)
    return match.group(1).strip() if match else ""


def relation_flags(sample: dict) -> dict[str, bool]:
    body = (sample.get("death") or {}).get("certificate") or ""
    return {
        "hasPartner": "配偶" in body and "送最后一程的人父母" not in body,
        "hasChildren": bool(re.search(r"子女\s*\n?(?:[1-9]\d*人|\d+人)", body)),
    }



def main() -> None:
    data = json.loads(SOURCE.read_text(encoding="utf-8"))
    samples = data["samples"]
    ages = [age_number(s["identity"]["ageAtCapture"]) for s in samples]
    genders = Counter(parse_gender(s) for s in samples)
    causes = Counter(s["death"]["cause"] for s in samples)
    event_types = Counter()
    allocation = Counter()
    choices_by_age = Counter()
    textures = Counter()
    remembered_per_life = []
    events_per_life = []
    choices_per_life = []
    rows = []
    locations = Counter()
    countries = Counter()
    texture_axes = Counter()
    education = Counter()
    jobs = Counter()
    partner_count = 0
    children_count = 0

    for sample, age in zip(samples, ages):
        choices = sample.get("choices") or []
        events = sample.get("events") or []
        choices_per_life.append(len(choices))
        events_per_life.append(len(events))
        remembered_per_life.append(len(sample["achievements"]["rememberedMoments"]))
        for event in events:
            event_types[event["type"].split()[0].replace("tap", "")] += 1
        for choice in choices:
            choices_by_age[age_number(choice.get("age", ""))] += 1
        allocation.update(parse_allocation(sample["annualFocus"].get("adultTimeAllocation", "")))
        texture = parse_texture_name(sample)
        if texture:
            textures[texture] += 1
        span = sample.get("death", {}).get("span", "")
        parts = [part.strip() for part in span.split("·")]
        if parts:
            locations[parts[-1]] += 1
        country = parse_birth_country(sample)
        countries[country] += 1
        axes = parse_texture_axes(sample)
        for key, value in axes.items():
            texture_axes[f"{key}:{value}"] += 1
        edu = summary_value(sample, "最高学历")
        if edu:
            education[edu.split(" · ")[0]] += 1
        job = summary_value(sample, "最后的工作")
        if job:
            jobs[job.split(" · ")[0]] += 1
        flags = relation_flags(sample)
        partner_count += int(flags["hasPartner"])
        children_count += int(flags["hasChildren"])
        rows.append({
            "index": sample["officialIndex"],
            "name": sample["identity"]["name"],
            "age": age,
            "gender": parse_gender(sample),
            "country": country,
            "deathCause": sample["death"]["cause"],
            "span": sample["death"]["span"],
            "events": len(events),
            "choices": len(choices),
            "remembered": len(sample["achievements"]["rememberedMoments"]),
            "texture": texture,
            "textureAxes": axes,
            "education": edu,
            "lastJob": job,
            "hasPartner": flags["hasPartner"],
            "hasChildren": flags["hasChildren"],
            "adultFocus": sample["annualFocus"].get("adultTimeAllocation", ""),
            "shareUrl": sample["provenance"]["shareUrl"],
        })

    summary = {
        "sourceMode": data["sourceMode"],
        "targetCount": data["targetCount"],
        "capturedCount": data["capturedCount"],
        "remainingCount": data["remainingCount"],
        "ages": {
            "values": ages,
            "mean": round(statistics.mean(ages), 2),
            "median": statistics.median(ages),
            "min": min(ages),
            "max": max(ages),
            "under1": sum(a < 1 for a in ages),
            "under5": sum(a < 5 for a in ages),
            "adult": sum(a >= 18 for a in ages),
            "age80plus": sum(a >= 80 for a in ages),
        },
        "gender": dict(genders),
        "causes": dict(causes.most_common()),
        "eventTypes": dict(event_types.most_common()),
        "eventsPerLife": {
            "total": sum(events_per_life),
            "mean": round(statistics.mean(events_per_life), 2),
            "median": statistics.median(events_per_life),
        },
        "choicesPerLife": {
            "total": sum(choices_per_life),
            "mean": round(statistics.mean(choices_per_life), 2),
            "median": statistics.median(choices_per_life),
        },
        "rememberedPerLife": {
            "total": sum(remembered_per_life),
            "mean": round(statistics.mean(remembered_per_life), 2),
        },
        "adultFocusYears": dict(allocation.most_common()),
        "textureNames": dict(textures.most_common()),
        "textureAxes": dict(texture_axes.most_common()),
        "locations": dict(locations.most_common()),
        "countries": dict(countries.most_common()),
        "education": dict(education.most_common()),
        "lastJobs": dict(jobs.most_common()),
        "relationshipEndState": {
            "withPartner": partner_count,
            "withChildren": children_count,
            "total": len(samples),
        },
        "choicesByAge": dict(sorted(choices_by_age.items())),
        "lives": rows,
    }
    OUT.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
