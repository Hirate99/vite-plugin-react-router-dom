import type { ReactNode } from 'react';
import type { PluginOption } from 'vite';
import type { HydrationState, AgnosticNonIndexRouteObject, AgnosticIndexRouteObject } from '@remix-run/router';
type RouteObject<Prop extends keyof AgnosticIndexRouteObject & keyof AgnosticNonIndexRouteObject> = AgnosticIndexRouteObject[Prop] | AgnosticNonIndexRouteObject[Prop];
export interface RouteItem {
    src: string;
    dynamic?: boolean;
    loader?: RouteObject<'loader'>;
    action?: RouteObject<'action'>;
    shouldRevalidate?: RouteObject<'shouldRevalidate'>;
    hasErrorBoundary?: RouteObject<'hasErrorBoundary'>;
    errorElement?: ReactNode | null;
}
export interface Route {
    [key: string]: string | RouteItem | Route;
}
export interface RouterOption {
    basename?: string;
    hydrationData?: HydrationState;
    window?: Window;
}
export interface VitePluginReactRouterDomOptions {
    name: string;
    root?: string;
    option?: RouterOption;
}
export declare function vitePluginReactRouterDom(option: VitePluginReactRouterDomOptions): PluginOption;
export {};
