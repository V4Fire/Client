import { is } from 'core/browser';
import type iBlock from 'super/i-block/i-block';
import { $$ } from 'traits/i-lock-page-scroll/i-lock-page-scroll';
import { group } from 'traits/i-lock-page-scroll/const';

const nodesMap = new Map<Element, number>()

export function initIOSScrollableNodeListeners(component: iBlock, scrollableNode?: Element): void {
	const
		{r: {unsafe: {async: $a}}} = component;

	if (is.mobile && is.iOS && scrollableNode) {
		let
			uniqueKey = nodesMap.get(scrollableNode);

		if (!Object.isNumber(uniqueKey)) {
			uniqueKey = Math.random();
			nodesMap.set(scrollableNode, uniqueKey);
		}

		const
			onTouchStart = (e: TouchEvent) => component[$$.initialY] = e.targetTouches[0].clientY;

		$a.on(scrollableNode, 'touchstart', onTouchStart, {
			group,
			label: $$[`${uniqueKey}_touchstart`]
		});

		const onTouchMove = (e: TouchEvent) => {
			let
				scrollTarget = <HTMLElement>(e.target ?? scrollableNode);

			while (scrollTarget !== scrollableNode) {
				if (scrollTarget.scrollHeight > scrollTarget.clientHeight || !scrollTarget.parentElement) {
					break;
				}

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
			label: $$[`${uniqueKey}_touchmove`],
			options: {passive: false}
		});
	}
}
