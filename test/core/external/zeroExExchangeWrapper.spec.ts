import * as chai from "chai";
import * as _ from "lodash";
import * as ethUtil from "ethereumjs-util";

import * as ABIDecoder from "abi-decoder";
import { BigNumber } from "bignumber.js";

// Types
import { Address, Bytes32, Log, UInt } from "../../../types/common.js";
import { ZeroExSignature, ZeroExOrderHeader, ZeroExOrder } from "../../../types/zeroEx";

// Contract types
import { CoreContract } from "../../../types/generated/core";
import { StandardTokenMockContract } from "../../../types/generated/standard_token_mock";
import { VaultContract } from "../../../types/generated/vault";
import { TransferProxyContract } from "../../../types/generated/transfer_proxy";
import { ZeroExExchangeWrapperContract } from "../../../types/generated/zero_ex_exchange_wrapper";

// Artifacts
const ZeroExExchangeWrapper = artifacts.require("ZeroExExchangeWrapper");

// Core wrapper
import { CoreWrapper } from "../../utils/coreWrapper";
import { ERC20Wrapper } from "../../utils/erc20Wrapper";

// https://blog.0xproject.com/0x-v2-deployed-on-kovan-first-audit-begins-404567b27742
// To test, we use a number of deployed 0x from a snapshot
import { ZERO_EX_ADDRESSES } from "../../utils/constants";

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
  const [ownerAccount, takerAddress, senderAddress] = accounts;
  
  let zeroExExchangeWrapper: ZeroExExchangeWrapperContract;
  let core: CoreContract;
  let vault: VaultContract;
  let transferProxy: TransferProxyContract;
  let makerToken: StandardTokenMockContract;
  let takerToken: StandardTokenMockContract;

  const coreWrapper = new CoreWrapper(ownerAccount, ownerAccount);
  const erc20Wrapper = new ERC20Wrapper(ownerAccount);


  beforeEach(async () => {
    core = await coreWrapper.deployCoreAsync();
    transferProxy = await coreWrapper.deployTransferProxyAsync(vault.address);
    await coreWrapper.addAuthorizationAsync(vault, core.address);
    await coreWrapper.addAuthorizationAsync(transferProxy, core.address);

    makerToken = await erc20Wrapper.deployTokenAsync(ownerAccount);
    takerToken = await erc20Wrapper.deployTokenAsync(takerAddress);

    const zeroExExchangeWrapperInstance = await ZeroExExchangeWrapper.new(
      ZERO_EX_ADDRESSES.EXCHANGE,
      ZERO_EX_ADDRESSES.ERC20_PROXY,
      transferProxy.address,
      { from: ownerAccount, gas: DEFAULT_GAS },
    );

    zeroExExchangeWrapper = new ZeroExExchangeWrapperContract(
      web3.eth.contract(zeroExExchangeWrapperInstance.abi).at(zeroExExchangeWrapperInstance.address),
      { from: ownerAccount },
    );
  });

  describe("#exchange", async () => {
    let orderData: any;

    async function subject(): Promise<string> {
      return zeroExExchangeWrapper.exchange.sendTransactionAsync(
        ownerAccount,
        orderData,
        { from: ownerAccount },
      );
    }

    it("should approve allowance of the 0x proxy if not sufficient", async () => {
      // Check the allowance of the maker token to the zeroEx proxy
    });

  });
});
