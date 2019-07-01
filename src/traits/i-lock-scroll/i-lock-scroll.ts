import iBlock from 'super/i-block/i-block';
import { is } from 'core/browser';
import symbolGenerator from 'core/symbol';

export const
	$$ = symbolGenerator();

export default abstract class iLockScroll {
	/**
	 * Запрещает прокрутку документа
	 *
	 * @param component
	 * @param [allowed]
	 */
	static lock<T extends iBlock>(component: T, allowed?: HTMLElement): void {
		const
			// @ts-ignore
			{async: $a, r} = component,
			group = 'lock-scroll';

		let
			initialY = 0;

		if (is.iOS) {
			if (allowed) {
				$a.on(allowed, 'touchstart', (e: TouchEvent) => {
					initialY = e.targetTouches[0].clientY;
				}, {group, label: $$.touchstart});

				$a.on(allowed, 'touchmove', (e: TouchEvent) => {
					const {
						scrollTop,
						scrollHeight,
						clientHeight
					} = allowed;

					const
						clientY = e.targetTouches[0].clientY - initialY,
						isOnTop = clientY > 0 && scrollTop  === 0,
						isOnBottom = clientY < 0 && scrollTop + clientHeight + 1 >= scrollHeight;

					if (isOnTop || isOnBottom && e.cancelable) {
						return e.preventDefault();
					}

					e.stopPropagation();

				}, {group, label: $$.touchmove})
			}

			$a.on(document, 'touchmove', (e) => e.cancelable && e.preventDefault(), {
				group,
				label: $$.preventTouchMove, options: {passive: false}
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

			body.style.paddingRight = `${scrollBarWidth}px`;
			r.setRootMod('lockScrollDesktop', true, r);
		}
	}

	/**
	 * Разрешает прокрутку документа
	 * @param component
	 */
	static unlock<T extends iBlock>(component: T): void {
		const
			// @ts-ignore
			{async: $a, r} = component;

		r.removeRootMod('lockScroll', true, r);
		$a.off({label: $$.lockScroll});
	}

	/**
	 * Инициализирует модификаторы и обработчики событий
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
			r.removeRootMod('lockScroll', true, r);
			$a.clearAll({label: $$.lockScroll});
		});
	}

	/**
	 * Lock component scroll
	 */
	abstract lock(): void;

	/**
	 * Unlock component scroll
	 */
	abstract unlock(): void;
}
