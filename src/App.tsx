import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button, FixedDialog, Loader, Table, Title } from '@gnosis.pm/safe-react-components';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import ERC20Abi from "./abis/erc20.json"
import { Contract, ethers } from 'ethers';
import AddErc20TokenForm from './AddErc20Token';
import TokenInfo from './TokenInfo';

const Container = styled.form`
  margin-bottom: 2rem;
  width: 100%;
  max-width: 480px;

  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`;

const GNO_ADDRESS = "0x996f6e3e97c97b2eff6ad44a40187bc6a718ce4a"


const App: React.FC = () => {
  const { sdk, safe } = useSafeAppsSDK();
  const web3Provider = useMemo(() => new ethers.providers.Web3Provider(new SafeAppProvider(safe, sdk)), [sdk, safe]);
  const gno = useMemo(() => new ethers.Contract(GNO_ADDRESS, ERC20Abi, web3Provider), [web3Provider]);
  const [tokens, setTokenList] = useState<TokenInfo[]>([])

  const onAddTokenClick = async (token: TokenInfo) => {
    setTokenList(old => [...old, token])
  }

  const [symbol, setSymbol] = useState("")

  const getData = useCallback(async () => {
    const symbol = await gno.symbol()
    setSymbol(symbol)
  }, [safe, gno])

  React.useEffect(() => {
    getData()
  })

  return (
    <Container>
      <Title size="md">{safe.safeAddress}</Title>
      <Title size="md">{symbol}</Title>
      <AddErc20TokenForm web3Provider={web3Provider} onAddTokenClick={onAddTokenClick} />
      <table>
        {tokens.map((item =>
          <tr>{item.symbol}</tr>
        ))}
      </table>
    </Container>
  );
};

export default App;
