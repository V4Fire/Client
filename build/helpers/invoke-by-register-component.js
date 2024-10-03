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

	console.log(`registerComponent.${layerName}.${componentName}`);

	return `\n
		{
			const {initEmitter} = require('core/component/event');
			initEmitter.once('registerComponent.${layerName}.${componentName}', () => {
				console.log('registerComponent.${layerName}.${componentName}');
				${script}
			});
		}\n
	`;
}