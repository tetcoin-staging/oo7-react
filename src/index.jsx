import React from 'react';
import {Bond, TimeBond, ReactiveBond, TransformBond} from 'oo7';

/**
 * @summary A derivable class for creating React components that can transparently
 * accept deal with prop values that are {@link Bond}s.
 *
 * This class is almost exactly equivalent to the basic {React.Component} class:
 * You can subclass it, just as you would with the basic {React.Component}, to
 * create new React-framework components. However, it provides awareness for
 * prop values provided that are {@link Bond}s. In the case of a {@link Bond}
 * prop, then the `state` of the object (specifically the field in `state` with the
 * same name as the prop) is kept up to date with the representative
 * value of the prop's {@link Bond}.
 *
 * The props that are {@link Bond}-aware must be enumerated at construction. Props
 * not named there will just pass the {@link Bond} object through transparetnly.
 *
 * In addition to the normal {ReactiveComponent#render} function which can be used
 * normally, there are also {ReactiveComponent#readyRender} and {ReactiveComponent#unreadyRender},
 * which allow different render functions to be given depending on whether all
 * {@link Bond}-based props are considered _ready_. {ReactiveComponent#unreadyRender} has
 * a default render function, so you may typically implement just {ReactiveComponent#readyRender}.
 *
 * The {ReactiveComponent#ready} function is provided for determining whether all
 * {@link Bond}-based props are considered _ready_.
 *
 * If you override the functions {ReactiveComponent.componentWillMount},
 * {ReactiveComponent.componentWillUnmount} or {ReactiveComponent.receiveProps}, ensure
 * you first call the superclass implementation.
 */
export class ReactiveComponent extends React.Component {
	/**
	 * Construct an instance of this class.
	 *
	 * @param {array} reactiveProps - The names of each prop for which a corresponding
	 * key/value in `this.state` should be maintained for its representative value.
	 * @param {object} bonds - An object defining the {@link Bond}s and their names
	 * which should have state entries maintained to the current values of the
	 * {@link Bond}s.
	 *
	 * @example
	 * class Clock extends ReactiveComponent {
	 *   constructor() { super([], {time: new TimeBond}); }
	 *   readyRender() { return <span>{this.state.time.toString()}</span>; }
 	 * }
	 */
	constructor(reactiveProps = [], bonds = {}) {
		super();
		this.reactiveProps = reactiveProps;
		this.bonds = bonds;
		this.allBondKeys = [].concat(reactiveProps).concat(Object.keys(bonds));
	}

	/**
	 * Overridden function from React.Component.
	 *
	 * Ensure that any further derivations of this function call this superclass
	 * implementation.
	 */
	componentWillMount() {
		this.initProps();
	}

	/**
	 * Overridden function from React.Component.
	 *
	 * Ensure that any further derivations of this function call this superclass
	 * implementation.
	 */
	componentWillReceiveProps(nextProps) {
		this.updateProps(nextProps);
	}

	/**
	 * Overridden function from React.Component.
	 *
	 * Ensure that any further derivations of this function call this superclass
	 * implementation.
	 */
	componentWillUnmount() {
		this.finiProps();
	}

	initProps () {
		this.manageProps({}, this.props);
		let that = this;
		let bonds = this.bonds;
		let bondKeys = Object.keys(bonds);
		this._consolidatedExtraBonds = new ReactiveBond(bondKeys.map(f => bonds[f]), [], a => {
			var s = that.state || {};
			bondKeys.forEach((f, i) => { s[f] = a[i]; });
			that.setState(s);
		}).use();
	}

	finiProps () {
		if (this._consolidatedExtraBonds) {
			this._consolidatedExtraBonds.drop();
			delete this._consolidatedExtraBonds;
		}
		if (this._consolidatedBonds) {
			this._consolidatedBonds.drop();
			delete this._consolidatedBonds;
		}
	}

	updateProps (nextProps) {
		this.manageProps(this.props, nextProps);
	}

	manageProps (props, nextProps) {
		var that = this;
		if (this._consolidatedBonds) {
			this._consolidatedBonds.drop();
			delete this._consolidatedBonds;
		}
		this._consolidatedBonds = new ReactiveBond(this.reactiveProps.map(f => nextProps[f]), [], a => {
			var s = that.state || {};
			that.reactiveProps.forEach((f, i) => { s[f] = a[i]; });
			that.setState(s);
		}).use();
	}

	/**
	 * Determine whether all props are ready.
	 *
	 * @returns {boolean} - `true` if and only if all props, specifically those
	 * which are {@link Bond} values and which are {@link Bond} aware, are _ready_.
	 */
	ready() {
		return this.allBondKeys.every(k => this.state[k] !== undefined);
	}

	/**
	 * Render this object with present state and props.
	 *
	 * This will only be called when all {@link Bond}-aware props are _ready_ and
	 * have a corresponding value in `this.state`.
	 */
	readyRender() {
		return this.unreadyRender();
	}

	/**
	 * Render this object with present state and props.
	 *
	 * This will only be called when not all {@link Bond}-aware props are _ready_.
	 */
	unreadyRender() {
		return (<span />);
	}

	/**
	 * Overridden function from React.Component. Render the object with present
	 * state and props.
	 */
	render() {
		return this.ready() ? this.readyRender() : this.unreadyRender();
	}
}

/**
 * {@link Bond}-aware, variant of `span` component.
 *
 * `className` and `style` props, and the child, behave as expected but are
 * {@link Bond}-aware.
 *
 * @example
 * class Clock extends React.Component {
 *   render () { return <Rspan>{(new TimeBond).map(_=>_.toString())}</Rspan>; }
 * }
 */
export class Rspan extends ReactiveComponent {
    constructor() { super(['className', 'style', 'children']); }
	render() {
		return (
			<span
				className={this.state.className}
				style={this.state.style}
				name={this.props.name}
			>{this.state.children}</span>
		);
	}
}

/**
 * {@link Bond}-aware, variant of `div` component.
 *
 * `className` and `style` props, and the child, behave as expected but are
 * {@link Bond}-aware.
 *
 * @example
 * class Clock extends React.Component {
 *   render () { return <Rdiv>{(new TimeBond).map(_=>_.toString())}</Rdiv>; }
 * }
 */
export class Rdiv extends ReactiveComponent {
    constructor() { super(['className', 'style', 'children']); }
	render() {
		return (
			<div
				className={this.state.className}
				style={this.state.style}
				name={this.props.name}
			>{this.state.children}</div>
		);
	}
}

/**
 * {@link Bond}-aware, variant of `a` component.
 *
 * `href`, `target`, `className` and `style` props, and the child, behave as
 * expected but are {@link Bond}-aware.
 */
export class Ra extends ReactiveComponent {
	constructor() {
		super(['href', 'target', 'className', 'style', 'children']);
	}
	render() {
		return (
			<a
				href={this.state.href}
				target={this.state.target}
				className={this.state.className}
				style={this.state.style}
				name={this.props.name}
			>{this.state.children}</a>
		);
	}
}

/**
 * {@link Bond}-aware, variant of `img` component.
 *
 * `src`, `className` and `style` props, and the child, behave as
 * expected but are {@link Bond}-aware.
 */
export class Rimg extends ReactiveComponent {
	constructor() {
		super(['src', 'className', 'style']);
	}
	render() {
		return (
			<img
				src={this.state.src}
				className={this.state.className}
				style={this.state.style}
				name={this.props.name}
			/>
		);
	}
}

/**
 * {@link Bond}-aware component for displaying hash values.
 *
 * Hash value (encoded as hex and `0x` prefixed) should be placed in `value` prop.
 *
 * `value`, `className` and `style` props behave as expected but are {@link Bond}-aware.
 */
export class Hash extends ReactiveComponent {
	constructor() {
		super(['value', 'className', 'style']);
	}
	render() {
		let v = this.state.value;
		let d = typeof(v) === 'string' && v.startsWith('0x') && v.length >= 18
			? v.substr(0, 8) + '???' + v.substr(v.length - 4)
			: v;
		return (
			<span
				className={this.state.className}
				style={this.state.style}
				title={this.state.value}
				name={this.props.name}
			>{d}</span>
		);
	}
}
Hash.defaultProps = {
	className: '_hash'
};
