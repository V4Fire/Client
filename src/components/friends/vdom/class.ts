/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode } from 'core/component/engines';
import Friend, { fakeMethods } from 'components/friends/friend';

import type iBlock from 'components/super/i-block/i-block';
import type { RenderFactory, RenderFn, ComponentInterface } from 'components/super/i-block/i-block';

import type { VNodeDescriptor, VNodeOptions } from 'components/friends/vdom/interface';

interface VDOM {
	closest<T extends iBlock = iBlock>(component: string | ClassConstructor<any[], T> | Function): CanNull<T>;
	findElement(name: string, where: VNode, ctx?: iBlock): CanNull<VNode>;

	create(type: string, opts?: VNodeOptions): VNode;
	create(...descriptors: VNodeDescriptor[]): VNode[];
	create(descriptors: VNodeDescriptor[]): VNode[];

	render(vnode: VNode, group?: string): Node;
	render(vnodes: VNode[], group?: string): Node[];

	getRenderFactory(path: string): CanUndef<RenderFactory>;
	getRenderFn(factoryOrPath: CanUndef<RenderFactory> | string, ctx?: ComponentInterface): RenderFn;
}

@fakeMethods(
	'closest',
	'findElem',

	'create',
	'render',

	'getRenderFactory',
	'getRenderFn'
)

class VDOM extends Friend {
	/**
	 * Sets the current component instance as active.
	 * This function is necessary to render components asynchronously.
	 */
	protected setInstance?: Function;

	constructor(component: iBlock) {
		super(component);

		if (this.ctx.isFunctional) {
			Object.defineProperty(this, 'setInstance', {
				configurable: true,
				enumerable: true,
				get() {
					return this.ctx.$normalParent?.unsafe.vdom.setInstance;
				}
			});

		} else {
			this.meta.hooks.mounted.push({
				fn: () => {
					this.setInstance = this.ctx.$renderEngine.r.withAsyncContext.call(this.ctx, Promise.resolve.bind(Promise))[1];
				}
			});
		}
	}

	/**
	 * Executes the given function in the component render context.
	 * This function is necessary to render components asynchronously.
	 *
	 * @param cb
	 */
	withRenderContext<T>(cb: (...args: any) => T): T {
		this.setInstance?.();
		return cb();
	}

	/**
	 * Saves the component active rendering context
	 */
	saveRenderContext(): void {
		const {ctx} = this;

		const withCtx = ctx.$renderEngine.r.withCtx((cb) => cb());

		ctx.$withCtx = (cb) => {
			if (ctx.hook === 'mounted' || ctx.hook === 'updated') {
				return withCtx(cb);
			}

			return cb();
		};
	}
}

export default VDOM;
