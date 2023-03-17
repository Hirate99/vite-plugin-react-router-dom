import { normalizePath as R } from 'vite';
const $ = (a) => a.replace(/^.*[\\\/]/, '');
function E(a, l = {}) {
  const i = /* @__PURE__ */ new Map(),
    u = new Array(),
    m = (r, o = !1) => {
      (i.get(r) !== void 0 && o) || i.set(r, o);
    },
    d = (r, o = '') => {
      for (const [s, t] of Object.entries(r)) {
        const n = `${o}${s}`;
        if (typeof t == 'object')
          if (t.src) {
            const e = t,
              y = e.src,
              h = e.dynamic ?? !0;
            m(y, h);
            const c = {};
            e.action && (c.action = e.action),
              e.dynamic && (c.dynamic = e.dynamic),
              e.errorElement && (c.errorElement = e.errorElement),
              e.hasErrorBoundary && (c.errorElement = e.hasErrorBoundary),
              e.loader && (c.loader = e.loader),
              e.shouldRevalidate && (c.shouldRevalidate = e.shouldRevalidate),
              u.push({
                route: n,
                component: $(y),
                config: c,
              });
          } else d(t, n);
        else
          m(t),
            u.push({
              route: n,
              component: $(t),
            });
      }
    },
    p = () => {
      const r = [],
        o = [];
      for (const [s, t] of i) {
        const n = $(s);
        t
          ? o.push(`const ${n} = lazy(() => import('${s}'))`)
          : r.push(`import ${n} from '${s}'`);
      }
      return [...r, ...o].join(`
`);
    },
    f = (r) => {
      const o = 'async';
      return Object.entries(r).map(([s, t]) => {
        if (typeof t == 'function') {
          let n = t.toString();
          return (
            n.startsWith(o) && (n = n.slice(o.length, n.length).trim()),
            n.startsWith('function')
              ? `${s}: ${t.toString()}`
              : `${t.toString()}`
          );
        }
        return `${s}: ${t},`;
      }).join(`
`);
    },
    g = () =>
      u.map(
        ({ route: r, component: o, config: s }) => `
        {
          path: '${r}',
          element: /*#__PURE__*/React.createElement(${o}, null),
          ${f(s ?? {})}
        }
      `,
      );
  return (
    d(a),
    `
  import React from 'react';
  import { createBrowserRouter } from 'react-router-dom';
  import { lazy } from 'react';

  ${p()}
  
  const router = createBrowserRouter(
    [${g()}],
    ${JSON.stringify(l)}
  );
  
  export default router;
  `
  );
}
function v(a) {
  const { name: l, option: i, root: u } = a,
    m = l ?? 'router.config.js',
    p = `${u ?? __dirname}/${R(m)}`;
  return {
    name: 'vite-plugin-react-router-dom',
    enforce: 'pre',
    async load(f) {
      if (f.includes(p)) {
        const g = (await import(f)).default;
        return E(g, i);
      }
      return null;
    },
  };
}
export { v as default };
