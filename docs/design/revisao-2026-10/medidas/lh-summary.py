# Mediana de 3 por pagina e perfil. Uso: python3 -I lh-summary.py <pasta>
import json, pathlib, statistics, sys
root = pathlib.Path(sys.argv[1])
rows = {}
for f in sorted(root.glob("*.json")):
    name, ff, run = f.stem.rsplit("-", 2)
    d = json.loads(f.read_text())
    a, c = d["audits"], d["categories"]
    rows.setdefault((name, ff), []).append({
        "perf": round(c["performance"]["score"] * 100), "a11y": round(c["accessibility"]["score"] * 100),
        "bp": round(c["best-practices"]["score"] * 100), "seo": round(c["seo"]["score"] * 100),
        "fcp": a["first-contentful-paint"]["numericValue"] / 1000, "lcp": a["largest-contentful-paint"]["numericValue"] / 1000,
        "tbt": a["total-blocking-time"]["numericValue"], "cls": a["cumulative-layout-shift"]["numericValue"],
        "kb": a["total-byte-weight"]["numericValue"] / 1024,
    })
print("| pagina | perfil | desempenho (3 execucoes) | mediana | FCP | LCP | TBT | CLS | peso | a11y | boas praticas | SEO |")
print("|---|---|---|---|---|---|---|---|---|---|---|---|")
for (name, ff), runs in rows.items():
    med = lambda k: statistics.median(r[k] for r in runs)
    print(f"| {name} | {ff} | {', '.join(str(r['perf']) for r in runs)} | **{med('perf'):.0f}** | {med('fcp'):.2f} s | {med('lcp'):.2f} s | {med('tbt'):.0f} ms | {med('cls'):.3f} | {med('kb'):.0f} KB | {med('a11y'):.0f} | {med('bp'):.0f} | {med('seo'):.0f} |")
