function sum(a: number, b: number, c: number) {
	return a + b + c;
}

function curry(fn: Function, ...args: unknown[]): Function {
	const
		initialFnArgsLength = fn.length;

	if (initialFnArgsLength >= args.length) {
		return fn(...args);
	}

	return (...newArgs: unknown[]) => curry(fn, ...args, ...newArgs);
}

console.log(curry(sum)(1)(2)(3)); // 6
console.log(curry(sum)(1, 2, 3)); // 6
console.log(curry(sum)(1, 2)(3)); // 6
