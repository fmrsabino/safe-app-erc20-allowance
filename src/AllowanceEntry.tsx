import { BigNumber } from "@ethersproject/bignumber";

interface AllowanceEntry {
  tokenAddress: string,
  symbol: string,
  spender: string,
  allowance: BigNumber,
  update: boolean,
}

export default AllowanceEntry
