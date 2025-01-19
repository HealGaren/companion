import React, { useCallback, useContext, useRef, useState } from 'react'
import { CAlert, CButton, CButtonGroup, CCallout, CNav, CNavItem, CNavLink, CTabContent, CTabPane } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faSync } from '@fortawesome/free-solid-svg-icons'
import { AddSurfaceGroupModal, AddSurfaceGroupModalRef } from './AddGroupModal.js'
import { RootAppStoreContext } from '../Stores/RootAppStore.js'
import { observer } from 'mobx-react-lite'
import { SurfaceDiscoveryTable } from './SurfaceDiscoveryTable.js'
import { KnownSurfacesTable } from './KnownSurfacesTable.js'
import { OutboundSurfacesTable } from './OutboundSurfacesTable.js'
import { Link, Outlet } from '@tanstack/react-router'

export const SurfacesPage = observer(function SurfacesPage() {
	return (
		<div className="secondary-panel fill-height">
			<div className="secondary-panel-header">
				<h4>Surfaces</h4>
			</div>

			<div className="secondary-panel-inner">
				<CNav variant="tabs" role="tablist">
					<CNavItem>
						<CNavLink to="/surfaces/configured" as={Link}>
							Configured Surfaces
						</CNavLink>
					</CNavItem>
					<CNavItem>
						<CNavLink to="/surfaces/discover" as={Link}>
							Discover
						</CNavLink>
					</CNavItem>
					<CNavItem>
						<CNavLink to="/surfaces/outbound" as={Link}>
							Remote Surfaces
						</CNavLink>
					</CNavItem>
				</CNav>
				<CTabContent>
					<CTabPane visible transition={false}>
						<Outlet />
					</CTabPane>
				</CTabContent>
			</div>
		</div>
	)
})

export function ConfiguredSurfacesTab() {
	const { socket } = useContext(RootAppStoreContext)

	const addGroupModalRef = useRef<AddSurfaceGroupModalRef>(null)

	const [scanning, setScanning] = useState(false)
	const [scanError, setScanError] = useState<string | null>(null)

	const refreshUSB = useCallback(() => {
		setScanning(true)
		setScanError(null)

		socket
			.emitPromise('surfaces:rescan', [], 30000)
			.then((errorMsg) => {
				setScanError(errorMsg || null)
				setScanning(false)
			})
			.catch((err) => {
				console.error('Refresh USB failed', err)

				setScanning(false)
			})
	}, [socket])

	const addEmulator = useCallback(() => {
		socket.emitPromise('surfaces:emulator-add', []).catch((err) => {
			console.error('Emulator add failed', err)
		})
	}, [socket])
	const addGroup = useCallback(() => {
		addGroupModalRef.current?.show()
	}, [socket])

	return (
		<>
			<p style={{ marginBottom: '0.5rem' }}>
				Currently connected surfaces. If your streamdeck is missing from this list, you might need to close the Elgato
				Streamdeck application and click the Rescan button below.
			</p>

			<CAlert color="warning" role="alert" style={{ display: scanError ? '' : 'none' }}>
				{scanError}
			</CAlert>

			<CButtonGroup size="sm">
				<CButton color="warning" onClick={refreshUSB}>
					<FontAwesomeIcon icon={faSync} spin={scanning} />
					{scanning ? ' Checking for new surfaces...' : ' Rescan USB'}
				</CButton>
				<CButton color="primary" onClick={addEmulator}>
					<FontAwesomeIcon icon={faAdd} /> Add Emulator
				</CButton>
				<CButton color="secondary" onClick={addGroup}>
					<FontAwesomeIcon icon={faAdd} /> Add Group
				</CButton>
			</CButtonGroup>

			<AddSurfaceGroupModal ref={addGroupModalRef} />

			<KnownSurfacesTable />

			<CCallout color="info">
				Did you know, you can connect a Streamdeck from another computer or Raspberry Pi with{' '}
				<a target="_blank" rel="noreferrer" href="https://bitfocus.io/companion-satellite?companion-inapp-didyouknow">
					Companion Satellite
				</a>
				?
			</CCallout>
		</>
	)
}

export function DiscoverSurfacesTab() {
	return (
		<>
			<p style={{ marginBottom: '0.5rem' }}>
				Discovered remote surfaces, such as Companion Satellite and Stream Deck Studio will be listed here. You can
				easily configure them to connect to Companion from here.
				<br />
				This requires Companion Satellite version 1.9.0 and later.
			</p>

			<SurfaceDiscoveryTable />
		</>
	)
}

export function OutboundSurfacesTab() {
	return (
		<>
			<p style={{ marginBottom: '0.5rem' }}>
				The Stream Deck Studio supports network connection. You can set up the connection from Companion here, or use
				the Discovered Surfaces tab.
				<br />
				This is not suitable for all remote surfaces such as Satellite, as that opens the connection to Companion
				itself.
			</p>

			<OutboundSurfacesTable />
		</>
	)
}
