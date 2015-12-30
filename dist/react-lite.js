/*!
 * react-lite.js v0.0.4
 * (c) 2015 Jade Gu
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.React = factory();
}(this, function () { 'use strict';

    var isType = function isType(type) {
    	return function (obj) {
    		return obj != null && Object.prototype.toString.call(obj) === '[object ' + type + ']';
    	};
    };
    var isObj = isType('Object');
    var isStr = isType('String');
    var isNum = isType('Number');
    var isFn = isType('Function');
    var isBln = isType('Boolean');
    var isArr = Array.isArray || isType('Array');
    var isUndefined = function isUndefined(obj) {
    	return obj === undefined;
    };
    var isComponent = function isComponent(obj) {
    	return obj && obj.prototype && 'forceUpdate' in obj.prototype;
    };
    var isStatelessComponent = function isStatelessComponent(obj) {
    	return obj && (!obj.prototype || !('forceUpdate' in obj.prototype));
    };

    var pipe = function pipe(fn1, fn2) {
    	return function () {
    		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    			args[_key] = arguments[_key];
    		}

    		fn1.apply(this, args);
    		return fn2.apply(this, args);
    	};
    };

    var forEach$1 = function forEach(list, iteratee) {
    	var record = arguments.length <= 2 || arguments[2] === undefined ? { index: 0 } : arguments[2];

    	for (var i = 0, len = list.length; i < len; i += 1) {
    		var item = list[i];
    		if (isArr(item)) {
    			forEach(item, iteratee, record);
    		} else if (!isUndefined(item)) {
    			iteratee(item, record.index);
    			record.index += 1;
    		}
    	}
    };

    var eachItem = function eachItem(list, iteratee) {
    	for (var i = 0, len = list.length; i < len; i += 1) {
    		iteratee(list[i], i);
    	}
    };

    var mapValue = function mapValue(obj, iteratee) {
    	for (var key in obj) {
    		if (!obj.hasOwnProperty(key)) {
    			continue;
    		}
    		iteratee(obj[key], key);
    	}
    };

    var mapKey = function mapKey(sources, iteratee) {
    	var keyMap = {};
    	var item = undefined;
    	var key = undefined;
    	for (var i = 0, len = sources.length; i < len; i += 1) {
    		item = sources[i];
    		for (key in item) {
    			if (!item.hasOwnProperty(key) || keyMap[key]) {
    				continue;
    			}
    			keyMap[key] = true;
    			iteratee(key);
    		}
    	}
    };

    var extend = function extend(target) {
    	for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    		args[_key2 - 1] = arguments[_key2];
    	}

    	eachItem(args, function (source) {
    		if (source == null) {
    			return;
    		}
    		mapValue(source, function (value, key) {
    			target[key] = value;
    		});
    	});
    	return target;
    };

    var uid = 0;
    var getUid = function getUid() {
    	return ++uid;
    };

    var hasKey = function hasKey(obj) {
    	var key = arguments.length <= 1 || arguments[1] === undefined ? 'key' : arguments[1];
    	return obj && obj.props && obj.props.hasOwnProperty(key);
    };

    var getChildren = function getChildren(_x3) {
    	var _again = true;

    	_function: while (_again) {
    		var children = _x3;
    		_again = false;

    		if (children && children.length > 0) {
    			if (children.length === 1) {
    				children = children[0];
    				if (isArr(children)) {
    					_x3 = children;
    					_again = true;
    					continue _function;
    				}
    			}
    		} else {
    			children = undefined;
    		}
    		return children;
    	}
    };
    var mergeProps = function mergeProps(props, children, defaultProps) {
    	var result = extend({}, defaultProps, props);
    	children = getChildren(children);
    	if (!isUndefined(children)) {
    		result.children = children;
    	}
    	return result;
    };

    var setAttr = function setAttr(elem, key, value) {
    	elem.setAttribute(key, value);
    };
    var getAttr = function getAttr(elem, key) {
    	return elem.getAttribute(key);
    };
    var removeAttr = function removeAttr(elem, key) {
    	elem.removeAttribute(key);
    };

    var eventNameAlias = {
    	onDoubleClick: 'ondblclick'
    };
    var getEventName = function getEventName(key) {
    	key = eventNameAlias[key] || key;
    	return key.toLowerCase();
    };
    var setEvent = function setEvent(elem, key, value) {
    	if (!isFn(value)) {
    		return;
    	}
    	key = getEventName(key);
    	elem[key] = value;
    	if (key === 'onchange') {
    		elem.oninput = value;
    	}
    };
    var removeEvent = function removeEvent(elem, key) {
    	key = getEventName(key);
    	elem[key] = null;
    	if (key === 'onchange') {
    		elem.oninput = null;
    	}
    };

    var ignoreKeys = {
    	key: true,
    	ref: true,
    	children: true
    };
    var EVENT_KEYS = /^on/i;
    var isIgnoreKey = function isIgnoreKey(key) {
    	return ignoreKeys[key];
    };
    var isEventKey = function isEventKey(key) {
    	return EVENT_KEYS.test(key);
    };
    var isInnerHTMLKey = function isInnerHTMLKey(key) {
    	return key === 'dangerouslySetInnerHTML';
    };
    var isStyleKey = function isStyleKey(key) {
    	return key === 'style';
    };
    var setProp = function setProp(elem, key, value) {
    	switch (true) {
    		case isIgnoreKey(key):
    			break;
    		case isEventKey(key):
    			setEvent(elem, key, value);
    			break;
    		case isStyleKey(key):
    			setStyle(elem, value);
    			break;
    		case isInnerHTMLKey(key):
    			value && isStr(value.__html) && (elem.innerHTML = value.__html);
    			break;
    		case key in elem:
    			elem[key] = value;
    			break;
    		default:
    			elem.setAttribute(key, value);
    	}
    };
    var setProps = function setProps(elem, props) {
    	mapValue(props, function (value, key) {
    		setProp(elem, key, value);
    	});
    };
    var removeProps = function removeProps(elem, oldProps) {
    	mapValue(oldProps, function (oldValue, key) {
    		removeProp(elem, key, oldValue);
    	});
    };
    var removeProp = function removeProp(elem, key, oldValue) {
    	switch (true) {
    		case isIgnoreKey(key):
    			break;
    		case isEventKey(key):
    			removeEvent(elem, key);
    			break;
    		case isStyleKey(key):
    			removeStyle(elem, oldValue);
    			break;
    		case isInnerHTMLKey(key):
    			elem.innerHTML = '';
    			break;
    		case !(key in elem):
    			removeAttr(elem, key);
    			break;
    		case isFn(oldValue):
    			elem[key] = null;
    			break;
    		case isStr(oldValue):
    			elem[key] = '';
    			break;
    		case isBln(oldValue):
    			elem[key] = false;
    			break;
    		default:
    			try {
    				elem[key] = null;
    			} catch (e) {
    				//pass
    			}
    	}
    };
    var patchProps = function patchProps(elem, props, newProps) {
    	if (props === newProps) {
    		return;
    	}
    	if (!props && newProps) {
    		setProps(elem, newProps);
    		return;
    	} else if (!newProps && props) {
    		removeProps(elem, props);
    		return;
    	}

    	mapKey([props, newProps], function (key) {
    		if (isIgnoreKey(key)) {
    			return;
    		}
    		var value = newProps[key];
    		var oldValue = key === 'value' ? elem.value : props[key];
    		if (value === oldValue) {
    			return;
    		}
    		if (isUndefined(value)) {
    			removeProp(elem, key, oldValue);
    			return;
    		}
    		if (isStyleKey(key)) {
    			patchStyle(elem, oldValue, value);
    		} else if (isInnerHTMLKey(key)) {
    			var oldHtml = oldValue && oldValue.__html;
    			var html = value && value.__html;
    			if (!isStr(html)) {
    				elem.innerHTML = '';
    			} else if (html !== oldHtml) {
    				elem.innerHTML = html;
    			}
    		} else {
    			setProp(elem, key, value);
    		}
    	});
    };

    var removeStyle = function removeStyle(elem, style) {
    	if (!isObj(style)) {
    		return;
    	}
    	var elemStyle = elem.style;
    	mapValue(style, function (_, key) {
    		elemStyle[key] = '';
    	});
    };
    var setStyle = function setStyle(elem, style) {
    	if (!isObj(style)) {
    		return;
    	}
    	var elemStyle = elem.style;
    	mapValue(style, function (value, key) {
    		setStyleValue(elemStyle, key, value);
    	});
    };
    var patchStyle = function patchStyle(elem, style, newStyle) {
    	if (style === newStyle) {
    		return;
    	}
    	if (!newStyle && style) {
    		removeStyle(elem, style);
    	} else if (newStyle && !style) {
    		setStyle(elem, newStyle);
    	} else {
    		var elemStyle = elem.style;
    		mapKey([style, newStyle], function (key) {
    			var value = newStyle[key];
    			var oldValue = style[key];
    			if (value !== oldValue) {
    				setStyleValue(elemStyle, key, value);
    			}
    		});
    	}
    };

    var isUnitlessNumber = {
    	animationIterationCount: true,
    	boxFlex: true,
    	boxFlexGroup: true,
    	boxOrdinalGroup: true,
    	columnCount: true,
    	flex: true,
    	flexGrow: true,
    	flexPositive: true,
    	flexShrink: true,
    	flexNegative: true,
    	flexOrder: true,
    	fontWeight: true,
    	lineClamp: true,
    	lineHeight: true,
    	opacity: true,
    	order: true,
    	orphans: true,
    	tabSize: true,
    	widows: true,
    	zIndex: true,
    	zoom: true,

    	// SVG-related properties
    	fillOpacity: true,
    	stopOpacity: true,
    	strokeDashoffset: true,
    	strokeOpacity: true,
    	strokeWidth: true
    };

    var isUnitlessNumberWithPrefix = {};
    var prefixes = ['Webkit', 'ms', 'Moz', 'O'];
    var prefixKey = function prefixKey(prefix, key) {
    	return prefix + key.charAt(0).toUpperCase() + key.substring(1);
    };
    mapValue(isUnitlessNumber, function (_, prop) {
    	eachItem(prefixes, function (prefix) {
    		return isUnitlessNumberWithPrefix[prefixKey(prefix, prop)] = true;
    	});
    });
    mapValue(isUnitlessNumberWithPrefix, function (value, key) {
    	isUnitlessNumber[key] = value;
    });

    var RE_NUMBER = /^-?\d+(\.\d+)?$/;
    var setStyleValue = function setStyleValue(style, key, value) {
    	if (isBln(value) || value == null) {
    		value = '';
    	}
    	if (!isUnitlessNumber[key] && RE_NUMBER.test(value)) {
    		style[key] = value + 'px';
    	} else {
    		style[key] = value;
    	}
    };

    var VNODE_TYPE = {
    	ELEMENT: 1,
    	COMPONENT: 2,
    	STATELESS_COMPONENT: 3,
    	TEXT: 4
    };
    var DIFF_TYPE = {
    	CREATE: 1,
    	REMOVE: 2,
    	REPLACE: 3,
    	UPDATE: 4
    };

    var COMPONENT_ID = 'data-liteid';

    var store = {};
    var render = function render(vtree, container, callback) {
    	if (!vtree) {
    		throw new Error('cannot render ' + vtree + ' to container');
    	}
    	var id = getAttr(container, COMPONENT_ID);
    	if (store.hasOwnProperty(id)) {
    		store[id].updateTree(vtree, container);
    	} else {
    		setAttr(container, COMPONENT_ID, id = getUid());
    		container.innerHTML = '';
    		vtree.initTree(container);
    	}
    	store[id] = vtree;

    	var result = undefined;

    	switch (vtree.vtype) {
    		case VNODE_TYPE.ELEMENT:
    			result = container.firstChild;
    			break;
    		case VNODE_TYPE.COMPONENT:
    			result = vtree.component;
    			break;
    		default:
    			result = null;
    	}

    	if (isFn(callback)) {
    		callback.call(result);
    	}

    	return result;
    };

    var unmountComponentAtNode = function unmountComponentAtNode(container) {
    	var id = getAttr(container, COMPONENT_ID);
    	if (store.hasOwnProperty(id)) {
    		store[id].destroyTree();
    		delete store[id];
    		return true;
    	}
    	return false;
    };

    var findDOMNode = function findDOMNode(node) {
    	if (node == null) {
    		return null;
    	}
    	if (node.nodeName) {
    		return node;
    	}
    	var component = node;
    	if (isFn(component.getDOMNode) && component.node) {
    		node = component.getDOMNode();
    		return node;
    	}
    	throw new Error('findDOMNode can not find Node');
    };

    var check = function check() {
        return check;
    };
    check.isRequired = check;
    var PropTypes = {
        "array": check,
        "bool": check,
        "func": check,
        "number": check,
        "object": check,
        "string": check,
        "any": check,
        "arrayOf": check,
        "element": check,
        "instanceOf": check,
        "node": check,
        "objectOf": check,
        "oneOf": check,
        "oneOfType": check,
        "shape": check
    };

    function Updater(instance) {
    	this.instance = instance;
    	this.pendingStates = [];
    	this.pendingCallbacks = [];
    	this.isPending = false;
    }

    Updater.prototype = {
    	constructor: Updater,
    	emitUpdate: function emitUpdate(nextProps) {
    		var instance = this.instance;
    		var pendingStates = this.pendingStates;
    		var pendingCallbacks = this.pendingCallbacks;

    		if (nextProps || pendingStates.length > 0) {
    			var props = nextProps || instance.props;
    			shouldUpdate(instance, props, this.getState(), this.clearCallbacks.bind(this));
    		}
    	},
    	addState: function addState(nextState) {
    		if (nextState) {
    			this.pendingStates.push(nextState);
    			if (!this.isPending) {
    				this.emitUpdate();
    			}
    		}
    	},
    	replaceState: function replaceState(nextState) {
    		var pendingStates = this.pendingStates;

    		pendingStates.pop();
    		pendingStates.push([nextState]);
    	},
    	getState: function getState() {
    		var instance = this.instance;
    		var pendingStates = this.pendingStates;
    		var state = instance.state;
    		var props = instance.props;

    		var merge = function merge(_x) {
    			var _again = true;

    			_function: while (_again) {
    				var nextState = _x;
    				_again = false;

    				// replace state
    				if (isArr(nextState)) {
    					state = null;
    					_x = nextState[0];
    					_again = true;
    					continue _function;
    				}
    				if (isFn(nextState)) {
    					nextState = nextState.call(instance, state, props);
    				}
    				state = extend({}, state, nextState);
    			}
    		};
    		eachItem(pendingStates, merge);
    		pendingStates.length = 0;
    		return state;
    	},
    	clearCallbacks: function clearCallbacks() {
    		var pendingCallbacks = this.pendingCallbacks;
    		var instance = this.instance;

    		if (pendingCallbacks.length > 0) {
    			eachItem(pendingCallbacks, function (callback) {
    				return callback.call(instance);
    			});
    			pendingCallbacks.length = 0;
    		}
    	},
    	addCallback: function addCallback(callback) {
    		if (isFn(callback)) {
    			this.pendingCallbacks.push(callback);
    		}
    	}
    };
    function Component(props) {
    	this.$updater = new Updater(this);
    	this.$cache = { isMounted: false };
    	this.props = props;
    	this.state = {};
    	this.refs = {};
    }

    Component.prototype = {
    	constructor: Component,
    	componentWillUpdate: function componentWillUpdate(nextProps, nextState) {},
    	componentDidUpdate: function componentDidUpdate(prevProps, prevState) {},
    	componentWillReceiveProps: function componentWillReceiveProps(nextProps) {},
    	componentWillMount: function componentWillMount() {},
    	componentDidMount: function componentDidMount() {},
    	componentWillUnmount: function componentWillUnmount() {},
    	shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
    		return true;
    	},
    	forceUpdate: function forceUpdate(callback) {
    		var $cache = this.$cache;
    		var props = this.props;
    		var state = this.state;
    		var vtree = this.vtree;
    		var node = this.node;
    		var refs = this.refs;

    		var nextProps = $cache.props || props;
    		var nextState = $cache.state || state;
    		$cache.props = $cache.state = null;
    		this.componentWillUpdate(nextProps, nextState);
    		this.props = nextProps;
    		this.state = nextState;
    		var nextVtree = renderComponent(this);
    		vtree.updateTree(nextVtree, node && node.parentNode);
    		this.vtree = nextVtree;
    		this.node = nextVtree.node;
    		this.componentDidUpdate(props, state);
    		if (isFn(callback)) {
    			callback.call(this);
    		}
    	},
    	setState: function setState(nextState, callback) {
    		var $updater = this.$updater;

    		$updater.addCallback(callback);
    		$updater.addState(nextState);
    	},
    	replaceState: function replaceState(nextState, callback) {
    		var $updater = this.$updater;

    		$updater.addCallback(callback);
    		$updater.replaceState(nextState);
    	},
    	getDOMNode: function getDOMNode() {
    		var node = this.vtree.node;
    		return node.tagName === 'NOSCRIPT' ? null : node;
    	},
    	isMounted: function isMounted() {
    		return this.$cache.isMounted;
    	}
    };

    var updatePropsAndState = function updatePropsAndState(component, props, state) {
    	component.state = state;
    	component.props = props;
    };

    var shouldUpdate = function shouldUpdate(component, nextProps, nextState, callback) {
    	var shouldUpdate = component.shouldComponentUpdate(nextProps, nextState);
    	if (shouldUpdate === false) {
    		updatePropsAndState(component, nextProps, nextState);
    		return;
    	}
    	updatePropsAndState(component.$cache, nextProps, nextState);
    	component.forceUpdate(callback);
    };

    var diff = function diff(vnode, newVnode) {
    	var type = undefined;
    	switch (true) {
    		case vnode === newVnode:
    			return null;
    		case isUndefined(newVnode):
    			type = DIFF_TYPE.REMOVE;
    			break;
    		case isUndefined(vnode):
    			type = DIFF_TYPE.CREATE;
    			break;
    		case vnode.type !== newVnode.type:
    			type = DIFF_TYPE.REPLACE;
    			break;
    		case hasKey(newVnode):
    			if (!hasKey(vnode) || newVnode.props.key !== vnode.props.key) {
    				type = DIFF_TYPE.REPLACE;
    			} else {
    				type = DIFF_TYPE.UPDATE;
    			}
    			break;
    		case hasKey(vnode):
    			type = DIFF_TYPE.REPLACE;
    			break;
    		default:
    			type = DIFF_TYPE.UPDATE;
    	}
    	return type;
    };

    function Vtree(properties) {
    	extend(this, properties);
    }

    var noop = function noop() {};
    var getDOMNode = function getDOMNode() {
    	return this;
    };
    Vtree.prototype = {
    	constructor: Vtree,
    	mapTree: noop,
    	attachRef: function attachRef() {
    		var refKey = this.ref;
    		var refs = this.refs;
    		var vtype = this.vtype;

    		if (!refs || refKey == null) {
    			return;
    		}
    		var refValue = undefined;
    		if (vtype === VNODE_TYPE.ELEMENT) {
    			refValue = this.node;
    			refValue.getDOMNode = getDOMNode;
    		} else if (vtype === VNODE_TYPE.COMPONENT) {
    			refValue = this.component;
    		}
    		if (refValue) {
    			if (isFn(refKey)) {
    				refKey(refValue);
    			} else if (isStr(refKey)) {
    				refs[refKey] = refValue;
    			}
    		}
    	},
    	detachRef: function detachRef() {
    		var refKey = this.ref;
    		var refs = this.refs;

    		if (!refs || refKey == null) {
    			return;
    		}
    		if (isFn(refKey)) {
    			refKey(null);
    		} else {
    			delete refs[refKey];
    		}
    	},
    	updateRef: function updateRef(newVtree) {
    		if (!this.refs) {
    			newVtree.attachRef();
    			return;
    		}
    		if (!newVtree.refs) {
    			this.detachRef();
    			return;
    		}
    		if (this.refs !== newVtree.refs) {
    			this.detachRef();
    			newVtree.attachRef();
    			return;
    		}
    		var oldRef = this.ref;
    		var newRef = newVtree.ref;
    		if (newRef == null) {
    			this.detachRef();
    		} else if (oldRef !== newRef) {
    			this.detachRef();
    			newVtree.attachRef();
    		}
    	},
    	updateTree: function updateTree(nextVtree, parentNode) {
    		_updateTree(this, nextVtree, parentNode);
    	}
    };

    function Vtext(text) {
    	this.text = text;
    }

    Vtext.prototype = new Vtree({
    	constructor: Vtext,
    	vtype: VNODE_TYPE.TEXT,
    	attachRef: noop,
    	detachRef: noop,
    	updateRef: noop,
    	update: function update(nextVtext) {
    		var node = this.node;
    		var text = this.text;

    		if (nextVtext.text !== text) {
    			node.replaceData(0, node.length, nextVtext.text);
    		}
    		nextVtext.node = this.node;
    		return this;
    	},
    	initTree: function initTree(parentNode) {
    		this.node = createTextNode(this.text);
    		appendNode(parentNode, this.node);
    	},
    	destroyTree: function destroyTree() {
    		removeNode(this.node);
    	}
    });

    function Velem(type, props) {
    	this.type = type;
    	this.props = props;
    }

    var unmountTree = function unmountTree(vtree) {
    	var vtype = vtree.vtype;

    	if (vtype === VNODE_TYPE.COMPONENT || vtype === VNODE_TYPE.STATELESS_COMPONENT) {
    		vtree.destroyTree();
    		return;
    	}
    	vtree.detachRef();
    };
    Velem.prototype = new Vtree({
    	constructor: Velem,
    	vtype: VNODE_TYPE.ELEMENT,
    	eachChildren: function eachChildren(iteratee) {
    		var children = this.props.children;
    		var sorted = this.sorted;

    		if (sorted) {
    			eachItem(children, iteratee);
    			return;
    		}
    		if (isArr(children)) {
    			var newChildren = [];
    			forEach$1(children, function (vchild, index) {
    				vchild = getVnode(vchild);
    				iteratee(vchild, index);
    				newChildren.push(vchild);
    			});
    			this.props.children = newChildren;
    			this.sorted = true;
    		} else if (!isUndefined(children)) {
    			children = this.props.children = getVnode(children);
    			iteratee(children, 0);
    		}
    	},
    	mapTree: function mapTree(iteratee) {
    		iteratee(this);
    		this.eachChildren(function (vchild) {
    			return vchild.mapTree(iteratee);
    		});
    	},
    	initTree: function initTree(parentNode) {
    		var type = this.type;
    		var props = this.props;

    		var node = this.node = createElement$1(type, props);
    		this.eachChildren(function (vchild) {
    			vchild.initTree(node);
    		});
    		appendNode(parentNode, node);
    		this.attachRef();
    	},
    	destroyTree: function destroyTree() {
    		var node = this.node;
    		var props = this.props;

    		this.mapTree(unmountTree);
    		removeNode(node);
    	},
    	update: function update(newVelem) {
    		var node = this.node;
    		var props = this.props;

    		var children = !isUndefined(props.children) ? props.children : [];
    		var newProps = newVelem.props;
    		var count = 0;
    		if (!isArr(children)) {
    			children = [children];
    		}
    		patchProps(node, props, newProps);
    		newVelem.node = node;
    		newVelem.eachChildren(function (newVchild, index) {
    			var vchild = children[index];
    			if (vchild) {
    				vchild.updateTree(newVchild, node);
    			} else {
    				newVchild.initTree(node);
    			}
    			count += 1;
    		});
    		while (children.length > count) {
    			children[count].destroyTree();
    			count += 1;
    		}
    		this.updateRef(newVelem);
    	}
    });

    function VstatelessComponent(type, props) {
    	this.type = type;
    	this.props = props;
    }

    VstatelessComponent.prototype = new Vtree({
    	constructor: VstatelessComponent,
    	vtype: VNODE_TYPE.STATELESS_COMPONENT,
    	attachRef: noop,
    	detachRef: noop,
    	updateRef: noop,
    	mapTree: function mapTree(iteratee) {
    		iteratee(this);
    	},
    	renderTree: function renderTree() {
    		var factory = this.type;
    		var props = this.props;

    		var vtree = factory(props);
    		if (vtree && isFn(vtree.render)) {
    			vtree = vtree.render();
    		}
    		this.vtree = getVnode(vtree);
    	},
    	initTree: function initTree(parentNode) {
    		this.renderTree();
    		this.vtree.initTree(parentNode);
    		this.node = this.vtree.node;
    	},
    	destroyTree: function destroyTree() {
    		this.vtree.destroyTree();
    		this.node = this.vtree = null;
    	},
    	update: function update(newVtree, parentNode) {
    		var vtree = this.vtree;

    		newVtree.renderTree();
    		vtree.updateTree(newVtree.vtree, parentNode);
    		newVtree.node = newVtree.vtree.node;
    	}
    });

    var setRefs = noop;
    var collectRef = function collectRef(vnode) {
    	setRefs(vnode);
    };
    var bindRefs = function bindRefs(refs) {
    	return function (vnode) {
    		if (!vnode.refs) {
    			vnode.refs = refs;
    		}
    	};
    };
    var renderComponent = function renderComponent(component) {
    	setRefs = bindRefs(component.refs);
    	var vtree = checkVtree(component.render());
    	setRefs = noop;
    	return vtree;
    };
    var neverUpdate = function neverUpdate() {
    	return false;
    };

    function Vcomponent(type, props) {
    	this.type = type;
    	this.props = props;
    }

    Vcomponent.prototype = new Vtree({
    	constructor: Vcomponent,
    	vtype: VNODE_TYPE.COMPONENT,
    	mapTree: function mapTree(iteratee) {
    		iteratee(this);
    	},
    	initTree: function initTree(parentNode) {
    		var Component = this.type;
    		var props = this.props;

    		var component = this.component = new Component(props);
    		var updater = component.$updater;
    		var cache = component.$cache;

    		updater.isPending = true;
    		component.props = component.props || props;
    		component.componentWillMount();
    		updatePropsAndState(component, component.props, updater.getState());
    		var vtree = component.vtree = renderComponent(component);
    		vtree.initTree(parentNode);
    		cache.isMounted = true;
    		component.node = this.node = vtree.node;
    		component.componentDidMount();
    		updater.isPending = false;
    		this.attachRef();
    		updater.emitUpdate();
    	},
    	destroyTree: function destroyTree() {
    		var component = this.component;
    		var props = this.props;

    		if (!component) {
    			return;
    		}
    		component.shouldComponentUpdate = neverUpdate;
    		component.forceUpdate = noop;
    		this.detachRef();
    		component.componentWillUnmount();
    		component.vtree.destroyTree();
    		component.$cache.isMounted = false;
    		this.component = this.node = component.node = component.refs = null;
    	},
    	update: function update(newVtree, parentNode) {
    		var component = this.component;

    		if (!component) {
    			return;
    		}
    		var Component = newVtree.type;
    		var nextProps = newVtree.props;

    		var updater = component.$updater;
    		newVtree.component = component;
    		updater.isPending = true;
    		component.componentWillReceiveProps(nextProps);
    		updater.isPending = false;
    		updater.emitUpdate(nextProps);
    		newVtree.node = component.node;
    		this.updateRef(newVtree);
    	}
    });

    var _updateTree = function _updateTree(vtree, newVtree, parentNode) {
    	var diffType = diff(vtree, newVtree);
    	var $removeNode = undefined;
    	var node = undefined;
    	switch (diffType) {
    		case DIFF_TYPE.CREATE:
    			newVtree.initTree(parentNode);
    			break;
    		case DIFF_TYPE.REMOVE:
    			vtree.destroyTree();
    			break;
    		case DIFF_TYPE.REPLACE:
    			node = vtree.node;
    			$removeNode = removeNode;
    			removeNode = noop;
    			vtree.destroyTree();
    			removeNode = $removeNode;
    			newVtree.initTree(function (newNode) {
    				replaceNode(parentNode, newNode, node);
    			});
    			break;
    		case DIFF_TYPE.UPDATE:
    			vtree.update(newVtree, parentNode);
    			break;
    	}
    };

    var removeNode = function removeNode(node) {
    	if (node && node.parentNode) {
    		node.parentNode.removeChild(node);
    	}
    };
    var appendNode = function appendNode(parentNode, node) {
    	if (parentNode && node) {
    		if (isFn(parentNode)) {
    			parentNode(node);
    		} else {
    			parentNode.appendChild(node);
    		}
    	}
    };
    var replaceNode = function replaceNode(parentNode, newNode, existNode) {
    	if (newNode && existNode) {
    		parentNode = parentNode || existNode.parentNode;
    		parentNode.replaceChild(newNode, existNode);
    	}
    };

    var createTextNode = function createTextNode(text) {
    	return document.createTextNode(text);
    };
    var createElement$1 = function createElement(tagName, props) {
    	var node = document.createElement(tagName);
    	setProps(node, props);
    	return node;
    };

    var getVnode = function getVnode(vnode) {
    	if (vnode === null || vnode === false) {
    		vnode = new Velem('noscript', {});
    	} else if (!isObj(vnode)) {
    		vnode = new Vtext(vnode);
    	}
    	return vnode;
    };

    var checkVtree = function checkVtree(vtree) {
    	if (isUndefined(vtree)) {
    		throw new Error('component can not render undefined');
    	}
    	return getVnode(vtree);
    };

    var isValidElement = function isValidElement(obj) {
    	if (obj == null) {
    		return false;
    	}
    	if (obj.vtype === VNODE_TYPE.ELEMENT || obj.vtype === VNODE_TYPE.COMPONENT) {
    		return true;
    	}
    	return false;
    };

    var cloneElement = function cloneElement(originElem, props) {
    	for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    		children[_key - 2] = arguments[_key];
    	}

    	var type = originElem.type;
    	props = extend({}, originElem.props, props);
    	var vnode = createElement.apply(undefined, [type, props].concat(children));
    	if (vnode.ref === originElem.ref) {
    		vnode.refs = originElem.refs;
    	}
    	return vnode;
    };

    var createFactory = function createFactory(type) {
    	return function () {
    		for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    			args[_key2] = arguments[_key2];
    		}

    		return createElement.apply(undefined, [type].concat(args));
    	};
    };

    var createElement = function createElement(type, props) {
    	for (var _len3 = arguments.length, children = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
    		children[_key3 - 2] = arguments[_key3];
    	}

    	var Vnode = undefined;
    	switch (true) {
    		case isStr(type):
    			Vnode = Velem;
    			break;
    		case isComponent(type):
    			Vnode = Vcomponent;
    			break;
    		case isStatelessComponent(type):
    			Vnode = VstatelessComponent;
    			break;
    		default:
    			throw new Error('React.createElement: unexpect type [ ' + type + ' ]');
    	}
    	var vnode = new Vnode(type, mergeProps(props, children, type.defaultProps));
    	var key = null;
    	var ref = null;
    	var hasRef = false;
    	if (props != null) {
    		if (!isUndefined(props.key)) {
    			key = '' + props.key;
    		}
    		if (!isUndefined(props.ref)) {
    			ref = props.ref;
    			hasRef = true;
    		}
    	}
    	vnode.key = key;
    	vnode.ref = ref;
    	if (hasRef && Vnode !== VstatelessComponent) {
    		collectRef(vnode);
    	}
    	return vnode;
    };

    var only = function only(children) {
    	if (children != null && !isArr(children)) {
    		return children;
    	}
    	throw new Error('expect only one child');
    };

    var forEach = function forEach(children, iteratee, context) {
    	if (children == null) {
    		return children;
    	}
    	if (isArr(children)) {
    		forEach$1(children, function (child, index) {
    			iteratee.call(context, child, index);
    		});
    	} else {
    		iteratee.call(context, children, 0);
    	}
    };

    var map = function map(children, iteratee, context) {
    	if (children == null) {
    		return children;
    	}
    	var store = [];
    	var keyMap = {};
    	forEach(children, function (child, index) {
    		var data = {};
    		data.child = iteratee.call(context, child, index) || child;
    		data.isEqual = data.child === child;
    		var key = data.key = getKey(child, index);
    		if (keyMap.hasOwnProperty(key)) {
    			keyMap[key] = keyMap[key] + 1;
    		} else {
    			keyMap[key] = 0;
    		}
    		data.index = keyMap[key];
    		store.push(data);
    	});
    	var result = [];
    	eachItem(store, function (_ref) {
    		var child = _ref.child;
    		var key = _ref.key;
    		var index = _ref.index;
    		var isEqual = _ref.isEqual;

    		if (child == null || isBln(child)) {
    			return;
    		}
    		if (!isValidElement(child) || key == null) {
    			result.push(child);
    			return;
    		}
    		if (keyMap[key] !== 0) {
    			key += ':' + index;
    		}
    		if (!isEqual) {
    			key = escapeUserProvidedKey(child.key || '') + '/' + key;
    		}
    		child = cloneElement(child, { key: key });
    		result.push(child);
    	});
    	return result;
    };

    var count = function count(children) {
    	var count = 0;
    	forEach(children, function () {
    		count++;
    	});
    	return count;
    };

    var identity = function identity(obj) {
    	return obj;
    };
    var toArray = function toArray(children) {
    	var mappedChildren = map(children, identity) || [];
    	var result = [];
    	eachItem(mappedChildren, function (child) {
    		if (child == null || isBln(child)) {
    			return;
    		}
    		result.push(child);
    	});
    	return result;
    };

    var getKey = function getKey(child, index) {
    	var key = undefined;
    	if (isValidElement(child) && isStr(child.key)) {
    		key = '.$' + child.key;
    	} else {
    		key = '.' + index.toString(36);
    	}
    	return key;
    };

    var userProvidedKeyEscapeRegex = /\/(?!\/)/g;
    var escapeUserProvidedKey = function escapeUserProvidedKey(text) {
    	return ('' + text).replace(userProvidedKeyEscapeRegex, '//');
    };

    var eachMixin = function eachMixin(mixins, iteratee) {
    	eachItem(mixins, function (mixin) {
    		if (isArr(mixin.mixins)) {
    			eachMixin(mixin.mixins, iteratee);
    		}
    		iteratee(mixin);
    	});
    };

    var combineMixinToProto = function combineMixinToProto(proto, mixin) {
    	mapValue(mixin, function (value, key) {
    		if (key === 'getInitialState') {
    			proto.$getInitialStates.push(value);
    			return;
    		}
    		var curValue = proto[key];
    		if (isFn(curValue) && isFn(value)) {
    			proto[key] = pipe(curValue, value);
    		} else {
    			proto[key] = value;
    		}
    	});
    };

    var combineMixinToClass = function combineMixinToClass(Component, mixin) {
    	if (isObj(mixin.propTypes)) {
    		extend(Component.propTypes, mixin.propTypes);
    	}
    	if (isFn(mixin.getDefaultProps)) {
    		extend(Component.defaultProps, mixin.getDefaultProps());
    	}
    	if (isObj(mixin.statics)) {
    		extend(Component, mixin.statics);
    	}
    };

    var bindContext = function bindContext(obj, source) {
    	mapValue(source, function (value, key) {
    		if (isFn(value)) {
    			obj[key] = value.bind(obj);
    		}
    	});
    };

    var Facade = function Facade() {};
    Facade.prototype = Component.prototype;

    var getInitialState = function getInitialState() {
    	var _this = this;

    	var state = {};
    	var setState = this.setState;
    	this.setState = Facade;
    	eachItem(this.$getInitialStates, function (getInitialState) {
    		if (isFn(getInitialState)) {
    			extend(state, getInitialState.call(_this));
    		}
    	});
    	this.setState = setState;
    	return state;
    };

    var createClass = function createClass(spec) {
    	if (!isFn(spec.render)) {
    		throw new Error('createClass: spec.render is not function');
    	}
    	var specMixins = spec.mixins || [];
    	var mixins = specMixins.concat(spec);
    	spec.mixins = null;
    	function Klass(props) {
    		Component.call(this, props);
    		this.constructor = Klass;
    		spec.autobind !== false && bindContext(this, Klass.prototype);
    		this.state = this.getInitialState() || this.state;
    	}
    	Klass.displayName = spec.displayName;
    	Klass.propTypes = {};
    	Klass.defaultProps = {};
    	var proto = Klass.prototype = new Facade();
    	var getInitialStates = proto.$getInitialStates = [];
    	eachMixin(mixins, function (mixin) {
    		combineMixinToProto(proto, mixin);
    		combineMixinToClass(Klass, mixin);
    	});
    	proto.getInitialState = getInitialState;
    	spec.mixins = specMixins;
    	return Klass;
    };

    var React = {
        cloneElement: cloneElement,
        isValidElement: isValidElement,
        createElement: createElement,
        createFactory: createFactory,
        Component: Component,
        createClass: createClass,
        Children: { only: only, forEach: forEach, map: map, count: count, toArray: toArray },
        PropTypes: PropTypes,
        render: render,
        findDOMNode: findDOMNode,
        unmountComponentAtNode: unmountComponentAtNode
    };

    React.__SECRET_DOM_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {
        render: render,
        findDOMNode: findDOMNode,
        unmountComponentAtNode: unmountComponentAtNode
    };

    return React;

}));