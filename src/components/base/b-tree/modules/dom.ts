import type Block from 'components/friends/block/class';

export function setActive(block: Block | undefined, el: Element, status: boolean): void {
	if (block == null) {
		return;
	}

	block.setElementMod(el, 'node', 'active', status);

	if (el.hasAttribute('aria-selected')) {
		el.setAttribute('aria-selected', String(status));
	}
}
