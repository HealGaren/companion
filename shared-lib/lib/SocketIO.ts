import type { ClientEditConnectionConfig, ConnectionStatusEntry, ConnectionStatusUpdate } from './Model/Common.js'
import type { CloudControllerState, CloudRegionState } from './Model/Cloud.js'
import type { ClientConnectionsUpdate, ClientConnectionConfig, ConnectionUpdatePolicy } from './Model/Connections.js'

export interface ClientToBackendEventsMap {
	disconnect: () => never // Hack because type is missing

	'connection-debug:subscribe': (connectionId: string) => boolean
	'connection-debug:unsubscribe': (connectionId: string) => void
	'connections:set-enabled': (connectionId: string, enabled: boolean) => void

	'connections:subscribe': () => Record<string, ClientConnectionConfig>
	'connections:unsubscribe': () => void

	'connections:add': (info: { type: string; product: string | undefined }, label: string, versionId: string) => string
	'connections:edit': (connectionId: string) => ClientEditConnectionConfig | null
	'connections:set-label-and-config': (
		connectionId: string,
		newLabel: string,
		config: Record<string, any>,
		secrets: Record<string, any>,
		updatePolicy: ConnectionUpdatePolicy
	) => string | null
	'connections:set-label-and-version': (
		connectionId: string,
		newLabel: string,
		versionId: string | null,
		updatePolicy: ConnectionUpdatePolicy | null
	) => string | null
	'connections:set-module-and-version': (
		connectionId: string,
		newModuleId: string,
		versionId: string | null
	) => string | null
	'connections:reorder': (collectionId: string | null, connectionId: string, dropIndex: number) => void
	'connections:delete': (connectionId: string) => void
	'connections:get-statuses': () => Record<string, ConnectionStatusEntry>

	cloud_state_get: () => never
	cloud_state_set: (newState: Partial<CloudControllerState>) => never
	cloud_login: (user: string, pass: string) => never
	cloud_logout: () => never
	cloud_regenerate_uuid: () => never
	cloud_region_state_get: (id: string) => never
	cloud_region_state_set: (id: string, newState: Partial<CloudRegionState>) => never
}

export interface BackendToClientEventsMap {
	'load-save:task': (task: 'reset' | 'import' | null) => void

	[id: `connection-debug:update:${string}`]: (level: string, message: string) => void

	'connections:patch': (patch: ClientConnectionsUpdate[]) => void
	'connections:update-statuses': (patch: ConnectionStatusUpdate[]) => void

	cloud_state: (newState: CloudControllerState) => void
	cloud_region_state: (id: string, newState: CloudRegionState) => void
}

type ChangeSignatureToHaveCallback<T extends (...args: any[]) => any> = (
	args: Parameters<T>,
	callback: (err: Error | null, res: ReturnType<T>) => void
) => void

export type AddCallbackParamToEvents<T extends object> = {
	[K in keyof T]: T[K] extends (...args: any[]) => any
		? ReturnType<T[K]> extends never
			? T[K]
			: ChangeSignatureToHaveCallback<T[K]>
		: never
}

export type StripNever<T extends object> = {
	[K in keyof T as T[K] extends never ? never : K]: T[K]
}

export type ClientToBackendEventsWithNoResponse = {
	[K in keyof ClientToBackendEventsListenMap as ReturnType<ClientToBackendEventsListenMap[K]> extends void
		? K
		: never]: true
}
// {
// 	[K in keyof ClientToBackendEventsMap as ClientToBackendEventsMap[K] extends (...args: any[]) => never ? never : K]: (
// 		...args: Parameters<ClientToBackendEventsMap[K]>
// 	) => void
// }

export type ClientToBackendEventsWithPromiseResponse = {
	[K in keyof ClientToBackendEventsListenMap as ReturnType<ClientToBackendEventsListenMap[K]> extends void
		? never
		: K]: true
}
// StripNever<{
// 	[K in keyof ClientToBackendEventsMap]: ClientToBackendEventsMap[K] extends (...args: any[]) => any
// 		? ReturnType<ClientToBackendEventsMap[K]> extends never
// 			? never
// 			: (...args: Parameters<ClientToBackendEventsMap[K]>) => Promise<ReturnType<ClientToBackendEventsMap[K]>>
// 		: never
// }>

export type ClientToBackendEventsListenMap = {
	[K in keyof ClientToBackendEventsMap]: ClientToBackendEventsMap[K] extends (...args: any[]) => never
		? (...args: Parameters<ClientToBackendEventsMap[K]>) => void
		: (
				...args: Parameters<ClientToBackendEventsMap[K]>
			) => Promise<ReturnType<ClientToBackendEventsMap[K]>> | ReturnType<ClientToBackendEventsMap[K]>
}
