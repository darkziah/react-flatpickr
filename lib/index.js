import { jsx as _jsx } from "react/jsx-runtime";
import { PureComponent } from 'react';
import flatpickr from 'flatpickr';
var hooks;
(function (hooks) {
    hooks["onChange"] = "onChange";
    hooks["onOpen"] = "onOpen";
    hooks["onClose"] = "onClose";
    hooks["onMonthChange"] = "onMonthChange";
    hooks["onYearChange"] = "onYearChange";
    hooks["onReady"] = "onReady";
    hooks["onValueUpdate"] = "onValueUpdate";
    hooks["onDayCreate"] = "onDayCreate";
})(hooks || (hooks = {}));
class DateTimePicker extends PureComponent {
    constructor() {
        super(...arguments);
        this.createFlatpickrInstance = () => {
            let options = {
                onClose: () => {
                    this.node.blur && this.node.blur();
                },
                ...this.props.options
            };
            // Add prop hooks to options
            options = mergeHooks(options, this.props);
            this.flatpickr = flatpickr(this.node, options);
            if (this.props.hasOwnProperty('value')) {
                this.flatpickr.setDate(this.props.value, false);
            }
            const { onCreate } = this.props;
            if (onCreate)
                onCreate(this.flatpickr);
        };
        this.destroyFlatpickrInstance = () => {
            const { onDestroy } = this.props;
            if (this.flatpickr) {
                if (onDestroy)
                    onDestroy(this.flatpickr);
                this.flatpickr.destroy();
                this.flatpickr = undefined;
            }
        };
        this.handleNodeChange = (node) => {
            this.node = node;
            if (this.flatpickr) {
                this.destroyFlatpickrInstance();
                this.createFlatpickrInstance();
            }
        };
    }
    componentDidUpdate(prevProps) {
        let { options } = this.props;
        let prevOptions = prevProps.options;
        options = mergeHooks(options, this.props);
        // Add prev ones too so we can compare against them later
        prevOptions = mergeHooks(prevOptions, prevProps);
        if (this.flatpickr) {
            const optionsKeys = Object.getOwnPropertyNames(options);
            for (let index = optionsKeys.length - 1; index >= 0; index--) {
                const key = optionsKeys[index];
                let value = options[key];
                if (value !== prevOptions[key]) {
                    // Hook handlers must be set as an array
                    if (Object.values(hooks).indexOf(key) !== -1 && !Array.isArray(value)) {
                        value = [value];
                    }
                    this.flatpickr.set(key, value);
                }
            }
            if (this.props.hasOwnProperty('value') &&
                !(this.props.value &&
                    Array.isArray(this.props.value) &&
                    prevProps.value &&
                    Array.isArray(prevProps.value) &&
                    this.props.value.every((v, i) => {
                        prevProps[i] === v;
                    })) &&
                this.props.value !== prevProps.value) {
                this.flatpickr.setDate(this.props.value, false);
            }
        }
    }
    componentDidMount() {
        this.createFlatpickrInstance();
    }
    componentWillUnmount() {
        this.destroyFlatpickrInstance();
    }
    render() {
        // eslint-disable-next-line no-unused-vars
        const { options, defaultValue, value, children, render, className, ...props } = this.props;
        return options.wrap
            ? (_jsx("div", { ref: this.handleNodeChange, className: className, children: children }))
            : (_jsx("input", { className: className, defaultValue: defaultValue, ref: this.handleNodeChange }));
    }
}
DateTimePicker.defaultProps = {
    options: {}
};
function mergeHooks(inputOptions, props) {
    let options = { ...inputOptions };
    Object.values(hooks).forEach(hook => {
        if (props.hasOwnProperty(hook)) {
            if (options[hook] && !Array.isArray(options[hook])) {
                options[hook] = [options[hook]];
            }
            else if (!options[hook]) {
                options[hook] = [];
            }
            const propHook = Array.isArray(props[hook])
                ? props[hook]
                : [props[hook]];
            options[hook].push(...propHook);
        }
    });
    return options;
}
export default DateTimePicker;
