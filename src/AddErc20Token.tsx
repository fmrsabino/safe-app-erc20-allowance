import { Button, Title } from "@gnosis.pm/safe-react-components"
import { ButtonBase, Container, TextField } from "@material-ui/core"
import { Contract, ethers } from "ethers"
import { useMemo, useState } from "react"
import ERC20Abi from "./abis/erc20.json"
import TokenInfo from "./TokenInfo"

interface Props {
    web3Provider: ethers.providers.Web3Provider
    onAddTokenClick: (erc20: TokenInfo) => {}
}

const AddErc20TokenForm: React.FC<Props> = ({ web3Provider, onAddTokenClick }) => {
    const [token, setToken] = useState<string>("")
    const [isError, setError] = useState<boolean>(false)

    const validateToken = async (tokenAddress: string) => {
        const erc20 = new ethers.Contract(token, ERC20Abi, web3Provider)
        if (!erc20) setError(true)
        const symbol = await erc20.symbol()
        const tokenInfo: TokenInfo = { address: tokenAddress, symbol: symbol }
        onAddTokenClick(tokenInfo)
    }

    return (
        <Container>
            <TextField helperText="Token address (eg.: 0x0..)" onChange={e => setToken(e.target.value)} error={isError}></TextField>
            <Button size="lg" color="secondary" onClick={() => validateToken(token)}>Add token</Button>
        </Container>
    )
}

export default AddErc20TokenForm