/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import iBlock from 'super/i-block/i-block';
import { queue, restart, deferRestart } from 'core/render';

export interface TaskOpts {
	weight?: number;
	filter?: Function;
}

export default class AsyncRender {
	/**
	 * Component async label
	 */
	get asyncLabel(): symbol {
		// @ts-ignore
		return this.component.$asyncLabel;
	}

	/**
	 * Component instance
	 */
	protected readonly component: iBlock;

	/**
	 * Async instance
	 */
	protected get async(): Async {
		// @ts-ignore
		return this.component.async;
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;

		const
			// @ts-ignore
			{hooks} = component.meta;

		hooks.beforeUpdate.push({fn: () => {
			this.async
				.cancelProxy({group: 'asyncComponents'})
				.terminateWorker({group: 'asyncComponents'});
		}});
	}

	/**
	 * Restarts the async render daemon for forcing render
	 */
	forceRender(): void {
		restart();
	}

	/**
	 * Restarts the async render daemon for forcing render
	 * (runs on a next tick)
	 */
	deferForceRender(): void {
		deferRestart();
	}

	/**
	 * Creates an asynchronous array from the specified
	 *
	 * @param value
	 * @param slice - elements per chunk or [elements per chunk, start position]
	 * @param [params]
	 */
	array(value: unknown[], slice: CanArray<number>, params: TaskOpts = {}): unknown[] {
		let
			from = 0,
			count;

		if (Object.isArray(slice)) {
			from = slice[1] || from;
			count = slice[0];

		} else {
			count = slice;
		}

		if (count > value.length) {
			count = value.length;
		}

		const
			f = params.filter,
			finalArr = <unknown[]>[],
			filteredArr = <unknown[]>[];

		for (let i = 0, j = 0; i < count; from++, j++) {
			const
				el = value[from];

			if (!f || f.call(this.component, el, j)) {
				i++;
				finalArr.push(el);

			} else {
				filteredArr.push(el);
			}
		}

		if (finalArr.length !== value.length) {
			finalArr[this.asyncLabel] = (cb) => {
				const
					weight = params.weight || 1,
					sourceArr = filteredArr.concat(value.slice(from));

				let
					j = 0,
					z = 0,
					newArray = <unknown[]>[];

				for (let i = 0; i < sourceArr.length; i++) {
					const
						el = sourceArr[i];

					const fn = () => {
						newArray.push(el);

						if (++j >= count || z === sourceArr.length - 1) {
							const
								els = <Node[]>cb(newArray, from);

							j = 0;
							newArray = [];

							this.async.worker(() => {
								for (let i = 0; i < els.length; i++) {
									const
										el = els[i];

									if (el.parentNode) {
										el.parentNode.removeChild(el);
									}
								}

							}, {group: 'asyncComponents'});
						}

						z++;
					};

					this.createTask(fn, {
						weight,
						filter: f && f.bind(this.component, el, i)
					});
				}
			};
		}

		return finalArr;
	}

	/**
	 * Creates a render task by the specified parameters
	 *
	 * @param cb
	 * @param [params]
	 */
	protected createTask(cb: (...args: unknown[]) => void, params: TaskOpts = {}): void {
		const task = {
			weight: params.weight,
			fn: this.async.proxy(() => {
				if (!params.filter || params.filter()) {
					cb();
					return true;
				}

				return false;

			}, {
				onClear: () => queue.delete(task),
				single: false,
				group: 'asyncComponents'
			})
		};

		queue.add(task);
	}
}
