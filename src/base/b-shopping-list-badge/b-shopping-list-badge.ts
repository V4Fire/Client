/**
 * [[include:base/p-shopping-list-count-badge/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import iBlock, { component } from 'super/i-block/i-block';

export const
	$$ = symbolGenerator();

@component({functional: true, flyweight: true})
export default class bShoppingListBadge extends iBlock {
	protected getContentRenderFilter(): CanPromise<boolean> {
		return this.localEmitter.promisifyOnce('forceRender').then(() => true);
	}

	protected onClick(): void {
		this.localEmitter.emit('forceRender');
	}
}
