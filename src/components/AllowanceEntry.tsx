import { BigNumber } from "@ethersproject/bignumber";

interface AllowanceEntry {
  id: string,
  tokenAddress: string,
  symbol: string,
  spender: string,
  allowance: BigNumber,
}

export default AllowanceEntry
