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

import type iBlock from 'super/i-block/i-block';
import type { ComponentElement } from 'super/i-block/i-block';

import Friend from 'super/i-block/modules/friend';
import type { TaskParams, TaskDesc } from 'super/i-block/modules/async-render/interface';

export * from 'super/i-block/modules/async-render/interface';

/**
 * Class provides API to render chunks of a component template asynchronously
 */
export default class AsyncRender extends Friend {
	//#if runtime has component/async-render

	constructor(component: iBlock) {
		super(component);

		this.meta.hooks.beforeUpdate.push({
			fn: () => this.async.clearAll({
				group: 'asyncComponents'
			})
		});
	}

	/**
	 * Restarts the `asyncRender` daemon to force rendering
	 */
	forceRender(): void {
		restart();
		this.localEmitter.emit('forceRender');
	}

	/**
	 * Restarts the `asyncRender` daemon to force rendering
	 * (runs on the next tick)
	 */
	deferForceRender(): void {
		deferRestart();
		this.localEmitter.emit('forceRender');
	}

	/**
	 * Returns a function that returns a promise that will be resolved after firing the `forceRender` event.
	 * The method can take an element name as the first parameter. This element will be dropped before resolving.
	 *
	 * Notice, the initial rendering of a component is mean the same as `forceRender`.
	 * The method is useful to re-render a non-regular component (functional or flyweight)
	 * without touching the parent state.
	 *
	 * @param elementToDrop - element to drop before resolving the promise
	 *   (if it passed as a function, it would be executed)
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
	waitForceRender(
		elementToDrop?: string | ((ctx: this['component']) => CanPromise<CanUndef<string | Element>>)
	): () => CanPromise<boolean> {
		return () => {
			const
				canImmediateRender = this.lfc.isBeforeCreate() || this.hook === 'beforeMount';

			if (canImmediateRender) {
				return true;
			}

			return this.localEmitter.promisifyOnce('forceRender').then(async () => {
				if (elementToDrop != null) {
					let
						el;

					if (Object.isFunction(elementToDrop)) {
						el = await elementToDrop(this.ctx);

					} else {
						el = elementToDrop;
					}

					if (Object.isString(el)) {
						this.block?.element(el)?.remove();

					} else {
						el?.remove();
					}
				}

				return true;
			});
		};
	}

	/**
	 * Creates an asynchronous render stream from the specified value.
	 * This method helps to optimize the rendering of a component by splitting big render tasks into little.
	 *
	 * @param value
	 * @param [sliceOrOpts] - elements per chunk, `[start position, elements per chunk]` or additional options
	 * @param [opts] - additional options
	 *
	 * @emits `localEmitter.asyncRenderChunkComplete(e: TaskParams & TaskDesc)`
	 * @emits `localEmitter.asyncRenderComplete(e: TaskParams & TaskDesc)`
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
			sliceOrOpts = [];
		}

		const
			{filter} = opts;

		let
			iterable = this.getIterable(value, filter != null);

		let
			startPos,
			perChunk;

		if (Object.isArray(sliceOrOpts)) {
			startPos = sliceOrOpts[0];
			perChunk = sliceOrOpts[1];

		} else {
			perChunk = sliceOrOpts;
		}

		startPos ??= 0;
		perChunk ??= 1;

		const
			firstRender = <unknown[]>[],
			untreatedEls = <unknown[]>[],
			srcIsPromise = Object.isPromise(iterable);

		let
			iterator: Iterator<unknown>,
			lastSyncEl: IteratorResult<unknown>;

		let
			syncI = 0,
			syncTotal = 0;

		if (!srcIsPromise) {
			iterator = iterable[Symbol.iterator]();

			// eslint-disable-next-line no-multi-assign
			for (let o = iterator, el = lastSyncEl = o.next(); !el.done; el = o.next(), syncI++) {
				if (startPos > 0) {
					startPos--;
					continue;
				}

				const
					val = el.value;

				let
					valIsPromise = Object.isPromise(val),
					canRender = !valIsPromise;

				if (canRender && filter != null) {
					canRender = filter.call(this.component, val, syncI, {
						iterable,
						i: syncI,
						total: syncTotal
					});

					if (Object.isPromise(canRender)) {
						valIsPromise = true;
						canRender = false;

					} else if (!Object.isTruly(canRender)) {
						canRender = false;
					}
				}

				if (canRender) {
					syncTotal++;
					firstRender.push(val);

				} else if (valIsPromise) {
					untreatedEls.push(val);
				}

				if (syncTotal >= perChunk || valIsPromise) {
					break;
				}
			}
		}

		const
			BREAK = {};

		firstRender[this.asyncLabel] = async (cb) => {
			const {
				async: $a,
				localEmitter
			} = this;

			const
				weight = opts.weight ?? 1,
				newIterator = createIterator();

			let
				i = 0,
				total = syncTotal,
				chunkTotal = 0,
				chunkI = 0,
				awaiting = 0;

			let
				group = 'asyncComponents',
				renderBuffer = <unknown[]>[];

			let
				lastTask,
				lastEvent;

			for (let o = newIterator, el = o.next(); !el.done; el = o.next()) {
				if (opts.group != null) {
					group = `asyncComponents:${opts.group}:${chunkI}`;
				}

				let
					val = el.value;

				const
					valIsPromise = Object.isPromise(val);

				if (valIsPromise) {
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

				const resolveTask = (filter?: boolean) => {
					if (filter === false) {
						return;
					}

					total++;
					chunkTotal++;
					renderBuffer.push(val);

					lastTask = () => {
						lastTask = null;
						awaiting++;

						const task = () => {
							const desc: TaskDesc = {
								async: $a,
								renderGroup: group
							};

							cb(renderBuffer, desc, (els: Node[]) => {
								chunkI++;
								chunkTotal = 0;
								renderBuffer = [];

								awaiting--;
								lastEvent = {...opts, ...desc};
								localEmitter.emit('asyncRenderChunkComplete', lastEvent);

								$a.worker(() => {
									const destroyEl = (el: CanUndef<ComponentElement | Node>) => {
										if (el == null) {
											return;
										}

										if (el[this.asyncLabel] != null) {
											delete el[this.asyncLabel];
											$a.worker(() => destroyEl(el), {group});

										} else {
											const
												els = el instanceof Element ? Array.from(el.querySelectorAll('.i-block-helper')) : [];

											if (opts.destructor?.(el, els) !== true) {
												this.destroy(el, els);
											}
										}
									};

									for (let i = 0; i < els.length; i++) {
										destroyEl(els[i]);
									}
								}, {group});
							});
						};

						return this.createTask(task, {group, weight});
					};

					if (!valIsPromise && chunkTotal < perChunk) {
						return;
					}

					return lastTask();
				};

				try {
					if (filter != null) {
						const needRender = filter.call(this.ctx, val, i, {
							iterable,
							i: syncI + i + 1,
							chunk: chunkI,
							total
						});

						if (Object.isPromise(needRender)) {
							await $a.promise(needRender, {group})
								.then((res) => resolveTask(res === undefined || Object.isTruly(res)));

						} else {
							const
								res = resolveTask(Object.isTruly(needRender));

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
					if (err?.type === 'clearAsync' && err.link.group === group) {
						break;
					}

					stderr(err);
					continue;
				}

				i++;
			}

			if (lastTask != null) {
				awaiting++;

				const
					res = lastTask();

				if (res != null) {
					await res;
				}
			}

			if (awaiting <= 0) {
				localEmitter.emit('asyncRenderComplete', lastEvent);

			} else {
				const id = localEmitter.on('asyncRenderChunkComplete', () => {
					if (awaiting <= 0) {
						localEmitter.emit('asyncRenderComplete', lastEvent);
						localEmitter.off(id);
					}
				});
			}

			function createIterator() {
				if (srcIsPromise) {
					const next = () => {
						if (Object.isPromise(iterable)) {
							return {
								done: false,
								value: iterable
									.then((v) => {
										iterable = v;
										iterator = v[Symbol.iterator]();

										const
											el = iterator.next();

										if (el.done) {
											return BREAK;
										}

										return el.value;
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
	}

	/**
	 * Returns an iterable object based on the passed value
	 *
	 * @param obj
	 * @param [hasFilter] - true if the passed object will be filtered
	 */
	protected getIterable(obj: unknown, hasFilter?: boolean): CanPromise<Iterable<unknown>> {
		if (obj == null) {
			return [];
		}

		if (obj === true) {
			if (hasFilter) {
				return new Range(0, Infinity);
			}

			return [];
		}

		if (obj === false) {
			if (hasFilter) {
				return new Range(0, -Infinity);
			}

			return [];
		}

		if (Object.isNumber(obj)) {
			return new Range(0, [obj]);
		}

		if (Object.isArray(obj)) {
			return obj;
		}

		if (Object.isString(obj)) {
			return obj.letters();
		}

		if (Object.isPromise(obj)) {
			return obj.then(this.getIterable.bind(this));
		}

		if (typeof obj === 'object') {
			if (Object.isIterable(obj)) {
				return obj;
			}

			return Object.entries(obj!);
		}

		return [obj];
	}

	/**
	 * Removes the given elements from the DOM tree and destroys the component attached to it
	 * @param el
	 */
	protected destroy(el: Node, els: Element[]): void {
		el.parentNode?.removeChild(el);

		for (let i = 0; i < els.length; i++) {
			const
				el = els[i];

			try {
				(<ComponentElement<iBlock>>el).component?.unsafe.$destroy();

			} catch (err) {
				stderr(err);
			}
		}

		try {
			(<ComponentElement<iBlock>>el).component?.unsafe.$destroy();

		} catch (err) {
			stderr(err);
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
					const cb = () => {
						taskFn();
						resolve();
						return true;
					};

					if (params.useRAF) {
						return $a.animationFrame({group}).then(cb);
					}

					return cb();

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
