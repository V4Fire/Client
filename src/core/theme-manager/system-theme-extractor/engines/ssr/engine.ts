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
import { defaultTheme } from 'core/theme-manager';

const HEADER_NAME = 'Sec-CH-Prefers-Color-Scheme';

/**
 * Represents a `SystemThemeExtractor` implementation tailored for ssr environments.
 * This implementation uses a request headers to monitor changes in the preferred color scheme.
 */
export default class SsrEngine implements SystemThemeExtractor {
	/**
	 * The request headers
	 * @protected
	 */
	protected readonly requestHeaders: Dictionary<string>;

	constructor(headers: Dictionary<string>) {
		this.requestHeaders = headers;
	}

	/** @inheritDoc */
	getSystemTheme(): SyncPromise<string> {
		return SyncPromise.resolve(this.ejectHeader(HEADER_NAME) ?? defaultTheme());
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
	 * Ejects header from the request
	 * @param headerName
	 */
	protected ejectHeader(headerName: string): CanUndef<string> {
		return this.requestHeaders[headerName.toLowerCase()];
	}
}
