/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';

import { storeRgxp } from 'core/component/reflect';
import { initEmitter } from 'core/component/event';

import { metaPointers } from 'core/component/const';
import { inverseFieldMap, tiedFieldMap } from 'core/component/decorators/const';

import type { ComponentMeta } from 'core/component/interface';
import type {

	DecoratorFunctionalOptions,
	ParamsFactoryTransformer,
	FactoryTransformer

} from 'core/component/decorators/interface';

/**
 * Factory to create a component property decorator
 *
 * @param cluster - the property cluster to decorate
 * @param [transformer] - transformer for the passed decorator parameters
 */
export function paramsFactory<T = object>(
	cluster: Nullable<string>,
	transformer?: ParamsFactoryTransformer
): FactoryTransformer<T> {
	return (params: Dictionary<any> = {}) => (target, key, desc) => {
		const
			isMethodDecorator = desc != null;

		initEmitter.once('bindConstructor', (componentName) => {
			metaPointers[componentName] = metaPointers[componentName] ?? Object.createDict();

			const
				link = metaPointers[componentName];

			if (link == null) {
				return;
			}

			link[key] = true;
			initEmitter.once(`constructor.${componentName}`, decorate);
		});

		function decorate({meta}: {meta: ComponentMeta}): void {
			delete meta.tiedFields[key];

			let
				p = params;

			if (isMethodDecorator) {
				delete meta.props[key];
				delete meta.fields[key];
				delete meta.systemFields[key];

				let
					metaKey;

				if (cluster != null) {
					metaKey = cluster;

				} else if ('value' in desc) {
					metaKey = 'methods';

				} else if (
					p.cache === true ||
					p.cache === 'auto' ||
					p.cache !== false && (Object.isArray(p.dependencies) || key in meta.computedFields)
				) {
					metaKey = 'computedFields';

				} else {
					metaKey = 'accessors';
				}

				if (transformer) {
					p = transformer(p, metaKey);
				}

				const
					metaCluster = meta[metaKey],
					info = metaCluster[key] ?? {src: meta.componentName};

				if (metaKey === 'methods') {
					const
						name = key;

					let {
						watchers,
						hooks
					} = info;

					if (p.watch != null) {
						watchers ??= {};

						Array.concat([], p.watch).forEach((watcher) => {
							if (Object.isPlainObject(watcher)) {
								const path = String(watcher.path ?? watcher.field);
								watchers[path] = wrapOpts({...p.watchParams, ...watcher, path});

							} else {
								watchers[watcher] = wrapOpts({...p.watchParams, path: watcher});
							}
						});
					}

					if (p.hook != null) {
						hooks ??= {};

						Array.concat([], p.hook).forEach((hook) => {
							if (Object.isSimpleObject(hook)) {
								const
									key = Object.keys(hook)[0],
									val = hook[key];

								hooks[key] = wrapOpts({
									...val,
									name,
									hook: key,
									after: val.after != null ? new Set([].concat(val.after)) : undefined
								});

							} else {
								hooks[hook] = wrapOpts({name, hook});
							}
						});
					}

					metaCluster[key] = wrapOpts({...info, ...p, watchers, hooks});
					return;
				}

				const needOverrideComputed = metaKey === 'accessors' ?
					key in meta.computedFields :
					!('cache' in p) && key in meta.accessors;

				if (needOverrideComputed) {
					metaCluster[key] = wrapOpts({...meta.computedFields[key], ...p, cache: false});
					delete meta.computedFields[key];

				} else {
					metaCluster[key] = wrapOpts({
						...info,
						...p,
						cache: metaKey === 'computedFields' ? p.cache ?? true : false
					});
				}

				if (p.dependencies != null) {
					meta.watchDependencies.set(key, p.dependencies);
				}

				return;
			}

			delete meta.methods[key];
			delete meta.accessors[key];
			delete meta.computedFields[key];

			const accessors = meta.accessors[key] ?
				meta.accessors :
				meta.computedFields;

			if (accessors[key]) {
				Object.defineProperty(meta.constructor.prototype, key, defProp);
				delete accessors[key];
			}

			const
				metaKey = cluster ?? (key in meta.props ? 'props' : 'fields'),
				inverseKeys = inverseFieldMap[metaKey],
				metaCluster = meta[metaKey];

			if (inverseKeys != null) {
				for (let i = 0; i < inverseKeys.length; i++) {
					const
						tmp = meta[inverseKeys[i]];

					if (key in tmp) {
						metaCluster[key] = tmp[key];
						delete tmp[key];
						break;
					}
				}
			}

			if (transformer) {
				p = transformer(p, metaKey);
			}

			const
				info = metaCluster[key] ?? {src: meta.componentName};

			let {
				watchers,
				after
			} = info;

			if (p.after != null) {
				after = new Set([].concat(p.after));
			}

			if (p.watch != null) {
				Array.concat([], p.watch).forEach((watcher) => {
					watchers ??= new Map();

					if (Object.isPlainObject(watcher)) {
						watchers.set(watcher.handler ?? watcher.fn, wrapOpts({...watcher, handler: watcher.handler}));

					} else {
						watchers.set(watcher, wrapOpts({handler: watcher}));
					}
				});
			}

			metaCluster[key] = wrapOpts({
				...info,
				...p,

				after,
				watchers,

				meta: {
					...info.meta,
					...p.meta
				}
			});

			if (tiedFieldMap[metaKey] != null && RegExp.test(storeRgxp, key)) {
				meta.tiedFields[key] = key.replace(storeRgxp, '');
			}

			function wrapOpts<T extends Dictionary & DecoratorFunctionalOptions>(opts: T): T {
				const
					p = meta.params;

				// eslint-disable-next-line eqeqeq
				if (opts.functional === undefined && p.functional === null) {
					opts.functional = false;
				}

				return opts;
			}
		}
	};
}
