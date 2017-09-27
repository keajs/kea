function havePropsChangedDebug (nextProps) {
  const changedProps = Object.keys(nextProps).filter(key => key !== 'actions' && nextProps[key] !== this.props[key])
  if (changedProps.length > 0) {
    changedProps.forEach(key => {
      console.log(`prop '${key}' changed`, this.props[key], nextProps[key])
    })
    return true
  }
  return false
}

function havePropsChangedProduction (nextProps) {
  for (var key in nextProps) {
    if (key === 'actions') {
      continue
    }
    if (nextProps[key] !== this.props[key]) {
      return true
    }
  }
  return false
}

export function havePropsChanged (debug = false) {
  if (debug) {
    return havePropsChangedDebug
  } else {
    return havePropsChangedProduction
  }
}
