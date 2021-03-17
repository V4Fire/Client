/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

interface DesignSystemDeprecatedOptions {
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

interface DesignSystem {
	meta?: {
		themes: string[];

		/**
		 * Set of design system fields that have theme
		 *
		 * For example, you can use themes for colors only.
		 * Then, pass to this variable value `['colors']`.
		 * In this case, the runtime theme will not affect other fields from a design system
		 */
		themedFields?: string[];

		/**
		 * Dictionary with deprecated options for the specified field
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
	 * Raw data for a design system.
	 * Only for processed object
	 */
	raw?: DesignSystem;

	components?: StrictDictionary;
	text?: StrictDictionary;
	rounding?: StrictDictionary;
	colors?: StrictDictionary;
}

/**
 * Storage with variables created by the design system object.
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
interface DesignSystemVariables extends Dictionary {
	/**
	 * Dictionary with couple `[cssVariable, value]` as value and deep path separated by `.` as key.
	 * May be separated by groups (e.g. themes)
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

type DesignSystemVariableMapValue = [string, unknown];

interface BuildTimeDesignSystemParams {
	data: DesignSystem;
	variables: DesignSystemVariables;
}
