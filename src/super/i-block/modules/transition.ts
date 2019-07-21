/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import Block from 'super/i-block/modules/block';

import symbolGenerator from 'core/symbol';
import Async from 'core/async';

export type StyleValuePrimitive = string | number;
export type StyleValueAsFn = (...args: any[]) => StyleValuePrimitive;
export type StyleValuesAsPromise = Promise<StyleValuePrimitive | StyleValueAsFn>;
export type StyleValue = StyleValuePrimitive | StyleValueAsFn | StyleValuesAsPromise;
export type StyleDictionary = Dictionary<StyleValue>;

export type TransitionMode = 'sequence' | 'parallel';
export type VisibilityMode = 'visible' | 'hidden';
export type TransitionMethod = 'step' | 'visible' | 'hidden';

export const NON_ANIMATED_PROPERTIES = {
	transition: true,
	display: true,
	pointerEvents: true
};

export const
	$$ = symbolGenerator(),
	CONTROLLER_GROUP = '[[TRANSITION_CONTROLLER]]',
	TRANSITION_GROUP = '[[TRANSITION]]';

let DUMMY: HTMLElement;

export enum TRANSITION_STATES {
	initial = 0,
	run = 1,
	end = 2
}

export interface TransitionCtx {
	ctx: iBlock;
	label: Label;
	transition: Transition;
}

export interface TransitionInfo {
	state: TRANSITION_STATES;
	props: StyleDictionary;
	nodes: HTMLElement;
	targets: Targets;
	initialProps: Dictionary;
	inheritedProps: StyleDictionaryAndParams;
	duration: number;
	delay: number;
	promise: Promise<unknown>;
	resolver(res: Function, rej: Function): unknown;
}

export interface TransitionReverseOptions {
	onDone?: boolean;
	then?: boolean;
}

export interface TransitionCreateParams {
	useGPU?: boolean;
	inheritProps?: boolean;
	reusable?: boolean;
}

export type Fn<T> = () => T;
export type StyleDictionaryParam = number | CanArray<number> | Fn<CanArray<number>>;

export interface TransitionParams {
	offset?: StyleDictionaryParam;
	delay?: StyleDictionaryParam;
	duration?: StyleDictionaryParam;
	each?: boolean;
	visible?: CanUndef<boolean>;
}

export interface TransitionStep {
	stack: TransitionInfo[];
	mode: TransitionMode;
	state: TRANSITION_STATES;
}

export type StyleDictionaryAndParams = TransitionParams & StyleDictionary;
export type TransitionStack = TransitionInfo[];
export type TransitionDirection = 'forward' | 'backwards';
export type Target = HTMLElement | string;
export type Targets = CanArray<Target>;
export type TargetsAsArray = Array<Target>;
export type NonAnimatedProperties = typeof NON_ANIMATED_PROPERTIES;

/**
 * @see https://github.com/microsoft/TypeScript/issues/1863
 */
export type Label = any;

export interface AbstractTransitionController {
	sequence(label: Label): Transition;
	parallel(label: Label): Transition;
	reverse(label: Label): CanUndef<Transition>;

	stop(label: Label): void;
	stopAll(): void;

	kill(label: Label): void;
	killAll(): void;
}

export class Transition {

	/**
	 * Returns a dummy HTMLElement
	 */
	static get dummy(): HTMLElement {
		if (!DUMMY) {
			DUMMY = document.createElement('div');
		}

		return DUMMY;
	}

	/**
	 * True, if transitions finished
	 */
	get isFulfilled(): boolean {
		return this.steps.every((info: TransitionStep) => info.state === TRANSITION_STATES.end);
	}

	/**
	 * Property for visible elements
	 */
	get visibleProps(): StyleDictionary {
		return {
			visibility: 'visible',
			pointerEvents: 'auto'
		};
	}

	/**
	 * Property for hidden elements
	 */
	get hiddenProps(): StyleDictionary {
		return {
			visibility: 'hidden',
			pointerEvents: 'none'
		};
	}

	/**
	 * Transition label
	 */
	protected label: Label;

	/**
	 * Link to component
	 */
	protected component: iBlock;

	/**
	 * Transition mode
	 */
	protected mode: TransitionMode;

	/**
	 * Transition direction
	 */
	protected direction: TransitionDirection;

	/**
	 * Transition params
	 */
	protected params: TransitionCreateParams;

	/**
	 * Steps of transitions
	 */
	protected steps: TransitionStep[] = [];

	/**
	 * List of subscribers
	 */
	protected subscribers: Function[] = [];

	/**
	 * State of transition
	 */
	protected state: TRANSITION_STATES;

	/**
	 * Link to current transition
	 */
	protected current: CanUndef<TransitionInfo>;

	/**
	 * Resolver
	 */
	protected resolver: CanUndef<Function>;

	/**
	 * Link to component async module
	 */
	protected get async(): Async {
		// @ts-ignore
		return this.component.async;
	}

	/**
	 * Link to component block module
	 */
	protected get block(): Block {
		// @ts-ignore
		return this.component.block;
	}

	/**
	 * Last transition from stack
	 */
	protected get last(): Transition | TransitionInfo {
		return this.step[this.step.length - 1];
	}

	/**
	 * @param component
	 * @param label
	 * @param mode
	 * @param params
	 */
	constructor(component: iBlock, label: Label, mode: TransitionMode, params: TransitionCreateParams = {}) {
		this.state = TRANSITION_STATES.initial;
		this.component = component;
		this.direction = 'forward';
		this.label = label;
		this.mode = mode;
		this.params  = params;
	}

	/**
	 * Register a new transition step
	 *
	 * @param elements
	 * @param props
	 * @param params
	 */
	step(elements: Targets, props: CanArray<StyleDictionaryAndParams>, params: TransitionParams): Transition {
		if (!Object.isArray(elements)) {
			elements = (<TargetsAsArray>[]).concat(elements);
		}

		for (let i = 0; i < elements.length; i++) {
			//...
		}

		return this;
	}

	/**
	 * Repeats transition specified times
	 */
	repeat(): Transition {
		return this;
	}

	/**
	 * Revers a transition
	 */
	reverse(): Transition {
		return this;
	}

	/**
	 * Kills a transition
	 */
	kill(): void {
		//..
	}

	/**
	 * @param resolve
	 * @param reject
	 */
	then(resolve: Function): Transition {
		return this;
	}

	/**
	 * Runs a specified step
	 * @param step
	 */
	protected run(step: TransitionInfo): void {
		return;
	}

	/**
	 * Makes an element hidden
	 *
	 * @param el
	 * @param [props]
	 */
	protected hide(el: Target, props?: StyleDictionary): Transition {
		return this;
	}

	/**
	 * Makes an element visible
	 *
	 * @param el
	 * @param [props]
	 */
	protected visible(el: Target, props?: StyleDictionary): Transition {
		return this;
	}

	/**
	 * Returns a DOM nodes by selector
	 * @param node
	 */
	protected getNodes(selector: string): HTMLElement[] {
		return [].slice.call(this.block.elements(selector));
	}

	/**
	 * Returns a DOM node by selector
	 * @param selector
	 */
	protected getNode(selector: string): CanUndef<HTMLElement> {
		return this.block.element(selector);
	}

	/**
	 * Returns a last step from transition stack
	 */
	protected getLast(): CanUndef<TransitionInfo> {
		return this.stack[this.stack.length - 1];
	}

	/**
	 * Generates a will-change property
	 *
	 * @param props
	 * @param [params]
	 */
	protected generateGPU(props: StyleDictionary): StyleDictionary {
		const
			animateProps = Object.reject(props, NON_ANIMATED_PROPERTIES),
			keys = Object.keys(animateProps),
			styles: StyleDictionary = {};

		styles.willChange = keys.reduce((acc, prop) => `${acc}${acc === '' ? '' : ','}${prop}`, '');
		return styles;
	}
}

export class TransitionController {
	/**
	 * Stores a transition links
	 */
	protected store: Dictionary<TransitionCtx> = {};

	/**
	 * Creates a new parallel transition timeline
	 */
	parallel(ctx: iBlock, label: Label, params: TransitionCreateParams = {}): Transition {
		this.kill(label);

		const
			{store} = this,
			transitionCtx = store[label] = this.buildContext(ctx, label, 'parallel', params);

		return transitionCtx.transition;
	}

	/**
	 * Creates a new transition sequence
	 * @param ctx
	 * @param label
	 */
	sequence(ctx: iBlock, label: Label, params: TransitionCreateParams = {}): Transition {
		this.kill(label);

		const
			{store} = this,
			transitionCtx = store[label] = this.buildContext(ctx, label, 'sequence', params);

		return transitionCtx.transition;
	}

	/**
	 * Reverse a transition
	 *
	 * @param ctx
	 * @param label
	 */
	reverse(label: Label): CanUndef<Transition> {
		const
			transition = this.getTransition(label);

		if (transition) {
			return transition.reverse();
		}
	}

	/**
	 * Stops a transition
	 * @param label
	 */
	stop(label: Label): void {
		//..
	}

	/**
	 * Stops all transitions
	 */
	stopAll(): void {
		//..
	}

	/**
	 * Removes a transition
	 * @param label
	 */
	kill(label: Label): void {
		const
			transition = this.getTransition(label);

		if (transition) {
			transition.kill();
			delete this.store[label];
		}
	}

	/**
	 * Removes all transitions
	 */
	killAll(): void {
		//..
	}

	/**
	 * Returns a transition
	 * @param label
	 */
	getTransition(label: Label): CanUndef<Transition> {
		const
			quota = this.store[label];

		if (quota) {
			return quota.transition;
		}
	}

	/**
	 * Returns a transition context
	 * @param label
	 */
	protected getTransitionCtx(label: Label): CanUndef<TransitionCtx> {
		return this.store[label];
	}

	/**
	 * Returns link to component async module
	 * @param ctx
	 */
	protected getAsync(ctx: iBlock): Async {
		// @ts-ignore
		return ctx.async;
	}

	/**
	 * Builds a new transition context
	 *
	 * @param ctx
	 * @param label
	 */
	protected buildContext(
		ctx: iBlock,
		label: Label,
		mode: TransitionMode,
		params: TransitionCreateParams
	): TransitionCtx {
		const
			$a = this.getAsync(ctx),
			group = {group: CONTROLLER_GROUP};

		$a.worker(() => {
			// should kill transition?
			delete this.store[label];
		}, group);

		return {
			ctx,
			label,
			transition: new Transition(ctx, label, mode, params)
		};
	}
}

const Controller = new TransitionController();
export default Controller;

/**
 * PROPOSAL V2
 * @example
 * this.transition($$.label, {reusable: true, inherit: true})
 * 	.step(this.$el, {setVisible: true})
 * 	.step('overlay', {opacity: 1}, {duration: 600})
 * 	.step(['content-wrapper', 'buttons'], {transform}, {mode: 'parallel'});
 *
 *
 *
 * // Сложный чейнинг (последовательно + параллельно)
 * this.transition($$.label, {inherit: true})
 * 	.step('overlay', {opacity: 1, setVisible: true}, {duration: 600})
 * 	.step(['content-wrapper', 'buttons'], [{
 * 		transform: 0,
 * 	}, {
 * 		transform: ['30px', 0, 0],
 * 		duration: 200
 * 	}], {
 * 		mode: 'parallel'
 * 	})
 *
 * this.transition($$.label)
 * 	.step('el', {
 * 		translate: [270, 0, 0]
 * 	}, {
 * 		duration: 200,
 * 		each: true,
 * 		delay: (i) => ({self: (i + 1) * 100, start: 500})
 * 	})
 * 	.step('test', {
 * 		translate: [300, 0, 0],
 * 		duration: 200,
 * 		offset: -600
 * 	}, {
 * 		duration: 500,
 * 		offset: -200
 * 	})
 */
