/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { DirectiveBinding, VNode, SSRBufferItem } from 'core/component/engines';

export interface DirectiveParams extends DirectiveBinding<CanUndef<CanArray<VNode> | SSRBufferItem>> {}
