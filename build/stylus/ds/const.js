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
	dsNotIncludedRequiredThemes: (dark, light) => `The design system object does not provide "${dark}" and "${light}" theme to use "prefers-color-scheme"`,
	dsNotIncludedDarkTheme: (dark) => `The design system object does not provide "${dark}" theme to use "prefers-color-scheme"`,
	dsNotIncludedLightTheme: (light) => `The design system object does not provide "${light}" theme to use "prefers-color-scheme"`
};
