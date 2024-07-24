/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/theme-manager/system-theme-extractor/engines/stub/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';
import type { AsyncOptions, ClearOptions } from 'core/async';

import { defaultTheme } from 'core/theme-manager';
import type { SystemThemeExtractor } from 'core/theme-manager/system-theme-extractor';

export class SystemThemeExtractorStub implements SystemThemeExtractor {
	/** @inheritDoc */
	getSystemTheme(): SyncPromise<string> {
		return SyncPromise.resolve(defaultTheme());
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
}
