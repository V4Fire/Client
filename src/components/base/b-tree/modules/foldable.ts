
/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import SyncPromise from 'core/promise/sync';

import Friend from 'components/friends/friend';
import type bTree from 'components/base/b-tree/b-tree';

export default class Foldable extends Friend {
	override readonly C!: bTree;

	/**
	 * Folds the specified item.
	 * If the method is called without an element passed, all tree sibling elements will be folded.
	 *
	 * @param [value]
	 */
	fold(value?: unknown): Promise<boolean> {
		const {ctx} = this;

		if (arguments.length === 0) {
			const values: Array<Promise<boolean>> = [];

			for (const [item] of ctx.traverse(ctx, {deep: false})) {
				values.push(this.fold(item.value));
			}

			return SyncPromise.all(values)
				.then((res) => res.some((value) => value === true));
		}

		const isFolded = ctx.getFoldedModByValue(value) === 'true';

		if (isFolded) {
			return SyncPromise.resolve(false);
		}

		return this.toggleFold(value, true);
	}

	/**
	 * Unfolds the specified item.
	 * If method is called on nested item, all parent items will be unfolded.
	 * If the method is called without an element passed, all tree sibling elements will be unfolded.
	 *
	 * @param [value]
	 */
	unfold(value?: unknown): Promise<boolean> {
		const
			values: Array<Promise<boolean>> = [],
			{ctx} = this;

		if (arguments.length === 0) {
			for (const [item] of ctx.traverse(ctx, {deep: false})) {
				if (!ctx.hasChildren(item)) {
					continue;
				}

				values.push(this.unfold(item.value));
			}

		} else {
			const
				{ctx} = this,
				{ctx: rootTree} = ctx,
				item = ctx.valueItems.get(value);

			if (item != null && ctx.hasChildren(item)) {
				values.push(rootTree.toggleFold(value, false));
			}

			let
				{parentValue} = item ?? {};

			while (parentValue != null) {
				const
					parent = ctx.valueItems.get(parentValue);

				if (parent != null) {
					values.push(rootTree.toggleFold(parent.value, false));
					parentValue = parent.parentValue;

				} else {
					parentValue = null;
				}
			}
		}

		return SyncPromise.all(values)
			.then((res) => res.some((value) => value === true));
	}

	/**
	 * Toggles the passed item fold value
	 *
	 * @param value
	 * @param [folded] - if value is not passed the current state will be toggled
	 * @emits `fold(target: HTMLElement, item: `[[Item]]`, value: boolean)`
	 */
	toggleFold(value: unknown, folded?: boolean): Promise<boolean> {
		const
			{ctx} = this,
			{ctx: rootTree} = ctx;

		const
			oldVal = ctx.getFoldedModByValue(value) === 'true',
			newVal = folded ?? !oldVal;

		const
			el = rootTree.unsafe.findItemElement(value),
			item = ctx.valueItems.get(value);

		if (oldVal !== newVal && el != null && item != null && ctx.hasChildren(item)) {
			ctx.block?.setElementMod(el, 'node', 'folded', newVal);
			rootTree.emit('fold', el, item, newVal);
			return SyncPromise.resolve(true);
		}

		return SyncPromise.resolve(false);
	}
}
