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

import Range from 'core/range';
import SyncPromise from 'core/promise/sync';

//#if runtime has component/async-render
import { queue, restart, deferRestart } from 'core/render';
//#endif

import Friend from 'super/i-block/modules/friend';
import type { TaskParams, TaskDesc } from 'super/i-block/modules/async-render/interface';

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
		this.localEmitter.emit('forceRender');
	}

	/**
	 * Restarts the async render daemon to force render
	 * (runs on a next tick)
	 */
	deferForceRender(): void {
		deferRestart();
		this.localEmitter.emit('forceRender');
	}

	/**
	 * Returns a promise that will be resolved after the firing of the `forceRender` event.
	 * Notice, the initial rendering of a component is mean the same as `forceRender`.
	 */
	waitForceRender(): CanPromise<boolean>;

	/**
	 * Returns a function that returns a promise that will be resolved after firing the `forceRender` event.
	 * The method takes an element name as the first parameter, the element will be dropped before resolving.
	 *
	 * Notice, the initial rendering of a component is mean the same as `forceRender`.
	 * The method is useful to re-render a non-regular component (functional or flyweight)
	 * without touching the parent state.
	 *
	 * @param elementToDrop - element to drop before resolving of the promise
	 *
	 * @example
	 * ```
	 * < button @click = asyncRender.forceRender()
	 *   Re-render the component
	 *
	 * < .&__wrapper
	 *   < template v-for = el in asyncRender.iterate(true, {filter: asyncRender.waitForceRender('content')})
	 *     < .&__content
	 *       {{ Math.random() }}
	 * ```
	 */
	waitForceRender(elementToDrop: string): () => CanPromise<boolean>;
	waitForceRender(elementToDrop?: string): CanPromise<boolean> | (() => CanPromise<boolean>) {
		const wait = () => {
			if (!this.lfc.isBeforeCreate()) {
				return this.localEmitter.promisifyOnce('forceRender').then(() => {
					if (elementToDrop != null) {
						this.block?.element(elementToDrop)?.remove();
					}

					return true;
				});
			}

			return true;
		};

		if (elementToDrop != null) {
			console.log(2222);
			return wait;
		}

		return wait();
	}

	/**
	 * Creates an asynchronous render stream from the specified value.
	 * This method helps to optimize the rendering of a component by splitting big render tasks into little.
	 *
	 * @param value
	 * @param [sliceOrOpts] - elements per chunk, `[start position, elements per chunk]` or additional options
	 * @param [opts] - additional options
	 *
	 * @example
	 * ```
	 * /// Asynchronous rendering of components, only five elements per chunk
	 * < template v-for = el in asyncRender.iterate(largeList, 5)
	 *   < my-component :data = el
	 * ```
	 */
	iterate(
		value: unknown,
		sliceOrOpts: number | [number?, number?] | TaskParams = 1,
		opts: TaskParams = {}
	): unknown[] {
		if (value == null) {
			return [];
		}

		if (Object.isPlainObject(sliceOrOpts)) {
			opts = sliceOrOpts;
			sliceOrOpts = 1;
		}

		let
			iterable = getIterable(value);

		let
			startPos = 0,
			perChunk;

		if (Object.isArray(sliceOrOpts)) {
			startPos = sliceOrOpts[0] ?? startPos;
			perChunk = sliceOrOpts[1];

		} else {
			perChunk = sliceOrOpts;
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
						i: syncI,
						list: iterable,
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

		const
			BREAK = {};

		firstRender[this.asyncLabel] = async (cb) => {
			const
				weight = opts.weight ?? 1,
				newIterator = createIterator();

			let
				i = 0,
				total = syncTotal,
				chunkTotal = 0,
				chunkI = 0;

			let
				renderBuffer = <unknown[]>[];

			const
				{async: $a} = this;

			let
				group = 'asyncComponents';

			if (opts.group != null) {
				group = `asyncComponents:${opts.group}:${chunkI}`;
			}

			for (let o = newIterator, el = o.next(); !el.done; el = o.next()) {
				let
					val = el.value;

				const
					isValPromise = Object.isPromise(val);

				if (isValPromise) {
					try {
						// eslint-disable-next-line require-atomic-updates
						val = await $a.promise(<Promise<unknown>>val, {group});

						if (val === BREAK) {
							break;
						}

					} catch (err) {
						if (err?.type === 'clearAsync' && err.reason === 'group' && err.link.group === group) {
							break;
						}

						stderr(err);
						continue;
					}
				}

				const resolveTask = (filter?) => {
					renderBuffer.push(val);

					total++;
					chunkTotal++;

					const isDone =
						el.done ||
						Object.isArray(iterable) && total >= iterable.length;

					const needRender =
						isDone ||
						isValPromise ||
						chunkTotal >= perChunk;

					if (!needRender) {
						return;
					}

					const task = () => {
						const desc: TaskDesc = {
							renderGroup: group
						};

						if (opts.group != null) {
							desc.destructor = () => $a.terminateWorker({group});
						}

						cb(renderBuffer, desc, (els: Node[]) => {
							chunkI++;
							chunkTotal = 0;
							renderBuffer = [];

							if (isDone) {
								this.ctx.localEmitter.emit('asyncRenderComplete', {...opts, ...desc});
							}

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
						});
					};

					return this.createTask(task, {group, weight, filter});
				};

				try {
					if (filter != null) {
						const filterParams = {
							iterable,
							i: syncI + i + 1,

							get chunk(): number {
								return chunkI;
							},

							get total(): number {
								return total;
							}
						};

						const
							res = filter.call(this.ctx, val, i, filterParams);

						if (Object.isPromise(res)) {
							await $a.promise(res, {group}).then((res) => {
								if (Object.isTruly(res)) {
									return resolveTask();
								}
							});

						} else {
							const
								res = resolveTask(filter.bind(this.ctx, val, i, filterParams));

							if (res != null) {
								await res;
							}
						}

					} else {
						const
							res = resolveTask();

						if (res != null) {
							await res;
						}
					}

				} catch (err) {
					if (err?.type === 'clearAsync' && err.reason === 'group' && err.link.group === group) {
						break;
					}

					stderr(err);
					continue;
				}

				i++;
			}

			function createIterator() {
				if (isSrcPromise) {
					const next = () => {
						if (Object.isPromise(iterable)) {
							return {
								done: false,
								value: iterable
									.then((v) => {
										iterable = v;
										iterator = v[Symbol.iterator]();
										return iterator.next().value;
									})

									.catch((err) => {
										stderr(err);
										return BREAK;
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
			}
		};

		return firstRender;

		function getIterable(value: unknown): CanPromise<Iterable<unknown>> {
			if (value === true) {
				return new Range(0, Infinity);
			}

			if (value === false) {
				return new Range(0, -Infinity);
			}

			if (Object.isNumber(value)) {
				return new Range(0, value);
			}

			if (Object.isArray(value)) {
				return value;
			}

			if (Object.isString(value)) {
				return value.letters();
			}

			if (Object.isPromise(value)) {
				return value.then(getIterable);
			}

			if (value != null && typeof value === 'object') {
				if (Object.isFunction(value![Symbol.iterator])) {
					return <any>value;
				}

				return Object.keys(value!);
			}

			return [value];
		}
	}

	/**
	 * Creates a render task by the specified parameters
	 *
	 * @param taskFn
	 * @param [params]
	 */
	protected createTask(taskFn: AnyFunction, params: TaskParams = {}): Promise<void> {
		const
			{async: $a} = this;

		const
			group = params.group ?? 'asyncComponents';

		return new SyncPromise<void>((resolve, reject) => {
			const task = {
				weight: params.weight,

				fn: $a.proxy(() => {
					if (params.filter == null) {
						return execTask(true);
					}

					const
						res = params.filter();

					if (Object.isPromise(res)) {
						return res.then(execTask);
					}

					return execTask(res);

					function execTask(res: unknown): CanPromise<boolean> {
						if (Object.isTruly(res)) {
							const cb = () => {
								taskFn();
								resolve();
								return true;
							};

							if (params.useRAF) {
								return $a.animationFrame({group}).then(cb);
							}

							return cb();
						}

						return false;
					}

				}, {
					group,
					single: false,
					onClear: (err) => {
						queue.delete(task);
						reject(err);
					}
				})
			};

			queue.add(task);
		});
	}

	//#endif
}
