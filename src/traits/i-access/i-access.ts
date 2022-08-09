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
import { sequence } from 'core/iter/combinators';
import { intoIter } from 'core/iter';

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

	/** @see [[iAccess.removeAllFromTabSequence]] */
	static removeAllFromTabSequence: AddSelf<iAccess['removeAllFromTabSequence'], iBlock> =
		(component, el?): boolean => {
			const
				ctx = el ?? component.$el;

			if (ctx == null) {
				return false;
			}

			let
				areElementsRemoved = false;

			const
				focusableElems = <IterableIterator<HTMLElement>>this.findAllFocusableElements(component, ctx);

			for (const focusableEl of focusableElems) {
				if (!focusableEl.hasAttribute('data-tabindex')) {
					focusableEl.setAttribute('data-tabindex', String(focusableEl.tabIndex));
				}

				focusableEl.tabIndex = -1;
				areElementsRemoved = true;
			}

			return areElementsRemoved;
		};

	/** @see [[iAccess.restoreAllToTabSequence]] */
	static restoreAllToTabSequence: AddSelf<iAccess['restoreAllToTabSequence'], iBlock> =
		(component, el?): boolean => {
			const
				ctx = el ?? component.$el;

			if (ctx == null) {
				return false;
			}

			let
				areElementsRestored = false;

			let
				removedElems = intoIter(ctx.querySelectorAll<HTMLElement>('[data-tabindex]'));

			if (el?.hasAttribute('data-tabindex')) {
				removedElems = sequence(removedElems, intoIter([<HTMLElement>el]));
			}

			for (const elem of removedElems) {
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
		(component, step, el?): CanUndef<Element> => {
			if (document.activeElement == null) {
				return;
			}

			const
				ctx = el ?? document.documentElement,
				focusableElems = <IterableIterator<HTMLElement>>this.findAllFocusableElements(component, ctx),
				visibleFocusable: HTMLElement[] = [];

			for (const focusableEl of focusableElems) {
				if (
					focusableEl.offsetWidth > 0 ||
					focusableEl.offsetHeight > 0 ||
					focusableEl === document.activeElement
				) {
					visibleFocusable.push(focusableEl);
				}
			}

			const
				index = visibleFocusable.indexOf(<HTMLElement>document.activeElement);

			if (index > -1) {
				return visibleFocusable[index + step];
			}
		};

	/** @see [[iAccess.findFocusableElement]] */
	static findFocusableElement: AddSelf<iAccess['findFocusableElement'], iBlock> =
		(component, el?) => {
			const
				ctx = el ?? component.$el,
				focusableElems = this.findAllFocusableElements(component, ctx);

			for (const focusableEl of focusableElems) {
				if (!focusableEl?.hasAttribute('disabled')) {
					return focusableEl;
				}
			}
		};

	/** @see [[iAccess.findAllFocusableElements]] */
	static findAllFocusableElements: AddSelf<iAccess['findAllFocusableElements'], iBlock> =
		(component, el?): IterableIterator<CanUndef<Element>> => {
			const
				ctx = el ?? component.$el,
				focusableElems = ctx?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);

			let
				focusableIter = intoIter(focusableElems ?? []);

			if (ctx?.matches(FOCUSABLE_SELECTOR)) {
				focusableIter = sequence(focusableIter, intoIter([<HTMLElement>el]));
			}

			function* createFocusableWithoutDisabled(iter: IterableIterator<Element>): IterableIterator<Element> {
				for (const iterEl of iter) {
					if (!iterEl.hasAttribute('disabled')) {
						yield iterEl;
					}
				}
			}

			const
				focusableWithoutDisabled = createFocusableWithoutDisabled(focusableIter);

			return {
				[Symbol.iterator]() {
					return this;
				},

				next: focusableWithoutDisabled.next.bind(focusableWithoutDisabled)
			};
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
		return Object.isFunction(dict.removeAllFromTabSequence) && Object.isFunction(dict.getNextFocusableElement);
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
	 * Removes all children of the specified element that can be focused from the Tab toggle sequence.
	 * In effect, these elements are set to -1 for the tabindex attribute.
	 *
	 * @param el - a context to search, if not set, the root element of the component will be used
	 */
	removeAllFromTabSequence(el?: Element): boolean {
		return Object.throw();
	}

	/**
	 * Reverts all children of the specified element that can be focused to the Tab toggle sequence.
	 * This method is used to restore the state of elements to the state
	 * they had before 'removeAllFromTabSequence' was applied.
	 *
	 * @param el - a context to search, if not set, the root element of the component will be used
	 */
	restoreAllToTabSequence(el?: Element): boolean {
		return Object.throw();
	}

	/**
	 * Gets a next or previous focusable element via the step parameter from the current focused element
	 *
	 * @param step
	 * @param el - a context to search, if not set, document will be used
	 */
	getNextFocusableElement<T extends Element = Element>(step: 1 | -1, el?: T): CanUndef<T> {
		return Object.throw();
	}

	/**
	 * Find focusable element except disabled ones
	 * @param el - a context to search, if not set, component will be used
	 */
	findFocusableElement<T extends Element = Element>(el?: T): CanUndef<T> {
		return Object.throw();
	}

	/**
	 * Find all focusable elements except disabled ones. Search includes the specified element
	 * @param el - a context to search, if not set, component will be used
	 */
	findAllFocusableElements<T extends Element = Element>(el?: T): IterableIterator<CanUndef<T>> {
		return Object.throw();
	}
}
