/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import watch from 'core/object/watch';
import { asyncLabel, beforeMountHooks } from 'core/component/const';

import { runHook } from 'core/component/hook';
import { initFields } from 'core/component/field';
import { initWatchers } from 'core/component/watch';
import { patchRefs } from 'core/component/create';

import { getNormalParent } from 'core/component/traverse';
import { isAbstractComponent } from 'core/component/reflection';
import { forkMeta, fillMeta, callMethodFromComponent } from 'core/component/meta';

import { ComponentDriver, ComponentOptions, FunctionalComponentOptions } from 'core/component/engines';
import { cacheStatus } from 'core/component/engines/const';
import { ComponentMeta } from 'core/component/interface';

/**
 * Returns a component declaration object from the specified component meta object
 * @param meta
 */
export function getComponent(
	meta: ComponentMeta
): ComponentOptions<ComponentDriver> | FunctionalComponentOptions<ComponentDriver> {
	const
		p = meta.params,
		m = p.model;

	const
		{component, instance, methods} = fillMeta(meta);

	if (p.functional === true || isAbstractComponent.test(meta.componentName)) {
		return Object.create(component);
	}

	return {
		...<ComponentOptions<ComponentDriver>>Any(component),

		parent: p.parent,
		inheritAttrs: p.inheritAttrs,

		model: m && {
			prop: m.prop,
			event: m.event && m.event.dasherize() || ''
		},

		data(): Dictionary {
			const
				ctx = <any>this,
				data = ctx.$$data;

			initFields(meta.fields, ctx, data);
			runHook('beforeDataCreate', ctx).catch(stderr);

			const watchOpts = {
				deep: true,
				tiedWith: this,
				collapse: true,
				postfixes: ['Store', 'Prop'],
				dependencies: meta.watchDependencies
			};

			const watcher = watch(data, watchOpts, (mutations) => {
				for (let i = 0; i < mutations.length; i++) {
					const
						info = mutations[i][2];

					if (info.parent) {
						const
							nm = String(info.path[0]);

						if (meta.computedFields[nm]?.get) {
							delete Object.getOwnPropertyDescriptor(this, nm)?.get?.[cacheStatus];
						}
					}
				}

				if (!beforeMountHooks[ctx.hook]) {
					this.$forceUpdate();
				}
			});

			ctx.$watch = (path, cb, opts) => {
				if (Object.isDictionary(cb)) {
					opts = Object.reject(cb, 'handler');
					cb = cb.handler;
				}

				const {unwatch} = watch(watcher.proxy, path, {...opts, collapse: true}, cb);
				return unwatch;
			};

			ctx.$$data = watcher.proxy;
			ctx.$set = watcher.set;
			ctx.$delete = watcher.delete;

			initWatchers(ctx);
			return {};
		},

		beforeCreate(): void {
			const
				ctx = <any>this;

			ctx.$$data = {};
			ctx.$$refs = {};

			ctx.$async = new Async(this);
			ctx.$asyncLabel = asyncLabel;

			const
				parent = ctx.$parent;

			if (parent && !parent.componentName) {
				ctx.$parent = ctx.$root.$$parent;
			}

			ctx.$normalParent = getNormalParent(ctx);
			ctx.instance = instance;
			ctx.componentName = meta.name;
			ctx.meta = forkMeta(meta);

			runHook('beforeRuntime', ctx)
				.catch(stderr);

			for (let o = meta.accessors, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = o[key];

				if (el) {
					Object.defineProperty(ctx, keys[i], {
						configurable: true,
						enumerable: true,
						get: el.get,
						set: el.set
					});
				}
			}

			for (let o = meta.computedFields, keys = Object.keys(o), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					el = o[key];

				if (el) {
					const get = () => {
						if (cacheStatus in get) {
							return get[cacheStatus];
						}

						return get[cacheStatus] = el.get!.call(ctx);
					};

					Object.defineProperty(ctx, keys[i], {
						configurable: true,
						enumerable: true,
						get: el.get && get,
						set: el.set
					});
				}
			}

			initFields(meta.systemFields, ctx, ctx);
			runHook('beforeCreate', ctx).catch(stderr);
			callMethodFromComponent(ctx, 'beforeCreate');
		},

		created(): void {
			runHook('created', this).catch(stderr);
			callMethodFromComponent(this, 'created');
		},

		beforeMount(): void {
			runHook('beforeMount', this).catch(stderr);
			callMethodFromComponent(this, 'beforeMount');
		},

		mounted(): void {
			this.$el.component = this;
			runHook('beforeMounted', this).catch(stderr);
			patchRefs(this);

			runHook('mounted', this).then(() => {
				if (methods.mounted) {
					return methods.mounted.fn.call(this);
				}
			}, stderr);
		},

		beforeUpdate(): void {
			runHook('beforeUpdate', this).catch(stderr);
			callMethodFromComponent(this, 'beforeUpdate');
		},

		updated(): void {
			runHook('beforeUpdated', this).catch(stderr);
			patchRefs(this);
			runHook('updated', this).then(() => {
				if (methods.updated) {
					return methods.updated.fn.call(this);
				}
			}, stderr);
		},

		activated(): void {
			runHook('beforeActivated', this).catch(stderr);
			patchRefs(this);
			runHook('activated', this).catch(stderr);
			callMethodFromComponent(this, 'activated');
		},

		deactivated(): void {
			runHook('deactivated', this).catch(stderr);
			callMethodFromComponent(this, 'deactivated');
		},

		beforeDestroy(): void {
			runHook('beforeDestroy', this).catch(stderr);
			callMethodFromComponent(this, 'beforeDestroy');
			this.$async.clearAll().locked = true;
		},

		destroyed(): void {
			runHook('destroyed', this).then(() => {
				if (methods.destroyed) {
					return methods.destroyed.fn.call(this);
				}
			}, stderr);
		},

		errorCaptured(): void {
			const
				args = arguments;

			runHook('errorCaptured', this, ...args).then(() => {
				if (methods.errorCaptured) {
					return methods.errorCaptured.fn.apply(this, args);
				}
			}, stderr);
		}
	};
}
