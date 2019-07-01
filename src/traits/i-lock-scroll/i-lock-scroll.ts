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
	 * @param allowed
	 */
	static lock<T extends iBlock>(component: T, allowed: HTMLElement): void {
		const
			// @ts-ignore
			{async: $a, r} = component;

		let isContain = false;

		if (is.mobile) {
			$a.on(document, 'touchmove', (e) => {
				const
					{target} = e;

				if (target && allowed &&
					target !== allowed &&
					(isContain || allowed.contains(target))
				) {
					isContain = true;
					e.preventDefault();
				}

			}, {
				label: $$.lockScroll,
				options: {passive: false}
			});
		}

		r.setRootMod('lockScroll', true, r);
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
