/**
 * Function incapsulates script to event handler that is being triggered when component with
 * name `componentName` renders on the page.
 *
 * @param {String} script 
 * @param {String} componentName 
 * @returns {String}
 */
exports.invokeByRegisterEvent = function(script, componentName) {
	if (script?.trim()?.length == 0) {
		return script;
	}

	return `\n
		(function(){
			const {initEmitter} = require('core/component/event');

			initEmitter.once('registerComponent.${componentName}', () => {
				${script}
			});
		})();\n
	`;
}