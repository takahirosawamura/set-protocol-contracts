import * as _ from "lodash";
import * as ethUtil from "ethereumjs-util";
import * as Web3 from "web3";
const web3 = new Web3();

import { BigNumber } from "bignumber.js";
import { Address, Bytes32, Bytes, UInt } from "../../types/common.js";
import { ZeroExOrder, ZeroExSignature, ZeroExOrderHeader } from "../../types/zeroEx";

function bufferAndLPad32(input: any): Buffer {
  return ethUtil.setLengthLeft(ethUtil.toBuffer(input), 32);
}

export function generateStandardZeroExOrderBytesArray(
    zeroExOrder: ZeroExOrder,
    signature: ZeroExSignature,
    fillAmount: UInt,
): Bytes {
  const { makerAssetData, takerAssetData } = zeroExOrder;

  const makerAssetDataLength = makerAssetData.slice(2).length / 2;
  const takerAssetDataLength = takerAssetData.slice(2).length / 2;

  // Get signature length
  const signatureLength: UInt = new BigNumber(signature.length);
  
  // Get order length   
  const zeroExOrderBuffer = bufferZeroExOrder(zeroExOrder);
  const zeroExOrderLength = getZeroExOrderLengthFromBuffer(zeroExOrderBuffer);

  // Generate the standard byte array
  return bufferArrayToHex(
    bufferOrderHeader(
      signatureLength,
      zeroExOrderLength,
      makerAssetDataLength,
      takerAssetDataLength,
    )
    .concat(bufferFillAmount(fillAmount))
    .concat(bufferSignature(signature))
    .concat(zeroExOrderBuffer)
  );
}

export function getZeroExOrderLengthFromBuffer(
    zeroExOrder: Buffer[],
): BigNumber {
    return new BigNumber(Buffer.concat(zeroExOrder).length);
}

export function bufferZeroExOrder(
  order: ZeroExOrder,
): Buffer[] {
  return [
      bufferAndLPad32(order.makerAddress),
      bufferAndLPad32(order.takerAddress),
      bufferAndLPad32(order.feeRecipientAddress),
      bufferAndLPad32(order.senderAddress),
      bufferAndLPad32(web3.toHex(order.makerAssetAmount)),
      bufferAndLPad32(web3.toHex(order.takerAssetAmount)),
      bufferAndLPad32(web3.toHex(order.makerFee)),
      bufferAndLPad32(web3.toHex(order.takerFee)),
      bufferAndLPad32(web3.toHex(order.expirationTimeSeconds)),
      bufferAndLPad32(web3.toHex(order.salt)),
      // For some reason, the ETH Utils function buffers things incorrectly
      // So we use a native JS buffer
      Buffer.from(order.makerAssetData.slice(2), 'hex'),
      Buffer.from(order.takerAssetData.slice(2), 'hex')
  ];
}

function bufferOrderHeader(
  signatureLength: UInt,
  orderLength: UInt,
  makerAssetDataLength: UInt,
  takerAssetDataLength: UInt,
): Buffer[] {
    return [
      bufferAndLPad32(web3.toHex(signatureLength)),
      bufferAndLPad32(web3.toHex(orderLength)),
      bufferAndLPad32(web3.toHex(makerAssetDataLength)),
      bufferAndLPad32(web3.toHex(takerAssetDataLength)),
    ];
}

function bufferFillAmount(
  fillAmount: UInt = 0,
): Buffer[] {
    return [bufferAndLPad32(web3.toHex(fillAmount))];
}

function bufferSignature(
  signature: Bytes32 = '',
): Buffer[] {
    return [ethUtil.toBuffer(signature)];
}

export function bufferArrayToHex(
  bufferArr: Buffer[]
): Bytes {
    const buffer = Buffer.concat(bufferArr);
    return ethUtil.bufferToHex(buffer);
}


