/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/theme-manager/system-theme-extractor/engines/web/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';
import Async, { EventEmitterLikeP, AsyncOptions, ClearOptions } from 'core/async';

import type { SystemThemeExtractor } from 'core/theme-manager/system-theme-extractor';
import { defaultTheme } from 'core/theme-manager';

/**
 * Represents a `SystemThemeExtractor` implementation tailored for web environments.
 * This implementation uses a media query to monitor changes in the preferred color scheme.
 */
export class SystemThemeExtractorWeb implements SystemThemeExtractor {
	/**
	 * A media query object for monitoring theme changes
	 */
	protected readonly darkThemeMq?: MediaQueryList;

	/**
	 * An event emitter to broadcast theme events
	 */
	protected readonly emitter?: EventEmitterLikeP;

	/** {@link Async} */
	protected readonly async: Async<this> = new Async(this);

	constructor() {
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
	unsubscribe(opts?: ClearOptions): void {
		this.async.clearAll(opts);
	}

	/** @inheritDoc */
	destroy(): void {
		this.unsubscribe();
		this.async.clearAll().locked = true;
	}

	/** @inheritDoc */
	getSystemTheme(): SyncPromise<string> {
		if (this.darkThemeMq == null) {
			return SyncPromise.resolve(defaultTheme());
		}

		return SyncPromise.resolve(this.darkThemeMq.matches ? 'dark' : 'light');
	}

	/** @inheritDoc */
	onThemeChange(cb: (value: string) => void, asyncOptions?: AsyncOptions): Function {
		if (this.emitter == null) {
			return () => {
				// Do nothing
			};
		}

		const
			changeHandler = (e: MediaQueryListEvent) => cb(e.matches ? 'dark' : 'light'),
			eventId = this.async.on(this.emitter, 'change', changeHandler, asyncOptions);

		return () => {
			if (eventId == null) {
				return;
			}

			this.async.off(eventId);
		};
	}
}
