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
import { invertedFieldMap, tiedFieldMap } from 'core/component/decorators/const';

import type { ComponentMeta, ComponentProp, ComponentField } from 'core/component/interface';

import type {

	DecoratorFunctionalOptions,
	ParamsFactoryTransformer,
	FactoryTransformer

} from 'core/component/decorators/interface';

/**
 * Factory to create component property decorators
 *
 * @param cluster - the property cluster to decorate, like `fields` or `systemFields`
 * @param [transformer] - a transformer for the passed decorator parameters
 */
export function paramsFactory<T = object>(
	cluster: Nullable<string>,
	transformer?: ParamsFactoryTransformer
): FactoryTransformer<T> {
	return (params: Dictionary<any> = {}) => (_: object, key: string, desc?: PropertyDescriptor) => {
		initEmitter.once('bindConstructor', (componentName) => {
			metaPointers[componentName] = metaPointers[componentName] ?? Object.createDict();

			const link = metaPointers[componentName];

			if (link == null) {
				return;
			}

			link[key] = true;
			initEmitter.once(`constructor.${componentName}`, decorate);
		});

		function decorate({meta}: {meta: ComponentMeta}): void {
			delete meta.tiedFields[key];

			let p = params;

			if (desc != null) {
				decorateMethodOrAccessor();

			} else {
				decorateProperty();
			}

			function decorateMethodOrAccessor() {
				if (desc == null) {
					return;
				}

				delete meta.props[key];
				delete meta.fields[key];
				delete meta.systemFields[key];

				let metaKey: string;

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
					decorateMethod();

				} else {
					decorateAccessor();
				}

				function decorateMethod() {
					const name = key;

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
								watchers[<string>watcher] = wrapOpts({...p.watchParams, path: watcher});
							}
						});
					}

					if (p.hook != null) {
						hooks ??= {};

						Array.concat([], p.hook).forEach((hook) => {
							if (Object.isSimpleObject(hook)) {
								const
									hookName = Object.keys(hook)[0],
									hookInfo = hook[hookName];

								hooks[hookName] = wrapOpts({
									...hookInfo,
									name,
									hook: hookName,
									after: hookInfo.after != null ? new Set([].concat(hookInfo.after)) : undefined
								});

							} else {
								hooks[<string>hook] = wrapOpts({name, hook});
							}
						});
					}

					metaCluster[key] = wrapOpts({...info, ...p, watchers, hooks});
				}

				function decorateAccessor() {
					delete meta.accessors[key];
					delete meta.computedFields[key];

					const needOverrideComputed = metaKey === 'accessors' ?
						key in meta.computedFields :
						!('cache' in p) && key in meta.accessors;

					if (needOverrideComputed) {
						metaCluster[key] = wrapOpts({...meta.computedFields[key], ...p, cache: false});

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
				}
			}

			function decorateProperty() {
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
					metaCluster: ComponentProp | ComponentField = meta[metaKey];

				inheritFromParent();

				if (transformer != null) {
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

				const desc = wrapOpts({
					...info,
					...p,

					after,
					watchers,

					meta: {
						...info.meta,
						...p.meta
					}
				});

				if (metaKey === 'props') {
					desc.forceUpdate ??= true;
				}

				metaCluster[key] = desc;

				if (metaKey === 'props' && desc.forceUpdate === false) {
					// A special system property used to observe props with the option `forceUpdate: false`.
					// This is because `forceUpdate: false` props are passed as attributes,
					// i.e., they are accessible via `$attrs`.
					// Moreover, all such attributes are readonly for the component.
					// However, we need a system property that will be synchronized with this attribute
					// and will update whenever this attribute is updated from the outside.
					// Therefore, we introduce a special private system field formatted as `[[${fieldName}]]`.
					meta.systemFields[`[[${key}]]`] = {
						...info,
						watchers,

						meta: {
							...info.meta,
							...p.meta
						}
					};
				}

				if (tiedFieldMap[metaKey] != null && RegExp.test(storeRgxp, key)) {
					meta.tiedFields[key] = key.replace(storeRgxp, '');
				}

				function inheritFromParent() {
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
				}
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
