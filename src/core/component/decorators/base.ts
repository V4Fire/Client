/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { defProp } from 'core/const/props';
import { initEmitter, metaPointers } from 'core/component/const';
import { invertedFieldMap, tiedFieldMap } from 'core/component/decorators/const';
import { storeRgxp } from 'core/component/reflection';

import type { ComponentMeta, ComponentProp, ComponentField } from 'core/component/interface';
import type { ParamsFactoryTransformer, FactoryTransformer } from 'core/component/decorators/interface';

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

			delete meta.tiedFields[key];

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

					let
						{watchers, hooks} = info;

					if (p.watch != null) {
						watchers ??= {};

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
						hooks ??= {};

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

					metaCluster[key] = wrapOpts({...info, ...p, watchers, hooks});
					return;
				}

				delete meta.accessors[key];
				delete meta.computedFields[key];

				const hasCache = 'cache' in p;
				delete p.cache;

				if (metaKey === 'accessors' ? key in meta.computedFields : !hasCache && key in meta.accessors) {
					metaCluster[key] = wrapOpts({...meta.computedFields[key], ...p});

				} else {
					metaCluster[key] = wrapOpts({...info, ...p});
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
				metaCluster: ComponentProp | ComponentField = meta[metaKey];

			const
				invertedMetaKeys = invertedFieldMap[metaKey];

			if (invertedMetaKeys != null) {
				for (let i = 0; i < invertedMetaKeys.length; i++) {
					const
						invertedMetaKey = invertedMetaKeys[i],
						invertedMetaCluster = meta[invertedMetaKey];

					if (key in invertedMetaCluster) {
						const info = {...invertedMetaCluster[key]};
						delete info.functional;

						if (invertedMetaKey === 'prop') {
							if (Object.isFunction(info.default)) {
								(<ComponentField>info).init = info.default;
								delete info.default;
							}

						} else if (metaKey === 'prop') {
							delete (<ComponentField>info).init;
						}

						metaCluster[key] = info;
						delete invertedMetaCluster[key];

						break;
					}
				}
			}

			if (transformer) {
				p = transformer(p, metaKey);
			}

			const
				info = metaCluster[key] ?? {src: meta.componentName};

			let
				{watchers, after} = info;

			if (p.after != null) {
				after = new Set([].concat(p.after));
			}

			if (p.watch != null) {
				for (let o = <Array<typeof p.watch>>[].concat(p.watch), i = 0; i < o.length; i++) {
					watchers ??= new Map();

					const
						val = o[i];

					if (Object.isPlainObject(val)) {
						watchers.set(val.handler ?? val.fn, wrapOpts({...val, handler: val.handler}));

					} else {
						watchers.set(val, wrapOpts({handler: val}));
					}
				}
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
		}
	};
}
