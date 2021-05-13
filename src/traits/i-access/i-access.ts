/* eslint-disable @typescript-eslint/no-unused-vars-experimental */

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

import type iBlock from 'super/i-block/i-block';
import type { ModsDecl, ModEvent } from 'super/i-block/i-block';

export default abstract class iAccess {
	/**
	 * Trait modifiers
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

	/** @see [[iAccess.disable]] */
	static disable: AddSelf<iAccess['disable'], iBlock> =
		async (component) => component.setMod('disabled', true);

	/** @see [[iAccess.enable]] */
	static enable: AddSelf<iAccess['enable'], iBlock> =
		async (component) => component.setMod('disabled', false);

	/** @see [[iAccess.focus]] */
	static focus: AddSelf<iAccess['focus'], iBlock> =
		async (component) => component.setMod('focused', true);

	/** @see [[iAccess.blur]] */
	static blur: AddSelf<iAccess['blur'], iBlock> =
		async (component) => component.setMod('focused', false);

	/**
	 * Returns true if the component in focus
	 * @param component
	 */
	static isFocused<T extends iBlock>(component: T): boolean {
		return component.mods.focused === 'true';
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
			{localEmitter: $e, async: $a} = component.unsafe;

		$e.on('block.mod.*.disabled.*', (e: ModEvent) => {
			const
				asyncGroup = 'disableHelpers';

			if (e.value === 'false' || e.type === 'remove') {
				$a.off({group: asyncGroup});

				if (e.type !== 'remove' || e.reason === 'removeMod') {
					component.emit('enable');
				}

			} else if (component.$el != null) {
				component.emit('disable');

				const handler = (e) => {
					e.preventDefault();
					e.stopImmediatePropagation();
				};

				// @see https://github.com/V4Fire/Client/issues/534
				$a.on(component.$el, 'click mousedown touchstart keydown input change scroll', handler, {
					group: asyncGroup,
					options: {
						capture: true
					}
				});
			}
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
	enable(...args: unknown[]): Promise<boolean> {
		return <any>null;
	}

	/**
	 * Disables the component
	 * @param args
	 */
	disable(...args: unknown[]): Promise<boolean> {
		return <any>null;
	}

	/**
	 * Sets the focus to the component
	 * @param args
	 */
	focus(...args: unknown[]): Promise<boolean> {
		return <any>null;
	}

	/**
	 * Unsets the focus from the component
	 * @param args
	 */
	blur(...args: unknown[]): Promise<boolean> {
		return <any>null;
	}
}
