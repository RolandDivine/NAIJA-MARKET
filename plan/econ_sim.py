#!/usr/bin/env python3
"""Naija Market empire economy simulation.

Money unit: F = one day of gross revenue of the finished flagship shop.
Run:  python3 econ_sim.py          -> simulate with FINAL params, print report
      python3 econ_sim.py --tune   -> random/coordinate search for branch curve
      python3 econ_sim.py --json   -> print the "empire" + "sim" blocks as JSON
"""
import json, sys, random, statistics

REGIONS = [  # name, size, income multiplier
    ("Lagos", 20, 1.0), ("South-West", 40, 1.1), ("South-South", 40, 1.2),
    ("South-East", 35, 1.3), ("North-Central + Abuja", 45, 1.4),
    ("North-West", 40, 1.5), ("North-East", 30, 1.6), ("West Africa", 60, 2.0),
    ("Rest of Africa", 50, 2.3), ("UK + Europe", 60, 2.7),
    ("North America", 50, 3.0), ("Middle East + Asia", 30, 3.0),
]
PAYROLL = 0.15      # salaries: share of all revenue
TAX = 0.10          # flat rate on monthly profit, paid at each month end
INEFF = 0.8         # player inefficiency on all income
START_DAY = 30      # flagship ladder finished, cash assumed 0
MONTH = 30

# ---- FINAL tuned parameters (F units) ----
FINAL = dict(c0=1.6, c1=0.46, p=0.645, b=0.0445)
# one-off items are priced as "the cost of branch number k", so the greedy
# player buys them around the time he reaches branch k.
MANAGER_COST = 1.8
MACHINE_AT = {"belt": 6, "auto": 28, "pack": 75}          # branch index anchor
CONTRACT_AT = [3, 14, 50, 130, 250, 400]                    # branch index anchor
CONTRACT_PER_DAY = [0.10, 0.20, 0.30, 0.40, 0.60, 0.90]     # total 2.5 F/day
RM_FACTOR = 1.0   # regional manager = RM_FACTOR x cost of the region's first branch
MILESTONES = [1] + list(range(5, 100, 5)) + list(range(100, 501, 10))


def r3(x):
    return float(f"{x:.3g}") if x < 100 else float(round(x))


def build(prm):
    c0, c1, p, b = prm["c0"], prm["c1"], prm["p"], prm["b"]
    C = lambda k: c0 + c1 * k ** p
    machines = {m: r3(C(k)) for m, k in MACHINE_AT.items()}
    contracts = [{"cost": r3(C(k)), "perDay": e} for k, e in zip(CONTRACT_AT, CONTRACT_PER_DAY)]
    regions, first = [], 1
    for i, (name, size, mult) in enumerate(REGIONS):
        cost = 1.2 if i == 0 else r3(RM_FACTOR * C(first))
        regions.append({"name": name, "size": size, "mult": mult, "managerCost": cost})
        first += size
    return {"managerCost": MANAGER_COST, "machineCost": machines, "contracts": contracts,
            "regions": regions, "branch": {"c0": c0, "c1": c1, "p": p, "b": b},
            "inefficiency": INEFF}


def simulate(emp, max_day=3000):
    br = emp["branch"]
    C = lambda k: br["c0"] + br["c1"] * k ** br["p"]
    cash, day = 0.0, START_DAY
    has_mgr, machines, tier, rm = False, [], 0, 0   # rm = regional managers hired
    mach_left = sorted(emp["machineCost"].items(), key=lambda kv: kv[1])
    branches, per_region = 0, [0] * 12
    month_profit = 0.0
    buys, events, at = [], [], {}
    while branches < 500 and day < max_day:
        day += 1
        flag = 1.0 * (1 + (0.2 if has_mgr else 0) + 0.1 * len(machines))
        export = sum(c["perDay"] for c in emp["contracts"][:tier])
        bri = sum(n * r["mult"] for n, r in zip(per_region, emp["regions"])) * br["b"]
        profit = (flag + export + bri) * INEFF * (1 - PAYROLL)
        cash += profit
        month_profit += profit
        if day % MONTH == 0:
            cash -= TAX * max(0.0, month_profit)
            month_profit = 0.0
        while True:
            opts = []
            if not has_mgr: opts.append((emp["managerCost"], "manager"))
            if mach_left: opts.append((mach_left[0][1], "machine"))
            if tier < 6: opts.append((emp["contracts"][tier]["cost"], "contract"))
            # next regional manager becomes available when every open region is full
            cur = rm - 1
            if rm < 12 and (rm == 0 or per_region[cur] >= emp["regions"][cur]["size"]):
                opts.append((emp["regions"][rm]["managerCost"], "region"))
            if rm > 0 and per_region[cur] < emp["regions"][cur]["size"]:
                opts.append((C(branches + 1), "branch"))
            if not opts: break
            cost, kind = min(opts)
            if cash < cost: break
            cash -= cost
            buys.append(day)
            if kind == "manager": has_mgr = True; events.append((day, "shop manager"))
            elif kind == "machine": machines.append(mach_left.pop(0)[0]); events.append((day, "machine " + machines[-1]))
            elif kind == "contract": tier += 1; events.append((day, f"contract {tier}"))
            elif kind == "region": rm += 1; events.append((day, "region " + emp["regions"][rm - 1]["name"]))
            else:
                branches += 1; per_region[cur] += 1; at[branches] = day
                if branches in MILESTONES: events.append((day, f"{branches} branches"))
    gaps = [b - a for a, b in zip([START_DAY] + buys, buys)]
    egaps = [b[0] - a[0] for a, b in zip([(START_DAY, "")] + events, events)]
    flag = 1.0 * (1 + 0.2 + 0.3)
    gross = flag + sum(c["perDay"] for c in emp["contracts"]) + \
        sum(r["size"] * r["mult"] for r in emp["regions"]) * br["b"]
    return {"at": at, "gaps": gaps, "events": events, "egaps": egaps, "done": branches >= 500,
            "netPerDay": gross * INEFF * (1 - PAYROLL) * (1 - TAX), "end": day}


TARGET = {1: 36, 10: 70, 50: 210, 100: 340, 250: 650, 500: 975}


def score(prm):
    s = simulate(build(prm), 1600)
    n = len(s["at"])
    err = sum(((s["at"].get(k, 1600 + (k - n) * 5) - d) / d) ** 2 for k, d in TARGET.items())
    err += 0.02 * max(0, max(s["gaps"]) - 6) ** 2
    return err


def tune():
    random.seed(1)
    best = dict(FINAL); bs = score(best)
    for it in range(6000):
        c = {k: v * (1 + random.gauss(0, 0.06 if it < 4000 else 0.015)) for k, v in best.items()}
        sc = score(c)
        if sc < bs: best, bs = c, sc
    print(bs, best)


def report(prm=FINAL):
    emp = build(prm)
    s = simulate(emp)
    at = s["at"]
    print("branches -> day:", {k: at[k] for k in (1, 10, 50, 100, 250, 500)})
    g = s["gaps"]
    print("purchases:", len(g), "max gap", max(g), "median", statistics.median(g),
          "share<=3d", round(sum(x <= 3 for x in g) / len(g), 3))
    print("max event gap:", max(s["egaps"]))
    for d, e in s["events"]: print(f"  day {d:4d}: {e}")
    print("net income/day at 500:", round(s["netPerDay"], 1))
    return emp, s


if __name__ == "__main__":
    if "--tune" in sys.argv: tune()
    elif "--json" in sys.argv:
        emp = build(FINAL); s = simulate(emp); g = s["gaps"]
        print(json.dumps({"empire": emp, "sim": {
            "dayAtBranches": {str(k): s["at"][k] for k in (1, 10, 50, 100, 250, 500)},
            "maxGapDays": max(g), "medianGapDays": statistics.median(g),
            "incomePerDayAt500": round(s["netPerDay"], 1)}}, indent=1))
    else: report()
