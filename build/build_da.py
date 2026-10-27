#!/usr/bin/env python3
"""Builds da/index.html (the Danish page) from index.html + build/strings-da.json.

Run from the repo root after changing any text:  python3 build/build_da.py
English lives in index.html. Danish strings live in build/strings-da.json.
"""
import html
import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = (root / "index.html").read_text(encoding="utf-8")
strings = json.loads((root / "build/strings-da.json").read_text(encoding="utf-8"))
jsonld = (root / "build/jsonld-da.json").read_text(encoding="utf-8")
meta = strings.pop("_meta")
html_keys = set(strings.pop("_html_keys"))

out = src

# 1. Translate every element marked data-i18n="key".
missing = []
for key, value in strings.items():
    pattern = re.compile(r'(<(\w+)\b[^>]*\bdata-i18n="%s"[^>]*>)(.*?)(</\2>)' % re.escape(key), re.S)
    text = value if key in html_keys else html.escape(value, quote=False)
    out, n = pattern.subn(lambda m: m.group(1) + text + m.group(4), out, count=1)
    if n == 0:
        missing.append(key)

# 2. Head: language, titles, canonical, social tags.
out = out.replace('<html lang="en">', '<html lang="da">', 1)
out = re.sub(r"<title>.*?</title>", "<title>%s</title>" % html.escape(meta["title"]), out, count=1)
out = re.sub(r'(<meta name="description" content=")[^"]*(")', lambda m: m.group(1) + html.escape(meta["description"], quote=True) + m.group(2), out, count=1)
out = re.sub(r'(<meta property="og:title" content=")[^"]*(")', lambda m: m.group(1) + html.escape(meta["og_title"], quote=True) + m.group(2), out, count=1)
out = re.sub(r'(<meta name="twitter:title" content=")[^"]*(")', lambda m: m.group(1) + html.escape(meta["og_title"], quote=True) + m.group(2), out, count=1)
out = re.sub(r'(<meta property="og:description" content=")[^"]*(")', lambda m: m.group(1) + html.escape(meta["og_description"], quote=True) + m.group(2), out, count=1)
out = re.sub(r'(<meta name="twitter:description" content=")[^"]*(")', lambda m: m.group(1) + html.escape(meta["og_description"], quote=True) + m.group(2), out, count=1)
out = out.replace('content="en_GB"', 'content="%s"' % meta["og_locale"], 1)
out = out.replace('<link rel="canonical" href="https://nickipabst.dk/" />', '<link rel="canonical" href="https://nickipabst.dk/da/" />', 1)
out = out.replace('<meta property="og:url" content="https://nickipabst.dk/" />', '<meta property="og:url" content="https://nickipabst.dk/da/" />', 1)
out = out.replace("Nicki Pabst. AI won't speed up your email marketing.", "Nicki Pabst. AI gør ikke din email marketing hurtigere.", 1)

# 3. No language redirect on the Danish page; Danish structured data.
out = re.sub(r"  <script>\s*// Danish visitors.*?</script>\n", "", out, count=1, flags=re.S)
out = re.sub(r'(<script type="application/ld\+json" id="ld-json">\n).*?(\n  </script>)', lambda m: m.group(1) + jsonld + m.group(2), out, count=1, flags=re.S)

# 4. Language toggle: Danish is the active page.
out = out.replace('data-lang="en" class="active"', 'data-lang="en"', 1)
out = out.replace('data-lang="da" hreflang="da"', 'data-lang="da" class="active" hreflang="da"', 1)

# 5. The page lives one folder down, so relative asset paths get "../".
def fix(m):
    attr, quote, url = m.group(1), m.group(2), m.group(3)
    if re.match(r"(https?:|//|#|/|mailto:|data:|tel:)", url):
        return m.group(0)
    return '%s=%s../%s%s' % (attr, quote, url, quote)

out = re.sub(r'\b(src|href|data-src|poster)=(["\'])([^"\']*)\2', fix, out)
# keep the language links and anchors pointing at the site root
out = out.replace('href="../da/"', 'href="/da/"').replace('href="../"', 'href="/"')

(root / "da").mkdir(exist_ok=True)
(root / "da/index.html").write_text(out, encoding="utf-8")
print("da/index.html written;", "missing keys: %s" % missing if missing else "all keys applied")
