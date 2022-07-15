/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { statuses } from 'super/i-block/const';

import type Sync from 'friends/sync/class';
import type { ModValueConverter, LinkGetter, AsyncWatchOptions } from 'friends/sync/interface';

/**
 * Binds a modifier to a property by the specified path
 *
 * @param modName - the modifier name to bind
 * @param path - the property path to bind
 * @param [converter] - a converter function
 *
 * @example
 * ```typescript
 * import iBlock, { component, prop } from 'super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @prop(Object)
 *   params: Dictionary = {
 *     opened: true
 *   };
 *
 *   protected override initModEvents(): void {
 *     // Each time the `params.opened` prop changes, the `opened` modifier will also change
 *     this.sync.mod('opened', 'params.opened');
 *   }
 * }
 * ```
 */
export function mod<D = unknown, R = unknown>(
	this: Sync,
	modName: string,
	path: string,
	converter?: ModValueConverter<Sync['C'], D, R>
): void;

/**
 * Binds a modifier to a property by the specified path
 *
 * @param modName - the modifier name to bind
 * @param path - the property path to bind
 * @param opts - additional options
 * @param [converter] - converter function
 *
 * @example
 * ```typescript
 * import iBlock, { component, prop } from 'super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @prop(Object)
 *   params: Dictionary = {
 *     opened: true
 *   };
 *
 *   protected override initModEvents(): void {
 *     // Each time the `params` prop changes, the `opened` modifier will also change
 *     this.sync.mod('params', 'opened', {deep: true}, ({opened}) => Boolean(opened));
 *   }
 * }
 * ```
 */
export function mod<D = unknown, R = unknown>(
	this: Sync,
	modName: string,
	path: string,
	opts: AsyncWatchOptions,
	converter?: ModValueConverter<Sync['C'], D, R>
): void;

export function mod<D = unknown, R = unknown>(
	this: Sync,
	modName: string,
	path: string,
	optsOrConverter?: AsyncWatchOptions | ModValueConverter<Sync['C'], D, R>,
	converter: ModValueConverter<Sync['C'], D, R> = (v) => v != null ? Boolean(v) : undefined
): void {
	modName = modName.camelize(false);

	let
		opts;

		if (Object.isFunction(optsOrConverter)) {
		converter = optsOrConverter;

	} else {
		opts = optsOrConverter;
	}

	const
		{ctx} = this;

	const setWatcher = () => {
		const wrapper = (val, ...args) => {
			val = (<LinkGetter>converter).call(this.component, val, ...args);

			if (val !== undefined) {
				void this.ctx.setMod(modName, val);
			}
		};

		if (converter.length > 1) {
			ctx.watch(path, opts, (val, oldVal) => wrapper(val, oldVal));

		} else {
			ctx.watch(path, opts, wrapper);
		}
	};

	if (this.lfc.isBeforeCreate()) {
		const sync = () => {
			const
				v = (<LinkGetter>converter).call(this.component, this.field.get(path));

			if (v !== undefined) {
				ctx.mods[modName] = String(v);
			}
		};

		this.syncModCache[modName] = sync;

		if (ctx.hook !== 'beforeDataCreate') {
			this.meta.hooks.beforeDataCreate.push({
				fn: sync
			});

		} else {
			sync();
		}

		setWatcher();

	} else if (statuses[ctx.componentStatus] >= 1) {
		setWatcher();
	}
}
