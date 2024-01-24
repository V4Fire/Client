/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import type { SystemThemeExtractor } from 'core/system-theme-extractor';
import Friend from 'components/friends/friend';
import SyncPromise from 'core/promise/sync';

const
	$$ = symbolGenerator();

/**
 * Represents a `SystemThemeExtractor` implementation tailored for web environments.
 * This implementation uses a media query to monitor changes in the preferred color scheme.
 */
export default class WebEngine extends Friend implements SystemThemeExtractor {
	/**
	 * Media query to watch theme changes
	 */
	protected darkThemeMq?: MediaQueryList;

	/** @inheritDoc */
	getSystemTheme(): SyncPromise<string> {
		const darkThemeMq = globalThis.matchMedia('(prefers-color-scheme: dark)');

		return SyncPromise.resolve(darkThemeMq.matches ? 'dark' : 'light');
	}

	/** @inheritDoc */
	subscribe(cb: (value: string) => void): void {
		if (this.darkThemeMq != null) {
			return;
		}

		this.darkThemeMq = globalThis.matchMedia('(prefers-color-scheme: dark)');

		// TODO: understand why cant we use `this.async.on(mq, 'change', ...)`; https://github.com/V4Fire/Core/issues/369
		this.darkThemeMq.onchange = this.ctx.async.proxy((event: MediaQueryListEvent) =>
			cb(event.matches ? 'dark' : 'light'),
		{single: false, label: $$.themeChange});
	}

	/** @inheritDoc */
	unsubscribe(): void {
		if (this.darkThemeMq == null) {
			return;
		}

		this.darkThemeMq.onchange = null;
		delete this.darkThemeMq;

		this.ctx.async.clearProxy({label: $$.themeChange});
	}
}
