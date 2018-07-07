import { Address, Bytes, UInt } from "./common";
import { BigNumber } from "bignumber.js";

export interface ZeroExOrderHeader {
  signatureLength: UInt;
  orderLength: UInt;
  makerAssetDataLength: UInt;
  takerAssetDataLength: UInt;
}

export interface ZeroExOrder {
  makerAddress: Address;
  takerAddress: Address;
  feeRecipientAddress: Address;
  senderAddress: Address;
  makerAssetAmount: UInt;
  takerAssetAmount: UInt;
  makerFee: UInt;
  takerFee: UInt;
  expirationTimeSeconds: UInt;
  salt: UInt;
  makerAssetData: Bytes;
  takerAssetData: Bytes;
}

export type ZeroExSignature = string;

export enum SignatureType {
    Illegal = 0,
    Invalid = 1,
    EIP712 = 2,
    EthSign = 3,
    Caller = 4,
    Wallet = 5,
    Validator = 6,
    PreSigned = 7,
    Trezor = 8,
    NSignatureTypes = 9,
}

export interface Order {
    senderAddress: string;
    makerAddress: string;
    takerAddress: string;
    makerFee: BigNumber;
    takerFee: BigNumber;
    makerAssetAmount: BigNumber;
    takerAssetAmount: BigNumber;
    makerAssetData: string;
    takerAssetData: string;
    salt: BigNumber;
    exchangeAddress: string;
    feeRecipientAddress: string;
    expirationTimeSeconds: BigNumber;
}

export enum AssetProxyId {
    INVALID = '0x00000000',
    ERC20 = '0xf47261b0',
    ERC721 = '0x08e937fa',
}

export interface ERC20AssetData {
    assetProxyId: string;
    tokenAddress: string;
}

export interface ERC721AssetData {
    assetProxyId: string;
    tokenAddress: string;
    tokenId: BigNumber;
    receiverData: string;
}