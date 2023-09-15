import { useSignalEffect } from "@preact/signals"
import { Contract, TransactionResponse } from "ethers"
import { ComponentChildren } from "preact"
import { TransferProvider, useTransfer } from "../context/Transfer.js"
import { ERC20ABI } from "../library/ERC20ABI.js"
import { useAsyncState } from "../library/preact-utilities.js"
import { useProviders } from "../store/provider.js"
import { TransferAddressField } from "./TransferAddressField.js"
import { TransferAmountField } from "./TransferAmountField.js"
import { TransferRecorder } from "./TransferRecorder.js"
import { TransferButton } from "./TransferButton.js"
import { TransferTokenSelector } from "./TransferTokenField.js"

export function SetupTransfer() {
	return (
		<TransferProvider>
			<TransferForm>
				<div class='grid gap-3'>
					<div class='grid gap-3 md:grid-cols-2'>
						<TransferTokenSelector />
						<TransferAmountField />
					</div>
					<TransferAddressField />
					<TransferButton />
					<TransferRecorder />
				</div>
			</TransferForm>
		</TransferProvider>
	)
}

const TransferForm = ({ children }: { children: ComponentChildren }) => {
	const providers = useProviders()
	const { transaction, safeParse } = useTransfer()
	const { value: transactionQuery, waitFor } = useAsyncState<TransactionResponse>()

	const sendTransferRequest = (e: Event) => {
		e.preventDefault()

		if (!safeParse.value.success) return
		const transferInput = safeParse.value.value

		waitFor(async () => {
			const signer = await providers.browserProvider.getSigner()

			// Ether transfer
			if (transferInput.token === undefined) {
				return await signer.sendTransaction({ to: transferInput.to, value: transferInput.amount })
			}

			// Token transfer
			const tokenContract = transferInput.token
			const contract = new Contract(tokenContract.address, ERC20ABI, signer)
			return await contract.transfer(transferInput.to, transferInput.amount)
		})
	}

	const listenForQueryChanges = () => {
		// do not reset shared state for other instances of this hooks
		if (transactionQuery.value.state === 'inactive') return
		transaction.value = transactionQuery.value
	}

	useSignalEffect(listenForQueryChanges)

	return (
		<form onSubmit={sendTransferRequest}>
			{children}
		</form>
	)
}
