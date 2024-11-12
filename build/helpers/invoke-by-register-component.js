/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

/**
 * Function incapsulates script to event handler that is being triggered when component with
 * name `componentName` from `layerName` renders on the page.
 *
 * @param {string} script
 * @param {string} layerName
 * @param {string} componentName
 * @returns {string}
 */
function invokeByRegisterEvent(script, layerName, componentName) {
	if (script?.trim()?.length === 0) {
		return script;
	}

	return `\n
		(function () {
			const {initEmitter} = require('core/component/event');
		
			initEmitter.once('registerComponent.${layerName}.${componentName}', () => {
				${script}
			});
		})();
		\n
	`;
}

exports.invokeByRegisterEvent = invokeByRegisterEvent;
