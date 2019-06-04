/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iBlock from 'super/i-block/i-block';
import { ModEvent } from 'super/i-block/modules/block';
import { ModsNTable } from 'super/i-block/modules/mods';
import { customWatcherRgxp, MethodWatcher } from 'core/component';

const
	$$ = symbolGenerator();

/**
 * Initializes global event listeners for the specified component
 * @param component
 */
export function initGlobalEvents(component: iBlock): void {
	const
		c = component;

	const
		// @ts-ignore
		{globalEvent: $e, state: $s} = c;

	const waitNextTick = (fn) => async () => {
		try {
			await c.nextTick({label: $$.reset});
			await fn();

		} catch (err) {
			stderr(err);
		}
	};

	$e.on('reset.load', waitNextTick(c.initLoad));
	$e.on('reset.load.silence', waitNextTick(c.reload));
	$e.on('reset.router', $s.resetRouter);
	$e.on('reset.storage', $s.resetStorage);

	$e.on('reset', waitNextTick(async () => {
		c.componentStatus = 'loading';

		await Promise.all([
			$s.resetRouter(),
			$s.resetStorage()
		]);

		await c.initLoad();
	}));

	$e.on('reset.silence', waitNextTick(async () => {
		await Promise.all([
			$s.resetRouter(),
			$s.resetStorage()
		]);

		await c.reload();
	}));
}

/**
 * Initializes modifiers event listeners for the specified component
 * @param component
 */
export function initModEvents(component: iBlock): void {
	const
		c = component;

	const
		// @ts-ignore
		{localEvent: $e} = c;

	$e.on('block.mod.set.**', (e: ModEvent) => {
		const
			k = e.name,
			v = e.value,
			w = <NonNullable<ModsNTable>>c.field.get('watchModsStore');

		c
			.mods[k] = v;

		if (k in w && w[k] !== v) {
			delete w[k];
			c.field.set(`watchModsStore.${k}`, v);
		}

		c.emit(`mod-set-${k}-${v}`, e);
	});

	$e.on('block.mod.remove.**', (e: ModEvent) => {
		if (e.reason === 'removeMod') {
			const
				k = e.name,
				w = <NonNullable<ModsNTable>>c.field.get('watchModsStore');

			c
				.mods[k] = undefined;

			if (k in w && w[k]) {
				delete w[k];
				c.field.set(`watchModsStore.${k}`, undefined);
			}

			c.emit(`mod-remove-${k}-${e.value}`, e);
		}
	});
}

/**
 * Initializes watchers from .watchProp for the specified component
 * @param component
 */
export function initRemoteWatchers(component: iBlock): void {
	const
		c = component,
		// @ts-ignore
		w = c.meta.watchers,
		o = c.watchProp;

	if (!o) {
		return;
	}

	const normalizeField = (field) => {
		if (customWatcherRgxp.test(field)) {
			return field.replace(customWatcherRgxp, (str, prfx, emitter, event) =>
				`${prfx + ['$parent'].concat(emitter || []).join('.')}:${event}`);
		}

		return `$parent.${field}`;
	};

	for (let keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			method = keys[i],
			watchers = (<Array<string | MethodWatcher>>[]).concat(<CanArray<string | MethodWatcher>>o[method] || []);

		for (let i = 0; i < watchers.length; i++) {
			const
				el = watchers[i];

			if (Object.isString(el)) {
				const
					field = normalizeField(el),
					wList = w[field] = w[field] || [];

				wList.push({
					method,
					handler: method
				});

			} else {
				const
					field = normalizeField(el.field),
					wList = w[field] = w[field] || [];

				wList.push({
					...el,
					args: (<unknown[]>[]).concat(el.args || []),
					method,
					handler: method
				});
			}
		}
	}
}
