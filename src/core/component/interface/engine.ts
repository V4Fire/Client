/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface RenderEngineFeatures {
	regular: boolean;
	functional: boolean;
	composite: boolean;
}

export type ProxyGetterType =
	'prop' |
	'field' |
	'system' |
	'attr' |
	'mounted';

export type ProxyGetter = (ctx: object) => {
	key: string;
	value: unknown;
	watch?(path: string, handler: Function): Function;
};

export interface RenderEngine {
	minimalCtx: object;
	supports: RenderEngineFeatures;
	proxyGetters: Record<ProxyGetterType, ProxyGetter>;
}
