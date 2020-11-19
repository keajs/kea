import { kea } from '../src/kea/kea'
import { complexLogicType } from './complexLogicType'

type FormInstance = {}
type AntdFieldData = { name: number; key: number }
type ActionType = { name?: string; steps?: string[] }
type ActionForm = { name?: string; steps?: string[] }

function newAction(element: HTMLElement | null): Partial<ActionType> {
  return {
    name: '',
    steps: [],
  }
}

const kea2 = {} as any

export const experimentalComplexLogic = kea2
  .actions({
    setForm: (form: FormInstance) => ({ form }),
    selectAction: (id: string | null) => ({ id: id || null }),
    newAction: (element?: HTMLElement) => ({ element }),
    inspectForElementWithIndex: (index: number | null) => ({ index }),
    inspectElementSelected: (element: HTMLElement, index: number | null) => ({ element, index }),
    setEditingFields: (editingFields: AntdFieldData[]) => ({ editingFields }),
    incrementCounter: true,
    saveAction: (formValues: ActionForm) => ({ formValues }),
    deleteAction: true,
    showButtonActions: true,
    hideButtonActions: true,
    setShowActionsTooltip: (showActionsTooltip: boolean) => ({ showActionsTooltip }),
  })
  .reducers({
    buttonActionsVisible: [
      false,
      {
        showButtonActions: () => true,
        hideButtonActions: () => false,
      },
    ],
    selectedActionId: [
      null as number | 'new' | null,
      {
        selectAction: (_, { id }) => (id ? parseInt(id) : null),
        newAction: () => 'new',
      },
    ],
    newActionForElement: [
      null as HTMLElement | null,
      {
        newAction: (_, { element }) => element || null,
        selectAction: () => null,
      },
    ],
    inspectingElement: [
      null as number | null,
      {
        inspectForElementWithIndex: (_, { index }) => index,
        inspectElementSelected: () => null,
        selectAction: () => null,
        newAction: () => null,
      },
    ],
    editingFields: [
      null as AntdFieldData[] | null,
      {
        setEditingFields: (_, { editingFields }) => editingFields,
        selectAction: () => null,
        newAction: () => null,
      },
    ],
    form: [
      null as FormInstance | null,
      {
        setForm: (_, { form }) => form,
      },
    ],
    counter: [
      0,
      {
        incrementCounter: (state) => state + 1,
      },
    ],
    showActionsTooltip: [
      false,
      {
        setShowActionsTooltip: (_, { showActionsTooltip }) => showActionsTooltip,
      },
    ],
  })
  .selectors({
    selectedAction: [
      (s) => [s.selectedActionId, s.newActionForElement],
      (selectedActionId, newActionForElement): ActionType | null => {
        if (selectedActionId === 'new') {
          return newAction(newActionForElement)
        }
        return null
      },
    ],
    initialValuesForForm: [
      (s) => [s.selectedAction],
      (selectedAction): ActionForm =>
        selectedAction
          ? {
              ...selectedAction,
              steps: [],
            }
          : { steps: [] },
    ],
    selectedEditedAction: [
      // `editingFields` don't update on values.form.setFields(fields), so reloading by tagging a few other selectors
      (s) => [s.selectedAction, s.initialValuesForForm, s.form, s.editingFields, s.inspectingElement, s.counter],
      (selectedAction, initialValuesForForm, form): ActionForm => {
        return initialValuesForForm
      },
    ],
  })
  .listeners(({ actions, values }) => ({
    hideButtonActions: () => {
      actions.setShowActionsTooltip(false)
    },
    setShowActionsTooltip: async ({ showActionsTooltip }, breakpoint, action) => {
      if (showActionsTooltip) {
        await breakpoint(1000)
        actions.setShowActionsTooltip(false)
      }
    },
  }))
