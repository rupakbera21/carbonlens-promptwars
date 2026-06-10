(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [177],
  {
    13673: () => {},
    46668: (e) => {
      e.exports = {
        style: { fontFamily: "'Inter', 'Inter Fallback'", fontStyle: "normal" },
        className: "__className_f367f3",
        variable: "__variable_f367f3",
      };
    },
    58903: (e, t, r) => {
      "use strict";
      r.d(t, { D: () => n, ThemeProvider: () => a });
      var s = r(95155),
        o = r(12115);
      let l = (0, o.createContext)(void 0);
      function a(e) {
        let { children: t } = e,
          [r, a] = (0, o.useState)("system"),
          [n, c] = (0, o.useState)(!1),
          [i, m] = (0, o.useState)(!1);
        return (
          (0, o.useEffect)(() => {
            let e = localStorage.getItem("carbonlens-theme");
            e && a(e);
            let t = localStorage.getItem("carbonlens-high-contrast");
            t && c("true" === t);
            let r = localStorage.getItem("carbonlens-reduced-motion");
            r && m("true" === r);
          }, []),
          (0, o.useEffect)(() => {
            let e = document.documentElement;
            if ("system" === r) {
              let t = window.matchMedia("(prefers-color-scheme: dark)").matches;
              e.classList.toggle("dark", t);
            } else e.classList.toggle("dark", "dark" === r);
            (localStorage.setItem("carbonlens-theme", r),
              e.classList.toggle("high-contrast", n),
              localStorage.setItem("carbonlens-high-contrast", String(n)),
              e.classList.toggle("reduce-motion", i),
              localStorage.setItem("carbonlens-reduced-motion", String(i)));
          }, [r, n, i]),
          (0, s.jsx)(l.Provider, {
            value: {
              theme: r,
              setTheme: a,
              highContrast: n,
              setHighContrast: c,
              reducedMotion: i,
              setReducedMotion: m,
            },
            children: t,
          })
        );
      }
      function n() {
        let e = (0, o.useContext)(l);
        if (!e) throw Error("useTheme must be used within a ThemeProvider");
        return e;
      }
    },
    61096: (e, t, r) => {
      (Promise.resolve().then(r.t.bind(r, 46668, 23)),
        Promise.resolve().then(r.t.bind(r, 13673, 23)),
        Promise.resolve().then(r.bind(r, 90208)),
        Promise.resolve().then(r.bind(r, 58903)));
    },
    90208: (e, t, r) => {
      "use strict";
      r.d(t, { AuthProvider: () => l });
      var s = r(95155),
        o = r(36489);
      function l(e) {
        let { children: t } = e;
        return (0, s.jsx)(o.SessionProvider, { children: t });
      }
    },
  },
  (e) => {
    (e.O(0, [967, 489, 441, 255, 358], () => e((e.s = 61096))), (_N_E = e.O()));
  },
]);
