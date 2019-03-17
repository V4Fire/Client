/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import iBlock from 'super/i-block/i-block';
import { queue, backQueue, restart, deferRestart, COMPONENTS_PER_TICK } from 'core/render';

export interface AsyncTaskObjectId {
	id: AsyncTaskSimpleId;
	weight?: number;
	filter?(id: AsyncTaskSimpleId): boolean;
}

export type AsyncTaskSimpleId = string | number;
export type AsyncTaskId = AsyncTaskSimpleId | (() => AsyncTaskObjectId) | AsyncTaskObjectId;
export type AsyncQueueType = 'asyncComponents' | 'asyncBackComponents';

export default class AsyncRender {
	/**
	 * Component render weight
	 */
	get weight(): CanUndef<number> {
		return this.component.weight;
	}

	/**
	 * True if the current component is functional
	 */
	get isFunctional(): boolean {
		return this.component.isFunctional;
	}

	/**
	 * True if the current component is flyweight
	 */
	get isFlyweight(): boolean {
		return this.component.isFlyweight;
	}

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
		return this.component.$async;
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
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
	 * Adds a component to the render queue
	 *
	 * @param id - task id
	 * @param [group] - task group
	 */
	regComponent(id: AsyncTaskId, group: AsyncQueueType = 'asyncComponents'): AsyncTaskSimpleId {
		id = Object.isFunction(id) ? id() : id;

		const
			simpleId = Object.isObject(id) ? (<AsyncTaskObjectId>id).id : id,
			taskQueue = group === 'asyncComponents' ? queue : backQueue,
			store = <Dictionary>this.component[group];

		if (!(simpleId in store)) {
			// @ts-ignore
			this.component.$set(store, simpleId, false);

			const
				cb = () => store[simpleId] = true,
				w = this.weight || this.isFlyweight ? 0.3 : this.isFunctional ? 0.5 : 1;

			this.createTask(taskQueue, cb, id, w);
		}

		return simpleId;
	}

	/**
	 * Adds a component to the background render queue
	 * @param id - task id
	 */
	regBackComponent(id: AsyncTaskId): AsyncTaskSimpleId {
		return this.regComponent(id, 'asyncBackComponents');
	}

	/**
	 * Creates an asynchronous array from the specified
	 *
	 * @param value
	 * @param slice - elements per chunk or [elements per chunk, start position]
	 * @param [id] - task id
	 */
	array(value: unknown[], slice: CanArray<number>, id?: AsyncTaskId): unknown[] {
		let
			from = 0,
			to;

		if (Object.isArray(slice)) {
			from = slice[1] || from;
			to = slice[0];

		} else {
			to = slice;
		}

		const
			newArray = value.slice(from, to);

		newArray[this.asyncLabel] = (cb) => {
			let
				from = to;

			const
				w = to > COMPONENTS_PER_TICK ? COMPONENTS_PER_TICK : to;

			while (from < value.length) {
				const data = value.slice(from, from + to);
				this.createTask(queue, () => cb(data), id, w, data);

				if (from + to > value.length) {
					from += from + to - value.length;

				} else {
					from += to;
				}
			}
		};

		return newArray;
	}

	/**
	 * Creates a render task by the specified parameters
	 *
	 * @param taskQueue
	 * @param cb
	 * @param id
	 * @param args
	 * @param defWeight
	 */
	protected createTask(
		taskQueue: Set<unknown>,
		cb: (...args: unknown[]) => void,
		id: AsyncTaskId = Math.random().toString(),
		defWeight: number = 1,
		args: unknown[] = []
	): void {
		let
			filter,
			simpleId,
			weight;

		if (Object.isObject(id)) {
			simpleId = (<AsyncTaskObjectId>id).id;
			filter = (<AsyncTaskObjectId>id).filter;
			weight = (<AsyncTaskObjectId>id).weight;

		} else {
			simpleId = id;
		}

		weight = weight || defWeight;

		const task = {
			weight,
			fn: this.async.proxy(() => {
				if (filter && !filter(...args, simpleId)) {
					return false;
				}

				cb(...args, simpleId);
				return true;

			}, {
				onClear: () => taskQueue.delete(task),
				single: false,
				group: `async${taskQueue === backQueue ? 'Back' : ''}Components`
			})
		};

		taskQueue.add(task);
	}
}
