import { PluginOption, normalizePath } from 'vite';
import transform from './transform';
import type { Route, VitePluginReactRouterDomOptions } from './types';

function vitePluginReactRouterDom(
  options: VitePluginReactRouterDomOptions,
): PluginOption {
  const { name: _name, option, root: _root } = options;

  const name = _name ?? 'router.config.js';
  const root = _root ?? '';
  const routerId = `${root}/${normalizePath(name)}`;

  return {
    name: 'vite-plugin-react-router-dom',
    enforce: 'pre',

    async load(id: string) {
      if (id.includes(routerId)) {
        const routes = (await import(id)).default as unknown as Route;
        return transform(routes, option);
      }
      return null;
    },
  };
}

export default vitePluginReactRouterDom;
