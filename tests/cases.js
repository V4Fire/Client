/* eslint-disable capitalized-comments */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

module.exports = [
	'--test-entry form/b-form/test',
	'--test-entry form/b-button/test',
	'--test-entry form/b-checkbox/test',
	'--test-entry form/b-radio-button/test',
	'--test-entry super/i-input-text/test',
	'--test-entry form/b-input-hidden/test',
	'--test-entry form/b-input/test',
	'--test-entry form/b-textarea/test',

	'--test-entry base/b-router/test',
	'--test-entry base/b-virtual-scroll/test',

	'--test-entry base/b-tree/test',
	'--test-entry base/b-list/test',

	'--test-entry base/b-sidebar/test',
	'--test-entry base/b-slider/test --device iPhone_11',
	'--test-entry base/b-window/test',

	'--test-entry icons/b-icon/test',
	'--test-entry base/b-image/test',

	'--test-entry super/i-block/test',
	'--test-entry super/i-block/modules/dom/test',
	'--test-entry super/i-block/modules/field/test',
	'--test-entry super/i-block/modules/storage/test',
	'--test-entry super/i-block/modules/async-render/test',
	'--test-entry super/i-block/modules/activation/test',
	'--test-entry super/i-block/modules/provide/test',
	'--test-entry super/i-block/modules/daemons/test',

	'--test-entry traits/i-lock-page-scroll/test',
	'--test-entry traits/i-observe-dom/test',

	'--test-entry core/dom/image/test',
	'--test-entry core/dom/in-view/test',

	'--test-entry core/component/directives/update-on/test'
];
