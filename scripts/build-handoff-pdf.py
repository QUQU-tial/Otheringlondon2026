#!/usr/bin/env python3
"""Build an A4 print HTML pack from specification markdown files."""

from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_HTML = ROOT / "docs" / "Othering-Designer-Handoff.html"

FILES: list[tuple[str, str]] = [
    ("What changed — 17 August 2026", "docs/2026-08-17-WHAT-CHANGED.md"),
    ("SYSTEM_INDEX.md", "SYSTEM_INDEX.md"),
    ("Project_scope.md", "Project_scope.md"),
    ("DESIGN_TOKENS.md", "# DESIGN_TOKENS.md"),
    ("Typography Mapping Table.md", "# Typography Mapping Table.md"),
    ("LAYOUT_INTERACTION_SPEC.md", "# LAYOUT_INTERACTION_SPEC.md"),
    ("SPACE_SYSTEM_COMPLETE.md", "SPACE_SYSTEM_COMPLETE.md"),
    ("SPACE_SYSTEM_DETAIL_PANEL.md", "SPACE_SYSTEM_DETAIL_PANEL.md"),
    ("FORM_SCHEMA.md", "FORM_SCHEMA.md"),
    ("FORM_PAGE_SPEC.md", "FORM_PAGE_SPEC.md"),
    ("INTERACTION_MOTION_SPEC.md", "INTERACTION_MOTION_SPEC.md"),
    ("AUTH_IDENTITY_SPEC.md", "AUTH_IDENTITY_SPEC.md"),
    ("DATABASE_SCHEMA.md", "DATABASE_SCHEMA.md"),
]


def inline(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", text)
    return text


def md_to_html(md: str) -> str:
    lines = md.replace("\r\n", "\n").split("\n")
    out: list[str] = []
    i = 0
    in_code = False
    code: list[str] = []
    in_ul = False
    in_ol = False
    table_rows: list[str] = []

    def close_lists() -> None:
        nonlocal in_ul, in_ol
        if in_ul:
            out.append("</ul>")
            in_ul = False
        if in_ol:
            out.append("</ol>")
            in_ol = False

    def flush_table() -> None:
        nonlocal table_rows
        if not table_rows:
            return
        rows = table_rows
        table_rows = []
        parsed: list[list[str]] = []
        for row in rows:
            if re.match(r"^\s*\|?\s*:?-{3,}", row):
                continue
            cells = [c.strip() for c in row.strip().strip("|").split("|")]
            parsed.append(cells)
        if not parsed:
            return
        out.append('<table>')
        header, *body = parsed
        out.append("<thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in header) + "</tr></thead>")
        out.append("<tbody>")
        for row in body:
            out.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in row) + "</tr>")
        out.append("</tbody></table>")

    while i < len(lines):
        line = lines[i]
        if in_code:
            if line.startswith("```"):
                out.append("<pre><code>" + html.escape("\n".join(code)) + "</code></pre>")
                code = []
                in_code = False
            else:
                code.append(line)
            i += 1
            continue
        if line.startswith("```"):
            close_lists()
            flush_table()
            in_code = True
            code = []
            i += 1
            continue
        if line.strip().startswith("|"):
            close_lists()
            table_rows.append(line)
            i += 1
            continue
        flush_table()
        if not line.strip():
            close_lists()
            i += 1
            continue
        if line.startswith("# "):
            close_lists()
            out.append(f"<h1>{inline(line[2:].strip())}</h1>")
        elif line.startswith("## "):
            close_lists()
            out.append(f"<h2>{inline(line[3:].strip())}</h2>")
        elif line.startswith("### "):
            close_lists()
            out.append(f"<h3>{inline(line[4:].strip())}</h3>")
        elif line.strip() in ("---", "***"):
            close_lists()
            out.append("<hr />")
        elif re.match(r"^\s*[-*] ", line):
            if in_ol:
                out.append("</ol>")
                in_ol = False
            if not in_ul:
                out.append("<ul>")
                in_ul = True
            item = re.sub(r"^\s*[-*] ", "", line)
            out.append(f"<li>{inline(item)}</li>")
        elif re.match(r"^\s*\d+\. ", line):
            if in_ul:
                out.append("</ul>")
                in_ul = False
            if not in_ol:
                out.append("<ol>")
                in_ol = True
            item = re.sub(r"^\s*\d+\. ", "", line)
            out.append(f"<li>{inline(item)}</li>")
        else:
            close_lists()
            out.append(f"<p>{inline(line.strip())}</p>")
        i += 1

    flush_table()
    close_lists()
    if in_code:
        out.append("<pre><code>" + html.escape("\n".join(code)) + "</code></pre>")
    return "\n".join(out)


COVER = """
<section class="cover">
  <p class="kicker">Othering London 2026 · SPIRA9</p>
  <h1>Designer / engineer handoff</h1>
  <p class="lede">One PDF of the live specification system, updated 17 August 2026 to include the Artists area.</p>
  <ul class="meta">
    <li>Visual system: black &amp; white only (plus existing red selected/hover)</li>
    <li>Fonts: Inter, Poppins, Source Sans 3 — do not add families</li>
    <li>Spacing scale: 4 / 12 / 16 / 24 / 30 / 36 / 60px</li>
    <li>Codebase is source of truth if a sentence here disagrees with the app</li>
  </ul>
  <p>How to use: start with SYSTEM_INDEX, then tokens → type → layout → interaction. Artists pages live in LAYOUT §1.3, Type section D, Motion §4b, Form schema (Artist Join).</p>
</section>
"""

CSS = """
@page { size: A4; margin: 18mm 16mm 18mm 16mm; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; color: #000; }
body { font-family: Inter, Helvetica, Arial, sans-serif; font-size: 10.5pt; line-height: 1.45; }
.cover { page-break-after: always; padding-top: 28mm; }
.kicker { letter-spacing: 0.08em; text-transform: uppercase; font-size: 9pt; color: #9A9A9A; }
.cover h1 { font-size: 28pt; font-weight: 500; letter-spacing: -0.04em; margin: 8px 0 16px; }
.lede { font-size: 12pt; max-width: 36em; }
.meta { padding-left: 1.1em; }
.chapter { page-break-before: always; }
.chapter:first-of-type { page-break-before: auto; }
h1 { font-size: 18pt; font-weight: 500; margin: 0 0 12px; page-break-after: avoid; }
h2 { font-size: 13pt; font-weight: 600; margin: 18px 0 8px; page-break-after: avoid; }
h3 { font-size: 11pt; font-weight: 600; margin: 14px 0 6px; page-break-after: avoid; }
p { margin: 0 0 8px; }
ul, ol { margin: 0 0 10px; padding-left: 1.2em; }
li { margin: 0 0 3px; }
hr { border: 0; border-top: 1px solid rgba(0,0,0,0.2); margin: 16px 0; }
code { font-family: ui-monospace, Menlo, monospace; font-size: 8.5pt; }
pre { background: #f6f6f6; border: 1px solid rgba(0,0,0,0.12); padding: 8px; overflow-wrap: anywhere; white-space: pre-wrap; font-size: 8pt; page-break-inside: avoid; }
table { width: 100%; border-collapse: collapse; margin: 0 0 12px; font-size: 8.5pt; page-break-inside: auto; }
th, td { border: 1px solid rgba(0,0,0,0.2); padding: 4px 6px; vertical-align: top; text-align: left; }
th { background: #f4f4f4; font-weight: 600; }
.file-label { font-size: 8pt; letter-spacing: 0.08em; text-transform: uppercase; color: #9A9A9A; margin: 0 0 6px; }
"""


def main() -> None:
    chapters: list[str] = [COVER]
    for title, rel in FILES:
        path = ROOT / rel
        md = path.read_text(encoding="utf-8")
        chapters.append(
            f'<section class="chapter"><p class="file-label">{html.escape(rel)}</p>'
            f"<h1>{html.escape(title)}</h1>{md_to_html(md)}</section>"
        )
    doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Othering London 2026 — designer handoff</title>
  <style>{CSS}</style>
</head>
<body>
{''.join(chapters)}
</body>
</html>
"""
    OUT_HTML.parent.mkdir(parents=True, exist_ok=True)
    OUT_HTML.write_text(doc, encoding="utf-8")
    print(f"Wrote {OUT_HTML}")


if __name__ == "__main__":
    main()
