/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async, { AsyncOpts } from 'core/async';
import iBlock from 'super/i-block/i-block';
import { statuses } from 'super/i-block/modules/const';
import { Hooks, ComponentMeta } from 'core/component';
import { Statuses } from 'super/i-block/modules/interface';

const beforeHooks = {
	beforeRuntime: true,
	beforeCreate: true,
	beforeDataCreate: true
};

export default class Lfc {
	/**
	 * Current component hook
	 */
	get hook(): Hooks {
		return this.component.hook;
	}

	/**
	 * Component instance
	 */
	protected readonly component: iBlock;

	/**
	 * Async instance
	 */
	protected get componentStatus(): Statuses {
		// @ts-ignore
		return this.component.status;
	}

	/**
	 * Async instance
	 */
	protected get async(): Async {
		// @ts-ignore
		return this.component.$async;
	}

	/**
	 * Component meta object
	 */
	protected get meta(): ComponentMeta {
		// @ts-ignore
		return this.component.meta;
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
	}

	/**
	 * Returns true if the component hook is equal one of "before" hooks
	 * @param [skip] - name of a skipped hook
	 */
	isBeforeCreate(...skip: Hooks[]): boolean {
		for (let i = 0; i < skip.length; i++) {
			beforeHooks[skip[i]] = false;
		}

		return Boolean(beforeHooks[this.hook]);
	}

	/**
	 * Executes the specified callback after a beforeDataCreate hook or a beforeReady event
	 *
	 * @see Async.proxy
	 * @param cb
	 * @param [params] - async parameters
	 */
	execCbAtTheRightTime<T = unknown>(cb: (this: iBlock) => T, params?: AsyncOpts): CanPromise<CanVoid<T>> {
		if (this.isBeforeCreate('beforeDataCreate')) {
			return this.async.promise(new Promise<T>((r) => {
				this.meta.hooks.beforeDataCreate.push({fn: () => r(cb.call(this))});
			}), params).catch(stderr);
		}

		if (this.hook === 'beforeDataCreate') {
			return cb.call(this);
		}

		// @ts-ignore
		this.component.beforeReadyListeners++;

		const
			res = this.component.waitStatus('beforeReady', cb, params);

		if (Object.isPromise(res)) {
			return res.catch(stderr);
		}

		return res;
	}

	/**
	 * Executes the specified callback after block.ready event and returns the result
	 *
	 * @param cb
	 * @param [params] - async parameters
	 */
	execCbAfterComponentReady<T = unknown>(cb: (this: this) => T, params?: AsyncOpts): CanPromise<CanVoid<T>> {
		// @ts-ignore
		if (this.component.block) {
			if (statuses[this.componentStatus] >= 0) {
				return cb.call(this);
			}

			return;
		}

		return this.async.promise(new Promise<T>((r) => {
			// @ts-ignore
			this.component.localEvent.once('block.ready', () => r(cb.call(this)));
		}), params).catch(stderr);
	}

	/**
	 * Executes the specified callback after created hook and returns the result
	 *
	 * @param cb
	 * @param [params] - async parameters
	 */
	execCbAfterComponentCreated<T = unknown>(cb: (this: this) => T, params?: AsyncOpts): CanPromise<CanVoid<T>> {
		if (this.isBeforeCreate()) {
			return this.async.promise(new Promise<T>((r) => {
				this.meta.hooks.created.unshift({fn: () => r(cb.call(this))});
			}), params).catch(stderr);
		}

		if (statuses[this.componentStatus] >= 0) {
			return cb.call(this);
		}
	}
}
