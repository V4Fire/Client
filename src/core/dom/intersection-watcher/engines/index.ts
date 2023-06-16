/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as support from 'core/const/support';

import IntersectionObserverEngine from 'core/dom/intersection-watcher/engines/intersection-observer';
import HeightmapObserverEngine from 'core/dom/intersection-watcher/engines/heightmap-observer';

export default support.IntersectionObserver ? IntersectionObserverEngine : HeightmapObserverEngine;
