/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import { is } from 'core/browser';
import symbolGenerator from 'core/symbol';

export const
	$$ = symbolGenerator();

export default abstract class iLockScroll {
	/**
	 * Locks document scroll
	 *
	 * @param component
	 * @param [allowed]
	 */
	static lock<T extends iBlock>(component: T, allowed?: HTMLElement): void {
		const
			// @ts-ignore
			{async: $a, r} = component,
			group = 'lock-scroll';

		if (is.iOS) {
			if (allowed) {
				$a.on(allowed, 'touchstart', (e: TouchEvent) => {
					component[$$.initialY] = e.targetTouches[0].clientY;
				}, {group, label: $$.touchstart});

				$a.on(allowed, 'touchmove', (e: TouchEvent) => {
					const {
						scrollTop,
						scrollHeight,
						clientHeight
					} = allowed;

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

			const
				scrollTop = html.scrollTop || body.scrollTop;

			component[$$.scrollTop] = scrollTop;
			body.style.top = `-${scrollTop}px`;
			r.setRootMod('lockScrollMobile', true, r);

		} else {
			const
				{body} = document,
				scrollBarWidth = window.innerWidth - body.clientWidth;

			component[$$.paddingRight] = body.style.paddingRight;
			body.style.paddingRight = `${scrollBarWidth}px`;

			r.setRootMod('lockScrollDesktop', true, r);
		}
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

		r.removeRootMod('lockScrollMobile', true, r);
		r.removeRootMod('lockScrollDesktop', true, r);

		if (is.Android) {
			window.scrollTo(0, component[$$.scrollTop]);
		}

		body.style.paddingRight = component[$$.paddingRight] || '';
		$a.off({group: 'lock-scroll'});
	}

	/**
	 * Initializes modifiers event listeners
	 * @param component
	 */
	static initModEvents<T extends iBlock>(component: T & iLockScroll): void {
		const
			// @ts-ignore
			{localEvent: $e, async: $a, r} = component;

		$e.on('block.mod.set.opened.*', (e) => {
			component[e.value === 'true' ? 'lock' : 'unlock']();
		});

		$e.on('component.status.destroyed', () => {
			iLockScroll.unlock(component);

			delete component[$$.paddingRight];
			delete component[$$.scrollTop];

			$a.clearAll({group: 'lock-scroll'});
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
