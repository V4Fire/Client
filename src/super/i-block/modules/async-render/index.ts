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

import Friend from 'super/i-block/modules/friend';
import { TaskParams, TaskDesc } from 'super/i-block/modules/async-render/interface';

export * from 'super/i-block/modules/async-render/interface';

/**
 * Class provides API to render chunks of a component template asynchronously
 */
export default class AsyncRender extends Friend {
	//#if runtime has component/async-render

	/** @override */
	constructor(component: any) {
		super(component);

		this.meta.hooks.beforeUpdate.push({fn: () => {
			const group = {
				group: 'asyncComponents'
			};

			this.async.clearAll(group);
			this.ctx.$async.clearAll(group);
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
	 * Creates an asynchronous render stream from the specified value.
	 * This method helps to optimize the rendering of a component by splitting big render tasks into little.
	 *
	 * @param value
	 * @param slice - elements per chunk or [start position, elements per chunk]
	 * @param [opts] - additional options
	 *
	 * @example
	 * ```
	 * /// Asynchronous rendering of components, only five elements per chunk
	 * < template v-for = el in asyncRender.iterate(largeList, 5)
	 *   < my-component :data = el
	 * ```
	 */
	iterate(value: unknown, slice: number | [number?, number?], opts: TaskParams = {}): unknown[] {
		if (value == null) {
			return [];
		}

		let
			iterable: CanPromise<Iterable<unknown>>;

		const getIterable = (value) => {
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
				return value.then(getIterable);
			}

			if (value != null && typeof value === 'object') {
				if (Object.isFunction(value[Symbol.iterator])) {
					return value;
				}

				return Object.keys(value);
			}

			return [value];
		};

		iterable = getIterable(value);

		let
			startPos = 0,
			perChunk;

		if (Object.isArray(slice)) {
			startPos = slice[0] ?? startPos;
			perChunk = slice[1];

		} else {
			perChunk = slice;
		}

		const
			{filter} = opts;

		const
			firstRender = <unknown[]>[],
			untreatedEls = <unknown[]>[],
			isSrcPromise = Object.isPromise(iterable);

		let
			iterator: Iterator<unknown>,
			lastSyncEl: IteratorResult<any>;

		let
			syncI = 0,
			syncTotal = 0;

		if (!isSrcPromise) {
			iterator = iterable[Symbol.iterator]();

			// eslint-disable-next-line no-multi-assign
			for (let o = iterator, el = lastSyncEl = o.next(); !el.done; el = o.next(), syncI++) {
				if (startPos > 0) {
					startPos--;
					continue;
				}

				const
					val = el.value,
					isPromise = Object.isPromise(val);

				let
					canRender = !isPromise;

				if (canRender && filter != null) {
					canRender = filter.call(this.component, val, syncI, {
						list: iterable,
						i: syncI,
						total: syncTotal
					});

					if (Object.isPromise(canRender) || !Object.isTruly(canRender)) {
						canRender = false;
					}
				}

				if (canRender) {
					syncTotal++;
					firstRender.push(val);

				} else {
					untreatedEls.push(val);
				}

				if (syncTotal >= perChunk || isPromise) {
					break;
				}
			}
		}

		firstRender[this.asyncLabel] = async (cb) => {
			const createIterator = () => {
				if (isSrcPromise) {
					const next = () => {
						if (Object.isPromise(iterable)) {
							return {
								done: false,
								value: iterable.then((v) => {
									iterable = v;
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
					if (untreatedEls.length === 0 && lastSyncEl.done) {
						return lastSyncEl;
					}

					if (i < untreatedEls.length) {
						return {
							value: untreatedEls[i++],
							done: false
						};
					}

					return iterator.next();
				};

				return {next};
			};

			const
				weight = opts.weight ?? 1,
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
					isValPromise = Object.isPromise(val);

				if (isValPromise) {
					try {
						// eslint-disable-next-line require-atomic-updates
						val = await val;

					} catch (err) {
						const
							{methods} = this.meta;

						if (methods.errorCaptured) {
							methods.errorCaptured.fn.call(this.component, err);
						}

						continue;
					}
				}

				const task = () => {
					newArray.push(val);

					total++;
					chunkTotal++;

					const needRender =
						el.done ||
						isValPromise ||
						chunkTotal >= perChunk ||
						Object.isArray(iterable) && total >= iterable.length;

					if (needRender) {
						const
							desc = <TaskDesc>{};

						let
							group = 'asyncComponents';

						if (opts.group != null) {
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
								if (el[this.asyncLabel] != null) {
									delete el[this.asyncLabel];
									$a.worker(() => destroyEl(el), {group});

								} else if (el.parentNode != null) {
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
					filter: filter?.bind(this.ctx, val, i, {
						iterable,
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

		return firstRender;
	}

	/**
	 * Creates a render task by the specified parameters
	 *
	 * @param cb
	 * @param [params]
	 */
	protected createTask(cb: AnyFunction, params: TaskParams = {}): void {
		const task = {
			weight: params.weight,
			fn: this.async.proxy(() => {
				if (!params.filter) {
					return exec(true);
				}

				const
					res = params.filter();

				if (Object.isPromise(res)) {
					return res.then(exec).catch((err) => {
						stderr(err);
						return false;
					});
				}

				return exec(res);

				function exec(res: unknown): boolean {
					if (Object.isTruly(res)) {
						cb();
						return true;
					}

					return false;
				}

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
