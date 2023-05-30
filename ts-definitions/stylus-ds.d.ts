/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

declare interface DesignSystemDeprecatedOptions {
	/**
	 * Indicates that a style or component was renamed, but its interface still actual,
	 * the value contains a name after renaming
	 */
	renamedTo?: string;

	/**
	 * Name of a style or component that should prefer to use instead of the current
	 */
	alternative?: string;

	/**
	 * Additional notice about deprecation
	 */
	notice?: string;
}

declare interface DesignSystem {
	meta?: {
		themes: string[];

		/**
		 * List of design system fields that should support theming.
		 * For instance, you can use themes only for colors and don't want that the design system affects other fields.
		 * To solve that case,  pass the `themedFields` property a value with `['colors']`.
		 */
		themedFields?: string[];

		/**
		 * Dictionary of deprecated options
		 *
		 * @example
		 * ```js
		 * {
		 *   'text.Heading1': {
		 *     renamedTo: 'headingSmall',
		 *     notice: 'Renamed as part of global typography refactoring'
		 *   }
		 * }
		 * ```
		 */
		deprecated?: StrictDictionary<DesignSystemDeprecatedOptions | boolean>;
	};

	/**
	 * Raw (unprocessed) design system value
	 */
	raw?: DesignSystem;

	components?: StrictDictionary;
	text?: StrictDictionary;
	rounding?: StrictDictionary;
	colors?: StrictDictionary;
}

/**
 * Storage with variables created by the design system
 *
 * @example
 * ```
 * {
 *   colors: {
 *     primary: var('--colors-primary')
 *   },
 *
 *   map: {
 *     light: {
 *       'colors.primary': ['--colors-primary', '#00F']
 *     }
 *   }
 * }
 * ```
 */
declare interface DesignSystemVariables extends Dictionary {
	/**
	 * Dictionary of couples `[cssVariable, value]`.
	 * It may be separated by groups (e.g., themes).
	 *
	 * @example
	 * ```js
	 * // Design system has themes
	 * map: {
	 *   light: {
	 *     'colors.primary': ['--colors-primary', '#00F']
	 *   }
	 * }
	 *
	 * // ...
	 *
	 * map: {
	 *  'colors.primary': ['--colors-primary', '#00F']
	 * }
	 * ```
	 */
	map: Dictionary<DesignSystemVariableMapValue>;
}

declare type DesignSystemVariableMapValue = [string, unknown];

declare interface BuildTimeDesignSystemParams {
	data: DesignSystem;
	variables: DesignSystemVariables;
}
