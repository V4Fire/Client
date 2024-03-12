/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import SyncPromise from 'core/promise/sync';
import type { AsyncOptions, ClearOptions } from 'core/async';

import type { SystemThemeExtractor } from 'core/theme-manager/system-theme-extractor';
import { HEADER_NAME } from 'core/theme-manager/system-theme-extractor/engines/ssr/const';
import { defaultTheme } from 'core/theme-manager';

/**
 * Represents a `SystemThemeExtractor` implementation tailored for ssr environments.
 * This implementation uses a request headers to extract preferred color scheme.
 */
export default class SsrEngine implements SystemThemeExtractor {
	/**
	 * The request headers
	 */
	protected readonly requestHeaders: Dictionary<string>;

	/**
	 * @param headers
	 */
	constructor(headers: Dictionary<string>) {
		this.requestHeaders = headers;

		Object.forEach(this.requestHeaders, (v, k) => {
			this.requestHeaders[k.toLowerCase()] = v;
		});
	}

	/** @inheritDoc */
	getSystemTheme(): SyncPromise<string> {
		return SyncPromise.resolve(this.getHeader(HEADER_NAME) ?? defaultTheme());
	}

	/** @inheritDoc */
	unsubscribe(_opts?: ClearOptions): void {
		// Do nothing
	}

	/** @inheritDoc */
	destroy(): void {
		// Do nothing
	}

	/** @inheritDoc */
	onThemeChange(_cb: (value: string) => void, _asyncOptions?: AsyncOptions): Function {
		return () => {
			// Do nothing
		};
	}

	/**
	 * Returns header from the request
	 * @param headerName
	 */
	protected getHeader(headerName: string): CanUndef<string> {
		return this.requestHeaders[headerName.toLowerCase()];
	}
}
