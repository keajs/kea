// Auto-generated with kea-typegen. DO NOT EDIT!

import { Logic } from '../src/types'

export interface complexLogicType<ActionType, ActionForm, FormInstance, AntdFieldData> extends Logic {
  actionCreators: {
    setForm: (
      form: FormInstance,
    ) => {
      type: 'set form (samples.complexLogic)'
      payload: {
        form: FormInstance
      }
    }
    selectAction: (
      id: string | null,
    ) => {
      type: 'select action (samples.complexLogic)'
      payload: {
        id: string | null
      }
    }
    newAction: (
      element?: HTMLElement,
    ) => {
      type: 'new action (samples.complexLogic)'
      payload: {
        element: HTMLElement | undefined
      }
    }
    inspectForElementWithIndex: (
      index: number | null,
    ) => {
      type: 'inspect for element with index (samples.complexLogic)'
      payload: {
        index: number | null
      }
    }
    inspectElementSelected: (
      element: HTMLElement,
      index: number | null,
    ) => {
      type: 'inspect element selected (samples.complexLogic)'
      payload: {
        element: HTMLElement
        index: number | null
      }
    }
    setEditingFields: (
      editingFields: AntdFieldData[],
    ) => {
      type: 'set editing fields (samples.complexLogic)'
      payload: {
        editingFields: AntdFieldData[]
      }
    }
    incrementCounter: () => {
      type: 'increment counter (samples.complexLogic)'
      payload: {
        value: boolean
      }
    }
    saveAction: (
      formValues: ActionForm,
    ) => {
      type: 'save action (samples.complexLogic)'
      payload: {
        formValues: ActionForm
      }
    }
    deleteAction: () => {
      type: 'delete action (samples.complexLogic)'
      payload: {
        value: boolean
      }
    }
    showButtonActions: () => {
      type: 'show button actions (samples.complexLogic)'
      payload: {
        value: boolean
      }
    }
    hideButtonActions: () => {
      type: 'hide button actions (samples.complexLogic)'
      payload: {
        value: boolean
      }
    }
    setShowActionsTooltip: (
      showActionsTooltip: boolean,
    ) => {
      type: 'set show actions tooltip (samples.complexLogic)'
      payload: {
        showActionsTooltip: boolean
      }
    }
  }
  actionKeys: {
    'set form (samples.complexLogic)': 'setForm'
    'select action (samples.complexLogic)': 'selectAction'
    'new action (samples.complexLogic)': 'newAction'
    'inspect for element with index (samples.complexLogic)': 'inspectForElementWithIndex'
    'inspect element selected (samples.complexLogic)': 'inspectElementSelected'
    'set editing fields (samples.complexLogic)': 'setEditingFields'
    'increment counter (samples.complexLogic)': 'incrementCounter'
    'save action (samples.complexLogic)': 'saveAction'
    'delete action (samples.complexLogic)': 'deleteAction'
    'show button actions (samples.complexLogic)': 'showButtonActions'
    'hide button actions (samples.complexLogic)': 'hideButtonActions'
    'set show actions tooltip (samples.complexLogic)': 'setShowActionsTooltip'
  }
  actionTypes: {
    setForm: 'set form (samples.complexLogic)'
    selectAction: 'select action (samples.complexLogic)'
    newAction: 'new action (samples.complexLogic)'
    inspectForElementWithIndex: 'inspect for element with index (samples.complexLogic)'
    inspectElementSelected: 'inspect element selected (samples.complexLogic)'
    setEditingFields: 'set editing fields (samples.complexLogic)'
    incrementCounter: 'increment counter (samples.complexLogic)'
    saveAction: 'save action (samples.complexLogic)'
    deleteAction: 'delete action (samples.complexLogic)'
    showButtonActions: 'show button actions (samples.complexLogic)'
    hideButtonActions: 'hide button actions (samples.complexLogic)'
    setShowActionsTooltip: 'set show actions tooltip (samples.complexLogic)'
  }
  actions: {
    setForm: (form: FormInstance) => void
    selectAction: (id: string | null) => void
    newAction: (element?: HTMLElement) => void
    inspectForElementWithIndex: (index: number | null) => void
    inspectElementSelected: (element: HTMLElement, index: number | null) => void
    setEditingFields: (editingFields: AntdFieldData[]) => void
    incrementCounter: () => void
    saveAction: (formValues: ActionForm) => void
    deleteAction: () => void
    showButtonActions: () => void
    hideButtonActions: () => void
    setShowActionsTooltip: (showActionsTooltip: boolean) => void
  }
  constants: {}
  defaults: {
    buttonActionsVisible: boolean
    selectedActionId: number | 'new' | null
    newActionForElement: HTMLElement | null
    inspectingElement: number | null
    editingFields: AntdFieldData[] | null
    form: FormInstance | null
    counter: number
    showActionsTooltip: boolean
  }
  events: {}
  key: undefined
  listeners: {
    hideButtonActions: ((
      action: {
        type: 'hide button actions (samples.complexLogic)'
        payload: {
          value: boolean
        }
      },
      previousState: any,
    ) => void | Promise<void>)[]
    setShowActionsTooltip: ((
      action: {
        type: 'set show actions tooltip (samples.complexLogic)'
        payload: {
          showActionsTooltip: boolean
        }
      },
      previousState: any,
    ) => void | Promise<void>)[]
  }
  path: ['samples', 'complexLogic']
  pathString: 'samples.complexLogic'
  props: Record<string, unknown>
  reducer: (
    state: any,
    action: any,
    fullState: any,
  ) => {
    buttonActionsVisible: boolean
    selectedActionId: number | 'new' | null
    newActionForElement: HTMLElement | null
    inspectingElement: number | null
    editingFields: AntdFieldData[] | null
    form: FormInstance | null
    counter: number
    showActionsTooltip: boolean
  }
  reducerOptions: {}
  reducers: {
    buttonActionsVisible: (state: boolean, action: any, fullState: any) => boolean
    selectedActionId: (state: number | 'new' | null, action: any, fullState: any) => number | 'new' | null
    newActionForElement: (state: HTMLElement | null, action: any, fullState: any) => HTMLElement | null
    inspectingElement: (state: number | null, action: any, fullState: any) => number | null
    editingFields: (state: AntdFieldData[] | null, action: any, fullState: any) => AntdFieldData[] | null
    form: (state: FormInstance | null, action: any, fullState: any) => FormInstance | null
    counter: (state: number, action: any, fullState: any) => number
    showActionsTooltip: (state: boolean, action: any, fullState: any) => boolean
  }
  selector: (
    state: any,
  ) => {
    buttonActionsVisible: boolean
    selectedActionId: number | 'new' | null
    newActionForElement: HTMLElement | null
    inspectingElement: number | null
    editingFields: AntdFieldData[] | null
    form: FormInstance | null
    counter: number
    showActionsTooltip: boolean
  }
  selectors: {
    buttonActionsVisible: (state: any, props: any) => boolean
    selectedActionId: (state: any, props: any) => number | 'new' | null
    newActionForElement: (state: any, props: any) => HTMLElement | null
    inspectingElement: (state: any, props: any) => number | null
    editingFields: (state: any, props: any) => AntdFieldData[] | null
    form: (state: any, props: any) => FormInstance | null
    counter: (state: any, props: any) => number
    showActionsTooltip: (state: any, props: any) => boolean
    selectedAction: (state: any, props: any) => ActionType | null
    initialValuesForForm: (state: any, props: any) => ActionForm
    selectedEditedAction: (state: any, props: any) => ActionForm
  }
  sharedListeners: {}
  values: {
    buttonActionsVisible: boolean
    selectedActionId: number | 'new' | null
    newActionForElement: HTMLElement | null
    inspectingElement: number | null
    editingFields: AntdFieldData[] | null
    form: FormInstance | null
    counter: number
    showActionsTooltip: boolean
    selectedAction: ActionType | null
    initialValuesForForm: ActionForm
    selectedEditedAction: ActionForm
  }
  _isKea: true
  _isKeaWithKey: false
  __keaTypeGenInternalSelectorTypes: {
    selectedAction: (arg1: number | 'new' | null, arg2: HTMLElement | null) => ActionType | null
    initialValuesForForm: (arg1: ActionType | null) => ActionForm
    selectedEditedAction: (
      arg1: ActionType | null,
      arg2: ActionForm,
      arg3: FormInstance | null,
      arg4: AntdFieldData[] | null,
      arg5: number | null,
      arg6: number,
    ) => ActionForm
  }
}
