(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [337],
  {
    10117: (e, t, s) => {
      "use strict";
      s.d(t, { $: () => c });
      var r = s(95155),
        a = s(12115),
        l = s(46673),
        n = s(83101),
        i = s(61433);
      let o = (0, n.F)(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          {
            variants: {
              variant: {
                default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                destructive:
                  "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                outline:
                  "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
                secondary:
                  "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
              },
              size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3 text-xs",
                lg: "h-11 rounded-md px-8",
                icon: "h-10 w-10",
              },
            },
            defaultVariants: { variant: "default", size: "default" },
          },
        ),
        c = a.forwardRef((e, t) => {
          let { className: s, variant: a, size: n, asChild: c = !1, ...d } = e,
            u = c ? l.DX : "button";
          return (0, r.jsx)(u, {
            className: (0, i.cn)(o({ variant: a, size: n, className: s })),
            ref: t,
            ...d,
          });
        });
      c.displayName = "Button";
    },
    15007: (e, t, s) => {
      Promise.resolve().then(s.bind(s, 33190));
    },
    17055: (e, t, s) => {
      "use strict";
      s.d(t, {
        BT: () => c,
        Wu: () => d,
        ZB: () => o,
        Zp: () => n,
        aR: () => i,
        wL: () => u,
      });
      var r = s(95155),
        a = s(12115),
        l = s(61433);
      let n = a.forwardRef((e, t) => {
        let { className: s, ...a } = e;
        return (0, r.jsx)("div", {
          ref: t,
          className: (0, l.cn)(
            "rounded-xl border bg-card text-card-foreground shadow-sm",
            s,
          ),
          ...a,
        });
      });
      n.displayName = "Card";
      let i = a.forwardRef((e, t) => {
        let { className: s, ...a } = e;
        return (0, r.jsx)("div", {
          ref: t,
          className: (0, l.cn)("flex flex-col space-y-1.5 p-6", s),
          ...a,
        });
      });
      i.displayName = "CardHeader";
      let o = a.forwardRef((e, t) => {
        let { className: s, ...a } = e;
        return (0, r.jsx)("div", {
          ref: t,
          className: (0, l.cn)("font-semibold leading-none tracking-tight", s),
          ...a,
        });
      });
      o.displayName = "CardTitle";
      let c = a.forwardRef((e, t) => {
        let { className: s, ...a } = e;
        return (0, r.jsx)("div", {
          ref: t,
          className: (0, l.cn)("text-sm text-muted-foreground", s),
          ...a,
        });
      });
      c.displayName = "CardDescription";
      let d = a.forwardRef((e, t) => {
        let { className: s, ...a } = e;
        return (0, r.jsx)("div", { ref: t, className: (0, l.cn)("p-6 pt-0", s), ...a });
      });
      d.displayName = "CardContent";
      let u = a.forwardRef((e, t) => {
        let { className: s, ...a } = e;
        return (0, r.jsx)("div", {
          ref: t,
          className: (0, l.cn)("flex items-center p-6 pt-0", s),
          ...a,
        });
      });
      u.displayName = "CardFooter";
    },
    33190: (e, t, s) => {
      "use strict";
      (s.r(t), s.d(t, { default: () => z }));
      var r = s(95155),
        a = s(12115),
        l = s(61433);
      function n(e) {
        return e >= 1e3
          ? "".concat((e / 1e3).toFixed(1), "t")
          : e >= 10
            ? "".concat(Math.round(e), " kg")
            : "".concat(e.toFixed(1), " kg");
      }
      function i(e) {
        return e >= 90
          ? "Excellent"
          : e >= 70
            ? "Good"
            : e >= 50
              ? "Average"
              : e >= 30
                ? "Fair"
                : "Needs Work";
      }
      function o(e) {
        return e >= 70
          ? "text-carbon-low"
          : e >= 50
            ? "text-carbon-medium"
            : e >= 30
              ? "text-carbon-high"
              : "text-carbon-critical";
      }
      var c = s(17055);
      function d(e) {
        let { score: t, explanation: s, totalCo2eKg: a, className: n } = e,
          d = null != t ? t : 0,
          u = 2 * Math.PI * 54,
          x = u - (d / 100) * u;
        return (0, r.jsxs)(c.Zp, {
          className: (0, l.cn)("relative overflow-hidden", n),
          children: [
            (0, r.jsx)(c.aR, {
              className: "pb-2",
              children: (0, r.jsx)(c.ZB, {
                className: "text-lg",
                children: "Carbon Score",
              }),
            }),
            (0, r.jsxs)(c.Wu, {
              className: "flex flex-col items-center gap-4",
              children: [
                (0, r.jsxs)("div", {
                  className: "relative flex items-center justify-center",
                  role: "img",
                  "aria-label": "Carbon score: ".concat(d, " out of 100. ").concat(i(d)),
                  children: [
                    (0, r.jsxs)("svg", {
                      className: "h-36 w-36 -rotate-90",
                      viewBox: "0 0 120 120",
                      "aria-hidden": "true",
                      children: [
                        (0, r.jsx)("circle", {
                          cx: "60",
                          cy: "60",
                          r: "54",
                          fill: "none",
                          stroke: "currentColor",
                          className: "text-muted/30",
                          strokeWidth: "8",
                        }),
                        (0, r.jsx)("circle", {
                          cx: "60",
                          cy: "60",
                          r: "54",
                          fill: "none",
                          stroke: "currentColor",
                          className: (0, l.cn)(
                            "transition-all duration-1000 ease-out",
                            o(d),
                          ),
                          strokeWidth: "8",
                          strokeLinecap: "round",
                          strokeDasharray: u,
                          strokeDashoffset: x,
                        }),
                      ],
                    }),
                    (0, r.jsxs)("div", {
                      className: "absolute flex flex-col items-center",
                      children: [
                        (0, r.jsx)("span", {
                          className: (0, l.cn)("text-4xl font-bold tabular-nums", o(d)),
                          children: d,
                        }),
                        (0, r.jsx)("span", {
                          className: "text-xs text-muted-foreground",
                          children: "/ 100",
                        }),
                      ],
                    }),
                  ],
                }),
                (0, r.jsxs)("div", {
                  className: "text-center",
                  children: [
                    (0, r.jsx)("p", {
                      className: (0, l.cn)("text-sm font-semibold", o(d)),
                      children: i(d),
                    }),
                    (0, r.jsx)("p", {
                      className: "mt-1 text-xs text-muted-foreground",
                      children: s,
                    }),
                  ],
                }),
                (0, r.jsxs)("div", {
                  className: "w-full rounded-lg bg-muted/50 p-3 text-center",
                  children: [
                    (0, r.jsx)("p", {
                      className: "text-xs text-muted-foreground",
                      children: "Total this period",
                    }),
                    (0, r.jsxs)("p", {
                      className: "text-lg font-semibold tabular-nums",
                      children: [
                        a >= 1e3
                          ? "".concat((a / 1e3).toFixed(1), "t")
                          : "".concat(a.toFixed(1), " kg"),
                        " ",
                        (0, r.jsx)("span", {
                          className: "text-xs font-normal text-muted-foreground",
                          children: "CO₂e",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
      let u = {
          transport: "Transport",
          energy: "Energy",
          food: "Food",
          shopping: "Shopping",
        },
        x = {
          transport: {
            car_petrol: "Petrol Car",
            car_diesel: "Diesel Car",
            car_electric: "Electric Car",
            bus: "Bus",
            train: "Train",
            flight_short: "Short Flight",
            flight_long: "Long Flight",
            bicycle: "Bicycle",
            walking: "Walking",
          },
          energy: {
            electricity: "Electricity",
            natural_gas: "Natural Gas",
            solar: "Solar",
          },
          food: {
            beef: "Beef",
            poultry: "Poultry",
            fish: "Fish",
            dairy: "Dairy",
            vegetables: "Vegetables",
            fruits: "Fruits",
            grains: "Grains",
          },
          shopping: {
            clothing: "Clothing",
            electronics: "Electronics",
            furniture: "Furniture",
            secondhand: "Second-hand",
          },
        },
        m = {
          transport: "hsl(210, 100%, 56%)",
          energy: "hsl(45, 100%, 50%)",
          food: "hsl(142, 71%, 45%)",
          shopping: "hsl(280, 67%, 55%)",
        };
      var h = s(24947),
        g = s(56154),
        p = s(89592),
        f = s(60952);
      let j = { transport: h.A, energy: g.A, food: p.A, shopping: f.A };
      function b(e) {
        let { breakdown: t, className: s } = e,
          a = null != t ? t : { transport: 0, energy: 0, food: 0, shopping: 0 },
          i = Object.values(a).reduce((e, t) => e + t, 0),
          o = Object.entries(a).sort((e, t) => {
            let [, s] = e,
              [, r] = t;
            return r - s;
          });
        return (0, r.jsxs)(c.Zp, {
          className: (0, l.cn)(s),
          children: [
            (0, r.jsx)(c.aR, {
              className: "pb-3",
              children: (0, r.jsx)(c.ZB, {
                className: "text-lg",
                children: "Emissions by Category",
              }),
            }),
            (0, r.jsxs)(c.Wu, {
              children: [
                (0, r.jsxs)("table", {
                  className: "sr-only",
                  children: [
                    (0, r.jsx)("caption", {
                      children: "Carbon emissions breakdown by category",
                    }),
                    (0, r.jsx)("thead", {
                      children: (0, r.jsxs)("tr", {
                        children: [
                          (0, r.jsx)("th", { children: "Category" }),
                          (0, r.jsx)("th", { children: "CO₂e" }),
                          (0, r.jsx)("th", { children: "Percentage" }),
                        ],
                      }),
                    }),
                    (0, r.jsx)("tbody", {
                      children: o.map((e) => {
                        let [t, s] = e;
                        return (0, r.jsxs)(
                          "tr",
                          {
                            children: [
                              (0, r.jsx)("td", { children: u[t] }),
                              (0, r.jsx)("td", { children: n(s) }),
                              (0, r.jsxs)("td", {
                                children: [i > 0 ? Math.round((s / i) * 100) : 0, "%"],
                              }),
                            ],
                          },
                          t,
                        );
                      }),
                    }),
                  ],
                }),
                (0, r.jsx)("div", {
                  className: "space-y-4",
                  "aria-hidden": "true",
                  children: o.map((e) => {
                    let [t, s] = e,
                      a = j[t],
                      l = i > 0 ? (s / i) * 100 : 0;
                    return (0, r.jsxs)(
                      "div",
                      {
                        className: "space-y-1.5",
                        children: [
                          (0, r.jsxs)("div", {
                            className: "flex items-center justify-between text-sm",
                            children: [
                              (0, r.jsxs)("div", {
                                className: "flex items-center gap-2",
                                children: [
                                  (0, r.jsx)(a, {
                                    className: "h-4 w-4 text-muted-foreground",
                                  }),
                                  (0, r.jsx)("span", {
                                    className: "font-medium",
                                    children: u[t],
                                  }),
                                ],
                              }),
                              (0, r.jsx)("span", {
                                className: "tabular-nums text-muted-foreground",
                                children: n(s),
                              }),
                            ],
                          }),
                          (0, r.jsx)("div", {
                            className: "h-2 w-full overflow-hidden rounded-full bg-muted",
                            children: (0, r.jsx)("div", {
                              className:
                                "h-full rounded-full transition-all duration-700 ease-out",
                              style: {
                                width: "".concat(Math.max(l, 1), "%"),
                                backgroundColor: m[t],
                              },
                            }),
                          }),
                        ],
                      },
                      t,
                    );
                  }),
                }),
                0 === i &&
                  (0, r.jsx)("p", {
                    className: "mt-4 text-center text-sm text-muted-foreground",
                    children:
                      "No activities logged yet. Start tracking to see your breakdown!",
                  }),
              ],
            }),
          ],
        });
      }
      var y = s(10117),
        v = s(80323),
        N = s(86153);
      let w = ["transport", "energy", "food", "shopping"];
      var k = s(6191),
        C = s(35299);
      let S = { transport: h.A, energy: g.A, food: p.A, shopping: f.A };
      function F(e) {
        let { emissionFactors: t, onSubmit: s, className: n } = e,
          [i, o] = (0, a.useState)(null),
          [d, m] = (0, a.useState)(null),
          [h, g] = (0, a.useState)(""),
          [p, f] = (0, a.useState)(!1),
          [j, b] = (0, a.useState)(!1),
          F = i
            ? t.filter((e) => {
                var t;
                return Object.keys(null != (t = x[i]) ? t : {}).includes(e.subCategory);
              })
            : [],
          A = async () => {
            if (i && d && h) {
              f(!0);
              try {
                (await s({
                  category: i,
                  subCategory: d.subCategory,
                  quantity: parseFloat(h),
                  unit: d.unit,
                  emissionFactorId: d.id,
                  activityDate: new Date().toISOString().split("T")[0],
                }),
                  b(!0),
                  o(null),
                  m(null),
                  g(""),
                  setTimeout(() => b(!1), 2e3));
              } finally {
                f(!1);
              }
            }
          };
        return (0, r.jsxs)(c.Zp, {
          className: (0, l.cn)(n),
          children: [
            (0, r.jsx)(c.aR, {
              className: "pb-3",
              children: (0, r.jsxs)(c.ZB, {
                className: "flex items-center gap-2 text-lg",
                children: [(0, r.jsx)(k.A, { className: "h-5 w-5" }), "Quick Log"],
              }),
            }),
            (0, r.jsxs)(c.Wu, {
              children: [
                j &&
                  (0, r.jsx)("div", {
                    className:
                      "mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200",
                    role: "status",
                    "aria-live": "polite",
                    children: "✓ Activity logged successfully!",
                  }),
                (0, r.jsxs)("div", {
                  className: "mb-4",
                  children: [
                    (0, r.jsx)(N.J, {
                      className: "mb-2 block text-xs text-muted-foreground",
                      children: "Category",
                    }),
                    (0, r.jsx)("div", {
                      className: "grid grid-cols-2 gap-2",
                      role: "radiogroup",
                      "aria-label": "Select activity category",
                      children: w.map((e) => {
                        let t = S[e];
                        return (0, r.jsxs)(
                          "button",
                          {
                            onClick: () => {
                              (o(e), m(null), g(""));
                            },
                            className: (0, l.cn)(
                              "flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors",
                              "hover:border-primary hover:bg-accent",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              i === e && "border-primary bg-primary/5 font-medium",
                            ),
                            role: "radio",
                            "aria-checked": i === e,
                            children: [(0, r.jsx)(t, { className: "h-4 w-4" }), u[e]],
                          },
                          e,
                        );
                      }),
                    }),
                  ],
                }),
                i &&
                  F.length > 0 &&
                  (0, r.jsxs)("div", {
                    className: "mb-4",
                    children: [
                      (0, r.jsx)(N.J, {
                        className: "mb-2 block text-xs text-muted-foreground",
                        children: "Type",
                      }),
                      (0, r.jsx)("div", {
                        className: "flex flex-wrap gap-2",
                        children: F.map((e) =>
                          (0, r.jsx)(
                            "button",
                            {
                              onClick: () => m(e),
                              className: (0, l.cn)(
                                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                                "hover:border-primary hover:bg-accent",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                (null == d ? void 0 : d.id) === e.id &&
                                  "border-primary bg-primary/10 font-medium",
                              ),
                              children: e.name,
                            },
                            e.id,
                          ),
                        ),
                      }),
                    ],
                  }),
                d &&
                  (0, r.jsxs)("div", {
                    className: "mb-4",
                    children: [
                      (0, r.jsxs)(N.J, {
                        htmlFor: "quick-log-quantity",
                        className: "mb-2 block text-xs text-muted-foreground",
                        children: ["Quantity (", d.unit, ")"],
                      }),
                      (0, r.jsxs)("div", {
                        className: "flex gap-2",
                        children: [
                          (0, r.jsx)(v.p, {
                            id: "quick-log-quantity",
                            type: "number",
                            min: "0",
                            step: "0.1",
                            value: h,
                            onChange: (e) => g(e.target.value),
                            placeholder: "e.g. 10 ".concat(d.unit),
                            className: "flex-1",
                            "aria-describedby": "quantity-hint",
                          }),
                          (0, r.jsx)(y.$, {
                            onClick: A,
                            disabled: !h || p,
                            size: "default",
                            children: p
                              ? (0, r.jsx)(C.A, { className: "h-4 w-4 animate-spin" })
                              : "Log",
                          }),
                        ],
                      }),
                      (0, r.jsxs)("p", {
                        id: "quantity-hint",
                        className: "mt-1 text-xs text-muted-foreground",
                        children: ["Enter the amount in ", d.unit],
                      }),
                    ],
                  }),
              ],
            }),
          ],
        });
      }
      var A = s(26991),
        R = s(84879),
        W = s(68425),
        K = s(47734),
        Z = s(73697),
        _ = s(23508),
        O = s(77568);
      function L(e) {
        let { data: t, className: s } = e,
          a = t.map((e) => ({
            ...e,
            label: new Date(e.periodStart).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          }));
        return (0, r.jsxs)(c.Zp, {
          className: (0, l.cn)(s),
          children: [
            (0, r.jsx)(c.aR, {
              className: "pb-2",
              children: (0, r.jsx)(c.ZB, {
                className: "text-lg",
                children: "Weekly Trends",
              }),
            }),
            (0, r.jsxs)(c.Wu, {
              children: [
                (0, r.jsxs)("table", {
                  className: "sr-only",
                  children: [
                    (0, r.jsx)("caption", { children: "Weekly carbon emissions trend" }),
                    (0, r.jsx)("thead", {
                      children: (0, r.jsxs)("tr", {
                        children: [
                          (0, r.jsx)("th", { children: "Week Starting" }),
                          (0, r.jsx)("th", { children: "CO₂e (kg)" }),
                          (0, r.jsx)("th", { children: "Score" }),
                        ],
                      }),
                    }),
                    (0, r.jsx)("tbody", {
                      children: a.map((e) =>
                        (0, r.jsxs)(
                          "tr",
                          {
                            children: [
                              (0, r.jsx)("td", { children: e.label }),
                              (0, r.jsxs)("td", {
                                children: [e.totalCo2eKg.toFixed(1), " kg"],
                              }),
                              (0, r.jsxs)("td", { children: [e.score, "/100"] }),
                            ],
                          },
                          e.periodStart,
                        ),
                      ),
                    }),
                  ],
                }),
                (0, r.jsx)("div", {
                  className: "h-[200px] w-full",
                  "aria-hidden": "true",
                  role: "presentation",
                  children:
                    a.length > 0
                      ? (0, r.jsx)(A.u, {
                          width: "100%",
                          height: "100%",
                          children: (0, r.jsxs)(R.Q, {
                            data: a,
                            children: [
                              (0, r.jsx)("defs", {
                                children: (0, r.jsxs)("linearGradient", {
                                  id: "co2eGradient",
                                  x1: "0",
                                  y1: "0",
                                  x2: "0",
                                  y2: "1",
                                  children: [
                                    (0, r.jsx)("stop", {
                                      offset: "5%",
                                      stopColor: "hsl(152, 60%, 36%)",
                                      stopOpacity: 0.3,
                                    }),
                                    (0, r.jsx)("stop", {
                                      offset: "95%",
                                      stopColor: "hsl(152, 60%, 36%)",
                                      stopOpacity: 0,
                                    }),
                                  ],
                                }),
                              }),
                              (0, r.jsx)(W.d, {
                                strokeDasharray: "3 3",
                                className: "stroke-muted",
                              }),
                              (0, r.jsx)(K.W, {
                                dataKey: "label",
                                className: "text-xs",
                                tick: { fontSize: 11 },
                              }),
                              (0, r.jsx)(Z.h, {
                                className: "text-xs",
                                tick: { fontSize: 11 },
                                tickFormatter: (e) =>
                                  e >= 1e3
                                    ? "".concat((e / 1e3).toFixed(0), "t")
                                    : "".concat(e, "kg"),
                              }),
                              (0, r.jsx)(_.m, {
                                content: (e) => {
                                  let { active: t, payload: s } = e;
                                  if (!t || !(null == s ? void 0 : s.length)) return null;
                                  let a = s[0].payload;
                                  return (0, r.jsxs)("div", {
                                    className:
                                      "rounded-lg border bg-popover p-2 shadow-md",
                                    children: [
                                      (0, r.jsx)("p", {
                                        className: "text-xs font-medium",
                                        children: a.label,
                                      }),
                                      (0, r.jsxs)("p", {
                                        className: "text-sm",
                                        children: [a.totalCo2eKg.toFixed(1), " kg CO₂e"],
                                      }),
                                      (0, r.jsxs)("p", {
                                        className: "text-xs text-muted-foreground",
                                        children: ["Score: ", a.score, "/100"],
                                      }),
                                    ],
                                  });
                                },
                              }),
                              (0, r.jsx)(O.G, {
                                type: "monotone",
                                dataKey: "totalCo2eKg",
                                stroke: "hsl(152, 60%, 36%)",
                                fill: "url(#co2eGradient)",
                                strokeWidth: 2,
                              }),
                            ],
                          }),
                        })
                      : (0, r.jsx)("div", {
                          className: "flex h-full items-center justify-center",
                          children: (0, r.jsx)("p", {
                            className: "text-sm text-muted-foreground",
                            children: "Not enough data to show trends yet",
                          }),
                        }),
                }),
              ],
            }),
          ],
        });
      }
      function B(e) {
        let { className: t, text: s = "Loading..." } = e;
        return (0, r.jsxs)("div", {
          className: (0, l.cn)("flex flex-col items-center justify-center gap-3 p-8", t),
          role: "status",
          "aria-label": s,
          children: [
            (0, r.jsx)(C.A, { className: "h-8 w-8 animate-spin text-primary" }),
            (0, r.jsx)("p", { className: "text-sm text-muted-foreground", children: s }),
          ],
        });
      }
      var D = s(24726);
      let E = a.forwardRef((e, t) => {
        let { className: s, value: a, indicatorClassName: n, ...i } = e;
        return (0, r.jsx)(D.bL, {
          ref: t,
          className: (0, l.cn)(
            "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
            s,
          ),
          ...i,
          children: (0, r.jsx)(D.C1, {
            className: (0, l.cn)(
              "h-full w-full flex-1 rounded-full bg-primary transition-all",
              n,
            ),
            style: { transform: "translateX(-".concat(100 - (a || 0), "%)") },
          }),
        });
      });
      E.displayName = D.bL.displayName;
      var T = s(26921),
        G = s(1524),
        P = s(30814),
        q = s(17666);
      function z() {
        var e, t, s, l, i, o, u, x, m, h, g;
        let [p, f] = (0, a.useState)(null),
          [j, y] = (0, a.useState)([]),
          [v, N] = (0, a.useState)([]),
          [w, k] = (0, a.useState)([]),
          [C, S] = (0, a.useState)(!0),
          A = (0, a.useCallback)(async () => {
            (S(!1),
              f({
                current: {
                  score: 75,
                  totalCo2eKg: 50,
                  breakdown: { transport: 25, energy: 15, food: 10, shopping: 0 },
                },
                explanation: "Good! Your footprint is 25% lower than the weekly average.",
                weeklyHistory: [
                  { periodStart: "2024-05-01", totalCo2eKg: 65, score: 68 },
                  { periodStart: "2024-05-08", totalCo2eKg: 60, score: 70 },
                  { periodStart: "2024-05-15", totalCo2eKg: 50, score: 75 },
                ],
              }),
              y([{ id: "g1", targetCo2eKg: 100, status: "active" }]),
              N([
                {
                  id: "r1",
                  title: "Take the train instead of flying",
                  description: "You took a flight recently. A train is greener.",
                  potentialSavingKg: 45,
                  priority: "high",
                  category: "transport",
                },
                {
                  id: "r2",
                  title: "Eat less beef",
                  description:
                    "Replacing two beef meals with poultry saves significant CO₂e.",
                  potentialSavingKg: 12,
                  priority: "medium",
                  category: "food",
                },
              ]),
              k([
                { id: "e1", subCategory: "car_petrol", name: "Petrol Car", unit: "km" },
              ]));
          }, []);
        (0, a.useEffect)(() => {
          A();
        }, [A]);
        let R = async (e) => {
          (
            await fetch("/api/activities", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(e),
            })
          ).ok && (await A());
        };
        if (C) return (0, r.jsx)(B, { text: "Loading your dashboard..." });
        let W = j.find((e) => "active" === e.status),
          K =
            null != (o = null == p || null == (e = p.current) ? void 0 : e.totalCo2eKg)
              ? o
              : 0,
          Z = W ? Math.max(0, Math.min(100, (1 - K / W.targetCo2eKg) * 100)) : null,
          _ = null != (u = null == p ? void 0 : p.weeklyHistory) ? u : [],
          O =
            _.length >= 2
              ? _[_.length - 1].totalCo2eKg - _[_.length - 2].totalCo2eKg
              : null;
        return (0, r.jsxs)("div", {
          className: "space-y-6",
          children: [
            (0, r.jsxs)("div", {
              children: [
                (0, r.jsx)("h1", {
                  className: "text-2xl font-bold tracking-tight",
                  children: "Dashboard",
                }),
                (0, r.jsx)("p", {
                  className: "text-muted-foreground",
                  children: "Your carbon footprint at a glance",
                }),
              ],
            }),
            (0, r.jsxs)("div", {
              className: "grid gap-6 md:grid-cols-2 xl:grid-cols-3",
              children: [
                (0, r.jsx)(d, {
                  score:
                    null != (x = null == p || null == (t = p.current) ? void 0 : t.score)
                      ? x
                      : null,
                  explanation:
                    null != (m = null == p ? void 0 : p.explanation)
                      ? m
                      : "Log activities to see your score",
                  totalCo2eKg: K,
                }),
                (0, r.jsx)(b, {
                  breakdown:
                    null !=
                    (h = null == p || null == (s = p.current) ? void 0 : s.breakdown)
                      ? h
                      : null,
                }),
                (0, r.jsx)(F, {
                  emissionFactors: w,
                  onSubmit: R,
                  className: "md:col-span-2 xl:col-span-1",
                }),
              ],
            }),
            (0, r.jsxs)("div", {
              className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
              children: [
                (0, r.jsx)(c.Zp, {
                  children: (0, r.jsxs)(c.Wu, {
                    className: "flex items-center gap-4 p-4",
                    children: [
                      (0, r.jsx)("div", {
                        className:
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted",
                        children:
                          null !== O && O <= 0
                            ? (0, r.jsx)(T.A, { className: "h-5 w-5 text-carbon-low" })
                            : (0, r.jsx)(G.A, { className: "h-5 w-5 text-carbon-high" }),
                      }),
                      (0, r.jsxs)("div", {
                        children: [
                          (0, r.jsx)("p", {
                            className: "text-xs text-muted-foreground",
                            children: "vs Last Week",
                          }),
                          (0, r.jsx)("p", {
                            className: "text-lg font-semibold tabular-nums",
                            children:
                              null !== O ? "".concat(O > 0 ? "+" : "").concat(n(O)) : "—",
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                (0, r.jsx)(c.Zp, {
                  children: (0, r.jsxs)(c.Wu, {
                    className: "flex items-center gap-4 p-4",
                    children: [
                      (0, r.jsx)("div", {
                        className:
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted",
                        children: (0, r.jsx)(P.A, { className: "h-5 w-5 text-primary" }),
                      }),
                      (0, r.jsxs)("div", {
                        className: "flex-1",
                        children: [
                          (0, r.jsx)("p", {
                            className: "text-xs text-muted-foreground",
                            children: "Goal Progress",
                          }),
                          null !== Z
                            ? (0, r.jsxs)("div", {
                                className: "mt-1",
                                children: [
                                  (0, r.jsx)(E, { value: Z, className: "h-2" }),
                                  (0, r.jsxs)("p", {
                                    className:
                                      "mt-1 text-xs tabular-nums text-muted-foreground",
                                    children: [Math.round(Z), "% on track"],
                                  }),
                                ],
                              })
                            : (0, r.jsx)("p", {
                                className: "text-sm text-muted-foreground",
                                children: "No active goal",
                              }),
                        ],
                      }),
                    ],
                  }),
                }),
                (0, r.jsx)(c.Zp, {
                  children: (0, r.jsxs)(c.Wu, {
                    className: "flex items-center gap-4 p-4",
                    children: [
                      (0, r.jsx)("div", {
                        className:
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted",
                        children: (0, r.jsx)(q.A, {
                          className: "h-5 w-5 text-yellow-500",
                        }),
                      }),
                      (0, r.jsxs)("div", {
                        children: [
                          (0, r.jsx)("p", {
                            className: "text-xs text-muted-foreground",
                            children: "Recommendations",
                          }),
                          (0, r.jsx)("p", {
                            className: "text-lg font-semibold tabular-nums",
                            children: v.length,
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                (0, r.jsx)(c.Zp, {
                  children: (0, r.jsxs)(c.Wu, {
                    className: "flex items-center gap-4 p-4",
                    children: [
                      (0, r.jsx)("div", {
                        className:
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10",
                        children: (0, r.jsx)("span", {
                          className: "text-lg font-bold text-primary",
                          children:
                            null !=
                            (g = null == p || null == (l = p.current) ? void 0 : l.score)
                              ? g
                              : "—",
                        }),
                      }),
                      (0, r.jsxs)("div", {
                        children: [
                          (0, r.jsx)("p", {
                            className: "text-xs text-muted-foreground",
                            children: "Carbon Score",
                          }),
                          (0, r.jsx)("p", {
                            className: "text-sm font-medium",
                            children:
                              (null == p || null == (i = p.current)
                                ? void 0
                                : i.score) !== void 0
                                ? p.current.score >= 70
                                  ? "Great job! \uD83C\uDF3F"
                                  : "Room to improve"
                                : "Start tracking",
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              ],
            }),
            (0, r.jsxs)("div", {
              className: "grid gap-6 lg:grid-cols-2",
              children: [
                (0, r.jsx)(L, { data: _ }),
                (0, r.jsxs)(c.Zp, {
                  children: [
                    (0, r.jsx)(c.aR, {
                      className: "pb-3",
                      children: (0, r.jsxs)(c.ZB, {
                        className: "flex items-center gap-2 text-lg",
                        children: [
                          (0, r.jsx)(q.A, { className: "h-5 w-5 text-yellow-500" }),
                          "Recommendations",
                        ],
                      }),
                    }),
                    (0, r.jsx)(c.Wu, {
                      children:
                        v.length > 0
                          ? (0, r.jsx)("div", {
                              className: "space-y-3",
                              children: v.slice(0, 3).map((e) =>
                                (0, r.jsx)(
                                  "div",
                                  {
                                    className:
                                      "rounded-lg border p-3 transition-colors hover:bg-accent/50",
                                    children: (0, r.jsxs)("div", {
                                      className: "flex items-start justify-between gap-2",
                                      children: [
                                        (0, r.jsxs)("div", {
                                          children: [
                                            (0, r.jsx)("p", {
                                              className: "text-sm font-medium",
                                              children: e.title,
                                            }),
                                            (0, r.jsx)("p", {
                                              className:
                                                "mt-1 text-xs text-muted-foreground",
                                              children: e.description,
                                            }),
                                          ],
                                        }),
                                        (0, r.jsxs)("span", {
                                          className:
                                            "shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary",
                                          children: ["-", n(e.potentialSavingKg)],
                                        }),
                                      ],
                                    }),
                                  },
                                  e.id,
                                ),
                              ),
                            })
                          : (0, r.jsx)("p", {
                              className: "text-center text-sm text-muted-foreground",
                              children:
                                "Log more activities to receive personalized recommendations",
                            }),
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
    },
    61433: (e, t, s) => {
      "use strict";
      s.d(t, { cn: () => l });
      var r = s(2821),
        a = s(75889);
      function l() {
        for (var e = arguments.length, t = Array(e), s = 0; s < e; s++)
          t[s] = arguments[s];
        return (0, a.QP)((0, r.$)(t));
      }
    },
    80323: (e, t, s) => {
      "use strict";
      s.d(t, { p: () => n });
      var r = s(95155),
        a = s(12115),
        l = s(61433);
      let n = a.forwardRef((e, t) => {
        let { className: s, type: a, ...n } = e;
        return (0, r.jsx)("input", {
          type: a,
          className: (0, l.cn)(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            s,
          ),
          ref: t,
          ...n,
        });
      });
      n.displayName = "Input";
    },
    86153: (e, t, s) => {
      "use strict";
      s.d(t, { J: () => c });
      var r = s(95155),
        a = s(12115),
        l = s(10489),
        n = s(83101),
        i = s(61433);
      let o = (0, n.F)(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        ),
        c = a.forwardRef((e, t) => {
          let { className: s, ...a } = e;
          return (0, r.jsx)(l.b, { ref: t, className: (0, i.cn)(o(), s), ...a });
        });
      c.displayName = l.b.displayName;
    },
  },
  (e) => {
    (e.O(0, [407, 514, 441, 255, 358], () => e((e.s = 15007))), (_N_E = e.O()));
  },
]);
