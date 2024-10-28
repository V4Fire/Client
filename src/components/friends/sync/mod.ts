/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { getPropertyInfo, PropertyInfo } from 'core/component';
import { statuses } from 'components/super/i-block/const';

import type Sync from 'components/friends/sync/class';
import type { ModValueConverter, LinkGetter, AsyncWatchOptions } from 'components/friends/sync/interface';

/**
 * Binds a modifier to a property at the specified path
 *
 * @param modName - the name of the modifier to bind
 * @param path - the path of the property to bind
 * @param [converter] - an optional converter function
 *
 * @example
 * ```typescript
 * import iBlock, { component, prop } from 'components/super/i-block/i-block';
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
 * Binds a modifier to a property at the specified path
 *
 * @param modName - the name of the modifier to bind
 * @param path - the path of the property to bind
 * @param opts - additional options
 * @param [converter] - an optional converter function
 *
 * @example
 * ```typescript
 * import iBlock, { component, prop } from 'components/super/i-block/i-block';
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

	let opts: AsyncWatchOptions;

	if (Object.isFunction(optsOrConverter)) {
		converter = optsOrConverter;
		opts = {};

	} else {
		opts = Object.cast(optsOrConverter);
	}

	const {ctx} = this;

	const
		that = this,
		originalPath = path;

	let info: CanNull<PropertyInfo> = null;

	if (this.lfc.isBeforeCreate()) {
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

	function sync() {
		info ??= getPropertyInfo(originalPath, that.component);

		const {path} = info;

		let val: unknown;

		if (path.includes('.')) {
			val = that.field.get(info.originalPath);

		} else {
			val = info.type === 'field' ? that.field.getFieldsStore(info.ctx)[path] : info.ctx[path];
		}

		val = (<LinkGetter>converter).call(that.component, val);

		if (val !== undefined) {
			ctx.mods[modName] = String(val);
		}
	}

	function setWatcher() {
		if (converter.length > 1) {
			ctx.watch(path, opts, (val: unknown, oldVal: unknown) => wrapper(val, oldVal));

		} else {
			ctx.watch(path, opts, wrapper);
		}

		function wrapper(val: unknown, ...args: unknown[]) {
			val = (<LinkGetter>converter).call(that.component, val, ...args);

			if (val !== undefined) {
				void ctx.setMod(modName, val);
			}
		}
	}
}
