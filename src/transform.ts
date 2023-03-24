import type { RouteItem, Route, RouterOption } from './types';

const getComponentName = (src: string) => {
  return src.replace(/^.*[\\\/]/, '');
};

const staticImport = (name: string, src: string) => {
  return `import ${name} from '${src}'`;
};

const lazyImport = (name: string, src: string) => {
  return `const ${name} = lazy(() => import('${src}'))`;
};

type ResolvedConfig = Pick<
  RouteItem,
  'action' | 'errorElement' | 'hasErrorBoundary' | 'loader' | 'shouldRevalidate'
> & {
  children?: string;
};

type RouteGenerationResult = {
  imports: {
    dynamic: string[];
    static: string[];
  };
  routes: string[];
};

const imports = new Map<string, boolean>();

function generate(routes: Route): RouteGenerationResult {
  const dynamicImportSet = new Set<string>();
  const staticImportSet = new Set<string>();

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
          const dynamic = item.dynamic ?? false;
          resolveImports(src, dynamic);
          const config: ResolvedConfig = {};
          if (item.action) {
            config.action = item.action;
          }
          if (item.errorElement) {
            config.errorElement = item.errorElement;
          }
          if (item.hasErrorBoundary) {
            config.hasErrorBoundary = item.hasErrorBoundary;
          }
          if (item.loader) {
            config.loader = item.loader;
          }
          if (item.shouldRevalidate) {
            config.shouldRevalidate = item.shouldRevalidate;
          }
          if (item.children) {
            const children = generate(item.children);
            children.imports.dynamic.forEach((value) => {
              dynamicImportSet.add(value);
            });
            children.imports.static.forEach((value) => {
              staticImportSet.add(value);
            });
            config.children = `${children.routes}`;
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
    for (const [src, dynamic] of imports) {
      const name = getComponentName(src);
      if (!dynamic) {
        staticImportSet.add(staticImport(name, src));
      } else {
        dynamicImportSet.add(lazyImport(name, src));
      }
    }
    return {
      dynamic: Array.from(dynamicImportSet) ?? [],
      static: Array.from(staticImportSet) ?? [],
    };
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
        if (key === 'children') {
          return `${key}: [
            ${value}
          ],`;
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

  return {
    imports: generateImports(),
    routes: generateRoutes(),
  };
}

function transform(routes: Route, options: RouterOption = {}) {
  imports.clear();

  const { imports: _imports, routes: _routes } = generate(routes);

  const code = `
  import React from 'react';
  import { createBrowserRouter } from 'react-router-dom';
  import { lazy } from 'react';

  ${_imports.static.join('\n')}
  ${_imports.dynamic.join('\n')}
  
  const router = createBrowserRouter(
    [${_routes}],
    ${JSON.stringify(options)}
  );
  
  export default router;
  `;

  return code;
}

export default transform;
