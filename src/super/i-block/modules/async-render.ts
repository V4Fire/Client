/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import iBlock from 'super/i-block/i-block';

import { runHook, ComponentMeta } from 'core/component';
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
	 * Component meta object
	 */
	protected get meta(): ComponentMeta {
		// @ts-ignore
		return this.component.meta;
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
		this.meta.hooks.beforeUpdate.push({fn: () => {
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
	 * Creates an asynchronous stream from the specified value
	 *
	 * @param value
	 * @param slice - elements per chunk or [start position, elements per chunk]
	 * @param [params]
	 */
	of(value: unknown, slice: CanArray<number>, params: TaskOpts = {}): unknown[] {
		let
			list: unknown[];

		if (Object.isArray(value)) {
			list = value;

		} else if (Object.isString(value)) {
			list = value.split('');

		} else if (Object.isNumber(value)) {
			list = new Array(value);

		} else {
			// @ts-ignore
			list = value && typeof value === 'object' ? value[Symbol.iterator] ? value : Object.keys(value) : [value];
		}

		let
			from = 0,
			count;

		if (Object.isArray(slice)) {
			from = slice[0] || from;
			count = slice[1];

		} else {
			count = slice;
		}

		const
			f = params.filter,
			finalArr = <unknown[]>[],
			filteredArr = <unknown[]>[],
			iterator = list[Symbol.iterator]();

		let
			last;

		for (let o = iterator, el = last = o.next(), i = 0, j = 0; !el.done; el = last = o.next(), j++) {
			if (from) {
				from--;
				continue;
			}

			const
				val = el.value,
				isPromise = Object.isPromise(val);

			if (!isPromise && (!f || f.call(this.component, val, j))) {
				i++;
				finalArr.push(val);

			} else {
				filteredArr.push(val);
			}

			if (i >= count || isPromise) {
				break;
			}
		}

		finalArr[this.asyncLabel] = (cb) => {
			const createIterator = () => {
				let i = 0;

				const next = () => {
					if (last.done) {
						return last;
					}

					if (i < filteredArr.length) {
						return {
							value: filteredArr[i++],
							done: false
						};
					}

					return iterator.next();
				};

				return {next};
			};

			const
				weight = params.weight || 1,
				newIterator = createIterator();

			let
				j = 0,
				newArray = <unknown[]>[];

			for (let o = newIterator, el = o.next(), i = 0; !el.done; el = o.next(), i++) {
				let
					val = el.value;

				const fn = () => {
					newArray.push(val);

					if (++j >= count || !el.done) {
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
				};

				if (Object.isPromise(val)) {
					val
						.then((resolvedVal) => {
							val = resolvedVal;

							this.createTask(fn, {
								weight,
								filter: f && f.bind(this.component, val, i)
							});
						})

						.catch((err) =>
							runHook('errorCaptured', this.meta, this, err).then((err) => err)
						)

						.then((err) => {
							const
								{methods} = this.meta;

							if (methods.errorCaptured) {
								return methods.errorCaptured.fn.call(this, err);
							}
						})

						.catch(stderr);

				} else {
					this.createTask(fn, {
						weight,
						filter: f && f.bind(this.component, val, i)
					});
				}
			}
		};

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
