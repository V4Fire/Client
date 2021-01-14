/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-access/README.md]]
 * @packageDocumentation
 */

import iBlock, { ModsDecl, ModEvent } from 'super/i-block/i-block';

export default abstract class iAccess {
	/**
	 * Accessibility modifiers
	 */
	static readonly mods: ModsDecl = {
		disabled: [
			'true',
			'false'
		],

		focused: [
			'true',
			'false'
		]
	};

	/**
	 * Returns true if the component in focus
	 * @param component
	 */
	static isFocused<T extends iBlock>(component: T): boolean {
		return component.mods.focused === 'true';
	}

	/**
	 * Disables the component
	 * @param component
	 */
	static async disable<T extends iBlock>(component: T): Promise<boolean> {
		return component.setMod('disabled', true);
	}

	/**
	 * Enables the component
	 * @param component
	 */
	static async enable<T extends iBlock>(component: T): Promise<boolean> {
		return component.setMod('disabled', false);
	}

	/**
	 * Sets focus to the component
	 * @param component
	 */
	static async focus<T extends iBlock>(component: T): Promise<boolean> {
		return component.setMod('focused', true);
	}

	/**
	 * Unsets focus to the component
	 * @param component
	 */
	static async blur<T extends iBlock>(component: T): Promise<boolean> {
		return component.setMod('focused', false);
	}

	/**
	 * Initializes modifier event listeners for the specified component
	 *
	 * @emits `enable()`
	 * @emits `disable()`
	 *
	 * @emits `focus()`
	 * @emits `blur()`
	 *
	 * @param component
	 */
	static initModEvents<T extends iBlock>(component: T): void {
		const
			{localEmitter: $e} = component.unsafe;

		$e.on('block.mod.*.disabled.*', (e: ModEvent) => {
			if (e.type === 'remove' && e.reason !== 'removeMod') {
				return;
			}

			component.emit(e.value === 'false' || e.type === 'remove' ? 'enable' : 'disable');
		});

		$e.on('block.mod.*.focused.*', (e: ModEvent) => {
			if (e.type === 'remove' && e.reason !== 'removeMod') {
				return;
			}

			component.emit(e.value === 'false' || e.type === 'remove' ? 'blur' : 'focus');
		});
	}

	/**
	 * A Boolean attribute which, if present, indicates that the component should automatically
	 * have focus when the page has finished loading (or when the `<dialog>` containing the element has been displayed)
	 *
	 * @prop
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautofocus
	 */
	abstract autofocus?: boolean;

	/**
	 * An integer attribute indicating if the component can take input focus (is focusable),
	 * if it should participate to sequential keyboard navigation.
	 * As all input types except for input of type hidden are focusable, this attribute should not be used on
	 * form controls, because doing so would require the management of the focus order for all elements within
	 * the document with the risk of harming usability and accessibility if done incorrectly.
	 *
	 * @prop
	 */
	abstract tabIndex?: number;

	/**
	 * True if the component in focus
	 */
	abstract isFocused: boolean;

	/**
	 * Enables the component
	 * @param args
	 */
	abstract enable(...args: unknown[]): Promise<boolean>;

	/**
	 * Disables the component
	 * @param args
	 */
	abstract disable(...args: unknown[]): Promise<boolean>;

	/**
	 * Sets focus to the component
	 * @param args
	 */
	abstract focus(...args: unknown[]): Promise<boolean>;

	/**
	 * Unsets focus to the component
	 * @param args
	 */
	abstract blur(...args: unknown[]): Promise<boolean>;
}
