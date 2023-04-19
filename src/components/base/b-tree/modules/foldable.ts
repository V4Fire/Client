/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import SyncPromise from 'core/promise/sync';

import { wait } from 'components/super/i-data/i-data';
import type bTree from 'components/base/b-tree/b-tree';

export default abstract class Foldable {
	/** @see [[Foldable.prototype.fold]] */
	static fold(ctx: bTree, value?: unknown): Promise<boolean> {
		if (arguments.length === 1) {
			const values: Array<Promise<boolean>> = [];

			for (const [item] of ctx.traverse(ctx, {deep: false})) {
				values.push(this.fold(ctx, item.value));
			}

			return SyncPromise.all(values)
				.then((res) => res.some((value) => value === true));
		}

		const isFolded = this.getFoldedModByValue(ctx, value) === 'true';

		if (isFolded) {
			return SyncPromise.resolve(false);
		}

		return this.toggleFold(ctx, value, true);
	}

	/** @see [[Foldable.prototype.unfold]] */
	static unfold(ctx: bTree, value?: unknown): Promise<boolean> {
		const values: Array<Promise<boolean>> = [];

		if (arguments.length === 1) {
			for (const [item] of ctx.traverse(ctx, {deep: false})) {
				if (!ctx.unsafe.hasChildren(item)) {
					continue;
				}

				values.push(this.unfold(ctx, item.value));
			}

		} else {
			const
				{top} = ctx.unsafe,
				item = ctx.valueItems.get(value);

			if (item != null && ctx.unsafe.hasChildren(item)) {
				values.push(top.toggleFold(value, false));
			}

			let
				{parentValue} = item ?? {};

			while (parentValue != null) {
				const
					parent = ctx.valueItems.get(parentValue);

				if (parent != null) {
					values.push(top.toggleFold(parent.value, false));
					parentValue = parent.parentValue;

				} else {
					parentValue = null;
				}
			}
		}

		return SyncPromise.all(values)
			.then((res) => res.some((value) => value === true));
	}

	/** @see [[Foldable.prototype.toggleFold]] */
	static toggleFold(ctx: bTree, value: unknown, folded?: boolean): Promise<boolean> {
		const
			{top} = ctx.unsafe;

		const
			oldVal = this.getFoldedModByValue(ctx, value) === 'true',
			newVal = folded ?? !oldVal;

		const
			el = top.unsafe.findItemElement(value),
			item = ctx.valueItems.get(value);

		if (oldVal !== newVal && el != null && item != null && ctx.unsafe.hasChildren(item)) {
			ctx.unsafe.block?.setElementMod(el, 'node', 'folded', newVal);
			top.emit('fold', el, item, newVal);
			return SyncPromise.resolve(true);
		}

		return SyncPromise.resolve(false);
	}

	/**
	 * Returns a value of the `folded` modifier from an element by the specified identifier
	 *
	 * @param ctx
	 * @param value
	 */
	protected static getFoldedModByValue(ctx: bTree, value: unknown): CanUndef<string> {
		const target = ctx.unsafe.findItemElement(value);

		if (target == null) {
			return;
		}

		return ctx.unsafe.block?.getElementMod(target, 'node', 'folded');
	}

	/**
	 * Folds the specified item.
	 * If the method is called without an element passed, all tree sibling elements will be folded.
	 *
	 * @param [value]
	 */
	@wait('ready')
	fold(value?: unknown): Promise<boolean> {
		return Object.throw();
	}

	/**
	 * Unfolds the specified item.
	 * If method is called on nested item, all parent items will be unfolded.
	 * If the method is called without an element passed, all tree sibling elements will be unfolded.
	 *
	 * @param [value]
	 */
	@wait('ready')
	unfold(value?: unknown): Promise<boolean> {
		return Object.throw();
	}

	/**
	 * Toggles the passed item fold value
	 *
	 * @param value
	 * @param [folded] - if value is not passed the current state will be toggled
	 * @emits `fold(target: HTMLElement, item: `[[Item]]`, value: boolean)`
	 */
	@wait('ready')
	toggleFold(value: unknown, folded?: boolean): Promise<boolean> {
		return Object.throw();
	}
}
