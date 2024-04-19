/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	scrollAttribute = 'data-save-scroll',
	separator = '-';

/**
 * Adds an attribute to the element with the scroll value
 * @param el
 */
export function saveScrollIntoAttribute(el: Element): void {
	const value = `${String(el.scrollTop)}${separator}${String(el.scrollLeft)}`;
	el.setAttribute(scrollAttribute, value);
}

/**
 * Restores the scroll position for saved DOM nodes on the page
 * @param page
 */
export function restorePageElementsScroll(page: Element): void {
	const elementsWithHorizontalScroll = page.querySelectorAll(`[${scrollAttribute}]`);

	elementsWithHorizontalScroll.forEach((element) => {
		const [scrollTop, scrollLeft] = element.getAttribute(scrollAttribute)?.split(separator) ?? [0, 0];

		const options = {
			top: Number(scrollTop),
			left: Number(scrollLeft)
		};

		element.scrollTo(options);
		removeScrollAttribute(element);
	});
}

/**
 * Removes the scroll attribute from the element
 * @param el
 */
function removeScrollAttribute(el: Element): void {
	el.removeAttribute(scrollAttribute);
}
