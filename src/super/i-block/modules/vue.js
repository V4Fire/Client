'use strict';

/* eslint-disable no-unused-vars */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import './vue.directives';

/** @interface */
export default class VueInterface {
	render(el: Function, ctx?: Object, attrs?: Object, children?: Array): Object {}
	$nextTick(cb: Function) {}
	$forceUpdate() {}
	$mount(elementOrSelector: HTMLElement | string) {}
	$destroy() {}
	$set(obj: Object, prop: string, val: any): any {}
	$get(obj: Object, prop: string): any {}
	$delete(obj: Object, prop: string) {}
	$on(event: string, cb: Function) {}
	$off(event?: string, cb?: Function) {}
	$once(event: string, cb: Function) {}
	$emit(event: string, ...args: any) {}
	$watch(expOrFn: string | Function, cb: Function, opts?: {deep?: boolean, immediate?: boolean}) {}
	get $isServer(): any {}
	get $el(): HTMLElement {}
	get $data(): Object {}
	get $refs(): any {}
	get $slots(): any {}
	get $scopedSlots(): any {}
	get $options(): Object & {parentComponent: any} {}
	get $parent(): Object {}
	get $children(): Object {}
	get $root(): Object {}
	get $vnode(): VNode {}
	get $attrs(): Object {}
	get $listeners(): Object {}
}
