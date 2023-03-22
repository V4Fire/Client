/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/base/b-scrolly/README.md]]
 * @packageDocumentation
 */

import iData, { component, prop, field } from 'components/super/i-data/i-data';
import VDOM, { create, render } from 'components/friends/vdom';

VDOM.addToPrototype(create);
VDOM.addToPrototype(render);

export * from 'components/super/i-data/i-data';

@component()
export default class bScrolly extends iData {
	/**
	 * Если установлено в `true` то компонент будет удалять невидимые во `viewport` DOM узлы.
	 *
	 * Опция может быть полезной в случае если необходимо отрисовывать контент который состоит из 1000+ элементов.
	 * Для работы этой опции необходима поддержка {@link ResizeObserver}.
	 */
	@prop(Boolean)
	readonly dropNodes: boolean = false;

	@field()
	list: unknown[] = [];

	pushToList(count: number): void {
		const arr = Array.from(new Array(count), () => ({id: Math.random().toString(), count}));

		performance.measure('list render', {start: performance.now()});
		this.field.set('list', this.list.concat(arr));

		void this.nextTick().then(() => {
			requestAnimationFrame(() => {
				performance.measure('list render', {end: performance.now()});
			});
		});
	}

	updateList(count: number): void {
		const arr = Array.from(new Array(count), () => ({id: Math.random().toString(), count}));

		performance.measure('list render', {start: performance.now()});
		this.field.set('list', arr);

		void this.nextTick().then(() => {
			requestAnimationFrame(() => {
				performance.measure('list render', {end: performance.now()});
			});
		});
	}

	updateListElements(count: number): void {
		const arr = Array.from(new Array(count), () => ({id: Math.random().toString(), count}));

		performance.measure('list render', {start: performance.now()});
		this.field.set('list', arr);

		void this.nextTick().then(() => {
			requestAnimationFrame(() => {
				performance.measure('list render', {end: performance.now()});
			});
		});
	}

	pushToListCreateElement(count: number): void {
		const arr = Array.from(new Array(count), () => ({id: Math.random().toString(), count}));

		performance.measure('list render', {start: performance.now()});
		const
			el = this.block?.element('container');

		const renderedNodes = arr.map(({id}) => ({
			type: 'div',
			children: {
				default: id.toString()
			}
		}));

		const nodes = this.vdom.render(this.vdom.create(renderedNodes));

		el?.append(...nodes);

		void this.nextTick().then(() => {
			requestAnimationFrame(() => {
				performance.measure('list render', {end: performance.now()});
			});
		});
	}
}
