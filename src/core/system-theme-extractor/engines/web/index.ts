/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import WebEngine from 'core/system-theme-extractor/engines/web/engine';
import type iBlock from 'components/super/i-block/i-block';
import type { SystemThemeExtractor } from 'core/system-theme-extractor';

/**
 * Factory for creating web engine instances
 *
 * @param ctx
 */
export const webEngineFactory = (ctx: iBlock): SystemThemeExtractor => new WebEngine(ctx);
