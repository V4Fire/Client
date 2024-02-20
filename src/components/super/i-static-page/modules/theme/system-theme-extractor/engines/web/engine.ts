/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { EventEmitterLikeP, AsyncOptions } from 'core/async';
import SyncPromise from 'core/promise/sync';

import Friend from 'components/friends/friend';
import type iBlock from 'components/super/i-block/i-block';

import type { SystemThemeExtractor } from 'components/super/i-static-page/modules/theme/system-theme-extractor';

/**
 * Represents a `SystemThemeExtractor` implementation tailored for web environments.
 * This implementation uses a media query to monitor changes in the preferred color scheme.
 */
export default class WebEngine extends Friend implements SystemThemeExtractor {
	/**
	 * A media query object for monitoring theme changes
	 */
	protected readonly darkThemeMq?: MediaQueryList;

	/**
	 * An event emitter to broadcast theme events
	 */
	protected readonly emitter?: EventEmitterLikeP;

	constructor(component: iBlock) {
		super(component);

		if (SSR) {
			return;
		}

		this.darkThemeMq = globalThis.matchMedia('(prefers-color-scheme: dark)');

		type EmitterArgs = [string, (e: Event) => void];

		this.emitter = Object.cast((...args: EmitterArgs) => {
			this.darkThemeMq!.addEventListener(...args);
			return (...args: EmitterArgs) => this.darkThemeMq!.removeEventListener(...args);
		});
	}

	/** @inheritDoc */
	getSystemTheme(): SyncPromise<string> {
		if (this.darkThemeMq == null) {
			return SyncPromise.resolve('light');
		}

		return SyncPromise.resolve(this.darkThemeMq.matches ? 'dark' : 'light');
	}

	/** @inheritDoc */
	onThemeChange(cb: (value: string) => void, asyncOptions?: AsyncOptions): void {
		if (this.emitter == null) {
			return;
		}

		const changeHandler = (e: MediaQueryListEvent) => cb(e.matches ? 'dark' : 'light');
		this.ctx.async.on(this.emitter, 'change', changeHandler, asyncOptions);
	}
}
