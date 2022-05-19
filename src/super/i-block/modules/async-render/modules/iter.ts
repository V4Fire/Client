/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Range from 'core/range';

import type { ComponentElement } from 'super/i-block/i-block';
import type { TaskParams, TaskDesc } from 'super/i-block/modules/async-render/interface';

import Super from 'super/i-block/modules/async-render/modules/base';

export * from 'super/i-block/modules/async-render/modules/base';
export * from 'super/i-block/modules/async-render/interface';

export default class AsyncRender extends Super {
	//#if runtime has component/async-render

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
			startIterPos,
			elsPerChunk;

		if (Object.isArray(sliceOrOpts)) {
			startIterPos = sliceOrOpts[0];
			elsPerChunk = sliceOrOpts[1];

		} else {
			elsPerChunk = sliceOrOpts;
		}

		startIterPos ??= 0;
		elsPerChunk ??= 1;

		const
			iterableIsPromise = Object.isPromise(iterable);

		const
			firstRenderEls = <unknown[]>[],
			asyncRenderEls = <unknown[]>[];

		let
			iterator: Iterator<unknown>,
			lastSyncEl: IteratorResult<unknown>;

		let
			syncI = 0,
			syncTotal = 0;

		if (!iterableIsPromise) {
			iterator = iterable[Symbol.iterator]();

			// eslint-disable-next-line no-multi-assign
			for (let o = iterator, el = lastSyncEl = o.next(); !el.done; el = o.next(), syncI++) {
				if (startIterPos > 0) {
					startIterPos--;
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
					firstRenderEls.push(val);

				} else if (valIsPromise) {
					asyncRenderEls.push(val);
				}

				if (syncTotal >= elsPerChunk || valIsPromise) {
					break;
				}
			}
		}

		const {
			async: $a,
			localEmitter
		} = this;

		let
			render: CanUndef<Function>,
			target: CanUndef<Element>;

		this.ctx.$once('[[V-FOR-CB]]', setRender);
		this.ctx.$once('[[V-ASYNC-TARGET]]', setTarget);

		const
			BREAK = {};

		$a.setImmediate(async () => {
			this.ctx.$off('[[V-FOR-CB]]', setRender);
			this.ctx.$off('[[V-ASYNC-TARGET]]', setTarget);

			if (render == null || target == null) {
				return;
			}

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

				const cb = (chunk, desc, cb) => {
					const res = [];

					Object.forEach(chunk, (el) => {
						const node = this.ctx.$renderEngine.r.render(render(el));
						target.el.appendChild(node);
						res.push(node);
					});

					cb(res);
				};

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

					if (!valIsPromise && chunkTotal < elsPerChunk) {
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
				if (iterableIsPromise) {
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
					if (asyncRenderEls.length === 0 && lastSyncEl.done) {
						return lastSyncEl;
					}

					if (i < asyncRenderEls.length) {
						return {
							value: asyncRenderEls[i++],
							done: false
						};
					}

					return iterator.next();
				};

				return {next};
			}
		});

		return firstRenderEls;

		function setRender(r: Function) {
			return render = r;
		}

		function setTarget(r: Element) {
			return target = r;
		}
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

			return Object.entries(obj);
		}

		return [obj];
	}

	//#endif
}

