import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Title } from '@gnosis.pm/safe-react-components';
import { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import { BigNumber, ethers } from 'ethers';
import AddAllowanceForm from './AddAllowanceForm';
import AllowanceEntry from './AllowanceEntry';
import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk';
import { DataGrid, GridCellParams, GridRowId } from '@material-ui/data-grid';
import { Button, TextField } from '@material-ui/core';
import ERC20Abi from "./abis/erc20.json"

const Container = styled.form`
  margin-bottom: 2rem;
  width: 100%;
  height: 100%;
  max-width: 480px;

  display: grid;
  grid-template-columns: 1fr;
  grid-column-gap: 1rem;
  grid-row-gap: 1rem;
`;

const DAI_ADDRESS = "0x996f6e3e97c97b2eff6ad44a40187bc6a718ce4a"

async function createAllowanceUpdateTx(web3Provider: ethers.providers.Web3Provider, tokenAddress: string, allowance: BigNumber, spender: string): Promise<ethers.PopulatedTransaction> {
  const tokenContract = new ethers.Contract(tokenAddress, ERC20Abi, web3Provider)
  const unsignedTx = await tokenContract.populateTransaction.approve(spender, allowance)
  return unsignedTx
}

async function executeTxs(txs: ethers.PopulatedTransaction[], safeSdk: SafeAppsSDK): Promise<string> {
  let transactions = txs.map(tx =>
  ({
    to: tx.to!,
    value: tx.value?.toHexString() ?? "0x0",
    data: tx.data ?? "0x0"
  }))
  const params = { safeTxGas: 500000 }

  const sendTx = await safeSdk.txs.send({ txs: transactions, params: params })
  return sendTx.safeTxHash
}

const App: React.FC = () => {
  const columns = [
    { field: 'symbol', headerName: 'Symbol', flex: 1 },
    { field: 'tokenAddress', headerName: 'Token Address', flex: 1 },
    { field: 'spender', headerName: 'Spender Address', flex: 1 },
    {
      field: 'allowance', headerName: 'Allowance', flex: 1,
      renderCell: (params: GridCellParams) => (
        <TextField
          onChange={e => onAllowanceChange(params.id, e.target.value) }
          defaultValue={params.value}>
        </TextField>)
    },
  ]

  const { sdk, safe } = useSafeAppsSDK();
  const web3Provider = useMemo(() => new ethers.providers.Web3Provider(new SafeAppProvider(safe, sdk)), [sdk, safe]);
  const [allowances, setAllowanceList] = useState<AllowanceEntry[]>([])
  const [selectionModel, setSelectionModel] = React.useState<GridRowId[]>([])

  const onAddTokenClick = async (token: AllowanceEntry) => { setAllowanceList(old => [...old, token]) }

  const onClick = useCallback(async () => {
    console.log(allowances)
    const updatedAllowances = allowances.filter(allowance => selectionModel.includes(allowance.id))
    const txs = await Promise.all(updatedAllowances.map(allowance =>
      createAllowanceUpdateTx(web3Provider, allowance.tokenAddress, allowance.allowance, allowance.spender)
    ))
    const txHash = await executeTxs(txs, sdk)
    console.log(txHash)
  }, [allowances, selectionModel])

  const onAllowanceChange = async (id: GridRowId, value: string) => {
    const newAllowances = allowances.slice()
    const target = allowances.find(allowance => allowance.id == id)
    if (!target) return
    target.allowance = BigNumber.from(value)
    setAllowanceList(newAllowances)
  }

  return (
    <Container>
      <Title size="md">Safe Address: {safe.safeAddress}</Title>
      <AddAllowanceForm web3Provider={web3Provider} safeAddress={safe.safeAddress} onAddTokenClick={onAddTokenClick} />
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ flexGrow: 1 }}>
          <DataGrid
            isCellEditable={() => true}
            rows={allowances}
            columns={columns}
            checkboxSelection
            onSelectionModelChange={newSelection => setSelectionModel(newSelection.selectionModel) }
            selectionModel={selectionModel} />
        </div>
      </div>
      <Button variant="contained" color="primary" onClick={() => onClick()}>Update selected</Button>
    </Container>
  );
};

export default App;
