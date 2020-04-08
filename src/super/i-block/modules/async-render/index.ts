/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/async-render/README.md]]
 * @packageDocumentation
 */

//#if runtime has component/async-render
import { queue, restart, deferRestart } from 'core/render';
//#endif

import iBlock from 'super/i-block/i-block';
import Friend from 'super/i-block/modules/friend';

import { TaskOptions, TaskDesc } from 'super/i-block/modules/async-render/interface';
export * from 'super/i-block/modules/async-render/interface';

/**
 * Class that provides API to render chunks of a component template asynchronously
 */
export default class AsyncRender<C extends iBlock = iBlock> extends Friend<C> {
	//#if runtime has component/async-render

	/** @see [[iBlock.$asyncLabel]] */
	get asyncLabel(): symbol {
		return this.component.$asyncLabel;
	}

	/** @override */
	constructor(component: C) {
		super(component);

		this.meta.hooks.beforeUpdate.push({fn: () => {
			const group = {
				group: 'asyncComponents'
			};

			this.async.clearAll(group);
			this.component.$async.clearAll(group);
		}});

		this.meta.hooks.beforeUpdated.push({fn: (desc: TaskDesc = {}) => {
			if (desc.destructor) {
				desc.destructor();
			}
		}});
	}

	/**
	 * Restarts the async render daemon to force render
	 */
	forceRender(): void {
		restart();
	}

	/**
	 * Restarts the async render daemon to force render
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
	 * @param [opts] - additional options
	 */
	iterate(value: unknown, slice: number | [number, number], opts: TaskOptions = {}): unknown[] {
		if (!value) {
			return [];
		}

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
			f = opts.filter,
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

		finalArr[this.asyncLabel] = async (cb) => {
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
					if (!filteredArr.length && lastSyncEl.done) {
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
				weight = opts.weight || 1,
				newIterator = createIterator();

			let
				i = 0,
				total = syncTotal,
				chunkTotal = 0,
				chunkI = 0;

			let
				newArray = <unknown[]>[];

			const
				{async: $a} = this;

			for (let o = newIterator, el = o.next(); !el.done; el = o.next()) {
				let
					val = el.value;

				const
					isPromise = Object.isPromise(val);

				if (isPromise) {
					try {
						val = await val;

					} catch (err) {
						const
							{methods} = this.meta;

						if (methods.errorCaptured) {
							methods.errorCaptured.fn.call(this, err);
						}

						continue;
					}
				}

				const task = () => {
					newArray.push(val);

					total++;
					chunkTotal++;

					if (chunkTotal >= count || el.done || isPromise) {
						const
							desc = <TaskDesc>{};

						let
							group = 'asyncComponents';

						if (opts.group) {
							group = `asyncComponents:${opts.group}:${chunkI}`;
							desc.destructor = () => $a.terminateWorker({group});
						}

						desc.renderGroup = group;

						const
							els = <Node[]>cb(newArray, desc);

						chunkI++;
						chunkTotal = 0;
						newArray = [];

						$a.worker(() => {
							const destroyEl = (el) => {
								if (el[this.asyncLabel]) {
									delete el[this.asyncLabel];
									$a.worker(() => destroyEl(el), {group});

								} else if (el.parentNode) {
									if (opts.destructor) {
										opts.destructor(el);
									}

									el.parentNode.removeChild(el);
								}
							};

							for (let i = 0; i < els.length; i++) {
								destroyEl(els[i]);
							}
						}, {group});
					}
				};

				this.createTask(task, {
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
	protected createTask(cb: (...args: unknown[]) => void, params: TaskOptions = {}): void {
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
