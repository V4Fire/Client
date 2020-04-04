/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/lfc/README.md]]
 * @packageDocumentation
 */

import Async, { AsyncOptions } from 'core/async';

import iBlock from 'super/i-block/i-block';
import Friend from 'super/i-block/modules/friend';

import { statuses } from 'super/i-block/const';
import { Hook } from 'core/component';

import { WrappedCb } from 'super/i-block/modules/lfc/interface';
export * from 'super/i-block/modules/lfc/interface';

/**
 * Class to work with a component life cycle
 */
export default class Lfc<C extends iBlock = iBlock> extends Friend<C> {
	/** @see [[iBlock.hook]] */
	get hook(): this['C']['hook'] {
		return this.component.hook;
	}

	/** @see [[iBlock.componentStatus]] */
	get status(): this['C']['componentStatus'] {
		return this.component.componentStatus;
	}

	/**
	 * Returns true if the component hook is equal to one of "before create" hooks
	 * @param [skip] - name of a skipped hook
	 */
	isBeforeCreate(...skip: Hook[]): boolean {
		const beforeHooks = {
			beforeRuntime: true,
			beforeCreate: true,
			beforeDataCreate: true
		};

		for (let i = 0; i < skip.length; i++) {
			beforeHooks[skip[i]] = false;
		}

		return Boolean(beforeHooks[<string>this.hook]);
	}

	/**
	 * Executes the specified callback after a "beforeDataCreate" hook or a "beforeReady" event
	 * and returns a result of invocation
	 *
	 * @see [[Async.proxy]]
	 * @param cb
	 * @param [opts] - additional options
	 */
	execCbAtTheRightTime<R = unknown>(cb: WrappedCb<R, this['C']>, opts?: AsyncOptions): CanPromise<CanVoid<R>> {
		if (this.isBeforeCreate('beforeDataCreate')) {
			return this.async.promise(new Promise<R>((r) => {
				this.meta.hooks.beforeDataCreate.push({fn: () => r(cb.call(this.component))});
			}), opts).catch(stderr);
		}

		if (this.hook === 'beforeDataCreate') {
			return cb.call(this.component);
		}

		this.component.beforeReadyListeners++;

		const
			res = this.component.waitStatus('beforeReady', cb, opts);

		if (Object.isPromise(res)) {
			return res.catch(stderr);
		}

		return res;
	}

	/**
	 * Executes the specified callback after a block ready event and returns a result of invocation
	 *
	 * @param cb
	 * @param [opts] - additional options
	 */
	execCbAfterBlockReady<R = unknown>(cb: WrappedCb<R, this['C']>, opts?: AsyncOptions): CanPromise<CanVoid<R>> {
		if (this.component.block) {
			if (statuses[this.status] >= 0) {
				return cb.call(this.component);
			}

			return;
		}

		return this.async.promise(new Promise<R>((r) => {
			this.component.blockReadyListeners.push(() => r(cb.call(this.component)));
		}), opts).catch(stderr);
	}

	/**
	 * Executes the specified callback after a "created" hook and returns a result of invocation
	 *
	 * @param cb
	 * @param [opts] - additional options
	 */
	execCbAfterComponentCreated<R = unknown>(cb: WrappedCb<R, this['C']>, opts?: AsyncOptions): CanPromise<CanVoid<R>> {
		if (this.isBeforeCreate()) {
			return this.async.promise(new Promise<R>((r) => {
				this.meta.hooks.created.unshift({fn: () => r(cb.call(this.component))});
			}), opts).catch(stderr);
		}

		if (statuses[this.status] >= 0) {
			return cb.call(this.component);
		}
	}
}
