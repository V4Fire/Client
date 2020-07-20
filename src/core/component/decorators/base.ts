/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';
import { initEmitter, metaPointers } from 'core/component/const';
import { inverseFieldMap } from 'core/component/decorators/const';

import { ComponentMeta } from 'core/component/interface';
import { ParamsFactoryTransformer, FactoryTransformer } from 'core/component/decorators/interface';

/**
 * Factory to create component property decorators
 *
 * @param cluster - property cluster
 * @param [transformer] - transformer for parameters
 */
export function paramsFactory<T = object>(
	cluster: Nullable<string>,
	transformer?: ParamsFactoryTransformer
): FactoryTransformer<T> {
	return (params: Dictionary<any> = {}) => (target, key, desc) => {
		initEmitter.once('bindConstructor', (componentName) => {
			metaPointers[componentName] = metaPointers[componentName] ?? Object.createDict();

			const
				link = metaPointers[componentName]!;

			link[key] = true;
			initEmitter.once(`constructor.${componentName}`, reg);
		});

		function reg({meta}: {meta: ComponentMeta}): void {
			const wrapOpts = (opts) => {
				const
					p = meta.params;

				if (opts.replace === undefined && p.flyweight) {
					opts.replace = false;
				}

				// eslint-disable-next-line eqeqeq
				if (opts.functional === undefined && p.functional === null) {
					opts.functional = false;
				}

				return opts;
			};

			let
				p = params;

			if (desc != null) {
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
					Object.isArray(p.dependencies) ||
					key in meta.computedFields && p.cache !== false
				) {
					metaKey = 'computedFields';

				} else {
					metaKey = 'accessors';
				}

				if (transformer) {
					p = transformer(p, metaKey);
				}

				const
					obj = meta[metaKey],
					el = obj[key] ?? {src: meta.componentName};

				if (metaKey === 'methods') {
					const
						name = key;

					let
						{watchers, hooks} = el;

					if (p.watch != null) {
						watchers = watchers ?? {};

						for (let o = <Array<typeof p.watch>>[].concat(p.watch), i = 0; i < o.length; i++) {
							const
								el = o[i];

							if (Object.isPlainObject(el)) {
								const path = String(el.path ?? el.field);
								watchers[path] = wrapOpts({...p.watchParams, ...el, path});

							} else {
								watchers[el] = wrapOpts({...p.watchParams, path: el});
							}
						}
					}

					if (p.hook != null) {
						hooks = hooks ?? {};

						for (let o = <Array<typeof p.hook>>[].concat(p.hook), i = 0; i < o.length; i++) {
							const
								el = o[i];

							if (Object.isSimpleObject(el)) {
								const
									key = Object.keys(el)[0],
									val = el[key];

								hooks[key] = wrapOpts({
									...val,
									name,
									hook: key,
									after: val.after != null ? new Set([].concat(val.after)) : undefined
								});

							} else {
								hooks[el] = wrapOpts({name, hook: el});
							}
						}
					}

					obj[key] = wrapOpts({...el, ...p, watchers, hooks});
					return;
				}

				const hasCache = 'cache' in p;
				delete p.cache;

				if (metaKey === 'accessors' ? key in meta.computedFields : !hasCache && key in meta.accessors) {
					obj[key] = wrapOpts({...meta.computedFields[key], ...p});
					delete meta.computedFields[key];

				} else {
					obj[key] = wrapOpts({...el, ...p});
				}

				if (p.dependencies != null) {
					meta.watchDependencies.set(key, p.dependencies);
				}

				return;
			}

			delete meta.methods[key];
			delete meta.accessors[key];
			delete meta.computedFields[key];

			const
				accessors = meta.accessors[key] ? meta.accessors : meta.computedFields;

			if (accessors[key]) {
				Object.defineProperty(meta.constructor.prototype, key, defProp);
				delete accessors[key];
			}

			const
				metaKey = cluster ?? (key in meta.props ? 'props' : 'fields'),
				inverse = inverseFieldMap[metaKey],
				obj = meta[metaKey];

			if (inverse != null) {
				for (let i = 0; i < inverse.length; i++) {
					const
						tmp = meta[inverse[i]];

					if (key in tmp) {
						obj[key] = tmp[key];
						delete tmp[key];
						break;
					}
				}
			}

			if (transformer) {
				p = transformer(p, metaKey);
			}

			const
				el = obj[key] ?? {src: meta.componentName};

			let
				{watchers, after} = el;

			if (p.after != null) {
				after = new Set([].concat(p.after));
			}

			if (p.watch != null) {
				for (let o = <Array<typeof p.watch>>[].concat(p.watch), i = 0; i < o.length; i++) {
					watchers = watchers ?? new Map();

					const
						val = o[i];

					if (Object.isPlainObject(val)) {
						watchers.set(val.handler ?? val.fn, wrapOpts({...val, handler: val.handler}));

					} else {
						watchers.set(val, wrapOpts({handler: val}));
					}
				}
			}

			obj[key] = wrapOpts({
				...el,
				...p,

				after,
				watchers,

				meta: {
					...el.meta,
					...p.meta
				}
			});
		}
	};
}
