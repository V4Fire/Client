function sum(a, b, c) {
    return a + b + c;
}
function curry(fn) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var initialFnArgsLength = fn.length;
    if (initialFnArgsLength >= args.length) {
        return fn.apply(void 0, args);
    }
    return function () {
        var newArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            newArgs[_i] = arguments[_i];
        }
        return curry.apply(void 0, [fn].concat(args, newArgs));
    };
}
console.log(curry(sum)(1)(2)(3)); // 6
console.log(curry(sum)(1, 2, 3)); // 6
console.log(curry(sum)(1, 2)(3)); // 6
