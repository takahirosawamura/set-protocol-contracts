import * as _ from "lodash";
import * as LogUtils from "../logs";
import { BigNumber } from "bignumber.js";

import { Address, Log, UInt } from "../../../types/common";

interface CreateLogArgs {
   _setTokenAddress: Address;
   _factoryAddress: Address;
   _components: Address[];
   _units: BigNumber[];
   _naturalUnit: BigNumber;
   _name: string;
   _symbol: string;
}

export function SetTokenCreated(
   _coreAddress: Address,
   _setTokenAddress: Address,
   _factoryAddress: Address,
   _components: Address[],
   _units: BigNumber[],
   _naturalUnit: BigNumber,
   _name: string,
   _symbol: string,
): Log {
  return {
    event: "SetTokenCreated",
    address: _coreAddress,
    args: {
      _setTokenAddress,
     _factoryAddress,
     _components,
     _units,
     _naturalUnit,
     _name,
     _symbol,
    },
  };
}

export function IssuanceComponentDeposited(
  _coreAddress: Address,
  _setToken: Address,
  _component: Address,
  _quantity: BigNumber,
): Log {
  return {
    event: "IssuanceComponentDeposited",
    address: _coreAddress,
    args: {
      _setToken,
      _component,
      _quantity
    },
  }
}

export function ExchangeRegistered(
  _coreAddress: Address,
  _exchangeId: UInt,
  _exchange: Address,
): Log {
  return {
    event: "ExchangeRegistered",
    address: _coreAddress,
    args: {
      _exchangeId,
      _exchange
    },
  }
}

export function extractNewSetTokenAddressFromLogs(
  logs: Log[],
): Address {
  const createLog = logs[logs.length - 1];
  const args: CreateLogArgs = createLog.args;
  return args._setTokenAddress;
};
