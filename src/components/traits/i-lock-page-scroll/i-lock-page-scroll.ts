/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/traits/i-lock-page-scroll/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import { is } from 'core/browser';

import type iBlock from 'components/super/i-block/i-block';
import type { ModEvent } from 'components/super/i-block/i-block';

//#if runtime has dummyComponents
import('components/traits/i-lock-page-scroll/test/b-traits-i-lock-page-scroll-dummy');
//#endif

const
	$$ = symbolGenerator();

const
	group = 'lockHelpers';

export default abstract class iLockPageScroll {
	/** {@link iLockPageScroll.prototype.lockPageScroll} */
	static lockPageScroll: AddSelf<iLockPageScroll['lockPageScroll'], iBlock> = (component, scrollableNode?) => {
		const {
			r,
			r: {unsafe: {async: $a}}
		} = component;

		if (is.mobile !== false && is.iOS !== false) {
			iLockPageScroll.initIOSScrollableNodeListeners(component, scrollableNode);
		}

		let
			promise = Promise.resolve();

		if (r[$$.isLocked] === true) {
			return promise;
		}

		const lockLabel = {
			group,
			label: $$.lock,
			join: true
		};

		if (is.mobile !== false) {
			if (is.iOS !== false) {
				$a.on(document, 'touchmove', (e: TouchEvent) => e.cancelable && e.preventDefault(), {
					group,
					label: $$.preventTouchMove,
					options: {passive: false}
				});
			}

			const {
				body,
				documentElement: html
			} = document;

			promise = $a.promise(new Promise((res) => {
				$a.requestAnimationFrame(() => {
					const scrollTop = Object.isTruly(html.scrollTop) ?
						html.scrollTop :
						body.scrollTop;

					r[$$.scrollTop] = scrollTop;
					body.style.top = (-scrollTop).px;
					r.setRootMod('lockPageScrollMobile', true);

					r[$$.isLocked] = true;
					res();

				}, lockLabel);
			}), lockLabel);

		} else {
			promise = $a.promise(new Promise((res) => {
				$a.requestAnimationFrame(() => {
					const
						{body} = document;

					const
						scrollBarWidth = globalThis.innerWidth - body.clientWidth;

					r[$$.paddingRight] = body.style.paddingRight;
					body.style.paddingRight = scrollBarWidth.px;
					r.setRootMod('lockPageScrollDesktop', true);

					r[$$.isLocked] = true;
					res();

				}, lockLabel);
			}), lockLabel);
		}

		return promise;
	};

	/** {@link iLockPageScroll.prototype.unlockPageScroll} */
	static unlockPageScroll: AddSelf<iLockPageScroll['unlockPageScroll'], iBlock> = (component) => {
		const {
			r,
			r: {unsafe: {async: $a}}
		} = component.unsafe;

		if (r[$$.isLocked] !== true) {
			return Promise.resolve();
		}

		return $a.promise(new Promise((res) => {
			$a.off({group});

			$a.requestAnimationFrame(() => {
				r.removeRootMod('lockPageScrollMobile', true);
				r.removeRootMod('lockPageScrollDesktop', true);
				r[$$.isLocked] = false;
				this.scrollableNodes = new WeakSet<Element>();

				if (is.mobile !== false) {
					globalThis.scrollTo(0, r[$$.scrollTop]);
				}

				document.body.style.paddingRight = r[$$.paddingRight] ?? '';
				res();

			}, {group, label: $$.unlockRaf, join: true});

		}), {
			group,
			label: $$.unlock,
			join: true
		});
	};

	/** {@link iLockPageScroll.prototype.unlockPageScrollOnDestroy} */
	static unlockPageScrollOnDestroy: AddSelf<iLockPageScroll['unlockPageScrollOnDestroy'], iBlock & iLockPageScroll> = (component) => {
		const {
			r,
			$async: $a
		} = component.unsafe;

		$a.worker(() => {
			component.unlockPageScroll().catch(stderr);
			delete r[$$.paddingRight];
			delete r[$$.scrollTop];
		});
	};

	/**
	 * Initializes modifier event listeners for the specified components
	 *
	 * @emits `lock()`
	 * @emits `unlock()`
	 *
	 * @param component
	 */
	static initModEvents<T extends iBlock>(component: T & iLockPageScroll): void {
		const
			{localEmitter: $e} = component.unsafe;

		$e.on('block.mod.*.opened.*', (e: ModEvent) => {
			if (e.type === 'remove' && e.reason !== 'removeMod') {
				return;
			}

			void component[e.value === 'false' || e.type === 'remove' ? 'unlockPageScroll' : 'lockPageScroll']();
		});
	}

	/**
	 * Set of scrollable nodes for iOS platform
	 */
	protected static scrollableNodes: WeakSet<Element> = new WeakSet<Element>();

	/**
	 * Initializes touch event listeners for the provided node on the iOS platform
	 *
	 * @see https://stackoverflow.com/questions/59193062/how-to-disable-scrolling-on-body-in-ios-13-safari-when-saved-as-pwa-to-the-hom
	 * @param component
	 * @param [scrollableNode]
	 */
	protected static initIOSScrollableNodeListeners(component: iBlock, scrollableNode?: Element): void {
		const
			{r: {unsafe: {async: $a}}} = component;

		if (scrollableNode == null || iLockPageScroll.scrollableNodes.has(scrollableNode)) {
			return;
		}

		iLockPageScroll.scrollableNodes.add(scrollableNode);

		const
			onTouchStart = (e: TouchEvent) => component[$$.initialY] = e.targetTouches[0].clientY;

		$a.on(scrollableNode, 'touchstart', onTouchStart, {
			group
		});

		const onTouchMove = (e: TouchEvent) => {
			let
				scrollTarget = <HTMLElement>(e.target ?? scrollableNode);

			while (
				scrollTarget !== scrollableNode &&
				scrollTarget.scrollHeight <= scrollTarget.clientHeight && scrollTarget.parentElement
			) {
				scrollTarget = scrollTarget.parentElement;
			}

			const {
				scrollTop,
				scrollHeight,
				clientHeight
			} = scrollTarget;

			const
				clientY = e.targetTouches[0].clientY - component[$$.initialY],
				isOnTop = clientY > 0 && scrollTop === 0,
				isOnBottom = clientY < 0 && scrollTop + clientHeight + 1 >= scrollHeight;

			if ((isOnTop || isOnBottom) && e.cancelable) {
				return e.preventDefault();
			}

			e.stopPropagation();
		};

		$a.on(scrollableNode, 'touchmove', onTouchMove, {
			group,
			options: {passive: false}
		});
	}

	/**
	 * Locks scrolling of the document, preventing any scrolling of the document except within that node
	 * @param [_scrollableNode] - the node within which scrolling is allowed
	 */
	lockPageScroll(_scrollableNode?: Element): Promise<void> {
		return Object.throw();
	}

	/**
	 * Unlocks scrolling of the document
	 */
	unlockPageScroll(): Promise<void> {
		return Object.throw();
	}

	/**
	 * Unlocks the page scroll when the component is destroyed
	 */
	unlockPageScrollOnDestroy(): void {
		return Object.throw();
	}
}
