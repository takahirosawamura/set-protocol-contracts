import { BigNumber } from "bignumber.js";
import { ether, gWei } from "../utils/units";
import { Address, UInt } from "../../types/common.js";

export const DEFAULT_GAS = 10000000;
export const DEFAULT_MOCK_TOKEN_DECIMALS = 18;
export const INVALID_OPCODE = "invalid opcode";
export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
export const REVERT_ERROR = "revert";
export const DEPLOYED_TOKEN_QUANTITY: BigNumber = ether(100000000000);
export const STANDARD_QUANTITY_ISSUED: BigNumber = ether(10);
export const STANDARD_NATURAL_UNIT = ether(1);
export const STANDARD_COMPONENT_UNIT = ether(1);
export const UNLIMITED_ALLOWANCE_IN_BASE_UNITS = new BigNumber(2).pow(256).minus(1);
export const MAX_DIGITS_IN_UNSIGNED_256_INT = 78;

export const ZERO: BigNumber = new BigNumber(0);
export const ONE: BigNumber = new BigNumber(1);

export const EXCHANGES = {
  ZERO_EX: 1,
  KYBER: 2,
  TAKER_WALLET: 3,
}

export const PRIVATE_KEYS = [
  "767df558efc63b6ba9a9257e68509c38f5c48d5938a41ab191a9a073ebff7c4f",
  "6dc5d3331608e4b99b68dd8b9dee89973ebc6feee1cb0ba9a2ec814a99c680c1",
  "2b73a8e22d40615e0144bee14c5f80668c449029d9f60eba71b800f0979337af",
  "95fab20a86f7aa81c47854e3a0d265014359d557027c3e07c64dbac9f66b0930",
  "b8400424887469943ca6e4448596a709c64ad768600e9c24538fda6c8f5d1599",
  "737392faafc4b9fa8861ec0dfb1e3a01e383e270331faa25f28fb40866740046",
  "92c0c7a1aba1e59f1f97af9a482649a4196b2b766f794b85bebcefeac8b80e30",
  "05973025898f0c1c1c723545630ecd251c42297d8db665aec245526022d82a98",
  "84f5e4921ea1ee2e53e2713bd5170877635c168d0fdab8044f15b835020f1f6c",
  "b17ee27cba4f656d8cd13165ba9fdfa79abf5308253c75654030d360f1e65329",
  "55d6cb34052149b6a93624bbfd1a277a37e352f34e16bc405054adf42b6eab18",
  "cc87c4b4d1665092048511f0318755884771d498f79d29aa78b341a3f058f4c6",
  "8884500103a7809924cbb5b6e7c1f8b9e27e7b6da839935f221406e02a954293",
  "0a44845c2b09e9f942578f7dd960653595c152e558dbf7fb40bd85e918dd565f",
  "843445407853ed9455b0b3511b50dc11a5c329746abbed08c95582b895c450a9",
]
