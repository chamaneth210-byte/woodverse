"""Verification round 2: a genuinely detailed wood image, plus characterisation of
the flat-colour false positive in is_likely_room."""
import base64, json, statistics, time, urllib.request

import cv2
import numpy as np

URL = "http://localhost:8010/ai/image/analyze"
H = {"content-type": "application/json", "x-api-key": "evidence-key-123"}


def b64(img):
    ok, buf = cv2.imencode(".png", img)
    return "data:image/png;base64," + base64.b64encode(buf.tobytes()).decode()


def analyze(img):
    req = urllib.request.Request(URL, data=json.dumps({"imageBase64": b64(img)}).encode(), headers=H)
    return json.load(urllib.request.urlopen(req, timeout=30))


def detailed_wood(w=800, h=800):
    """Wood tones PLUS high-frequency detail so edgeDensity clears 0.04."""
    img = np.zeros((h, w, 3), np.uint8)
    rng = np.random.default_rng(11)
    for y in range(h):
        t = y / h
        img[y, :] = (int(55 + 95 * t), int(95 + 75 * t), int(155 - 55 * t))
    # tight dark grain lines -> many Canny edges
    for _ in range(1400):
        x0 = int(rng.integers(0, w - 30))
        y0 = int(rng.integers(0, h - 3))
        ln = int(rng.integers(10, 30))
        v = int(rng.integers(15, 60))
        img[y0 : y0 + 2, x0 : x0 + ln] = (v, v + 20, v + 55)
    # a few knots
    for _ in range(14):
        cx, cy = int(rng.integers(40, w - 40)), int(rng.integers(40, h - 40))
        cv2.circle(img, (cx, cy), int(rng.integers(6, 16)), (30, 45, 85), -1)
        cv2.circle(img, (cx, cy), int(rng.integers(16, 26)), (70, 100, 150), 2)
    return img


def room_scene(w=800, h=800):
    img = np.full((h, w, 3), (206, 214, 220), np.uint8)
    cv2.rectangle(img, (90, 380), (330, 700), (188, 196, 203), -1)
    cv2.rectangle(img, (420, 420), (700, 700), (192, 200, 206), -1)
    return cv2.GaussianBlur(img, (25, 25), 0)


CASES = [
    ("detailed wood grain + knots", detailed_wood(), True, False),
    ("room scene (warm neutral, blurred)", room_scene(), False, True),
]

print("=" * 100)
print("ROUND 2 — classification with correctly-constructed inputs")
print("=" * 100)
print(f"  {'image':<40}{'furn?':<8}{'room?':<8}{'edge':<9}{'bright':<9}{'sharp':<8}{'verdict'}")
print("  " + "-" * 94)
results = []
for name, img, ef, er in CASES:
    r = analyze(img)
    ok = r["isLikelyFurniture"] == ef and r["isLikelyRoom"] == er
    print(f"  {name:<40}{str(r['isLikelyFurniture']):<8}{str(r['isLikelyRoom']):<8}"
          f"{r['edgeDensity']:<9}{r['brightness']:<9}{r['sharpness']:<8}{'PASS' if ok else 'FAIL'}")
    results.append({"image": name, "expected": {"f": ef, "r": er},
                    "actual": {"f": r["isLikelyFurniture"], "r": r["isLikelyRoom"]},
                    "pass": ok, "metrics": {k: r[k] for k in
                    ("brightness", "contrast", "sharpness", "edgeDensity")},
                    "dominantColors": r["dominantColors"]})

print("\n" + "=" * 100)
print("BUG CHARACTERISATION — flat, textureless product backgrounds")
print("  is_likely_room requires warm_neutral>0.45 AND edge<0.12 AND bright>0.35 AND contrast<0.55")
print("  -> it has NO lower bound on texture, so ANY flat bright warm/neutral field qualifies")
print("=" * 100)
print(f"  {'flat colour':<34}{'RGB':<18}{'edge':<8}{'bright':<9}{'room?':<8}{'furn?':<8}note")
print("  " + "-" * 96)
bug = []
for label, rgb in [
    ("pure white (product photo bg)", (255, 255, 255)),
    ("off-white / studio sweep", (245, 245, 248)),
    ("light warm grey backdrop", (232, 228, 222)),
    ("light beige seamless", (225, 215, 200)),
    ("flat saturated blue", (200, 90, 40)),
    ("flat mid grey", (128, 128, 128)),
]:
    img = np.full((600, 600, 3), rgb, np.uint8)
    r = analyze(img)
    is_room, is_furn = r["isLikelyRoom"], r["isLikelyFurniture"]
    note = "FALSE POSITIVE" if is_room else "ok"
    print(f"  {label:<34}{str(rgb):<18}{r['edgeDensity']:<8}{r['brightness']:<9}"
          f"{str(is_room):<8}{str(is_furn):<8}{note}")
    bug.append({"colour": label, "rgb": rgb, "isLikelyRoom": is_room,
                "isLikelyFurniture": is_furn, "edgeDensity": r["edgeDensity"],
                "brightness": r["brightness"], "contrast": r["contrast"],
                "sharpness": r["sharpness"],
                "recommendations": r["recommendations"]})

fp = [b for b in bug if b["isLikelyRoom"]]
print(f"\n  {len(fp)}/{len(bug)} flat colours misclassified as 'likely room scene'")

print("\n" + "=" * 100)
print("LATENCY — 30 repetitions, real HTTP against the running service")
print("=" * 100)
img = detailed_wood(400, 400)
b = b64(img)
eps = {
    "image/analyze": {"imageBase64": b},
    "image/compare": {"imageBase64A": b, "imageBase64B": b64(detailed_wood(400, 400))},
    "image/validate": {"imageBase64": b},
}
lat = {}
for ep, body in eps.items():
    analyze(img)
    ts = []
    for _ in range(30):
        t = time.perf_counter()
        rq = urllib.request.Request(f"http://localhost:8010/ai/{ep}",
                                    data=json.dumps(body).encode(), headers=H)
        urllib.request.urlopen(rq, timeout=30).read()
        ts.append((time.perf_counter() - t) * 1000)
    ts.sort()
    med = statistics.median(ts)
    print(f"  {ep:<16} median {med:7.2f} ms   p95 {ts[int(0.95*len(ts))-1]:7.2f} ms   "
          f"min {min(ts):7.2f}   max {max(ts):7.2f}   n={len(ts)}")
    lat[ep] = {"median_ms": round(med, 2), "p95_ms": round(ts[int(0.95*len(ts))-1], 2),
               "min_ms": round(min(ts), 2), "max_ms": round(max(ts), 2), "n": len(ts)}

out = {"classification_round2": results, "flat_colour_false_positives": bug,
       "false_positive_count": f"{len(fp)}/{len(bug)}", "latency": lat}
json.dump(out, open("/tmp/wv/image-verify.json", "w"), indent=2)
print("\n  saved -> /tmp/wv/image-verify.json")