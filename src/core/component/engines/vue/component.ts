/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import watch from 'core/object/watch';

import { asyncLabel, beforeRenderHooks } from 'core/component/const';

import { runHook } from 'core/component/hook';
import { initFields } from 'core/component/field';
import { initAccessors } from 'core/component/accessor';

import { bindRemoteWatchers, initComponentWatcher } from 'core/component/watch';
import { patchRefs } from 'core/component/create';

import { getNormalParent } from 'core/component/traverse';
import { isAbstractComponent } from 'core/component/reflection';
import { forkMeta, fillMeta, callMethodFromComponent } from 'core/component/meta';

import { ComponentDriver, ComponentOptions, FunctionalComponentOptions } from 'core/component/engines';
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
				ctx = <any>this;

			initFields(meta.fields, ctx, ctx.$fields);
			runHook('beforeDataCreate', ctx).catch(stderr);
			initComponentWatcher(ctx);

			watch(ctx.$fields, {deep: true, collapse: true}, () => {
				if (!beforeRenderHooks[ctx.hook]) {
					this.$forceUpdate();
				}
			});

			bindRemoteWatchers(ctx);
			return {};
		},

		beforeCreate(): void {
			const
				ctx = <any>this;

			ctx.$fields = {};
			ctx.$systemFields = {};
			ctx.$refHandlers = {};

			ctx.$async = new Async(this);
			ctx.$asyncLabel = asyncLabel;

			const
				parent = ctx.$parent;

			if (parent && !parent.componentName) {
				ctx.$parent = ctx.$root.$remoteParent;
			}

			ctx.$normalParent = getNormalParent(ctx);
			ctx.instance = instance;
			ctx.componentName = meta.name;
			ctx.meta = forkMeta(meta);

			runHook('beforeRuntime', ctx)
				.catch(stderr);

			initAccessors(ctx);
			initFields(meta.systemFields, ctx, ctx);

			for (let keys = Object.keys(meta.systemFields), i = 0; i < keys.length; i++) {
				const key = keys[i];
				ctx.$systemFields[key] = ctx[key];
			}

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
