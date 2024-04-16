const horizontalScrollAttribute = 'data-horizontal-scroll';

/**
 * Class that provides an interface for managing the scroll of DOM nodes on the page
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class ScrollManager {
	/**
	 * Adds an attribute to the element with the scroll value
	 * @param {Element} el
	 */
	static saveScrollIntoAttribute(el: Element): void {
		el.setAttribute(horizontalScrollAttribute, String(el.scrollLeft));
	}

	/**
	 * Removes the scroll attribute from the element
	 * @param {Element} el
	 */
	static removeScrollAttribute(el: Element): void {
		el.removeAttribute(horizontalScrollAttribute);
	}

	/**
	 * Restores the scroll position for saved DOM nodes on the page
	 * @param {Element} page
	 */
	static restorePageElementsScroll(page: Element): void {
		const elementsWithHorizontalScroll = page.querySelectorAll(`[${horizontalScrollAttribute}]`);

		elementsWithHorizontalScroll.forEach((element) => {
			const scrollLeft = Number(element.getAttribute(horizontalScrollAttribute));

			if (Number.isNaN(scrollLeft)) {
				return;
			}

			element.scrollTo({left: scrollLeft});
			ScrollManager.removeScrollAttribute(element);
		});
	}
}
