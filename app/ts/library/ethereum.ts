import { BytesLike } from 'ethers'
import { TransactionResponse, TransferTransactionResponse } from '../types'

export function isTransferTransaction(txResponse: TransactionResponse): txResponse is TransferTransactionResponse {
	return txResponse.data.startsWith('0xa9059cbb')
}

export function isReceiptFromTokenTransfer(bytecode: BytesLike) {
	return bytecode !== '0x'
}
