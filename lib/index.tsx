import React, { Component, PureComponent, useRef } from 'react'
import PropTypes from 'prop-types'
import flatpickr, { } from 'flatpickr'
import { Instance } from 'flatpickr/dist/types/instance'
import { BaseOptions, DateOption } from 'flatpickr/dist/types/options'

enum hooks {
  onChange = 'onChange',
  onOpen = 'onOpen',
  onClose = 'onClose',
  onMonthChange = 'onMonthChange',
  onYearChange = 'onYearChange',
  onReady = 'onReady',
  onValueUpdate = 'onValueUpdate',
  onDayCreate = 'onDayCreate'
}

class DateTimePicker extends PureComponent<React.PropsWithChildren<DateTimePickerProps>> {
  private flatpickr?: Instance
  private node!: HTMLDivElement | HTMLInputElement
  static defaultProps = {
    options: {}
  }

  componentDidUpdate(prevProps: any) {
    let { options } = this.props
    let prevOptions = prevProps.options

    options = mergeHooks(options, this.props)

    // Add prev ones too so we can compare against them later
    prevOptions = mergeHooks(prevOptions, prevProps)

    if (this.flatpickr) {
      const optionsKeys = Object.getOwnPropertyNames(options)
    for (let index = optionsKeys.length - 1; index >= 0; index--) {
      const key = optionsKeys[index]
      let value: boolean | boolean[] = options[key as keyof DateTimePickerProps['options']]

      if (value !== prevOptions[key]) {
        // Hook handlers must be set as an array
        if (Object.values(hooks).indexOf(key as hooks) !== -1 && !Array.isArray(value)) {
          value = [value]
        }
        
        this.flatpickr.set(key as keyof BaseOptions, value)
      }
    }

    if (
      this.props.hasOwnProperty('value') &&
      !(
        this.props.value &&
        Array.isArray(this.props.value) &&
        prevProps.value &&
        Array.isArray(prevProps.value) &&
        this.props.value.every((v, i) => {
          prevProps[i] === v
        })
      ) &&
      this.props.value !== prevProps.value
    ) {
      this.flatpickr.setDate(this.props.value, false)
    }
    }
  }

  componentDidMount() {
    this.createFlatpickrInstance()
  }

  componentWillUnmount() {
    this.destroyFlatpickrInstance()
  }

  createFlatpickrInstance = () => {
    let options = {
      onClose: () => {
       this.node.blur && this.node.blur()
      },
      ...this.props.options
    }

    // Add prop hooks to options
    options = mergeHooks(options, this.props)

    this.flatpickr = flatpickr(this.node, options)

    if (this.props.hasOwnProperty('value')) {
      this.flatpickr.setDate(this.props.value, false)
    }

    const { onCreate } = this.props
    if (onCreate) onCreate(this.flatpickr)
  }

  destroyFlatpickrInstance = () => {
    const { onDestroy } = this.props
    if (this.flatpickr) {
      if (onDestroy) onDestroy(this.flatpickr)
      this.flatpickr.destroy()
      this.flatpickr = undefined
    }
  }

  handleNodeChange = (node: any) => {
    this.node = node
    if (this.flatpickr) {
      this.destroyFlatpickrInstance()
      this.createFlatpickrInstance()
    }
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const { options, defaultValue, value, children, render, className,  ...props } = this.props

    return options.wrap
      ? (
        <div ref={this.handleNodeChange} className={className}>
          { children }
        </div>
      )
      : (
        <input className={className} defaultValue={defaultValue} ref={this.handleNodeChange} />
      )
  }
}


interface DateTimePickerProps {
  options: {
    wrap: boolean
  }
  defaultValue: string | string[] | undefined
  value: DateOption | DateOption[]
  render?: () => void
  onDestroy?: (instance: Instance) => void
  onChange?: (instance: Instance) => void
  onOpen?: (instance: Instance) => void
  onClose?: (instance: Instance) => void
  onMonthChange?: (instance: Instance) => void
  onYearChange?: (instance: Instance) => void
  onReady?: (instance: Instance) => void
  onValueUpdate?: (instance: Instance) => void
  onDayCreate?: (instance: Instance) => void
  onCreate:(instance: Instance) => void,
  className?: string
}

function mergeHooks(inputOptions: any, props: any) {
  let options = {...inputOptions}

  Object.values(hooks).forEach(hook => {
    if (props.hasOwnProperty(hook)) {
      if (options[hook] && !Array.isArray(options[hook])) {
        options[hook] = [options[hook]]
      } else if (!options[hook]) {
        options[hook] = []
      }

      const propHook = Array.isArray(props[hook])
        ? props[hook]
        : [props[hook]]
      options[hook].push(...propHook)
    }
  })

  return options
}

export default DateTimePicker
