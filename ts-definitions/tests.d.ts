/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export {};

declare global {
	namespace BrowserTests {
		interface TestParams {
			/**
			 * Browser instance
			 */
			browser: import('playwright').Browser;

			/**
			 * Browser version
			 */
			version: string;

			/**
			 * Base test URL
			 */
			testURL: string;

			/**
			 * Initial page
			 */
			page: import('playwright').Page;

			/**
			 * Initial context
			 */
			context: import('playwright').BrowserContext;

			/**
			 * Context options
			 */
			contextOpts: Dictionary;

			/**
			 * Directory with component files
			 */
			componentDir: string;

			/**
			 * Directory to store some temporary data
			 */
			tmpDir: string;
		}
	}
}
