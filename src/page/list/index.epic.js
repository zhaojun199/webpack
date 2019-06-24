import { ofType } from 'redux-observable'
import { filter, mapTo, mergeMap, map } from 'rxjs/operators'
import http$ from '@home/util/http'

export default class ListEpic {
	// epic命名空间,与controller ns 对应
	namespace = 'list';

	fetchList(action$) {
		return action$.pipe(
			ofType('list/get'),
			mergeMap(action =>
				http$.getJSON(`https://api.github.com/users/${action.payload}`).pipe(
					map(response => ({ type: 'list/showList', response, id: response.id }))
				)
			)
		)
	}

	// pingEpic(action$) {
	// 	return action$.pipe(
	// 		filter(action => action.type === 'PING'),
	// 		mapTo({ type: 'PONG' })
	// 	)
	// }
}