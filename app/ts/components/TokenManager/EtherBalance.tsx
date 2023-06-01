
import { useSignalEffect } from '@preact/signals'
import { BigNumber, ethers } from 'ethers'
import { useAsyncState } from '../../library/preact-utilities.js'
import { useAccount } from '../../store/account.js'
import { useNetwork } from '../../store/network.js'
import { useProviders } from '../../store/provider.js'
import { AsyncText } from '../AsyncText.js'

export const EtherBalance = () => {
	const { network } = useNetwork()
	const { address } = useAccount()
	const providers = useProviders()
	const { value: query, waitFor } = useAsyncState<BigNumber>()

	const getBalance = () => {
		if (address.value.state !== 'resolved') return
		const accountAddress = address.value.value
		waitFor(async () => {
			const provider = providers.getbrowserProvider()
			return await provider.getBalance(accountAddress)
		})
	}

	useSignalEffect(() => {
		if (network.value.state !== 'resolved' || address.value.state !== 'resolved') return
		getBalance()
	})

	switch (query.value.state) {
		case 'inactive':
			return <></>
		case 'rejected':
		console.log(query.value.error.message)
			return <></>
		case 'pending':
			return (
				<div class='text-white/50'>
					<AsyncText />
				</div>
			)
		case 'resolved':
			const balance = ethers.utils.formatEther(query.value.value)
			return (
				<div class='text-white/50'>
					{balance} ETH
				</div>
			)
	}
}