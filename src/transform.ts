import type { RouteItem, Route, RouterOption } from './types';

const getComponentName = (src: string) => {
  return src.replace(/^.*[\\\/]/, '');
};

type ResolvedConfig = Pick<
  RouteItem,
  | 'action'
  | 'dynamic'
  | 'errorElement'
  | 'hasErrorBoundary'
  | 'loader'
  | 'shouldRevalidate'
>;

function transform(routes: Route, options: RouterOption = {}) {
  const imports = new Map<string, boolean>();

  const resolved = new Array<{
    route: string;
    component: string;
    config?: ResolvedConfig;
  }>();

  const resolveImports = (src: string, dynamic = false) => {
    const isDynamic = imports.get(src);
    if (isDynamic !== undefined) {
      if (!dynamic) {
        imports.set(src, dynamic);
      }
    } else {
      imports.set(src, dynamic);
    }
  };

  const resolveRoutes = (routes: Route, prefix = '') => {
    for (const [key, value] of Object.entries(routes)) {
      const currentRoute = `${prefix}${key}`;

      if (typeof value === 'object') {
        if (value.src) {
          const item = value as RouteItem;
          const src = item.src;
          const dynamic = item.dynamic ?? true;
          resolveImports(src, dynamic);
          const config: ResolvedConfig = {};
          if (item.action) {
            config.action = item.action;
          }
          if (item.dynamic) {
            config.dynamic = item.dynamic;
          }
          if (item.errorElement) {
            config.errorElement = item.errorElement;
          }
          if (item.hasErrorBoundary) {
            config.errorElement = item.hasErrorBoundary;
          }
          if (item.loader) {
            config.loader = item.loader;
          }
          if (item.shouldRevalidate) {
            config.shouldRevalidate = item.shouldRevalidate;
          }

          resolved.push({
            route: currentRoute,
            component: getComponentName(src),
            config,
          });
        } else {
          resolveRoutes(value as Route, currentRoute);
        }
      } else {
        resolveImports(value);
        resolved.push({
          route: currentRoute,
          component: getComponentName(value),
        });
      }
    }
  };

  const generateImports = () => {
    const statics = [];
    const dynamics = [];
    for (const [src, dynamic] of imports) {
      const name = getComponentName(src);
      if (!dynamic) {
        statics.push(`import ${name} from '${src}'`);
      } else {
        dynamics.push(`const ${name} = lazy(() => import('${src}'))`);
      }
    }
    return [...statics, ...dynamics].join('\n');
  };

  const generateConfig = (config: ResolvedConfig) => {
    const asyncIdentifier = 'async';

    return Object.entries(config)
      .map(([key, value]) => {
        if (typeof value === 'function') {
          let func = value.toString();
          if (func.startsWith(asyncIdentifier)) {
            func = func.slice(asyncIdentifier.length, func.length).trim();
          }
          if (func.startsWith('function')) {
            return `${key}: ${value.toString()}`;
          } else {
            return `${value.toString()}`;
          }
        }
        return `${key}: ${value},`;
      })
      .join('\n');
  };

  const generateRoutes = () => {
    return resolved.map(({ route, component, config: _config }) => {
      const config = _config ?? {};

      return `
        {
          path: '${route}',
          element: /*#__PURE__*/React.createElement(${component}, null),
          ${generateConfig(config)}
        }
      `;
    });
  };

  resolveRoutes(routes);

  const code = `
  import React from 'react';
  import { createBrowserRouter } from 'react-router-dom';
  import { lazy } from 'react';

  ${generateImports()}
  
  const router = createBrowserRouter(
    [${generateRoutes()}],
    ${JSON.stringify(options)}
  );
  
  export default router;
  `;

  return code;
}

export default transform;
