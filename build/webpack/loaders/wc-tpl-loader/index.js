const fs = require('fs');
const {parse} = require('node-html-parser');

function loader(source) {
	const options = this.getOptions();
	console.log(source)
	let  result =  convert2lit(source);
	result = `import { html, nothing } from 'lit';
import { map } from 'lit/directives/map.js';
import { repeat } from 'lit/directives/repeat.js';
import { classMap } from 'lit/directives/class-map.js';

export function render() {
	return html\`${result}\`
};`
	fs.writeFile('tmp/2.js', result, 'utf-8', ()=>{
		console.log('saved')});
	this.callback(null, result);
}

function vForString(){
	const [itemName, inName] = this.attrs['v-for'].split(' in ');
	this.removeAttribute('v-for');
	if (this.attrs[':key']) {
		const key = this.attrs[':key'];
		this.removeAttribute(':key')
		return `\${ repeat(${inName}, (${itemName}) => ${key}, (${itemName}) => html\`${this.__proto__.toString.call(this)}\`) }`
	} else {
		return `\${ map(${inName}, (${itemName}) => html\`${this.__proto__.toString.call(this)}\`) }`
	}
}
function vIfString(){
	const condition = this.attrs['v-if'];
	this.removeAttribute('v-if');
	return `\${ ${condition} ? html\`${ this.__proto__.toString.call(this) }\` : nothing }`
}

function convert2lit(source) {
	const nodes = parse(source);

	nodes.querySelectorAll('[v-for]').forEach(x => x.toString = vForString);

	nodes.querySelectorAll('[v-if]').forEach(x => x.toString = vIfString);

	return nodes.toString();
}

module.exports = loader;


