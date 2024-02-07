/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { EventEmitterLikeP, AsyncOptions } from 'core/async';
import SyncPromise from 'core/promise/sync';

import type { SystemThemeExtractor } from 'components/super/i-static-page/modules/theme/system-theme-extractor';
import Friend from 'components/friends/friend';
import type iBlock from 'components/super/i-block/i-block';

/**
 * Represents a `SystemThemeExtractor` implementation tailored for web environments.
 * This implementation uses a media query to monitor changes in the preferred color scheme.
 */
export default class WebEngine extends Friend implements SystemThemeExtractor {
	/**
	 * Media query to watch theme changes
	 */
	protected darkThemeMq: MediaQueryList;

	/**
	 * Event emitter
	 */
	protected emitter: EventEmitterLikeP;

	constructor(component: iBlock) {
		super(component);
		this.darkThemeMq = globalThis.matchMedia('(prefers-color-scheme: dark)');
		this.emitter = <EventEmitterLikeP>((...args: [string, (e: Event) => void]) => {
			this.darkThemeMq.addEventListener(...args);
			return (...args: [string, (e: Event) => void]) => this.darkThemeMq.removeEventListener(...args);
		});
	}

	/** @inheritDoc */
	getSystemTheme(): SyncPromise<string> {
		return SyncPromise.resolve(this.darkThemeMq.matches ? 'dark' : 'light');
	}

	/** @inheritDoc */
	onThemeChange(cb: (value: string) => void, asyncOptions?: AsyncOptions): void {
		const
			changeHandler = (e: MediaQueryListEvent) => cb(e.matches ? 'dark' : 'light');

		this.ctx.async.on(this.emitter, 'change', changeHandler, asyncOptions);
	}
}
