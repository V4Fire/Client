/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-static-page/modules/theme/README.md]]
 * @packageDocumentation
 */

export * from 'core/theme-manager/const';
export * from 'core/theme-manager/helpers';
export * from 'core/theme-manager/interface';

export { default } from 'core/theme-manager/factory';

export { default as ThemeManager } from 'core/theme-manager/class';
export { default as SystemThemeExtractorWeb } from 'core/theme-manager/system-theme-extractor/engines/web/engine';
