/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import iBlock from 'super/i-block/i-block';

//#if runtime has component/async-render
import { runHook, ComponentMeta } from 'core/component';
import { queue, restart, deferRestart } from 'core/render';
//#endif

export interface TaskI<D = unknown> {
	list: Iterator<D>;
	i: number;
	total: number;
	chunk?: number;
}

export interface TaskFilter<EL = unknown, I extends number = number, D = unknown> {
	(): boolean;
	(el: EL, i: I, task: TaskI<D>): boolean;
}

export interface TaskDestructor {
	(el: Node);
}

export interface TaskOpts<EL = unknown, I extends number = number, D = unknown> {
	group?: string;
	weight?: number;
	filter?: TaskFilter<EL, I, D>;
	destructor?: TaskDestructor;
}

export interface TaskDesc {
	renderGroup?: string;
	destructor?: Function;
}

export default class AsyncRender {
	//#if runtime has component/async-render

	/**
	 * Component async label
	 */
	get asyncLabel(): symbol {
		// @ts-ignore (access)
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
		// @ts-ignore (access)
		return this.component.async;
	}

	/**
	 * Component meta object
	 */
	protected get meta(): ComponentMeta {
		// @ts-ignore (access)
		return this.component.meta;
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
		this.meta.hooks.beforeUpdate.push({fn: () => {
			const group = {
				group: 'asyncComponents'
			};

			this.async.clearAll(group);

			// @ts-ignore (access)
			this.component.$async.clearAll(group);
		}});

		this.meta.hooks.beforeUpdated.push({fn: (desc: TaskDesc = {}) => {
			if (desc.destructor) {
				desc.destructor();
			}
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
	iterate(value: unknown, slice: CanArray<number>, params: TaskOpts = {}): unknown[] {
		let
			list: CanPromise<unknown[]>;

		const setList = (value) => {
			if (Object.isArray(value)) {
				return value;
			}

			if (Object.isString(value)) {
				return value.split('');
			}

			if (Object.isNumber(value)) {
				return new Array(value);
			}

			if (Object.isPromise(value)) {
				return value.then(setList);
			}

			return value && typeof value === 'object' ? value[Symbol.iterator] ? value : Object.keys(value) : [value];
		};

		list = setList(value);

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
			isPromise = Object.isPromise(list);

		let
			iterator: Iterator<unknown>,
			lastSyncEl;

		let
			syncI = 0,
			syncTotal = 0;

		if (!isPromise) {
			iterator = list[Symbol.iterator]();

			for (let o = iterator, el = lastSyncEl = o.next(); !el.done; el = lastSyncEl = o.next(), syncI++) {
				if (from) {
					from--;
					continue;
				}

				const
					val = el.value,
					isPromise = Object.isPromise(val);

				if (!isPromise && (!f || f.call(this.component, val, syncI, {list, i: syncI, total: syncTotal}))) {
					syncTotal++;
					finalArr.push(val);

				} else {
					filteredArr.push(val);
				}

				if (syncTotal >= count || isPromise) {
					break;
				}
			}
		}

		finalArr[this.asyncLabel] = (cb) => {
			const createIterator = () => {
				if (isPromise) {
					const next = () => {
						if (Object.isPromise(list)) {
							return {
								done: false,
								value: list.then((v) => {
									list = v;
									iterator = v[Symbol.iterator]();
									return iterator.next().value;
								})
							};
						}

						return iterator.next();
					};

					return {next};
				}

				let
					i = 0;

				const next = () => {
					if (lastSyncEl.done) {
						return lastSyncEl;
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
				i = 0,
				total = syncTotal,
				chunkTotal = 0,
				chunkI = 0;

			let
				newArray = <unknown[]>[];

			const iterate = () => {
				for (let o = newIterator, el = o.next(); !el.done;) {
					let
						val = el.value;

					const fn = () => {
						newArray.push(val);

						total++;
						chunkTotal++;

						if (chunkTotal >= count || el.done) {
							const
								desc = <TaskDesc>{};

							let
								group = 'asyncComponents';

							if (params.group) {
								group = `asyncComponents:${params.group}:${chunkI}`;
								desc.destructor = () => this.async.terminateWorker({group});
							}

							desc.renderGroup = group;

							const
								els = <Node[]>cb(newArray, desc);

							chunkI++;
							chunkTotal = 0;
							newArray = [];

							this.async.worker(() => {
								for (let i = 0; i < els.length; i++) {
									const
										el = els[i];

									if (el[this.asyncLabel]) {
										delete el[this.asyncLabel];

									} else if (el.parentNode) {
										if (params.destructor) {
											params.destructor(el);
										}

										el.parentNode.removeChild(el);
									}
								}
							}, {group});
						}
					};

					if (Object.isPromise(val)) {
						val
							.then((resolvedVal) => {
								val = resolvedVal;

								this.createTask(fn, {
									weight,
									filter: f && f.bind(this.component, val, i, {
										list,
										i: syncI + i + 1,

										get chunk(): number {
											return chunkI;
										},

										get total(): number {
											return total;
										}
									})
								});

								i++;
								iterate();
							})

							.catch((err) =>
								runHook('errorCaptured', this.meta, this.component, err).then(() => err)
									.then((err) => {
										const
											{methods} = this.meta;

										if (methods.errorCaptured) {
											return methods.errorCaptured.fn.call(this, err);
										}
									})

									.catch(stderr)
							);

						break;
					}

					this.createTask(fn, {
						weight,
						filter: f && f.bind(this.component, val, i, {
							list,
							i: syncI + i + 1,

							get chunk(): number {
								return chunkI;
							},

							get total(): number {
								return total;
							}
						})
					});

					i++;
					el = o.next();
				}
			};

			iterate();
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

	//#endif
}
