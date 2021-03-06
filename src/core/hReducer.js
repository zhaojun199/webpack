import { combineReducers } from 'redux'
import warning from 'warning'

import { getClassName, getClassFunction, assertIsPromise } from './util'

// 单例模式
let instance
class Hreducer {
	constructor() {
		if (instance) {
			return instance
		}
		instance = this
		return instance
	}

	reducers = {
		init: () => ({}),
	}

	usedNamespace = []

	extraRecucer(Controller) {
		const entry = new Controller()
		const reducerName = entry.namespace
		warning(reducerName, `【${getClassName(entry)}】 - 未找到命名空间`)
		warning(!this.usedNamespace.includes(reducerName), `【${getClassName(entry)}】-【${reducerName}】- 命名空间重复`)
		this.usedNamespace.push(entry.namespace)
		this.reducers[reducerName] = (state = { '@@INIT': true }, action) => {
			const { type, ...otherAction } = action
			const actionType = type
			const extractActionType = actionType.split('/')
			if (reducerName === extractActionType[0]) {
				const isFunc = typeof entry[extractActionType[1]] === 'function'
				// warning(
				// 		isFunc,
				// 		`【${getClassName(entry)}】【${extractActionType[1]}】 - 未找到action`
				// 	)
				if (isFunc) {
					let newState = entry[extractActionType[1]](otherAction);
					return {
						...state,
						...(entry[extractActionType[1]](otherAction))
					}
				}
			}
			return state
		}
	}

	getReducers() {
		return combineReducers(this.reducers)
	}
}

export default new Hreducer()
