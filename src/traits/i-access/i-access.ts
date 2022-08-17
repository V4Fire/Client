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

import { intoIter } from 'core/iter';
import { sequence } from 'core/iter/combinators';

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
	 * Checks if the passed object realize the current trait
	 * @param obj
	 */
	static is(obj: unknown): obj is iAccess {
		if (Object.isPrimitive(obj)) {
			return false;
		}

		const dict = Object.cast<Dictionary>(obj);
		return Object.isFunction(dict.removeAllFromTabSequence) && Object.isFunction(dict.getNextFocusableElement);
	}

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

	/** @see [[iAccess.removeAllFromTabSequence]] */
	static removeAllFromTabSequence: AddSelf<iAccess['removeAllFromTabSequence'], iBlock> =
		(component, searchCtx = component.$el): boolean => {
			let
				areElementsRemoved = false;

			if (searchCtx == null) {
				return areElementsRemoved;
			}

			const
				focusableEls = this.findFocusableElements(component, searchCtx);

			for (const el of focusableEls) {
				if (!el.hasAttribute('data-tabindex')) {
					el.setAttribute('data-tabindex', String(el.tabIndex));
				}

				el.tabIndex = -1;
				areElementsRemoved = true;
			}

			return areElementsRemoved;
		};

	/** @see [[iAccess.restoreAllToTabSequence]] */
	static restoreAllToTabSequence: AddSelf<iAccess['restoreAllToTabSequence'], iBlock> =
		(component, searchCtx = component.$el): boolean => {
			let
				areElementsRestored = false;

			if (searchCtx == null) {
				return areElementsRestored;
			}

			let
				removedEls = intoIter(searchCtx.querySelectorAll<AccessibleElement>('[data-tabindex]'));

			if (searchCtx.hasAttribute('data-tabindex')) {
				removedEls = sequence(removedEls, intoIter([<HTMLElement>searchCtx]));
			}

			for (const elem of removedEls) {
				const
					originalTabIndex = elem.getAttribute('data-tabindex');

				if (originalTabIndex != null) {
					elem.tabIndex = Number(originalTabIndex);
					elem.removeAttribute('data-tabindex');
					areElementsRestored = true;
				}
			}

			return areElementsRestored;
		};

	/** @see [[iAccess.getNextFocusableElement]] */
	static getNextFocusableElement: AddSelf<iAccess['getNextFocusableElement'], iBlock> =
		(component, step, searchCtx = document.documentElement): AccessibleElement | null => {
			if (document.activeElement == null) {
				return null;
			}

			const
				focusableEls = this.findFocusableElements(component, searchCtx),
				visibleFocusableEls: AccessibleElement[] = [...focusableEls];

			visibleFocusableEls.sort((el1, el2) => el2.tabIndex - el1.tabIndex);

			const
				index = visibleFocusableEls.indexOf(<AccessibleElement>document.activeElement);

			if (index > -1) {
				return visibleFocusableEls[index + step] ?? null;
			}

			return null;
		};

	/** @see [[iAccess.findFocusableElement]] */
	static findFocusableElement: AddSelf<iAccess['findFocusableElement'], iBlock> =
		(component, searchCtx?): AccessibleElement | null => {
			const
				search = this.findFocusableElements(component, searchCtx).next();

			if (search.done) {
				return null;
			}

			return search.value;
		};

	/** @see [[iAccess.findFocusableElements]] */
	static findFocusableElements: AddSelf<iAccess['findFocusableElements'], iBlock> =
		(component, searchCtx = component.$el): IterableIterator<AccessibleElement> => {
			const
				accessibleEls = searchCtx?.querySelectorAll<AccessibleElement>(FOCUSABLE_SELECTOR);

			let
				searchIter = intoIter(accessibleEls ?? []);

			if (searchCtx?.matches(FOCUSABLE_SELECTOR)) {
				searchIter = sequence(searchIter, intoIter([<AccessibleElement>searchCtx]));
			}

			const
				focusableWithoutDisabled = filterDisabledElements(searchIter);

			return {
				[Symbol.iterator]() {
					return this;
				},

				next: focusableWithoutDisabled.next.bind(focusableWithoutDisabled)
			};

			function* filterDisabledElements(
				iter: IterableIterator<AccessibleElement>
			): IterableIterator<AccessibleElement> {
				for (const el of iter) {
					if (
						!el.hasAttribute('disabled') ||
						el.getAttribute('visibility') !== 'hidden' ||
						el.getAttribute('display') !== 'none'
					) {
						yield el;
					}
				}
			}
		};

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
	 * Removes all children of the specified element that can be focused from the Tab toggle sequence.
	 * In effect, these elements are set to -1 for the tabindex attribute.
	 *
	 * @param [searchCtx] - a context to search, if not set, the component root element will be used
	 */
	removeAllFromTabSequence(searchCtx?: Element): boolean {
		return Object.throw();
	}

	/**
	 * Restores all children of the specified element that can be focused to the Tab toggle sequence.
	 * This method is used to restore the state of elements to the state they had before `removeAllFromTabSequence` was
	 * applied.
	 *
	 * @param [searchCtx] - a context to search, if not set, the component root element will be used
	 */
	restoreAllToTabSequence(searchCtx?: Element): boolean {
		return Object.throw();
	}

	/**
	 * Returns the next (or previous) element to which focus will be switched by pressing Tab.
	 * The method takes a "step" parameter, i.e. you can control the Tab sequence direction. For example,
	 * by setting the step to `-1` you will get an element that will be switched to focus by pressing Shift+Tab.
	 *
	 * @param step
	 * @param [searchCtx] - a context to search, if not set, document will be used
	 */
	getNextFocusableElement<T extends AccessibleElement = AccessibleElement>(
		step: 1 | -1,
		searchCtx?: Element
	): T | null {
		return Object.throw();
	}

	/**
	 * Finds the first non-disabled visible focusable element from the passed context to search and returns it.
	 * The element that is the search context is also taken into account in the search.
	 *
	 * @param [searchCtx] - a context to search, if not set, the component root element will be used
	 */
	findFocusableElement<T extends AccessibleElement = AccessibleElement>(searchCtx?: Element): T | null {
		return Object.throw();
	}

	/**
	 * Finds all non-disabled visible focusable elements and returns an iterator with the found ones.
	 * The element that is the search context is also taken into account in the search.
	 *
	 * @param [searchCtx] - a context to search, if not set, the component root element will be used
	 */
	findFocusableElements<T extends AccessibleElement = AccessibleElement>(searchCtx?: Element): IterableIterator<T> {
		return Object.throw();
	}
}
