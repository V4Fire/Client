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

import SyncPromise from 'core/promise/sync';

import type iBlock from 'super/i-block/i-block';
import type { ModsDecl, ModEvent } from 'super/i-block/i-block';
import { FOCUSABLE_SELECTOR } from 'traits/i-access/const';

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

				const
					el = (<HTMLButtonElement>$el);

				if (el.hasAttribute('tabindex') || el.tabIndex > -1) {
					if (focused) {
						el.focus();

					} else {
						el.blur();
					}
				}
			}
		});
	}

	/** @see [[iAccess.muteTabIndexes]] */
	static muteTabIndexes: AddSelf<iAccess['muteTabIndexes'], iBlock> =
		(component, ctx?): boolean => {
			const
				el = ctx ?? component.$el;

			if (el == null) {
				return false;
			}

			const
				elems = el.querySelectorAll(FOCUSABLE_SELECTOR);

			for (let i = 0; i < elems.length; i++) {
				const
					elem = (<HTMLElement>elems[i]);

				if (elem.dataset.tabindex == null) {
					elem.dataset.tabindex = String(elem.tabIndex);
				}

				elem.tabIndex = -1;
			}

			if (ctx != null && ctx.tabIndex > -1) {
				if (ctx.dataset.tabindex == null) {
					ctx.dataset.tabindex = String(ctx.tabIndex);
				}

				ctx.tabIndex = -1;

				return true;
			}

			return elems.length > 0;
		};

	/** @see [[iAccess.unmuteTabIndexes]] */
	static unmuteTabIndexes: AddSelf<iAccess['unmuteTabIndexes'], iBlock> =
		(component, ctx?): boolean => {
			const
				el = ctx ?? component.$el;

			if (el == null) {
				return false;
			}

			const
				elems = el.querySelectorAll('[data-tabindex]');

			for (let i = 0; i < elems.length; i++) {
				const
					elem = (<HTMLElement>elems[i]);

				elem.tabIndex = Number(elem.dataset.tabindex);
				delete elem.dataset.tabindex;
			}

			if (ctx?.dataset.tabindex != null) {
				ctx.tabIndex = Number(ctx.dataset.tabindex);
				delete ctx.dataset.tabindex;

				return true;
			}

			return elems.length > 0;
		};

	/** @see [[iAccess.unmuteTabIndexes]] */
	static nextFocusableElement: AddSelf<iAccess['nextFocusableElement'], iBlock> =
		(component, step, el?): CanUndef<HTMLElement> => {
			if (document.activeElement == null) {
				return;
			}

			const
				nodeListOfFocusable = (el ?? document).querySelectorAll(FOCUSABLE_SELECTOR);

			const focusable: HTMLElement[] = [].filter.call(
					nodeListOfFocusable,
				 (el: HTMLElement) => (
					 el.offsetWidth > 0 ||
					 el.offsetHeight > 0 ||
					 el === document.activeElement
				 )
			);

			const
				index = focusable.indexOf(<HTMLElement>document.activeElement);

			if (index > -1) {
				return focusable[index + step];
			}
		};

	/**
	 * Checks if the component realize current trait
	 * @param obj
	 */
	static is(obj: unknown): obj is iAccess {
		if (Object.isPrimitive(obj)) {
			return false;
		}

		const dict = Object.cast<Dictionary>(obj);
		return Object.isFunction(dict.muteTabIndexes) && Object.isFunction(dict.nextFocusableElement);
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

	/**
	 * Remove all descendants with tabindex attribute from tab sequence and saves previous value.
	 * @param el
	 */
	muteTabIndexes(el?: HTMLElement): boolean {
		return Object.throw();
	}

	/**
	 * Recovers previous saved tabindex values to the elements that were changed.
	 * @param el
	 */
	unmuteTabIndexes(el?: HTMLElement): boolean {
		return Object.throw();
	}

	/**
	 * Sets the focus to the next or previous focusable element via the step parameter
	 * @params step, el?
	 */
	nextFocusableElement(step: 1 | -1, el?: HTMLElement): CanUndef<HTMLElement> {
		return Object.throw();
	}
}
