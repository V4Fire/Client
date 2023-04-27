import type { ModVal } from 'core/component';

export { ModVal };

export type ComponentItemId = string | number;

export type ComponentItemIds = ComponentItemId[];

export type AssertComponentItemsHaveMod = (value: ModVal, itemIds: ComponentItemIds) => Promise<void>;

export type AssertItems = (itemIds: ComponentItemIds) => Promise<void>;
