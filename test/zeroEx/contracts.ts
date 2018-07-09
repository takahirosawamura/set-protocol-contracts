import { mnemonicWallet } from "../utils/zeroExSigning";

import { artifacts } from './artifacts';
import { ExchangeContract } from './exchange';

const NETWORK_ID = 50;
const RPC_URL = 'http://127.0.0.1:8545';

const Web3ProviderEngine = require('web3-provider-engine');
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc');

export const providerEngine = new Web3ProviderEngine();
providerEngine.addProvider(mnemonicWallet);
providerEngine.addProvider(new RpcSubprovider({ rpcUrl: RPC_URL }));
providerEngine.start();

// Create an Exchange Contract from the artifact output
export const exchangeContract = new ExchangeContract(
    artifacts.Exchange.compilerOutput.abi,
    artifacts.Exchange.networks[NETWORK_ID].address,
    providerEngine,
);