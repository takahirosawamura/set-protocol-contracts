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
export const MAX_UINT256 = new BigNumber(2).pow(256).minus(1);
export const MAX_DIGITS_IN_UNSIGNED_256_INT = 78;

export const ZERO: BigNumber = new BigNumber(0);
export const ONE: BigNumber = new BigNumber(1);

export const EXCHANGES = {
  ZERO_EX: 1,
  KYBER: 2,
  TAKER_WALLET: 3,
}

export const PRIVATE_KEYS = [
  "0xf2f48ee19680706196e2e339e5da3491186e0c4c5030670656b0e0164837257d",
  "0x5d862464fe9303452126c8bc94274b8c5f9874cbd219789b3eb2128075a76f72",
  "0xdf02719c4df8b9b8ac7f551fcb5d9ef48fa27eef7a66453879f4d8fdc6e78fb1",
  "0xff12e391b79415e941a94de3bf3a9aee577aed0731e297d5cfa0b8a1e02fa1d0",
  "0x752dd9cf65e68cfaba7d60225cbdbc1f4729dd5e5507def72815ed0d8abc6249",
  "0xefb595a0178eb79a8df953f87c5148402a224cdf725e88c0146727c6aceadccd",
  "0x83c6d2cc5ddcf9711a6d59b417dc20eb48afd58d45290099e5987e3d768f328f",
  "0xbb2d3f7c9583780a7d3904a2f55d792707c345f21de1bacb2d389934d82796b2",
  "0xb2fd4d29c1390b71b8795ae81196bfd60293adf99f9d32a0aff06288fcdac55f",
  "0x23cb7121166b9a2f93ae0b7c05bde02eae50d64449b2cbb42bc84e9d38d6cc89",
  "0x5ad34d7f8704ed33ab9e8dc30a76a8c48060649204c1f7b21b973235bba8092f",
  "0xf18b03c1ae8e3876d76f20c7a5127a169dd6108c55fe9ce78bc7a91aca67dee3",
  "0x4ccc4e7d7843e0701295e8fd671332a0e2f1e92d0dab16e8792e91cb0b719c9d",
  "0xd7638ae813450e710e6f1b09921cc1593181073ce2099fb418fc03a933c7f41f",
  "0xbc7bbca8ca15eb567be60df82e4452b13072dcb60db89747e3c85df63d8270ca",
];

// https://blog.0xproject.com/0x-v2-deployed-on-kovan-first-audit-begins-404567b27742
// To test, we use a number of deployed 0x from a snapshot
/**
    Exchange: 0x48bacb9266a570d521063ef5dd96e61686dbe788
    ERC20Proxy: 0x1dc4c1cefef38a777b15aa20260a54e584b16c48
    ERC721Proxy: 0x1d7022f5b17d2f8b695918fb48fa1089c9f85401
    ZRXToken: 0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c
    AssetProxyOwner: 0x34d402f14d58e001d8efbe6585051bf9706aa064
    WETH9: 0x0b1ba0af832d7c05fd64161e0db78e85978e8082
**/
export const ZERO_EX_ADDRESSES = {
  EXCHANGE: "0x48bacb9266a570d521063ef5dd96e61686dbe788",
  ERC20_PROXY: "0x1dc4c1cefef38a777b15aa20260a54e584b16c48",
}