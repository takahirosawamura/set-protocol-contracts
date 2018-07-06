import * as chai from "chai";
import * as _ from "lodash";
import * as ethUtil from "ethereumjs-util";

import * as ABIDecoder from "abi-decoder";
import { BigNumber } from "bignumber.js";

import { ether } from "../../utils/units";

// Types
import { Address, Bytes32, Log, UInt } from "../../../types/common.js";
import { ZeroExSignature, ZeroExOrderHeader, ZeroExOrder, SignatureType } from "../../../types/zeroEx";

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
import { ZERO_EX_ADDRESSES, NULL_ADDRESS, PRIVATE_KEYS } from "../../utils/constants";

const [ownerPrivateKey] = PRIVATE_KEYS;

import {
  bufferZeroExOrder,
  getZeroExOrderLengthFromBuffer,
  generateStandardZeroExOrderBytesArray,
} from "../../utils/zeroExExchangeWrapper";

import {
  createZeroExOrder,
  generateERC20TokenAssetData,
  getOrderHashBuffer,
  signMessage,
} from "../../utils/zeroExOrder";

// Testing Set up
import { BigNumberSetup } from "../../config/bigNumberSetup";
import ChaiSetup from "../../config/chaiSetup";
BigNumberSetup.configure();
ChaiSetup.configure();
const { expect, assert } = chai;

import {
  DEFAULT_GAS,
  ZERO,
  MAX_UINT256,
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
    vault = await coreWrapper.deployVaultAsync();
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

  describe.only("#exchange", async () => {
    let orderData: any;

    beforeEach(async () => {
      // Create a 0x order and assign to orderData
      const order = {
        makerAddress: ownerAccount,
        takerAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        senderAddress: NULL_ADDRESS,
        makerAssetAmount: ether(1),
        takerAssetAmount: ether(1),
        makerFee: ZERO,
        takerFee: ZERO,
        expirationTimeSeconds: MAX_UINT256,
        salt: ZERO,
        makerAssetData: generateERC20TokenAssetData(makerToken.address),
        takerAssetData: generateERC20TokenAssetData(takerToken.address),
        exchangeAddress: ZERO_EX_ADDRESSES.EXCHANGE,
      };

      // Sign the order and generate signature
      /**
        // 2. Sign order
        const orderHashBuff = orderHashUtils.getOrderHashBuffer(order);
        const signature = signingUtils.signMessage(orderHashBuff, this.makerPrivateKey, SignatureType.EthSign);
      **/

      const orderHashBuff = getOrderHashBuffer(order);
      const privateKey = ethUtil.toBuffer(ownerPrivateKey);

      const signatureBuff = signMessage(orderHashBuff, privateKey, SignatureType.EthSign);
      const signature = signatureBuff.toString('hex');

      const zeroExOrder: ZeroExOrder = createZeroExOrder(
        ownerAccount,
        NULL_ADDRESS,
        NULL_ADDRESS,
        NULL_ADDRESS,
        ether(1),
        ether(1),
        ZERO,
        ZERO,
        MAX_UINT256,
        ZERO,
        generateERC20TokenAssetData(makerToken.address),
        generateERC20TokenAssetData(takerToken.address),
      );

      // Decide on a fill Amount
      const fillAmount = ether(1);

      orderData = generateStandardZeroExOrderBytesArray(
        zeroExOrder,
        signature,
        fillAmount,
      );
    });

    async function subject(): Promise<string> {
      return zeroExExchangeWrapper.exchange.callAsync(
        ownerAccount,
        orderData,
        { from: ownerAccount },
      );
    }

    it("should approve allowance of the 0x proxy if not sufficient", async () => {
      
      console.log("ZeroExWrapper Contract address", zeroExExchangeWrapper.address);

      const result = await subject();
      console.log("Supposed msg.sender", result);

      expect(1).to.equal(1);

      // Check the allowance of the maker token to the zeroEx proxy

    });

  });
});
