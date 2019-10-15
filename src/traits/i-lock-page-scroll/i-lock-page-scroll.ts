/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { is } from 'core/browser';
import symbolGenerator from 'core/symbol';
import iBlock from 'super/i-block/i-block';

export const
	$$ = symbolGenerator();

export default abstract class iLockPageScroll {
	/**
	 * Locks document scroll
	 *
	 * @param component
	 * @param [scrollableNode] - the node inside which is allowed to scroll
	 */
	static lock<T extends iBlock>(component: T, scrollableNode: Element = <Element>component.$el): void {
		const
			// @ts-ignore
			{async: $a, r} = component,
			group = 'pageScrollLock';

		if (r[$$.isLocked]) {
			return;
		}

		if (is.iOS) {
			if (scrollableNode) {
				$a.on(scrollableNode, 'touchstart', (e: TouchEvent) => {
					component[$$.initialY] = e.targetTouches[0].clientY;
				}, {group, label: $$.touchstart});

				$a.on(scrollableNode, 'touchmove', (e: TouchEvent) => {
					const {
						scrollTop,
						scrollHeight,
						clientHeight
					} = scrollableNode;

					const
						clientY = e.targetTouches[0].clientY - component[$$.initialY],
						isOnTop = clientY > 0 && scrollTop  === 0,
						isOnBottom = clientY < 0 && scrollTop + clientHeight + 1 >= scrollHeight;

					if ((isOnTop || isOnBottom) && e.cancelable) {
						return e.preventDefault();
					}

					e.stopPropagation();

				}, {
					group,
					label: $$.touchmove,
					options: {passive: false}
				});
			}

			$a.on(document, 'touchmove', (e) => e.cancelable && e.preventDefault(), {
				group,
				label: $$.preventTouchMove,
				options: {passive: false}
			});

		} else if (is.Android) {
			const
				html = document.documentElement,
				body = document.body;

			$a.requestAnimationFrame(() => {
				const
					scrollTop = html.scrollTop || body.scrollTop;

				component[$$.scrollTop] = scrollTop;
				body.style.top = `-${scrollTop}px`;
				r.setRootMod('lockScrollMobile', true, r);

			}, {label: $$.lockScroll});

		} else {
			$a.requestAnimationFrame(() => {
				const
					{body} = document,
					scrollBarWidth = window.innerWidth - body.clientWidth;

				component[$$.paddingRight] = body.style.paddingRight;
				body.style.paddingRight = `${scrollBarWidth}px`;

				r.setRootMod('lockScrollDesktop', true, r);

			}, {label: $$.lockScroll});
		}

		r[$$.isLocked] = true;
	}

	/**
	 * Unlocks document scroll
	 * @param component
	 */
	static unlock<T extends iBlock>(component: T): void {
		const
			// @ts-ignore
			{async: $a, r} = component,
			{body} = document;

		if (!r[$$.isLocked]) {
			return;
		}

		$a.requestAnimationFrame(() => {
			r.removeRootMod('lockScrollMobile', true, r);
			r.removeRootMod('lockScrollDesktop', true, r);
			r[$$.isLocked] = false;

			if (is.Android) {
				window.scrollTo(0, component[$$.scrollTop]);
			}

			body.style.paddingRight = component[$$.paddingRight] || '';

		}, {label: $$.unlockScroll});

		$a.off({group: 'pageScrollLock'});
	}

	/**
	 * Initializes modifiers event listeners
	 * @param component
	 */
	static initModEvents<T extends iBlock>(component: T & iLockPageScroll): void {
		const
			// @ts-ignore (access)
			{localEvent: $e, async: $a} = component;

		$e.on('block.mod.set.opened.*', (e) => {
			component[e.value === 'true' ? 'lock' : 'unlock']();
		});

		component.on('statusDestroyed', () => {
			component.unlock();

			delete component[$$.paddingRight];
			delete component[$$.scrollTop];

			$a.clearAll({group: 'pageScrollLock'});
		});
	}

	/**
	 * Locks document scroll
	 */
	abstract lock(): void;

	/**
	 * Unlocks document scroll
	 */
	abstract unlock(): void;
}
