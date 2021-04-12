import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Title } from '@gnosis.pm/safe-react-components';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import { BigNumber, ethers } from 'ethers';
import AddAllowanceForm from './AddErc20Token';
import AllowanceEntry from './AllowanceEntry';
import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk';

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


async function createAllowanceUpdateTx(tokenContract: ethers.Contract, allowance: BigNumber, spender: string): Promise<ethers.PopulatedTransaction> {
  const unsignedTx = await tokenContract.populateTransaction.approve(spender, allowance)
  return unsignedTx
}

async function executeTxs(txs: ethers.PopulatedTransaction[], safeSdk: SafeAppsSDK): Promise<string> {
  let transactions = txs.map(tx =>
  ({
    to: tx.to!,
    value: tx.value!.toHexString(),
    data: tx.value!.toHexString()
  }))
  const params = { safeTxGas: 500000 }

  const sendTx = await safeSdk.txs.send({ txs: transactions, params: params })
  return sendTx.safeTxHash
}

const App: React.FC = () => {
  const { sdk, safe } = useSafeAppsSDK();
  const web3Provider = useMemo(() => new ethers.providers.Web3Provider(new SafeAppProvider(safe, sdk)), [sdk, safe]);
  const [allowances, allowanceList] = useState<AllowanceEntry[]>([])

  const onAddTokenClick = async (token: AllowanceEntry) => {
    allowanceList(old => [...old, token])
  }

  return (
    <Container>
      <Title size="md">{safe.safeAddress}</Title>
      <AddAllowanceForm web3Provider={web3Provider} safeAddress={safe.safeAddress} onAddTokenClick={onAddTokenClick} />
      <table>
        <th>{["Token Symbol", "Spender", "Allowance", "Update"]}</th>
        {allowances.map((item =>
          <tr>{item.symbol}</tr>
        ))}
      </table>
    </Container>
  );
};

export default App;
