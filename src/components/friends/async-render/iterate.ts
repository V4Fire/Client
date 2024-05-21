/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { TaskCtx } from 'core/async';

import { ASYNC_RENDER_ID, ComponentElement } from 'core/component';
import type { VNode } from 'core/component/engines';

import type Friend from 'components/friends/friend';
import { render } from 'components/friends/vdom';

import { addRenderTask, destroyNode as nodeDestructor } from 'components/friends/async-render/helpers/render';
import { getIterDescriptor } from 'components/friends/async-render/helpers/iter';

import type { TaskOptions, TaskParams, IterDescriptor } from 'components/friends/async-render/interface';

const
	isCached = Symbol('Is cached');

let iteratorCounter = 0;

/**
 * Creates an asynchronous render stream from the specified value.
 * It returns a list of elements to the first synchronous render.
 *
 * This function helps optimize component rendering by splitting big render tasks into smaller ones.
 *
 * @param value
 * @param [sliceOrOpts] - elements per chunk or `[start position, elements per chunk]` or additional options
 * @param [opts] - additional options
 *
 * @emits `localEmitter.asyncRenderChunkComplete(e: TaskParams)`
 * @emits `localEmitter.asyncRenderComplete(e: TaskParams)`
 *
 * @example
 * ```
 * /// Where to append asynchronous elements
 * < .container v-async-target
 *   /// Asynchronous rendering of components: only five elements per chunk
 *   < template v-for = el in asyncRender.iterate(largeList, 5)
 *     < my-component :data = el
 * ```
 */
export function iterate(
	this: Friend,
	value: unknown,
	sliceOrOpts?: number | [number?, number?] | TaskOptions,
	opts: TaskOptions = {}
): unknown[] {
	const
		iterateId = iteratorCounter++;

	if (value == null) {
		return [];
	}

	const
		that = this;

	const {
		ctx,
		async: $a,
		localEmitter
	} = this;

	if (Object.isPlainObject(sliceOrOpts)) {
		opts = sliceOrOpts;
		sliceOrOpts = [];
	}

	const {
		filter,
		weight = 1
	} = opts;

	let
		start: CanUndef<number>,
		perChunk = 1;

	if (Object.isArray(sliceOrOpts)) {
		start = sliceOrOpts[0];
		perChunk = sliceOrOpts[1] ?? perChunk;

	} else {
		perChunk = sliceOrOpts ?? perChunk;
	}

	const iter: IterDescriptor = getIterDescriptor.call(this, value, {
		start,
		perChunk,
		filter
	});

	let
		toVNode: AnyFunction<unknown[], CanArray<VNode>>,
		target: VNode;

	ctx.$on('[[V_FOR_CB]]', setVNodeCompiler, {prepend: true});
	ctx.$on('[[V_ASYNC_TARGET]]', setTarget, {prepend: true});

	let
		iterI = iter.readI + 1,
		chunkI = 0;

	let
		total = iter.readTotal,
		chunkTotal = 0;

	let
		awaiting = 0;

	const
		mainGroup = 'asyncComponents',
		valuesToRender: Array<CanPromise<unknown>> = [];

	let
		vdomGroup: string,
		group = mainGroup;

	let
		lastTask: Nullable<() => CanPromise<void>>,
		lastTaskParams: Nullable<TaskParams>;

	// This ID will mark the vnode array to ensure that async-render is used for the correct async-target
	Object.defineProperty(iter.readEls, ASYNC_RENDER_ID, {
		enumerable: false,
		configurable: false,
		writable: false,
		value: iterateId
	});

	if (SSR) {
		return iter.readEls;
	}

	let
		nextIter: CanUndef<CanPromise<IteratorResult<unknown>>>;

	$a.setImmediate(async () => {
		ctx.$off('[[V_FOR_CB]]', setVNodeCompiler);
		ctx.$off('[[V_ASYNC_TARGET]]', setTarget);
		iteratorCounter = 0;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (target == null) {
			throw new ReferenceError('There is no host node to append asynchronously render elements');
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (toVNode == null) {
			return;
		}

		// Using `while` instead of `for of` helps to iterate over synchronous and asynchronous iterators
		// with a single loop
		// eslint-disable-next-line no-constant-condition
		rendering: while (true) {
			if (opts.group != null) {
				const postfix = `${Object.isFunction(opts.group) ? opts.group() : opts.group}:${chunkI}`;
				group = `${mainGroup}:${postfix}`;
				vdomGroup = `${mainGroup}:vdom:${postfix}`;
			}

			let iterRes: CanPromise<IteratorResult<unknown>> =
				nextIter ??
				iter.iterator.next();

			try {
				iterRes = Object.isPromise(iterRes) ?
					await $a.promise(iterRes, {group}) :
					iterRes;

				if (iterRes.done) {
					break;
				}

			} catch (err) {
				stderr(err);
				break;
			}

			// eslint-disable-next-line require-atomic-updates
			nextIter = iter.iterator.next();

			try {
				const el = Object.isPromise(iterRes.value) ?
					await $a.promise(iterRes.value, {group}) :
					iterRes.value;

				if (filter != null) {
					const needRender = filter.call(this.ctx, el, iterI, {
						total,
						chunk: chunkI,
						iterable: iter.iterable
					});

					if (Object.isPromise(needRender)) {
						await $a.promise(needRender, {group}).then(
							(res) => createRenderTask(el, res === undefined || Object.isTruly(res))
						);

					} else {
						const
							res = createRenderTask(el, Object.isTruly(needRender));

						if (res != null) {
							await res;
						}
					}

				} else {
					const res = createRenderTask(el);

					if (res != null) {
						await res;
					}
				}

				iterI++;

			} catch (err) {
				if (Object.get(err, 'type') === 'clearAsync') {
					const
						taskCtx = Object.cast<TaskCtx>(err);

					switch (taskCtx.reason) {
						case 'all':
							break rendering;

						case 'rgxp':
						case 'group':
							if (taskCtx.link.group === group) {
								break rendering;
							}

							break;

						default:
							// Ignore
					}
				}

				stderr(err);

				// Avoiding infinite loop
				await $a.sleep(0, {group});
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
			localEmitter.emit('asyncRenderComplete', lastTaskParams);

		} else {
			const id = localEmitter.on('asyncRenderChunkComplete', async () => {
				try {
					// eslint-disable-next-line require-atomic-updates
					nextIter = Object.isPromise(nextIter) ? await $a.promise(nextIter, {group}) : nextIter;

				} catch (err) {
					stderr(err);
				}

				if (awaiting <= 0) {
					localEmitter.emit('asyncRenderComplete', lastTaskParams);
					localEmitter.off(id);
				}
			});
		}
	}, {group});

	return iter.readEls;

	function isChildOf(vnode: VNode, id: number): boolean {
		if (vnode.children?.[ASYNC_RENDER_ID] === id) {
			return true;
		}

		if (Object.isArray(vnode.children)) {
			return vnode.children.some((c) => isChildOf(Object.cast(c), id));
		}

		return false;
	}

	function setVNodeCompiler(e: {wrappedCb: AnyFunction; handled?: boolean}) {
		if (e.handled) {
			return;
		}

		e.handled = true;
		toVNode = e.wrappedCb;

		ctx.$off('[[V_FOR_CB]]', setVNodeCompiler);
	}

	function setTarget(vnode: VNode) {
		if (isChildOf(vnode, iterateId)) {
			target = vnode;
			ctx.$off('[[V_ASYNC_TARGET]]', setTarget);
		}
	}

	function createRenderTask(value: CanPromise<unknown>, filter?: boolean) {
		if (filter === false) {
			return;
		}

		total++;
		chunkTotal++;
		valuesToRender.push(value);

		lastTask = () => {
			lastTask = null;
			awaiting++;
			return addRenderTask.call(that, task, {group, weight});
		};

		const isNotLastLast =
			chunkTotal < perChunk &&
			!Object.isPromise(value) &&
			!Object.isPromise(nextIter) && nextIter?.done !== true;

		if (isNotLastLast) {
			return;
		}

		return lastTask();

		function task() {
			const
				renderedVNodes: Node[] = [];

			ctx.vdom.withRenderContext(() => {
				const vnodes = valuesToRender.flatMap((el) => {
					const rawVNodes = Array.concat([], toVNode(el, iterI));

					return rawVNodes.flatMap((vnode) => {
						if (Object.isSymbol(vnode.type) && Object.isArray(vnode.children)) {
							return <VNode[]>vnode.children;
						}

						return vnode;
					});
				});

				vnodes.forEach(renderVNode);
				valuesToRender.splice(0, valuesToRender.length);

				chunkI++;
				chunkTotal = 0;
				awaiting--;

				lastTaskParams = {...opts, renderGroup: group};
				localEmitter.emit('asyncRenderChunkComplete', lastTaskParams);

				$a.worker(destructor, {group});
			});

			function renderVNode(vnode: VNode) {
				let
					renderedVnode: Nullable<CanArray<Node>>;

				if (vnode.el != null) {
					vnode.el[Object.cast<string>(isCached)] = true;
					renderedVnode = Object.cast(vnode.el);

				} else {
					renderedVnode = render.call(that, Object.cast(vnode), vdomGroup);
				}

				const
					nodeToMount = target.el ?? ctx.$el;

				if (nodeToMount != null) {
					if (Object.isArray(renderedVnode)) {
						renderedVNodes.push(...renderedVnode);
						renderedVnode.forEach((renderedVnode) => nodeToMount.appendChild(renderedVnode));

					} else if (renderedVnode != null) {
						renderedVNodes.push(renderedVnode);
						nodeToMount.appendChild(renderedVnode);
					}
				}
			}

			function destructor() {
				renderedVNodes.forEach(destroyNode);

				function destroyNode(el: CanUndef<ComponentElement | Node>) {
					if (el == null) {
						return;
					}

					if (el[isCached] != null) {
						delete el[isCached];
						$a.worker(() => destroyNode(el), {group});

					} else {
						const
							els = el instanceof Element ? Array.from(el.querySelectorAll('.i-block-helper')) : [];

						if (opts.destructor?.(el, els) !== true) {
							nodeDestructor.call(that, el, els);
						}
					}
				}
			}
		}
	}
}
