/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import type { ComponentElement, VNode } from 'super/i-block/i-block';

import Super from 'super/i-block/modules/async-render/modules/iter-helpers';
import type { TaskParams } from 'super/i-block/modules/async-render/interface';

export * from 'super/i-block/modules/async-render/modules/iter-helpers';

export const
	$$ = symbolGenerator();

export default class AsyncRender extends Super {
	//#if runtime has component/async-render

	/**
	 * Creates an asynchronous render stream from the specified value.
	 * This method helps to optimize component rendering by splitting big render tasks into little.
	 *
	 * @param value
	 * @param [sliceOrOpts] - elements per chunk or `[start position, elements per chunk]` or additional options
	 * @param [opts] - additional options
	 *
	 * @emits `localEmitter.asyncRenderChunkComplete(e: TaskParams & {renderGroup: string})`
	 * @emits `localEmitter.asyncRenderComplete(e: TaskParams & {renderGroup: string})`
	 *
	 * @example
	 * ```
	 * /// Where to append asynchronous elements
	 * < .target v-async-target
	 *   /// Asynchronous rendering of components: only five elements per chunk
	 *   < template v-for = el in asyncRender.iterate(largeList, 5)
	 *     < my-component :data = el
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

		const
			that = this;

		const {
			ctx,
			ctx: {$renderEngine: {r}},

			async: $a,
			localEmitter
		} = this;

		if (Object.isPlainObject(sliceOrOpts)) {
			opts = sliceOrOpts;
			sliceOrOpts = [];
		}

		const
			{filter, weight = 1} = opts;

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
			toVNode: AnyFunction<unknown[], CanArray<VNode>>,
			target: VNode;

		ctx.$once('[[V_FOR_CB]]', setVNodeCompiler);
		ctx.$once('[[V_ASYNC_TARGET]]', setTarget);

		let
			iterI = iter.readI + 1,
			chunkI = 0;

		let
			total = iter.readTotal,
			chunkTotal = 0;

		let
			awaiting = 0;

		let
			group = 'asyncComponents',
			valsToRender: unknown[] = [];

		let
			lastTask,
			lastEvent;

		$a.setImmediate(async () => {
			ctx.$off('[[V_FOR_CB]]', setVNodeCompiler);
			ctx.$off('[[V_ASYNC_TARGET]]', setTarget);

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (target == null) {
				throw new ReferenceError('There is no host node to append asynchronously render elements');
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (toVNode == null) {
				return;
			}

			// eslint-disable-next-line no-constant-condition
			// TODO: add description
			while (true) {
				if (opts.group != null) {
					group = `asyncComponents:${opts.group}:${chunkI}`;
				}

				let
					el = iter.iterator.next();

				try {
					el = Object.isPromise(el) ? await $a.promise(el, {group}) : el;

					if (el.done) {
						break;
					}

				} catch (err) {
					stderr(err);
					break;
				}

				try {
					const
						iterVal = Object.isPromise(el.value) ? await $a.promise(el.value, {group}) : el.value;

					if (filter != null) {
						const needRender = filter.call(this.ctx, iterVal, iterI, {
							total,
							chunk: chunkI,
							iterable: iter.iterable
						});

						if (Object.isPromise(needRender)) {
							await $a.promise(needRender, {group}).then(
								(res) => resolveTask(iterVal, res === undefined || Object.isTruly(res))
							);

						} else {
							const
								res = resolveTask(iterVal, Object.isTruly(needRender));

							if (res != null) {
								await res;
							}
						}

					} else {
						const
							res = resolveTask(iterVal);

						if (res != null) {
							await res;
						}
					}

					iterI++;

				} catch (err) {
					if (err?.type === 'clearAsync' && err.reason === 'group' && err.link.group === group) {
						break;
					}

					stderr(err);
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

		function setVNodeCompiler(c: AnyFunction) {
			toVNode = c;
		}

		function setTarget(t: VNode) {
			target = t;
		}

		function resolveTask(iterVal: unknown, filter?: boolean) {
			if (filter === false) {
				return;
			}

			total++;
			chunkTotal++;
			valsToRender.push(iterVal);

			lastTask = () => {
				lastTask = null;
				awaiting++;

				return that.createTask(task, {group, weight});
			};

			if (!Object.isPromise(iterVal) && chunkTotal < perChunk) {
				return;
			}

			return lastTask();

			function task() {
				const
					renderedVNodes: Node[] = [];

				for (let i = 0; i < valsToRender.length; i++) {
					const
						el = valsToRender[i],
						vnodes = toVNode(el, iterI);

					if (Object.isArray(vnodes)) {
						for (let i = 0; i < vnodes.length; i++) {
							renderVNode(vnodes[i]);
						}

					} else {
						renderVNode(vnodes);
					}
				}

				valsToRender = [];

				chunkI++;
				chunkTotal = 0;
				awaiting--;

				lastEvent = {...opts, renderGroup: group};
				localEmitter.emit('asyncRenderChunkComplete', lastEvent);

				$a.worker(destructor, {group});

				function renderVNode(vnode: VNode) {
					let
						renderedVnode: Node;

					if (vnode.el != null) {
						vnode.el[Object.cast<string>($$.cached)] = true;
						renderedVnode = Object.cast(vnode.el);

					} else {
						renderedVnode = r.render(vnode);
					}

					renderedVNodes.push(renderedVnode);
					target.el?.appendChild(renderedVnode);
				}

				function destructor() {
					for (let i = 0; i < renderedVNodes.length; i++) {
						destroyNode(renderedVNodes[i]);
					}

					function destroyNode(el: CanUndef<ComponentElement | Node>) {
						if (el == null) {
							return;
						}

						if (el[$$.cached] != null) {
							delete el[$$.cached];
							$a.worker(() => destroyNode(el), {group});

						} else {
							const
								els = el instanceof Element ? Array.from(el.querySelectorAll('.i-block-helper')) : [];

							if (opts.destructor?.(el, els) !== true) {
								that.destroy(el, els);
							}
						}
					}
				}
			}
		}
	}

	//#endif
}

