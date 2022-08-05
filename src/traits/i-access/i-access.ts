/* eslint-disable @typescript-eslint/no-unused-vars */

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

import SyncPromise from 'core/promise/sync';

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
		(component) => SyncPromise.resolve(component.setMod('disabled', true));

	/** @see [[iAccess.enable]] */
	static enable: AddSelf<iAccess['enable'], iBlock> =
		(component) => SyncPromise.resolve(component.setMod('disabled', false));

	/** @see [[iAccess.focus]] */
	static focus: AddSelf<iAccess['focus'], iBlock> =
		(component) => SyncPromise.resolve(component.setMod('focused', true));

	/** @see [[iAccess.blur]] */
	static blur: AddSelf<iAccess['blur'], iBlock> =
		(component) => SyncPromise.resolve(component.setMod('focused', false));

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
		const {
			async: $a,
			localEmitter: $e
		} = component.unsafe;

		$e.on('block.mod.*.disabled.*', (e: ModEvent) => {
			const asyncGroup = {
				group: 'disableHelpers'
			};

			$a.off(asyncGroup);

			const
				enabled = e.value === 'false' || e.type === 'remove';

			if (enabled) {
				if (e.type !== 'remove' || e.reason === 'removeMod') {
					component.emit('enable');
				}

			} else {
				component.emit('disable');
			}

			return component.waitStatus('ready', setAttrs, asyncGroup);

			function setAttrs(): void {
				const
					{$el} = component;

				if ($el == null) {
					return;
				}

				$el.setAttribute('aria-disabled', String(!enabled));

				if (!enabled) {
					const handler = (e) => {
						e.preventDefault();
						e.stopImmediatePropagation();
					};

					// @see https://github.com/V4Fire/Client/issues/534
					$a.on($el, 'click mousedown touchstart keydown input change scroll', handler, {
						...asyncGroup,
						options: {
							capture: true
						}
					});
				}
			}
		});

		$e.on('block.mod.*.focused.*', (e: ModEvent) => {
			const asyncGroup = {
				group: 'focusHelpers'
			};

			$a.off(asyncGroup);

			const
				focused = e.value !== 'false' && e.type !== 'remove';

			if (e.type !== 'remove' || e.reason === 'removeMod') {
				component.emit(focused ? 'focus' : 'blur');
			}

			return component.waitStatus('ready', setAttrs, asyncGroup);

			function setAttrs(): void {
				const
					{$el} = component;

				if ($el == null) {
					return;
				}

				if ($el.hasAttribute('tab-index')) {
					const
						el = (<HTMLButtonElement>$el);

					if (focused) {
						el.focus();

					} else {
						el.blur();
					}
				}
			}
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
		return Object.throw();
	}

	/**
	 * Disables the component
	 * @param args
	 */
	disable(...args: unknown[]): Promise<boolean> {
		return Object.throw();
	}

	/**
	 * Sets the focus to the component
	 * @param args
	 */
	focus(...args: unknown[]): Promise<boolean> {
		return Object.throw();
	}

	/**
	 * Unsets the focus from the component
	 * @param args
	 */
	blur(...args: unknown[]): Promise<boolean> {
		return Object.throw();
	}
}
