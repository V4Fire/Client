/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page, JSHandle } from 'playwright';
import type bSidebar from 'components/base/b-sidebar/b-sidebar';
import Component from 'tests/helpers/component';
import { DOM } from 'tests/helpers';

/**
 * Renders the `bSidebar` component with test params and returns Promise<JSHandle>
 *
 * @param page
 */
export async function renderSidebar(page: Page): Promise<JSHandle<bSidebar>> {
  return Component.createComponent<bSidebar>(page, 'b-sidebar', {
    attrs: {},
    children: {
      default: {
        type: 'div',
        children: {
          default: 'Hello content'
        },
        attrs: {
          id: 'test-div'
        }
      }
    }
  });
}

/**
* Returns the class list of the root node bSidebar
*
* @param target
*/
export function getClassList(target: JSHandle<bSidebar>): Promise<string[] | undefined> {
  return target.evaluate((ctx) => ctx.$el?.className.split(' '));
}

/**
* Returns the selector in b-sidebar block
*
* @param elName
*
* @example
* ```typescript
* expect(createSidebarSelector('foo')).toBe('.b-sidebar__foo')
* ```
*/
export function createSidebarSelector(elName: string): string {
  return DOM.elNameSelectorGenerator('b-sidebar')(elName);
}
