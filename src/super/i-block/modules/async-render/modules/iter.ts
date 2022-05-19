/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentElement } from 'super/i-block/i-block';
import type { TaskParams, TaskDesc } from 'super/i-block/modules/async-render/interface';

import Super from 'super/i-block/modules/async-render/modules/iter-helpers';

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

		const {
			async: $a,
			localEmitter
		} = this;

		if (Object.isPlainObject(sliceOrOpts)) {
			opts = sliceOrOpts;
			sliceOrOpts = [];
		}

		const
			{filter} = opts;

		let
			start,
			perChunk;

		if (Object.isArray(sliceOrOpts)) {
			start = sliceOrOpts[0];
			perChunk = sliceOrOpts[1];

		} else {
			perChunk = sliceOrOpts;
		}

		const
			iter = this.getIterDescriptor(value, {start, perChunk, filter});

		let
			render: CanUndef<Function>,
			target: CanUndef<Element>;

		this.ctx.$once('[[V-FOR-CB]]', setRender);
		this.ctx.$once('[[V-ASYNC-TARGET]]', setTarget);

		$a.setImmediate(async () => {
			this.ctx.$off('[[V-FOR-CB]]', setRender);
			this.ctx.$off('[[V-ASYNC-TARGET]]', setTarget);

			if (render == null || target == null) {
				return;
			}

			const
				weight = opts.weight ?? 1;

			let
				i = 0,
				chunkI = 0,
				total = iter.readTotal,
				chunkTotal = 0,
				awaiting = 0;

			let
				group = 'asyncComponents',
				renderBuffer = <unknown[]>[];

			let
				lastTask,
				lastEvent;

			const doIter = async (val: unknown) => {
				try {
					if (opts.group != null) {
						group = `asyncComponents:${opts.group}:${chunkI}`;
					}

					const
						valIsPromise = Object.isPromise(val);

					if (valIsPromise) {
						// eslint-disable-next-line require-atomic-updates
						val = await $a.promise(Object.cast(val), {group});
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

						if (!valIsPromise && chunkTotal < perChunk) {
							return;
						}

						return lastTask();
					};

					if (filter != null) {
						const needRender = filter.call(this.ctx, val, i, {
							iterable: iter.iterable,
							i: iter.readI + i + 1,
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

					i++;

				} catch (err) {
					if (err?.type === 'clearAsync' && err.reason === 'group' && err.link.group === group) {
						return false;
					}

					stderr(err);
				}
			};

			if (Object.isAsyncIterable(iter.iterator)) {
				for await (const el of iter.iterator) {
					await doIter(el);
				}

			} else {
				for (const el of iter.iterator) {
					await doIter(el);
				}
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
		});

		return iter.readEls;

		function setRender(r: Function) {
			return render = r;
		}

		function setTarget(r: Element) {
			return target = r;
		}
	}

	//#endif
}

