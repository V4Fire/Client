/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const testStyles = `
[data-index] {
	width: 200px;
	height: 200px;
	margin: 16px;
	background-color: red;
}

[data-index]:after {
	content: attr(data-index);
}

.b-virtual-scroll-new__container {
	min-width: 20px;
	min-height: 20px;
}

#done {
	width: 200px;
	height: 200px;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: green;
}

#done:after {
	content: "done";
}

#empty:after {
	content: "empty";
}

#retry:after {
	content: "retry"
}

#renderNext:after {
	content: "render next"
}

#loader,
#tombstone {
	display: block;
	height: 120px;
	width: 200px;
	background-color: grey;
}
`;
