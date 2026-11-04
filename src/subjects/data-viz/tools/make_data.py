"""Generates the practice dataset used by the SQL lab, the Excel lab and the downloadable workbook.
Deterministic (fixed seed), so the three always match. Writes dataset.js (window.DV_SALES)."""
import random, json, os, datetime as dt
random.seed(3003)
HERE = os.path.dirname(os.path.abspath(__file__))
REG = {"Central": ["Selangor", "Kuala Lumpur", "Negeri Sembilan"], "Northern": ["Penang", "Kedah", "Perak"],
       "Southern": ["Johor", "Melaka"], "East Coast": ["Pahang", "Terengganu", "Kelantan"], "East Malaysia": ["Sabah", "Sarawak"]}
REG_W = {"Central": 34, "Northern": 20, "Southern": 18, "East Coast": 12, "East Malaysia": 16}
CAT = {"Furniture": {"Chairs": (250, 900, .16), "Tables": (400, 1500, -.02), "Bookcases": (300, 900, .02), "Furnishings": (30, 200, .2)},
       "Office Supplies": {"Paper": (10, 60, .3), "Binders": (8, 40, .26), "Storage": (40, 250, .12), "Art": (5, 40, .24), "Appliances": (80, 600, .15)},
       "Technology": {"Phones": (600, 3500, .14), "Accessories": (30, 300, .2), "Machines": (800, 4000, .08), "Copiers": (1500, 6000, .3)}}
CAT_W = {"Furniture": 26, "Office Supplies": 46, "Technology": 28}
SEG = [("Consumer", 52), ("Corporate", 30), ("Home Office", 18)]
DISC_STATE = {"Sabah": .3, "Kelantan": .4, "Terengganu": .2}   # heavy discounting -> losses (diverging-colour example)
def pick(w): return random.choices(list(w), weights=list(w.values()))[0]
rows = []
oid = 1001
for y in (2024, 2025):
    for m in range(1, 13):
        n = 13 + (3 if m in (10, 11, 12) else 0) + (2 if m in (3, 9) else 0) + (2 if y == 2025 else 0) + random.randint(-2, 2)
        for _ in range(n):
            d = dt.date(y, m, random.randint(1, 28))
            reg = pick(REG_W); st = random.choice(REG[reg])
            cat = pick(CAT_W); sub = random.choice(list(CAT[cat])); lo, hi, mg = CAT[cat][sub]
            seg = random.choices([s for s, _ in SEG], weights=[w for _, w in SEG])[0]
            units = random.choices([1, 2, 3, 4, 5, 6, 8], weights=[22, 26, 18, 12, 9, 7, 6])[0]
            price = round(random.uniform(lo, hi) / 5) * 5 if hi > 100 else round(random.uniform(lo, hi), 1)
            base = DISC_STATE.get(st, 0)
            disc = random.choices([0, .1, .2, .3, .4], weights=[55, 18, 12, 9, 6])[0]
            disc = min(.5, max(disc, base if random.random() < .7 else 0))
            sales = round(units * price * (1 - disc), 2)
            margin = mg + .06 - disc * 1.15 + random.uniform(-.05, .05)
            profit = round(sales * margin, 2)
            ship = random.choices(range(1, 10), weights=[6, 14, 18, 16, 12, 10, 8, 6, 4 + (6 if reg == "East Malaysia" else 0)])[0]
            ch = "Online" if random.random() < (.45 + (.1 if y == 2025 else 0)) else "Store"
            rows.append([f"SO-{oid}", d.isoformat(), reg, st, seg, ch, cat, sub, units, price, disc, sales, profit, ship])
            oid += 1
COLS = ["OrderID", "OrderDate", "Region", "State", "Segment", "Channel", "Category", "SubCategory", "Units", "UnitPrice", "Discount", "Sales", "Profit", "ShipDays"]
json.dump({"cols": COLS, "rows": rows}, open(os.path.join(HERE, "dataset.json"), "w"), separators=(",", ":"))
tot = sum(r[11] for r in rows); pr = sum(r[12] for r in rows)
print(len(rows), "orders · sales", round(tot), "· profit", round(pr), "· margin", round(pr / tot * 100, 1), "%")
by = {}
for r in rows: by[r[3]] = by.get(r[3], 0) + r[12]
print(sorted((round(v), k) for k, v in by.items()))
bys = {}
for r in rows: bys[r[7]] = bys.get(r[7], 0) + r[12]
print(sorted((round(v), k) for k, v in bys.items()))
