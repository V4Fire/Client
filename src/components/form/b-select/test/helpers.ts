import type { JSHandle, Page } from 'playwright';

import type bSelect from 'components/form/b-select/b-select';
import { Component } from 'tests/helpers';

/**
 * Returns rendered `b-select` component
 *
 * @param page
 * @param params
 */
export function renderSelect(
	page: Page,
	paramsOrAttrs: RenderComponentsVnodeParams | RenderComponentsVnodeParams['attrs'] = {}
): Promise<JSHandle<bSelect>> {
	return Component.createComponent(page, 'b-select', paramsOrAttrs);
}
