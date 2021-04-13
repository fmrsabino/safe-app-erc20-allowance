import { Button } from "@gnosis.pm/safe-react-components"
import { Container, TextField } from "@material-ui/core"
import { BigNumber, ethers } from "ethers"
import { useState } from "react"
import ERC20Abi from "../abis/erc20.json"
import AllowanceEntry from "./AllowanceEntry"

interface Props {
    web3Provider: ethers.providers.Web3Provider,
    safeAddress: string,
    onAddTokenClick: (erc20: AllowanceEntry) => {}
}

const AddAllowanceForm: React.FC<Props> = ({ web3Provider, safeAddress, onAddTokenClick: onAddEntryClick }) => {
    const [token, setToken] = useState<string>("")
    const [spender, setSpender] = useState<string>("")
    const [isError, setError] = useState<boolean>(false)
    const [isSpenderError, setSpenderError] = useState<boolean>(false)

    // Should use React callback here
    const addAllowance = async () => {
        // Many of these states can be modelled as React states
        const isValidTokenAddress = ethers.utils.isAddress(token)
        setError(!isValidTokenAddress)
        if (!isValidTokenAddress) return

        const isValidSpenderAddress = ethers.utils.isAddress(spender)
        setError(!isValidSpenderAddress)
        if (!isValidSpenderAddress) return

        const erc20 = new ethers.Contract(token, ERC20Abi, web3Provider)
        if (!erc20) return
        const symbol = await erc20.symbol()
        const allowance: BigNumber = await erc20.allowance(safeAddress, spender)
        const allowanceEntry: AllowanceEntry = {
            id: token + spender,
            tokenAddress: token,
            symbol: symbol,
            spender: spender,
            allowance: allowance,
        }
        onAddEntryClick(allowanceEntry)
    }

    return (
        <Container>
            <TextField helperText="Token address (eg.: 0x0..)" onChange={e => setToken(e.target.value)} error={isError}></TextField>
            <TextField helperText="Token spender address (eg.: 0x0..)" onChange={e => setSpender(e.target.value)} error={isSpenderError}></TextField>
            <Button size="lg" color="secondary" onClick={() => addAllowance()}>Add</Button>
        </Container >
    )
}

export default AddAllowanceForm