import { isHexString } from 'ethers'
import * as funtypes from 'funtypes'
import { ParsedValueConfig } from 'funtypes/lib/types/ParsedValue'

export const BigIntParser: ParsedValueConfig<funtypes.String, bigint> = {
	parse(value) {
		if (!isHexString(value)) return { success: false, message: `${value} is not a hex string encoded number.` }
		return { success: true, value: BigInt(value) }
	},
	serialize(value) {
		if (typeof value !== 'bigint') return { success: false, message: `${typeof value} is not a bigint.` } satisfies funtypes.Failure
		return { success: true, value: `0x${value.toString(16)}` } satisfies funtypes.Success<string>
	},
}

export const BigIntHexSchema = funtypes.String.withParser(BigIntParser)

export const TokenSchema = funtypes.Object({
	chainId: BigIntHexSchema,
	name: funtypes.String,
	address: funtypes.String,
	symbol: funtypes.String,
	decimals: BigIntHexSchema,
})

export const TokenListSchema = funtypes.Array(TokenSchema)

export const ManagedTokensCacheParserConfig: ParsedValueConfig<funtypes.String, funtypes.Static<typeof TokenListSchema>> = {
	parse(value) {
		const jsonParsed = JSON.parse(value)
		return TokenListSchema.safeParse(jsonParsed)
	},
	serialize(value) {
		const serializedValue = TokenListSchema.safeSerialize(value)
		if (!serializedValue.success) return { success: false, message: serializedValue.message }
		const jsonString = JSON.stringify(serializedValue.value)
		return { success: true, value: jsonString }
	},
}

export const ManagedTokensCacheSchema = funtypes.String.withParser(ManagedTokensCacheParserConfig)

export type ManagedTokensCache = funtypes.Static<typeof ManagedTokensCacheSchema>
