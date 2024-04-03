/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/theme-manager/system-theme-extractor/engines/ssr/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';
import type { AsyncOptions, ClearOptions } from 'core/async';

import { defaultTheme } from 'core/theme-manager/helpers';

import type { SystemThemeExtractor } from 'core/theme-manager/system-theme-extractor';
import { HEADER_NAME } from 'core/theme-manager/system-theme-extractor/engines/ssr/const';

export class SystemThemeExtractorSSR implements SystemThemeExtractor {
	/**
	 * The request headers
	 */
	protected readonly requestHeaders: Dictionary<string>;

	/**
	 * @param headers - request headers
	 */
	constructor(headers: Dictionary<string>) {
		this.requestHeaders = headers;

		Object.forEach(this.requestHeaders, (value, name) => {
			this.requestHeaders[name.toLowerCase()] = value;
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
	 * Retrieves the value of a specified header name from the request
	 * @param headerName
	 */
	protected getHeader(headerName: string): CanUndef<string> {
		return this.requestHeaders[headerName.toLowerCase()];
	}
}
