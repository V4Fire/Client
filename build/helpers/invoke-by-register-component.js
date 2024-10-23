/**
 * Function incapsulates script to event handler that is being triggered when component with
 * name `componentName` from `layerName` renders on the page.
 *
 * @param {String} script 
 * @param {String} layerName 
 * @param {String} componentName 
 * @returns {String}
 */
exports.invokeByRegisterEvent = function(script, layerName, componentName) {
	if (script?.trim()?.length == 0) {
		return script;
	}

	return `\n
		if (globalThis.initEmitter == null) {
			const {initEmitter} = require('core/component/event');
			globalThis.initEmitter = initEmitter;
		}
		if (globalThis.layersList == null) {
			globalThis.layersList = new Set();
		}
		if (!globalThis.layersList.has('${layerName}')) {
			globalThis.layersList.add('${layerName}');
		}
		globalThis.initEmitter.once('registerComponent.${layerName}.${componentName}', () => {
			${script}
		});
		\n
	`;
}