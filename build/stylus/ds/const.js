/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

module.exports = {
	dsHasThemesNotIncluded: 'The design system object has themes, but none included into the build',
	dsNotIncludedRequiredThemes: (dark, light) => `The "ds/use-prefers-color-scheme" parameter is set to true, but the design system does not provide "${dark}" and "${light}" themes, which are required for using this parameter`,
	dsNotIncludedDarkTheme: (dark) => `The "ds/use-prefers-color-scheme" parameter is set to true, but the design system does not provide "${dark}" theme, which is required for using this parameter`,
	dsNotIncludedLightTheme: (light) => `The "ds/use-prefers-color-scheme" parameter is set to true, but the design system does not provide "${light}" theme, which is required for using this parameter`
};
