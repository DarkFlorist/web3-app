import { assertsWithEthereum } from '../library/ethereum.js'
import { ConnectAttemptError } from '../library/exceptions.js'
import { AsyncProperty, useAsyncState } from '../library/preact-utilities.js'
import { useProviders } from './provider.js'
import { effect, signal, useSignalEffect } from '@preact/signals'

const address = signal<AsyncProperty<string>>({ state: 'inactive' })

export function useAccount() {
	const providers = useProviders()
	const { value: query, waitFor } = useAsyncState<string>()

	const connect = () => {
		waitFor(async () => {
			const browserProvider = providers.getbrowserProvider()
			await browserProvider.send('eth_requestAccounts', [])
			const signer = browserProvider.getSigner()
			return await signer.getAddress()
		})
	}

	const attemptToConnect = () => {
		waitFor(async () => {
			const browserProvider = providers.getbrowserProvider()

			try {
				const signer = browserProvider.getSigner()
				return await signer.getAddress()
			} catch (unknownError) {
				let error = new ConnectAttemptError(`Unknown error ${unknownError}`)
				if (typeof unknownError === 'string') error = new ConnectAttemptError(unknownError)
				if (unknownError instanceof Error) error = new ConnectAttemptError(error.message)
				throw error
			}
		})
	}

	const listenForQueryChanges = () => {
		// do not reset shared state for other instances of this hooks
		if (query.value.state === 'inactive') return
		address.value = query.value
	}

	useSignalEffect(listenForQueryChanges)

	return { address, connect, attemptToConnect }
}

const handleAccountChanged = ([newAddress]: string[]) => {
	if (address.value.state !== 'resolved') return
	removeAccountChangedListener()
	if (newAddress === undefined) {
		address.value = { state: 'inactive' }
		return;
	}
	address.value = { ...address.value, value: newAddress }
}

const removeAccountChangedListener = effect(() => {
	if (address.value.state !== 'resolved') return
	assertsWithEthereum(window)
	window.ethereum.on('accountsChanged', handleAccountChanged)
})
