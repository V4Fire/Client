/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/traits/i-access/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';

import type iBlock from 'components/super/i-block/i-block';
import type { ModsDecl, ModEvent } from 'components/super/i-block/i-block';

export default abstract class iAccess {
	/**
	 * A Boolean attribute which, if present, indicates that the component should automatically
	 * have focus when the page has finished loading (or when the `<dialog>` containing the element has been displayed)
	 *
	 * @prop
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefautofocus
	 */
	abstract readonly autofocus?: boolean;

	/**
	 * An integer attribute indicating if the component can take input focus (is focusable),
	 * if it should participate to sequential keyboard navigation.
	 * As all input types except for input of type hidden are focusable, this attribute should not be used on
	 * form controls, because doing so would require the management of the focus order for all elements within
	 * the document with the risk of harming usability and accessibility if done incorrectly.
	 *
	 * @prop
	 */
	abstract readonly tabIndex?: number;

	/**
	 * True if the component in focus
	 */
	abstract get isFocused(): boolean;

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

	/** {@link iAccess.prototype.disable} */
	static disable: AddSelf<iAccess['disable'], iBlock> =
		(component) => SyncPromise.resolve(component.setMod('disabled', true));

	/** {@link iAccess.prototype.enable} */
	static enable: AddSelf<iAccess['enable'], iBlock> =
		(component) => SyncPromise.resolve(component.setMod('disabled', false));

	/** {@link iAccess.prototype.focus} */
	static focus: AddSelf<iAccess['focus'], iBlock> =
		(component) => SyncPromise.resolve(component.setMod('focused', true));

	/** {@link iAccess.prototype.blur} */
	static blur: AddSelf<iAccess['blur'], iBlock> =
		(component) => SyncPromise.resolve(component.setMod('focused', false));

	/**
	 * Returns true if the component is in focus
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

			return component.waitComponentStatus('ready', setAttrs, asyncGroup);

			function setAttrs(): void {
				const
					{$el} = component;

				if ($el == null) {
					return;
				}

				$el.setAttribute('aria-disabled', String(!enabled));

				if (!enabled) {
					const handler = (e: Event) => {
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

			return component.waitComponentStatus('ready', setAttrs, asyncGroup);

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
	 * Enables the component
	 * @param _args
	 */
	enable(..._args: unknown[]): Promise<boolean> {
		return Object.throw();
	}

	/**
	 * Disables the component
	 * @param _args
	 */
	disable(..._args: unknown[]): Promise<boolean> {
		return Object.throw();
	}

	/**
	 * Sets focus on the component
	 * @param _args
	 */
	focus(..._args: unknown[]): Promise<boolean> {
		return Object.throw();
	}

	/**
	 * Unsets focus on the component
	 * @param _args
	 */
	blur(..._args: unknown[]): Promise<boolean> {
		return Object.throw();
	}
}
