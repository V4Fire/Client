/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-theme/README.md]]
 * @packageDocumentation
 */

import type iBlock from 'components/super/i-block/i-block';
import type { ThemeManager } from 'components/super/i-static-page/modules/theme';
import type { Theme } from 'components/traits/i-theme/interface';
import * as assert from "assert";

export * from 'components/traits/i-theme/interface';

export default abstract class iTheme {
	abstract readonly theme: CanUndef<ThemeManager>;

	/**
	 * @param component
	 * @param theme
	 * @see [[iTheme.changeTheme]]
	 */
	static changeTheme: AddSelf<iTheme['changeTheme'], iBlock & iTheme> =
		(component, theme) => {
			iTheme.assertThemeManagerIsNotNull(component.theme);
			component.theme.current = theme;
		};

	/**
	 * @param component
	 * @param theme
	 * @see [[iTheme.changeTheme]]
	 */
	static hasTheme: AddSelf<iTheme['hasTheme'], iBlock & iTheme> =
		(component, theme) => {
			iTheme.assertThemeManagerIsNotNull(component.theme);
			return component.theme.availableThemes.has(theme);
		}

	/**
	 * Asserts that themeManager is initialized
	 * @param themeManager
	 */
		static assertThemeManagerIsNotNull(themeManager: CanUndef<ThemeManager>): asserts themeManager is ThemeManager {
			if (themeManager == null) {
				throw new Error("ThemeManager is not initialized");
			}
		}

	/**
	 * Checks if theme is available in application
	 * @param _theme
	 */
	hasTheme(_theme: Theme): boolean {
		return Object.throw();
	}

	/**
	 * Changes application theme
	 * @param _theme
	 */
	changeTheme(_theme: Theme): void {
		return Object.throw();
	}
}
