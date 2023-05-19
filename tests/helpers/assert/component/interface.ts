import type { ModVal } from 'core/component';

export { ModVal };

export type ComponentItemId = string | number;

export type ComponentItemIds = ComponentItemId[];

export type AssertComponentItemsHaveMod = (value: ModVal, itemIds: ComponentItemIds | ComponentItemId) => Promise<void>;

export type AssertItems = (itemIds: ComponentItemIds | ComponentItemId) => Promise<void>;
