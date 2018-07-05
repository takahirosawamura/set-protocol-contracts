import * as chai from "chai";
import * as _ from "lodash";
import * as ethUtil from "ethereumjs-util";

import * as ABIDecoder from "abi-decoder";
import { BigNumber } from "bignumber.js";

// Types
import { Address, Bytes32, Log, UInt } from "../../../types/common.js";
import { ZeroExSignature, ZeroExOrderHeader, ZeroExOrder } from "../../../types/zeroEx";

// Contract types
import { ZeroExExchangeWrapperContract } from "../../../types/generated/zero_ex_exchange_wrapper";
import { CoreContract } from "../../../types/generated/core";
import { VaultContract } from "../../../types/generated/vault";
import { TransferProxyContract } from "../../../types/generated/transfer_proxy";

// Artifacts
const ZeroExExchangeWrapper = artifacts.require("ZeroExExchangeWrapper");

// Core wrapper
import { CoreWrapper } from "../../utils/coreWrapper";
import { ERC20Wrapper } from "../../utils/erc20Wrapper";

import {
  createZeroExOrder,
} from "../../utils/zeroExExchangeWrapper";

// Testing Set up
import { BigNumberSetup } from "../../config/bigNumberSetup";
import ChaiSetup from "../../config/chaiSetup";
BigNumberSetup.configure();
ChaiSetup.configure();
const { expect, assert } = chai;

import {
  DEFAULT_GAS,
} from "../../utils/constants";
 
contract("ZeroExExchangeWrapper", (accounts) => {
  const [ownerAccount, takerAddress, feeRecipientAddress, senderAddress] = accounts;
  let zeroExExchangeWrapper: ZeroExExchangeWrapperContract;

  let core: CoreContract;
  let vault: VaultContract;
  let transferProxy: TransferProxyContract;

  const coreWrapper = new CoreWrapper(ownerAccount, ownerAccount);
  const erc20Wrapper = new ERC20Wrapper(ownerAccount);


  beforeEach(async () => {
    core = await coreWrapper.deployCoreAsync();
    transferProxy = await coreWrapper.deployTransferProxyAsync(vault.address);
    await coreWrapper.addAuthorizationAsync(vault, core.address);
    await coreWrapper.addAuthorizationAsync(transferProxy, core.address);
    



    // Deploy a Zero Ex Exchange Mock or the whole shebang?

    // Deploy a Zero Ex ERC20 Asset Proxy



    const zeroExExchangeWrapperInstance = await ZeroExExchangeWrapper.new(
      { from: ownerAccount, gas: DEFAULT_GAS },
    );

    zeroExExchangeWrapper = new ZeroExExchangeWrapperContract(
      web3.eth.contract(zeroExExchangeWrapperInstance.abi).at(zeroExExchangeWrapperInstance.address),
      { from: ownerAccount },
    );
  });

  describe("#exchange", async () => {
    // Deploy a mock 0x exchange
    // Deploy a mock 0x proxy
  });
});
