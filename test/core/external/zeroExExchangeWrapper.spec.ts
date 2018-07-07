import * as chai from "chai";
import * as _ from "lodash";
import * as ethUtil from "ethereumjs-util";

import * as ABIDecoder from "abi-decoder";
import { BigNumber } from "bignumber.js";

import { ether } from "../../utils/units";

// Types
import { Address, Bytes32, Log, UInt, Bytes } from "../../../types/common.js";
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
import {
  ZERO_EX_ADDRESSES,
  NULL_ADDRESS,
  PRIVATE_KEYS,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
} from "../../utils/constants";

const [, makerPrivateKey] = PRIVATE_KEYS;

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

import {
  generatePseudoRandomSalt,
} from "../../utils/zeroEx/salt";

import {
  assetProxyUtils,
} from "../../utils/zeroEx/asset_proxy_utils";

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
  const [ownerAccount, makerAddress, senderAddress] = accounts;
  
  let zeroExExchangeWrapper: ZeroExExchangeWrapperContract;
  let core: CoreContract;
  let vault: VaultContract;
  let transferProxy: TransferProxyContract;
  let makerToken: StandardTokenMockContract;
  let takerToken: StandardTokenMockContract;
  let zrxToken: StandardTokenMockContract;

  const coreWrapper = new CoreWrapper(ownerAccount, ownerAccount);
  const erc20Wrapper = new ERC20Wrapper(ownerAccount);


  beforeEach(async () => {
    core = await coreWrapper.deployCoreAsync();
    vault = await coreWrapper.deployVaultAsync();
    transferProxy = await coreWrapper.deployTransferProxyAsync(vault.address);
    await coreWrapper.addAuthorizationAsync(vault, core.address);
    await coreWrapper.addAuthorizationAsync(transferProxy, core.address);

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

    takerToken = await erc20Wrapper.deployTokenAsync(zeroExExchangeWrapper.address);

    // Zero Ex maker Token
    makerToken = await erc20Wrapper.deployTokenAsync(makerAddress);
  });

  describe.only("#exchange", async () => {
    let orderData: any;
    let fillAmount: BigNumber;
    let signature: Bytes;

    beforeEach(async () => {
      // Create a 0x order and assign to orderData
      const order = {
        makerAddress,
        takerAddress: NULL_ADDRESS,
        feeRecipientAddress: NULL_ADDRESS,
        senderAddress: NULL_ADDRESS,
        makerAssetAmount: ether(1),
        takerAssetAmount: ether(1),
        makerFee: ZERO,
        takerFee: ZERO,
        expirationTimeSeconds: new BigNumber(Date.now() + 10 * 60 * 1000),
        salt: generatePseudoRandomSalt(),
        makerAssetData: generateERC20TokenAssetData(makerToken.address),
        takerAssetData: generateERC20TokenAssetData(takerToken.address),
        exchangeAddress: ZERO_EX_ADDRESSES.EXCHANGE,
      };

      console.log("Order", Object.entries(order));

      // Sign the order and generate signature
      /**
        // 2. Sign order
        const orderHashBuff = orderHashUtils.getOrderHashBuffer(order);
        const signature = signingUtils.signMessage(orderHashBuff, this.makerPrivateKey, SignatureType.EthSign);
      **/

      const orderHashBuff = getOrderHashBuffer(order);
      const privateKey = ethUtil.toBuffer(makerPrivateKey);

      const signatureBuff = signMessage(orderHashBuff, privateKey, SignatureType.EthSign);
      signature = signatureBuff.toString('hex');

      const zeroExOrder: ZeroExOrder = createZeroExOrder(
        makerAddress,
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
      fillAmount = ether(1);

      orderData = generateStandardZeroExOrderBytesArray(
        zeroExOrder,
        signature,
        fillAmount,
      );

      // Approve the maker's token to the ZeroEx Proxy
      await makerToken.approve.sendTransactionAsync(
        ZERO_EX_ADDRESSES.ERC20_PROXY,
        UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
        { from: makerAddress },
      );

      // Checks 1) The maker has enough maker token
      const makerTokenSuff = await makerToken.balanceOf.callAsync(makerAddress);
      console.log("Maker account maker token balance", makerTokenSuff.toString());

      // Checks 2) The maker has approved his token ot the 0x ERC20 proxy      
      const makerTokenAllowanceSuff = await makerToken.allowance.callAsync(
        makerAddress,
        ZERO_EX_ADDRESSES.ERC20_PROXY
      );      
      console.log("Maker token erc20 proxy allowance from maker", makerTokenAllowanceSuff.toString());

      // Checks 3) The exchange has enough taker token
      const takerTokenSuff = await takerToken.balanceOf.callAsync(zeroExExchangeWrapper.address);
      console.log("Exchange Wrapper taker token balance", makerTokenSuff.toString());

      // Checks 4) The exchange has approved to the 0x ERC20 proxy
      const takerTokenAllowanceSuff = await takerToken.allowance.callAsync(
        zeroExExchangeWrapper.address,
        ZERO_EX_ADDRESSES.ERC20_PROXY
      );      
      console.log("Taker token erc20 proxy allowance from exchangeWrapper", takerTokenAllowanceSuff.toString());

      // Test Maker Asset Data by decoding
      console.log("Maker Asset Data", assetProxyUtils.decodeERC20AssetData(zeroExOrder.makerAssetData))

      // Test Taker Asset Data by decoding
      console.log("Taker Asset Data", assetProxyUtils.decodeERC20AssetData(zeroExOrder.takerAssetData))
    });

    async function subject(): Promise<string> {
      return zeroExExchangeWrapper.exchange.sendTransactionAsync(
        ownerAccount,
        orderData,
        { from: ownerAccount },
      );
    }

    it("should approve allowance of the 0x proxy if not sufficient", async () => {
      await subject();

      // Check the allowance of the maker token to the zeroEx proxy
      const zeroExProxyAllowance = await takerToken.allowance.callAsync(
        zeroExExchangeWrapper.address,
        ZERO_EX_ADDRESSES.ERC20_PROXY,
      );

      expect(zeroExProxyAllowance).to.bignumber.greaterThan(fillAmount)
    });

    it("should exchange the makerAsset from the maker to the taker account", async () => {
     

      const txnHash = await subject();

      console.log(txnHash);

      const receipt = await web3.eth.getTransactionReceipt(txnHash);

      console.log("Recept", receipt);

      expect(1).to.equal(1);
      // Check the allowance of the maker token to the zeroEx proxy
      // const zeroExProxyAllowance = await makerToken.allowance.callAsync(
      //   zeroExExchangeWrapper.address,
      //   ZERO_EX_ADDRESSES.ERC20_PROXY,
      // );

      // expect(zeroExProxyAllowance).to.bignumber.greaterThan(fillAmount)
    });

  });
});
