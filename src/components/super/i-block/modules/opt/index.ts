/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-block/modules/opt/README.md]]
 * @packageDocumentation
 */

import Friend from 'components/friends/friend';
import type { IfOnceValue } from 'components/super/i-block/modules/opt/interface';

export * from 'components/super/i-block/modules/opt/interface';

export default class Opt extends Friend {
	/** {@link iBlock.ifOnceStore} */
	protected get ifOnceStore(): Dictionary<number> {
		return this.ctx.ifOnceStore;
	}

	/**
	 * Returns a number if the specified label:
	 *   `2` -> already exists in the cache;
	 *   `1` -> just written in the cache;
	 *   `0` -> does not exist in the cache.
	 *
	 * This method is used with conditions to provide logic: if the condition switched to true,
	 * then it always returns true in the future.
	 *
	 * @param label - the label name
	 * @param [value] - the label value (will be saved in the cache only if true)
	 *
	 * @example
	 * ```
	 * < .content v-if = opt.ifOnce('opened', m.opened === 'true')
	 *   Very big content
	 * ```
	 */
	ifOnce(label: unknown, value: boolean = false): IfOnceValue {
		const
			strLabel = String(label);

		if (this.ifOnceStore[strLabel] != null) {
			return 2;
		}

		if (value) {
			return this.ifOnceStore[strLabel] = 1;
		}

		return 0;
	}

	/**
	 * Shows any changes to the component properties in the debugger console.
	 * This method is useful to debug.
	 *
	 * @example
	 * ```typescript
	 * import iBlock, { component } from 'components/super/i-block/i-block';
	 *
	 * @component()
	 * export default class bExample extends iBlock {
	 *   mounted() {
	 *     this.opt.showAnyChanges();
	 *   }
	 * }
	 * ```
	 */
	showAnyChanges(): void {
		const cg = (name, key, val, oldVal, info) => {
			/* eslint-disable no-console */
			console.group(`${name} "${key}" (${this.ctx.componentName})`);
			console.log(Object.fastClone(val));
			console.log(oldVal);
			console.log('Path: ', info?.path);
			console.groupEnd();
			/* eslint-enable no-console */
		};

		Object.forEach(this.ctx.$systemFields, (val, key) => {
			this.ctx.watch(key, {deep: true}, (val, oldVal, info) => {
				cg('System field', key, val, oldVal, info);
			});
		});

		Object.forEach(this.ctx.$fields, (val, key) => {
			this.ctx.watch(key, {deep: true}, (val, oldVal, info) => {
				cg('Field', key, val, oldVal, info);
			});
		});

		Object.forEach(this.ctx.$props, (val, key) => {
			this.ctx.watch(key, {deep: true}, (val, oldVal, info) => {
				cg('Prop', key, val, oldVal, info);
			});
		});
	}
}
