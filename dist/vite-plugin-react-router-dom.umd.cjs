(function (a, s) {
  typeof exports == 'object' && typeof module < 'u'
    ? (module.exports = s(require('vite')))
    : typeof define == 'function' && define.amd
    ? define(['vite'], s)
    : ((a = typeof globalThis < 'u' ? globalThis : a || self),
      (a['vite-plugin-react-router-dom'] = s(a.vite)));
})(this, function (a) {
  'use strict';
  const s = (f) => f.replace(/^.*[\\\/]/, '');
  function R(f, p = {}) {
    const u = new Map(),
      m = new Array(),
      l = (r, o = !1) => {
        (u.get(r) !== void 0 && o) || u.set(r, o);
      },
      y = (r, o = '') => {
        for (const [i, e] of Object.entries(r)) {
          const n = `${o}${i}`;
          if (typeof e == 'object')
            if (e.src) {
              const t = e,
                h = t.src,
                E = t.dynamic ?? !0;
              l(h, E);
              const c = {};
              t.action && (c.action = t.action),
                t.dynamic && (c.dynamic = t.dynamic),
                t.errorElement && (c.errorElement = t.errorElement),
                t.hasErrorBoundary && (c.errorElement = t.hasErrorBoundary),
                t.loader && (c.loader = t.loader),
                t.shouldRevalidate && (c.shouldRevalidate = t.shouldRevalidate),
                m.push({ route: n, component: s(h), config: c });
            } else y(e, n);
          else l(e), m.push({ route: n, component: s(e) });
        }
      },
      g = () => {
        const r = [],
          o = [];
        for (const [i, e] of u) {
          const n = s(i);
          e
            ? o.push(`const ${n} = lazy(() => import('${i}'))`)
            : r.push(`import ${n} from '${i}'`);
        }
        return [...r, ...o].join(`
`);
      },
      d = (r) => {
        const o = 'async';
        return Object.entries(r).map(([i, e]) => {
          if (typeof e == 'function') {
            let n = e.toString();
            return (
              n.startsWith(o) && (n = n.slice(o.length, n.length).trim()),
              n.startsWith('function')
                ? `${i}: ${e.toString()}`
                : `${e.toString()}`
            );
          }
          return `${i}: ${e},`;
        }).join(`
`);
      },
      $ = () =>
        m.map(
          ({ route: r, component: o, config: i }) => `
        {
          path: '${r}',
          element: /*#__PURE__*/React.createElement(${o}, null),
          ${d(i ?? {})}
        }
      `,
        );
    return (
      y(f),
      `
  import React from 'react';
  import { createBrowserRouter } from 'react-router-dom';
  import { lazy } from 'react';

  ${g()}
  
  const router = createBrowserRouter(
    [${$()}],
    ${JSON.stringify(p)}
  );
  
  export default router;
  `
    );
  }
  function v(f) {
    const { name: p, option: u, root: m } = f,
      l = p ?? 'router.config.js',
      g = `${m ?? __dirname}/${a.normalizePath(l)}`;
    return {
      name: 'vite-plugin-react-router-dom',
      enforce: 'pre',
      async load(d) {
        if (d.includes(g)) {
          const $ = (await import(d)).default;
          return R($, u);
        }
        return null;
      },
    };
  }
  return v;
});
