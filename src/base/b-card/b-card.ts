/**
 * [[include:base/p-shopping-list-count-badge/README.md]]
 * @packageDocumentation
 */

import iBlock, { prop, component } from 'super/i-block/i-block';

@component({functional: true, flyweight: true})
export default class bCard extends iBlock {
	@prop({required: false})
	readonly bar!: string;
}
