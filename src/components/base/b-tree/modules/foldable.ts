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

export default abstract class iFoldable {
	/**
	 * A set of values for unfolded items
	 */
	abstract unfoldedStore: Set<bTree['Item']['value']>;

	/** {@link iFoldable.prototype.fold} */
	static fold(ctx: bTree, itemValue?: unknown): Promise<boolean> {
		if (arguments.length === 1) {
			const values: Array<Promise<boolean>> = [];

			for (const [item] of ctx.traverse(ctx, {deep: false})) {
				values.push(this.fold(ctx, item.value));
			}

			return SyncPromise.all(values)
				.then((res) => res.some((value) => value === true));
		}

		const
			isFolded = this.getFoldedModByValue(ctx, itemValue) === 'true';

		if (isFolded) {
			return SyncPromise.resolve(false);
		}

		return this.toggleFold(ctx, itemValue, true);
	}

	/** {@link iFoldable.prototype.unfold} */
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
			const {
				unsafe,
				unsafe: {top}
			} = ctx;

			const
				item = unsafe.values.getItem(value);

			if (item != null && unsafe.hasChildren(item)) {
				values.push(top.toggleFold(value, false));
			}

			let
				{parentValue} = item ?? {};

			while (parentValue != null) {
				const
					parent = unsafe.values.getItem(parentValue);

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

	/** {@link iFoldable.prototype.toggleFold} */
	static toggleFold(ctx: bTree, itemValue: unknown, folded?: boolean): Promise<boolean> {
		const {
			unsafe,
			unsafe: {top}
		} = ctx;

		const
			oldVal = this.getFoldedModByValue(ctx, itemValue) === 'true',
			newVal = folded ?? !oldVal;

		if (newVal) {
			ctx.unfoldedStore.delete(itemValue);

		} else {
			ctx.unfoldedStore.add(itemValue);
		}

		const
			el = top.unsafe.findItemElement(itemValue),
			item = unsafe.values.getItem(itemValue);

		if (oldVal !== newVal && el != null && item != null && unsafe.hasChildren(item)) {
			unsafe.block?.setElementMod(el, 'node', 'folded', newVal);
			top.emit(newVal ? 'fold' : 'unfold', el, item);
			return SyncPromise.resolve(true);
		}

		return SyncPromise.resolve(false);
	}

	/**
	 * Returns the value of the `folded` modifier from an item by its value
	 *
	 * @param ctx
	 * @param itemValue
	 */
	protected static getFoldedModByValue(ctx: bTree, itemValue: unknown): CanUndef<string> {
		const
			{unsafe} = ctx;

		const
			target = unsafe.findItemElement(itemValue);

		if (target == null) {
			return;
		}

		return unsafe.block?.getElementMod(target, 'node', 'folded');
	}

	/**
	 * Folds the specified item by its value.
	 * If the method is called without an item being passed, all sibling elements in the tree will be folded.
	 *
	 * @param [_itemValue]
	 */
	@wait('ready')
	fold(_itemValue?: unknown): Promise<boolean> {
		return Object.throw();
	}

	/**
	 * Unfolds the specified item by its value.
	 * If the method is called on a nested item, all parent items will be unfolded.
	 * If the method is called without an item being passed, all sibling elements in the tree will be unfolded.
	 *
	 * @param [_itemValue]
	 */
	@wait('ready')
	unfold(_itemValue?: unknown): Promise<boolean> {
		return Object.throw();
	}

	/**
	 * Toggles the folded status of an item with the specified value
	 *
	 * @param _itemValue
	 * @param [_folded] - if an item value is not passed, the method will toggle the current state.
	 * @emits `fold(target: HTMLElement, item: `[[Item]]`, value: boolean)`
	 */
	@wait('ready')
	toggleFold(_itemValue: unknown, _folded?: boolean): Promise<boolean> {
		return Object.throw();
	}
}
