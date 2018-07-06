import * as _ from "lodash";
import * as ethUtil from "ethereumjs-util";
import * as Web3 from "web3";
import { ECSignature } from '@0xproject/types';
const web3 = new Web3();

import { BigNumber } from "bignumber.js";
import { Address, Bytes32, Bytes, UInt } from "../../types/common.js";
import { SignatureType, ZeroExOrder, ZeroExSignature, ZeroExOrderHeader, Order } from "../../types/zeroEx";
import { EIP712Types, EIP712Schema } from "./zeroEx/types";
import { EIP712Utils } from "./zeroEx/eip712_utils";


export function createZeroExOrder(
  makerAddress: Address,
  takerAddress: Address,
  feeRecipientAddress: Address,
  senderAddress: Address,
  makerAssetAmount: UInt,
  takerAssetAmount: UInt,
  makerFee: UInt,
  takerFee: UInt,
  expirationTimeSeconds: UInt,
  salt: UInt,
  makerAssetData: Bytes,
  takerAssetData: Bytes,
): ZeroExOrder {
  return {
    makerAddress,
    takerAddress,
    feeRecipientAddress,
    senderAddress,
    makerAssetAmount,
    takerAssetAmount,
    makerFee,
    takerFee,
    expirationTimeSeconds,
    salt,
    makerAssetData,
    takerAssetData,
  }
}

export function generateERC20TokenAssetData(
  tokenAddress: Address,
): string {
  // The ERC20 asset data is always prefixed with 0xf47261b0
  // bytes4 ERC20_SELECTOR = bytes4(keccak256("ERC20Token(address)"));
  const erc20AssetSelector = "f47261b0";

  // Remove hex prefix and left pad to 32 bytes
  const moddedTokenAddress = tokenAddress.slice(2).padStart(64, "0");
  return `0x${erc20AssetSelector.concat(moddedTokenAddress)}`;
}


////////////////////////////////////////////////////////////////////////////////////////////////
/// Signing Utils
////////////////////////////////////////////////////////////////////////////////////////////////
export function signMessage(message: Buffer, privateKey: Buffer, signatureType: SignatureType): Buffer {
    if (signatureType === SignatureType.EthSign) {
        const prefixedMessage = ethUtil.hashPersonalMessage(message);
        const ecSignature = ethUtil.ecsign(prefixedMessage, privateKey);
        const signature = Buffer.concat([
            ethUtil.toBuffer(ecSignature.v),
            ecSignature.r,
            ecSignature.s,
            ethUtil.toBuffer(signatureType),
        ]);
        return signature;
    } else if (signatureType === SignatureType.EIP712) {
        const ecSignature = ethUtil.ecsign(message, privateKey);
        const signature = Buffer.concat([
            ethUtil.toBuffer(ecSignature.v),
            ecSignature.r,
            ecSignature.s,
            ethUtil.toBuffer(signatureType),
        ]);
        return signature;
    } else {
        throw new Error(`${signatureType} is not a valid signature type`);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////
/// ORDER HASH
/// https://github.com/0xProject/0x-monorepo/blob/v2-prototype/packages/order-utils/src/order_hash.ts
////////////////////////////////////////////////////////////////////////////////////////////////

const EIP712_ORDER_SCHEMA: EIP712Schema = {
    name: 'Order',
    parameters: [
        { name: 'makerAddress', type: EIP712Types.Address },
        { name: 'takerAddress', type: EIP712Types.Address },
        { name: 'feeRecipientAddress', type: EIP712Types.Address },
        { name: 'senderAddress', type: EIP712Types.Address },
        { name: 'makerAssetAmount', type: EIP712Types.Uint256 },
        { name: 'takerAssetAmount', type: EIP712Types.Uint256 },
        { name: 'makerFee', type: EIP712Types.Uint256 },
        { name: 'takerFee', type: EIP712Types.Uint256 },
        { name: 'expirationTimeSeconds', type: EIP712Types.Uint256 },
        { name: 'salt', type: EIP712Types.Uint256 },
        { name: 'makerAssetData', type: EIP712Types.Bytes },
        { name: 'takerAssetData', type: EIP712Types.Bytes },
    ],
};

export function getOrderHashBuffer(order: Order): Buffer {
    const orderParamsHashBuff = EIP712Utils.structHash(EIP712_ORDER_SCHEMA, order);
    const orderHashBuff = EIP712Utils.createEIP712Message(orderParamsHashBuff, order.exchangeAddress);
    return orderHashBuff;
}