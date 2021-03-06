export const ZeroExOrderDataHandler = 
{
  "contractName": "ZeroExOrderDataHandler",
  "abi": [],
  "bytecode": "0x605a602c600b82828239805160001a60731460008114601c57601e565bfe5b5030600052607381538281f30073000000000000000000000000000000000000000030146080604052600080fd00a265627a7a72305820bec2d9213182a87bafe12373e4000b0cb4ef294e2723dfda1bb13143e2eeef686c6578706572696d656e74616cf50037",
  "deployedBytecode": "0x73000000000000000000000000000000000000000030146080604052600080fd00a265627a7a72305820bec2d9213182a87bafe12373e4000b0cb4ef294e2723dfda1bb13143e2eeef686c6578706572696d656e74616cf50037",
  "sourceMap": "1031:7122:8:-;;132:2:-1;166:7;155:9;146:7;137:37;252:7;246:14;243:1;238:23;232:4;229:33;270:1;265:20;;;;222:63;;265:20;274:9;222:63;;298:9;295:1;288:20;328:4;319:7;311:22;352:7;343;336:24",
  "deployedSourceMap": "1031:7122:8:-;;;;;;;;",
  "source": "/*\n    Copyright 2018 Set Labs Inc.\n\n    Licensed under the Apache License, Version 2.0 (the \"License\");\n    you may not use this file except in compliance with the License.\n    You may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n\n    Unless required by applicable law or agreed to in writing, software\n    distributed under the License is distributed on an \"AS IS\" BASIS,\n    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n    See the License for the specific language governing permissions and\n    limitations under the License.\n*/\n\npragma solidity 0.4.24;\npragma experimental \"ABIEncoderV2\";\n\nimport { SafeMath } from \"zeppelin-solidity/contracts/math/SafeMath.sol\";\nimport { LibBytes } from \"../../../external/0x/LibBytes.sol\";\nimport { LibOrder } from \"../../../external/0x/Exchange/libs/LibOrder.sol\";\n\n\n/**\n * @title ZeroExOrderDataHandler\n * @author Set Protocol\n *\n * This library contains functions and structs to assist with parsing exchange orders data\n */\nlibrary ZeroExOrderDataHandler {\n    using SafeMath for uint256;\n    using LibBytes for bytes;\n\n    // ============ Constants ============\n\n    bytes4 constant ERC20_SELECTOR = bytes4(keccak256(\"ERC20Token(address)\"));\n\n    string constant INVALID_TOKEN_ADDRESS = \"Address is not for ERC20 asset.\";\n\n    // ============ Structs ============\n\n    struct ZeroExHeader {\n        uint256 signatureLength;\n        uint256 orderLength;\n        uint256 makerAssetDataLength;\n        uint256 takerAssetDataLength;\n    }\n\n    struct AssetDataAddresses {\n        address makerTokenAddress;\n        address takerTokenAddress;\n    }\n\n    // ============ Internal Functions ============\n\n    // We construct the following to allow calling fillOrder on ZeroEx V2 Exchange\n    // The layout of this orderData is in the table below.\n    // \n    // | Section | Data                  | Offset              | Length          | Contents                      |\n    // |---------|-----------------------|---------------------|-----------------|-------------------------------|\n    // | Header  | signatureLength       | 0                   | 32              | Num Bytes of 0x Signature     |\n    // |         | orderLength           | 32                  | 32              | Num Bytes of 0x Order         |\n    // |         | makerAssetDataLength  | 64                  | 32              | Num Bytes of maker asset data |\n    // |         | takerAssetDataLength  | 96                  | 32              | Num Bytes of taker asset data |\n    // | Body    | fillAmount            | 128                 | 32              | taker asset fill amouint      |\n    // |         | signature             | 160                 | signatureLength | signature in bytes            |\n    // |         | order                 | 160+signatureLength | orderLength     | ZeroEx Order                  |\n\n    /*\n     * Parses the header of the orderData\n     * Can only be called by authorized contracts.\n     *\n     * @param  _orderData   \n     * @return ZeroExHeader\n     */\n    function parseOrderHeader(bytes _orderData)\n        internal\n        pure\n        returns (ZeroExHeader)\n    {\n        ZeroExHeader memory header;\n\n        uint256 orderDataAddr = _orderData.contentAddress();\n\n        assembly {\n            mstore(header,          mload(orderDataAddr)) // signatureLength\n            mstore(add(header, 32), mload(add(orderDataAddr, 32))) // orderLength\n            mstore(add(header, 64), mload(add(orderDataAddr, 64))) // makerAssetDataLength\n            mstore(add(header, 96), mload(add(orderDataAddr, 96))) // takerAssetDataLength\n        }\n\n        return header;\n    }\n\n    function parseFillAmount(bytes _orderData)\n        internal\n        pure\n        returns (uint256)\n    {\n        uint256 orderDataAddr = _orderData.contentAddress();\n        uint256 fillAmount;\n\n        assembly {\n            fillAmount := mload(add(orderDataAddr, 128))\n        }\n\n        return fillAmount;\n    }\n\n    function sliceSignature(bytes _orderData)\n        internal\n        pure\n        returns (bytes)\n    {\n        uint256 orderDataAddr = _orderData.contentAddress();\n        uint256 signatureLength;\n        assembly {\n            signatureLength := mload(orderDataAddr)\n        }\n\n        bytes memory signature = _orderData.slice(160, signatureLength.add(160));\n        return signature;\n    }\n\n    function sliceZeroExOrder(bytes _orderData, uint _signatureLength, uint _orderLength)\n        internal\n        pure\n        returns (bytes)\n    {\n        uint256 orderDataAddr = _orderData.contentAddress();\n        uint256 orderStartAddress = orderDataAddr.add(_signatureLength);\n        bytes memory order = _orderData.slice(\n            orderStartAddress,\n            orderStartAddress.add(_orderLength)\n        );\n        return order;\n    }\n\n    function constructZeroExOrder(\n        bytes _zeroExOrder,\n        uint _makerAssetDataLength,\n        uint _takerAssetDataLength\n    )\n        internal\n        pure\n        returns (LibOrder.Order memory)\n    {\n        LibOrder.Order memory order;\n        uint256 orderDataAddr = _zeroExOrder.contentAddress();\n\n        // | Data                       | Location | Length |\n        // |----------------------------|----------|--------|\n        // | maker                      | 0        |        |\n        // | taker                      | 32       |        |\n        // | feeRecipient               | 64       |        |\n        // | senderAddress              | 96       |        |\n        // | makerAssetAmount           | 128      |        |\n        // | takerAssetAmount           | 160      |        |\n        // | makerFee                   | 192      |        |\n        // | takerFee                   | 224      |        |\n        // | expirationUnixTimeStampSec | 256      |        |\n        // | salt                       | 288      |        |\n        // | makerAssetData             | 320      | **     |\n        // | takerAssetData             | 320 + ** | ***    |\n        // ** - Maker Asset Data Length\n        // *** - Taker Asset Data Length\n        assembly {\n            mstore(order,           mload(orderDataAddr))           // maker\n            mstore(add(order, 32),  mload(add(orderDataAddr, 32)))  // taker\n            mstore(add(order, 64),  mload(add(orderDataAddr, 64)))  // feeRecipient\n            mstore(add(order, 96),  mload(add(orderDataAddr, 96)))  // senderAddress\n            mstore(add(order, 128), mload(add(orderDataAddr, 128))) // makerAssetAmount\n            mstore(add(order, 160), mload(add(orderDataAddr, 160))) // takerAssetAmount\n            mstore(add(order, 192), mload(add(orderDataAddr, 192))) // makerFee\n            mstore(add(order, 224), mload(add(orderDataAddr, 224))) // takerFee\n            mstore(add(order, 256), mload(add(orderDataAddr, 256))) // expirationUnixTimestampSec\n            mstore(add(order, 288), mload(add(orderDataAddr, 288))) // salt\n        }\n\n        order.makerAssetData = _zeroExOrder.slice(320, _makerAssetDataLength.add(320));\n        order.takerAssetData = _zeroExOrder.slice(\n            _makerAssetDataLength.add(320),\n            _makerAssetDataLength.add(320).add(_takerAssetDataLength)\n        );\n\n        return order;       \n    }\n\n    function parseZeroExOrder(bytes _orderData)\n        internal\n        pure\n        returns(LibOrder.Order memory)\n    {\n        ZeroExHeader memory header = parseOrderHeader(_orderData);\n\n        LibOrder.Order memory order = constructZeroExOrder(\n            sliceZeroExOrder(_orderData, header.signatureLength, header.orderLength),\n            header.makerAssetDataLength,\n            header.takerAssetDataLength\n        );\n\n        return order;\n    }\n\n    function parseERC20TokenAddress(bytes _assetData)\n        internal\n        pure\n        returns(address)\n    {\n        // Ensure that the asset is ERC20\n        bytes4 assetType = _assetData.readBytes4(0);\n        require(\n            ERC20_SELECTOR == assetType,\n            INVALID_TOKEN_ADDRESS\n        );\n\n        address tokenAddress = address(_assetData.readBytes32(4));\n\n        return tokenAddress;\n    }\n}\n",
  "sourcePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/core/exchange-wrappers/lib/ZeroExOrderDataHandler.sol",
  "ast": {
    "absolutePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/core/exchange-wrappers/lib/ZeroExOrderDataHandler.sol",
    "exportedSymbols": {
      "ZeroExOrderDataHandler": [
        1404
      ]
    },
    "id": 1405,
    "nodeType": "SourceUnit",
    "nodes": [
      {
        "id": 1132,
        "literals": [
          "solidity",
          "0.4",
          ".24"
        ],
        "nodeType": "PragmaDirective",
        "src": "597:23:8"
      },
      {
        "id": 1133,
        "literals": [
          "experimental",
          "ABIEncoderV2"
        ],
        "nodeType": "PragmaDirective",
        "src": "621:35:8"
      },
      {
        "absolutePath": "zeppelin-solidity/contracts/math/SafeMath.sol",
        "file": "zeppelin-solidity/contracts/math/SafeMath.sol",
        "id": 1135,
        "nodeType": "ImportDirective",
        "scope": 1405,
        "sourceUnit": 6347,
        "src": "658:73:8",
        "symbolAliases": [
          {
            "foreign": 1134,
            "local": null
          }
        ],
        "unitAlias": ""
      },
      {
        "absolutePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/external/0x/LibBytes.sol",
        "file": "../../../external/0x/LibBytes.sol",
        "id": 1137,
        "nodeType": "ImportDirective",
        "scope": 1405,
        "sourceUnit": 4491,
        "src": "732:61:8",
        "symbolAliases": [
          {
            "foreign": 1136,
            "local": null
          }
        ],
        "unitAlias": ""
      },
      {
        "absolutePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/external/0x/Exchange/libs/LibOrder.sol",
        "file": "../../../external/0x/Exchange/libs/LibOrder.sol",
        "id": 1139,
        "nodeType": "ImportDirective",
        "scope": 1405,
        "sourceUnit": 4342,
        "src": "794:75:8",
        "symbolAliases": [
          {
            "foreign": 1138,
            "local": null
          }
        ],
        "unitAlias": ""
      },
      {
        "baseContracts": [],
        "contractDependencies": [],
        "contractKind": "library",
        "documentation": "@title ZeroExOrderDataHandler\n@author Set Protocol\n * This library contains functions and structs to assist with parsing exchange orders data",
        "fullyImplemented": true,
        "id": 1404,
        "linearizedBaseContracts": [
          1404
        ],
        "name": "ZeroExOrderDataHandler",
        "nodeType": "ContractDefinition",
        "nodes": [
          {
            "id": 1142,
            "libraryName": {
              "contractScope": null,
              "id": 1140,
              "name": "SafeMath",
              "nodeType": "UserDefinedTypeName",
              "referencedDeclaration": 6346,
              "src": "1074:8:8",
              "typeDescriptions": {
                "typeIdentifier": "t_contract$_SafeMath_$6346",
                "typeString": "library SafeMath"
              }
            },
            "nodeType": "UsingForDirective",
            "src": "1068:27:8",
            "typeName": {
              "id": 1141,
              "name": "uint256",
              "nodeType": "ElementaryTypeName",
              "src": "1087:7:8",
              "typeDescriptions": {
                "typeIdentifier": "t_uint256",
                "typeString": "uint256"
              }
            }
          },
          {
            "id": 1145,
            "libraryName": {
              "contractScope": null,
              "id": 1143,
              "name": "LibBytes",
              "nodeType": "UserDefinedTypeName",
              "referencedDeclaration": 4490,
              "src": "1106:8:8",
              "typeDescriptions": {
                "typeIdentifier": "t_contract$_LibBytes_$4490",
                "typeString": "library LibBytes"
              }
            },
            "nodeType": "UsingForDirective",
            "src": "1100:25:8",
            "typeName": {
              "id": 1144,
              "name": "bytes",
              "nodeType": "ElementaryTypeName",
              "src": "1119:5:8",
              "typeDescriptions": {
                "typeIdentifier": "t_bytes_storage_ptr",
                "typeString": "bytes"
              }
            }
          },
          {
            "constant": true,
            "id": 1152,
            "name": "ERC20_SELECTOR",
            "nodeType": "VariableDeclaration",
            "scope": 1404,
            "src": "1175:73:8",
            "stateVariable": true,
            "storageLocation": "default",
            "typeDescriptions": {
              "typeIdentifier": "t_bytes4",
              "typeString": "bytes4"
            },
            "typeName": {
              "id": 1146,
              "name": "bytes4",
              "nodeType": "ElementaryTypeName",
              "src": "1175:6:8",
              "typeDescriptions": {
                "typeIdentifier": "t_bytes4",
                "typeString": "bytes4"
              }
            },
            "value": {
              "argumentTypes": null,
              "arguments": [
                {
                  "argumentTypes": null,
                  "arguments": [
                    {
                      "argumentTypes": null,
                      "hexValue": "4552433230546f6b656e286164647265737329",
                      "id": 1149,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": true,
                      "kind": "string",
                      "lValueRequested": false,
                      "nodeType": "Literal",
                      "src": "1225:21:8",
                      "subdenomination": null,
                      "typeDescriptions": {
                        "typeIdentifier": "t_stringliteral_f47261b06eedbfce68afd46d0f3c27c60b03faad319eaf33103611cf8f6456ad",
                        "typeString": "literal_string \"ERC20Token(address)\""
                      },
                      "value": "ERC20Token(address)"
                    }
                  ],
                  "expression": {
                    "argumentTypes": [
                      {
                        "typeIdentifier": "t_stringliteral_f47261b06eedbfce68afd46d0f3c27c60b03faad319eaf33103611cf8f6456ad",
                        "typeString": "literal_string \"ERC20Token(address)\""
                      }
                    ],
                    "id": 1148,
                    "name": "keccak256",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 6893,
                    "src": "1215:9:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_function_sha3_pure$__$returns$_t_bytes32_$",
                      "typeString": "function () pure returns (bytes32)"
                    }
                  },
                  "id": 1150,
                  "isConstant": false,
                  "isLValue": false,
                  "isPure": true,
                  "kind": "functionCall",
                  "lValueRequested": false,
                  "names": [],
                  "nodeType": "FunctionCall",
                  "src": "1215:32:8",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  }
                }
              ],
              "expression": {
                "argumentTypes": [
                  {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  }
                ],
                "id": 1147,
                "isConstant": false,
                "isLValue": false,
                "isPure": true,
                "lValueRequested": false,
                "nodeType": "ElementaryTypeNameExpression",
                "src": "1208:6:8",
                "typeDescriptions": {
                  "typeIdentifier": "t_type$_t_bytes4_$",
                  "typeString": "type(bytes4)"
                },
                "typeName": "bytes4"
              },
              "id": 1151,
              "isConstant": false,
              "isLValue": false,
              "isPure": true,
              "kind": "typeConversion",
              "lValueRequested": false,
              "names": [],
              "nodeType": "FunctionCall",
              "src": "1208:40:8",
              "typeDescriptions": {
                "typeIdentifier": "t_bytes4",
                "typeString": "bytes4"
              }
            },
            "visibility": "internal"
          },
          {
            "constant": true,
            "id": 1155,
            "name": "INVALID_TOKEN_ADDRESS",
            "nodeType": "VariableDeclaration",
            "scope": 1404,
            "src": "1255:73:8",
            "stateVariable": true,
            "storageLocation": "default",
            "typeDescriptions": {
              "typeIdentifier": "t_string_memory",
              "typeString": "string"
            },
            "typeName": {
              "id": 1153,
              "name": "string",
              "nodeType": "ElementaryTypeName",
              "src": "1255:6:8",
              "typeDescriptions": {
                "typeIdentifier": "t_string_storage_ptr",
                "typeString": "string"
              }
            },
            "value": {
              "argumentTypes": null,
              "hexValue": "41646472657373206973206e6f7420666f722045524332302061737365742e",
              "id": 1154,
              "isConstant": false,
              "isLValue": false,
              "isPure": true,
              "kind": "string",
              "lValueRequested": false,
              "nodeType": "Literal",
              "src": "1295:33:8",
              "subdenomination": null,
              "typeDescriptions": {
                "typeIdentifier": "t_stringliteral_86bd15f736bfc35ffa26d5b270c6a610858a1cd544a317069255ba4a0f5dda71",
                "typeString": "literal_string \"Address is not for ERC20 asset.\""
              },
              "value": "Address is not for ERC20 asset."
            },
            "visibility": "internal"
          },
          {
            "canonicalName": "ZeroExOrderDataHandler.ZeroExHeader",
            "id": 1164,
            "members": [
              {
                "constant": false,
                "id": 1157,
                "name": "signatureLength",
                "nodeType": "VariableDeclaration",
                "scope": 1164,
                "src": "1407:23:8",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 1156,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "1407:7:8",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  }
                },
                "value": null,
                "visibility": "internal"
              },
              {
                "constant": false,
                "id": 1159,
                "name": "orderLength",
                "nodeType": "VariableDeclaration",
                "scope": 1164,
                "src": "1440:19:8",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 1158,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "1440:7:8",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  }
                },
                "value": null,
                "visibility": "internal"
              },
              {
                "constant": false,
                "id": 1161,
                "name": "makerAssetDataLength",
                "nodeType": "VariableDeclaration",
                "scope": 1164,
                "src": "1469:28:8",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 1160,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "1469:7:8",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  }
                },
                "value": null,
                "visibility": "internal"
              },
              {
                "constant": false,
                "id": 1163,
                "name": "takerAssetDataLength",
                "nodeType": "VariableDeclaration",
                "scope": 1164,
                "src": "1507:28:8",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 1162,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "1507:7:8",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  }
                },
                "value": null,
                "visibility": "internal"
              }
            ],
            "name": "ZeroExHeader",
            "nodeType": "StructDefinition",
            "scope": 1404,
            "src": "1377:165:8",
            "visibility": "public"
          },
          {
            "canonicalName": "ZeroExOrderDataHandler.AssetDataAddresses",
            "id": 1169,
            "members": [
              {
                "constant": false,
                "id": 1166,
                "name": "makerTokenAddress",
                "nodeType": "VariableDeclaration",
                "scope": 1169,
                "src": "1584:25:8",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_address",
                  "typeString": "address"
                },
                "typeName": {
                  "id": 1165,
                  "name": "address",
                  "nodeType": "ElementaryTypeName",
                  "src": "1584:7:8",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  }
                },
                "value": null,
                "visibility": "internal"
              },
              {
                "constant": false,
                "id": 1168,
                "name": "takerTokenAddress",
                "nodeType": "VariableDeclaration",
                "scope": 1169,
                "src": "1619:25:8",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_address",
                  "typeString": "address"
                },
                "typeName": {
                  "id": 1167,
                  "name": "address",
                  "nodeType": "ElementaryTypeName",
                  "src": "1619:7:8",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  }
                },
                "value": null,
                "visibility": "internal"
              }
            ],
            "name": "AssetDataAddresses",
            "nodeType": "StructDefinition",
            "scope": 1404,
            "src": "1548:103:8",
            "visibility": "public"
          },
          {
            "body": {
              "id": 1188,
              "nodeType": "Block",
              "src": "3177:500:8",
              "statements": [
                {
                  "assignments": [],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1177,
                      "name": "header",
                      "nodeType": "VariableDeclaration",
                      "scope": 1189,
                      "src": "3187:26:8",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                        "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader"
                      },
                      "typeName": {
                        "contractScope": null,
                        "id": 1176,
                        "name": "ZeroExHeader",
                        "nodeType": "UserDefinedTypeName",
                        "referencedDeclaration": 1164,
                        "src": "3187:12:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_ZeroExHeader_$1164_storage_ptr",
                          "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1178,
                  "initialValue": null,
                  "nodeType": "VariableDeclarationStatement",
                  "src": "3187:26:8"
                },
                {
                  "assignments": [
                    1180
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1180,
                      "name": "orderDataAddr",
                      "nodeType": "VariableDeclaration",
                      "scope": 1189,
                      "src": "3224:21:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1179,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "3224:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1184,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [],
                    "expression": {
                      "argumentTypes": [],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1181,
                        "name": "_orderData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1171,
                        "src": "3248:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1182,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "contentAddress",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4357,
                      "src": "3248:25:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$returns$_t_uint256_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory) pure returns (uint256)"
                      }
                    },
                    "id": 1183,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "3248:27:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "3224:51:8"
                },
                {
                  "externalReferences": [
                    {
                      "header": {
                        "declaration": 1177,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3316:6:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1180,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3339:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "header": {
                        "declaration": 1177,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3397:6:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1180,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3420:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "header": {
                        "declaration": 1177,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3479:6:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1180,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3502:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "header": {
                        "declaration": 1177,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3570:6:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1180,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3593:13:8",
                        "valueSize": 1
                      }
                    }
                  ],
                  "id": 1185,
                  "nodeType": "InlineAssembly",
                  "operations": "{\n    mstore(header, mload(orderDataAddr))\n    mstore(add(header, 32), mload(add(orderDataAddr, 32)))\n    mstore(add(header, 64), mload(add(orderDataAddr, 64)))\n    mstore(add(header, 96), mload(add(orderDataAddr, 96)))\n}",
                  "src": "3286:377:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1186,
                    "name": "header",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 1177,
                    "src": "3664:6:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                      "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader memory"
                    }
                  },
                  "functionReturnParameters": 1175,
                  "id": 1187,
                  "nodeType": "Return",
                  "src": "3657:13:8"
                }
              ]
            },
            "documentation": null,
            "id": 1189,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "parseOrderHeader",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 1172,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1171,
                  "name": "_orderData",
                  "nodeType": "VariableDeclaration",
                  "scope": 1189,
                  "src": "3094:16:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1170,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "3094:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "3093:18:8"
            },
            "payable": false,
            "returnParameters": {
              "id": 1175,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1174,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 1189,
                  "src": "3159:12:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                    "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader"
                  },
                  "typeName": {
                    "contractScope": null,
                    "id": 1173,
                    "name": "ZeroExHeader",
                    "nodeType": "UserDefinedTypeName",
                    "referencedDeclaration": 1164,
                    "src": "3159:12:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_ZeroExHeader_$1164_storage_ptr",
                      "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "3158:14:8"
            },
            "scope": 1404,
            "src": "3068:609:8",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 1208,
              "nodeType": "Block",
              "src": "3786:211:8",
              "statements": [
                {
                  "assignments": [
                    1197
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1197,
                      "name": "orderDataAddr",
                      "nodeType": "VariableDeclaration",
                      "scope": 1209,
                      "src": "3796:21:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1196,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "3796:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1201,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [],
                    "expression": {
                      "argumentTypes": [],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1198,
                        "name": "_orderData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1191,
                        "src": "3820:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1199,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "contentAddress",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4357,
                      "src": "3820:25:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$returns$_t_uint256_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory) pure returns (uint256)"
                      }
                    },
                    "id": 1200,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "3820:27:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "3796:51:8"
                },
                {
                  "assignments": [],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1203,
                      "name": "fillAmount",
                      "nodeType": "VariableDeclaration",
                      "scope": 1209,
                      "src": "3857:18:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1202,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "3857:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1204,
                  "initialValue": null,
                  "nodeType": "VariableDeclarationStatement",
                  "src": "3857:18:8"
                },
                {
                  "externalReferences": [
                    {
                      "fillAmount": {
                        "declaration": 1203,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3909:10:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1197,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3933:13:8",
                        "valueSize": 1
                      }
                    }
                  ],
                  "id": 1205,
                  "nodeType": "InlineAssembly",
                  "operations": "{\n    fillAmount := mload(add(orderDataAddr, 128))\n}",
                  "src": "3886:93:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1206,
                    "name": "fillAmount",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 1203,
                    "src": "3980:10:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "functionReturnParameters": 1195,
                  "id": 1207,
                  "nodeType": "Return",
                  "src": "3973:17:8"
                }
              ]
            },
            "documentation": null,
            "id": 1209,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "parseFillAmount",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 1192,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1191,
                  "name": "_orderData",
                  "nodeType": "VariableDeclaration",
                  "scope": 1209,
                  "src": "3708:16:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1190,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "3708:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "3707:18:8"
            },
            "payable": false,
            "returnParameters": {
              "id": 1195,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1194,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 1209,
                  "src": "3773:7:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 1193,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "3773:7:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "3772:9:8"
            },
            "scope": 1404,
            "src": "3683:314:8",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 1239,
              "nodeType": "Block",
              "src": "4103:291:8",
              "statements": [
                {
                  "assignments": [
                    1217
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1217,
                      "name": "orderDataAddr",
                      "nodeType": "VariableDeclaration",
                      "scope": 1240,
                      "src": "4113:21:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1216,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "4113:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1221,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [],
                    "expression": {
                      "argumentTypes": [],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1218,
                        "name": "_orderData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1211,
                        "src": "4137:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1219,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "contentAddress",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4357,
                      "src": "4137:25:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$returns$_t_uint256_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory) pure returns (uint256)"
                      }
                    },
                    "id": 1220,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "4137:27:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "4113:51:8"
                },
                {
                  "assignments": [],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1223,
                      "name": "signatureLength",
                      "nodeType": "VariableDeclaration",
                      "scope": 1240,
                      "src": "4174:23:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1222,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "4174:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1224,
                  "initialValue": null,
                  "nodeType": "VariableDeclarationStatement",
                  "src": "4174:23:8"
                },
                {
                  "externalReferences": [
                    {
                      "signatureLength": {
                        "declaration": 1223,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "4230:15:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1217,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "4255:13:8",
                        "valueSize": 1
                      }
                    }
                  ],
                  "id": 1225,
                  "nodeType": "InlineAssembly",
                  "operations": "{\n    signatureLength := mload(orderDataAddr)\n}",
                  "src": "4207:87:8"
                },
                {
                  "assignments": [
                    1227
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1227,
                      "name": "signature",
                      "nodeType": "VariableDeclaration",
                      "scope": 1240,
                      "src": "4289:22:8",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes_memory_ptr",
                        "typeString": "bytes"
                      },
                      "typeName": {
                        "id": 1226,
                        "name": "bytes",
                        "nodeType": "ElementaryTypeName",
                        "src": "4289:5:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_storage_ptr",
                          "typeString": "bytes"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1236,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "hexValue": "313630",
                        "id": 1230,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": true,
                        "kind": "number",
                        "lValueRequested": false,
                        "nodeType": "Literal",
                        "src": "4331:3:8",
                        "subdenomination": null,
                        "typeDescriptions": {
                          "typeIdentifier": "t_rational_160_by_1",
                          "typeString": "int_const 160"
                        },
                        "value": "160"
                      },
                      {
                        "argumentTypes": null,
                        "arguments": [
                          {
                            "argumentTypes": null,
                            "hexValue": "313630",
                            "id": 1233,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": true,
                            "kind": "number",
                            "lValueRequested": false,
                            "nodeType": "Literal",
                            "src": "4356:3:8",
                            "subdenomination": null,
                            "typeDescriptions": {
                              "typeIdentifier": "t_rational_160_by_1",
                              "typeString": "int_const 160"
                            },
                            "value": "160"
                          }
                        ],
                        "expression": {
                          "argumentTypes": [
                            {
                              "typeIdentifier": "t_rational_160_by_1",
                              "typeString": "int_const 160"
                            }
                          ],
                          "expression": {
                            "argumentTypes": null,
                            "id": 1231,
                            "name": "signatureLength",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 1223,
                            "src": "4336:15:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          "id": 1232,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "lValueRequested": false,
                          "memberName": "add",
                          "nodeType": "MemberAccess",
                          "referencedDeclaration": 6345,
                          "src": "4336:19:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_function_internal_pure$_t_uint256_$_t_uint256_$returns$_t_uint256_$bound_to$_t_uint256_$",
                            "typeString": "function (uint256,uint256) pure returns (uint256)"
                          }
                        },
                        "id": 1234,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "kind": "functionCall",
                        "lValueRequested": false,
                        "names": [],
                        "nodeType": "FunctionCall",
                        "src": "4336:24:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_rational_160_by_1",
                          "typeString": "int_const 160"
                        },
                        {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      ],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1228,
                        "name": "_orderData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1211,
                        "src": "4314:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1229,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "slice",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4489,
                      "src": "4314:16:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$_t_uint256_$returns$_t_bytes_memory_ptr_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory,uint256,uint256) pure returns (bytes memory)"
                      }
                    },
                    "id": 1235,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "4314:47:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_memory_ptr",
                      "typeString": "bytes memory"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "4289:72:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1237,
                    "name": "signature",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 1227,
                    "src": "4378:9:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_memory_ptr",
                      "typeString": "bytes memory"
                    }
                  },
                  "functionReturnParameters": 1215,
                  "id": 1238,
                  "nodeType": "Return",
                  "src": "4371:16:8"
                }
              ]
            },
            "documentation": null,
            "id": 1240,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "sliceSignature",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 1212,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1211,
                  "name": "_orderData",
                  "nodeType": "VariableDeclaration",
                  "scope": 1240,
                  "src": "4027:16:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1210,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "4027:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "4026:18:8"
            },
            "payable": false,
            "returnParameters": {
              "id": 1215,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1214,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 1240,
                  "src": "4092:5:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1213,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "4092:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "4091:7:8"
            },
            "scope": 1404,
            "src": "4003:391:8",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 1277,
              "nodeType": "Block",
              "src": "4544:300:8",
              "statements": [
                {
                  "assignments": [
                    1252
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1252,
                      "name": "orderDataAddr",
                      "nodeType": "VariableDeclaration",
                      "scope": 1278,
                      "src": "4554:21:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1251,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "4554:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1256,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [],
                    "expression": {
                      "argumentTypes": [],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1253,
                        "name": "_orderData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1242,
                        "src": "4578:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1254,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "contentAddress",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4357,
                      "src": "4578:25:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$returns$_t_uint256_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory) pure returns (uint256)"
                      }
                    },
                    "id": 1255,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "4578:27:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "4554:51:8"
                },
                {
                  "assignments": [
                    1258
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1258,
                      "name": "orderStartAddress",
                      "nodeType": "VariableDeclaration",
                      "scope": 1278,
                      "src": "4615:25:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1257,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "4615:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1263,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "id": 1261,
                        "name": "_signatureLength",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1244,
                        "src": "4661:16:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      ],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1259,
                        "name": "orderDataAddr",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1252,
                        "src": "4643:13:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "id": 1260,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "add",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 6345,
                      "src": "4643:17:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_uint256_$_t_uint256_$returns$_t_uint256_$bound_to$_t_uint256_$",
                        "typeString": "function (uint256,uint256) pure returns (uint256)"
                      }
                    },
                    "id": 1262,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "4643:35:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "4615:63:8"
                },
                {
                  "assignments": [
                    1265
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1265,
                      "name": "order",
                      "nodeType": "VariableDeclaration",
                      "scope": 1278,
                      "src": "4688:18:8",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes_memory_ptr",
                        "typeString": "bytes"
                      },
                      "typeName": {
                        "id": 1264,
                        "name": "bytes",
                        "nodeType": "ElementaryTypeName",
                        "src": "4688:5:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_storage_ptr",
                          "typeString": "bytes"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1274,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "id": 1268,
                        "name": "orderStartAddress",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1258,
                        "src": "4739:17:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      {
                        "argumentTypes": null,
                        "arguments": [
                          {
                            "argumentTypes": null,
                            "id": 1271,
                            "name": "_orderLength",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 1246,
                            "src": "4792:12:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          }
                        ],
                        "expression": {
                          "argumentTypes": [
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          ],
                          "expression": {
                            "argumentTypes": null,
                            "id": 1269,
                            "name": "orderStartAddress",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 1258,
                            "src": "4770:17:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          "id": 1270,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "lValueRequested": false,
                          "memberName": "add",
                          "nodeType": "MemberAccess",
                          "referencedDeclaration": 6345,
                          "src": "4770:21:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_function_internal_pure$_t_uint256_$_t_uint256_$returns$_t_uint256_$bound_to$_t_uint256_$",
                            "typeString": "function (uint256,uint256) pure returns (uint256)"
                          }
                        },
                        "id": 1272,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "kind": "functionCall",
                        "lValueRequested": false,
                        "names": [],
                        "nodeType": "FunctionCall",
                        "src": "4770:35:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        },
                        {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      ],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1266,
                        "name": "_orderData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1242,
                        "src": "4709:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1267,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "slice",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4489,
                      "src": "4709:16:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$_t_uint256_$returns$_t_bytes_memory_ptr_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory,uint256,uint256) pure returns (bytes memory)"
                      }
                    },
                    "id": 1273,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "4709:106:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_memory_ptr",
                      "typeString": "bytes memory"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "4688:127:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1275,
                    "name": "order",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 1265,
                    "src": "4832:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_memory_ptr",
                      "typeString": "bytes memory"
                    }
                  },
                  "functionReturnParameters": 1250,
                  "id": 1276,
                  "nodeType": "Return",
                  "src": "4825:12:8"
                }
              ]
            },
            "documentation": null,
            "id": 1278,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "sliceZeroExOrder",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 1247,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1242,
                  "name": "_orderData",
                  "nodeType": "VariableDeclaration",
                  "scope": 1278,
                  "src": "4426:16:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1241,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "4426:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 1244,
                  "name": "_signatureLength",
                  "nodeType": "VariableDeclaration",
                  "scope": 1278,
                  "src": "4444:21:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 1243,
                    "name": "uint",
                    "nodeType": "ElementaryTypeName",
                    "src": "4444:4:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 1246,
                  "name": "_orderLength",
                  "nodeType": "VariableDeclaration",
                  "scope": 1278,
                  "src": "4467:17:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 1245,
                    "name": "uint",
                    "nodeType": "ElementaryTypeName",
                    "src": "4467:4:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "4425:60:8"
            },
            "payable": false,
            "returnParameters": {
              "id": 1250,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1249,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 1278,
                  "src": "4533:5:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1248,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "4533:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "4532:7:8"
            },
            "scope": 1404,
            "src": "4400:444:8",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 1335,
              "nodeType": "Block",
              "src": "5060:2214:8",
              "statements": [
                {
                  "assignments": [],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1292,
                      "name": "order",
                      "nodeType": "VariableDeclaration",
                      "scope": 1336,
                      "src": "5070:27:8",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                        "typeString": "struct LibOrder.Order"
                      },
                      "typeName": {
                        "contractScope": null,
                        "id": 1291,
                        "name": "LibOrder.Order",
                        "nodeType": "UserDefinedTypeName",
                        "referencedDeclaration": 4333,
                        "src": "5070:14:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_Order_$4333_storage_ptr",
                          "typeString": "struct LibOrder.Order"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1293,
                  "initialValue": null,
                  "nodeType": "VariableDeclarationStatement",
                  "src": "5070:27:8"
                },
                {
                  "assignments": [
                    1295
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1295,
                      "name": "orderDataAddr",
                      "nodeType": "VariableDeclaration",
                      "scope": 1336,
                      "src": "5107:21:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1294,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "5107:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1299,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [],
                    "expression": {
                      "argumentTypes": [],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1296,
                        "name": "_zeroExOrder",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1280,
                        "src": "5131:12:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1297,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "contentAddress",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4357,
                      "src": "5131:27:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$returns$_t_uint256_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory) pure returns (uint256)"
                      }
                    },
                    "id": 1298,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "5131:29:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "5107:53:8"
                },
                {
                  "externalReferences": [
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6150:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6173:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6231:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6254:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6308:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6331:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6653:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6392:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6477:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6415:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6565:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6588:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6500:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6911:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6934:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6733:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6676:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6813:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6756:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6836:13:8",
                        "valueSize": 1
                      }
                    }
                  ],
                  "id": 1300,
                  "nodeType": "InlineAssembly",
                  "operations": "{\n    mstore(order, mload(orderDataAddr))\n    mstore(add(order, 32), mload(add(orderDataAddr, 32)))\n    mstore(add(order, 64), mload(add(orderDataAddr, 64)))\n    mstore(add(order, 96), mload(add(orderDataAddr, 96)))\n    mstore(add(order, 128), mload(add(orderDataAddr, 128)))\n    mstore(add(order, 160), mload(add(orderDataAddr, 160)))\n    mstore(add(order, 192), mload(add(orderDataAddr, 192)))\n    mstore(add(order, 224), mload(add(orderDataAddr, 224)))\n    mstore(add(order, 256), mload(add(orderDataAddr, 256)))\n    mstore(add(order, 288), mload(add(orderDataAddr, 288)))\n}",
                  "src": "6120:868:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1312,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "lValueRequested": false,
                    "leftHandSide": {
                      "argumentTypes": null,
                      "expression": {
                        "argumentTypes": null,
                        "id": 1301,
                        "name": "order",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1292,
                        "src": "6983:5:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                          "typeString": "struct LibOrder.Order memory"
                        }
                      },
                      "id": 1303,
                      "isConstant": false,
                      "isLValue": true,
                      "isPure": false,
                      "lValueRequested": true,
                      "memberName": "makerAssetData",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4330,
                      "src": "6983:20:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes_memory",
                        "typeString": "bytes memory"
                      }
                    },
                    "nodeType": "Assignment",
                    "operator": "=",
                    "rightHandSide": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "hexValue": "333230",
                          "id": 1306,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": true,
                          "kind": "number",
                          "lValueRequested": false,
                          "nodeType": "Literal",
                          "src": "7025:3:8",
                          "subdenomination": null,
                          "typeDescriptions": {
                            "typeIdentifier": "t_rational_320_by_1",
                            "typeString": "int_const 320"
                          },
                          "value": "320"
                        },
                        {
                          "argumentTypes": null,
                          "arguments": [
                            {
                              "argumentTypes": null,
                              "hexValue": "333230",
                              "id": 1309,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "7056:3:8",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_320_by_1",
                                "typeString": "int_const 320"
                              },
                              "value": "320"
                            }
                          ],
                          "expression": {
                            "argumentTypes": [
                              {
                                "typeIdentifier": "t_rational_320_by_1",
                                "typeString": "int_const 320"
                              }
                            ],
                            "expression": {
                              "argumentTypes": null,
                              "id": 1307,
                              "name": "_makerAssetDataLength",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 1282,
                              "src": "7030:21:8",
                              "typeDescriptions": {
                                "typeIdentifier": "t_uint256",
                                "typeString": "uint256"
                              }
                            },
                            "id": 1308,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": false,
                            "lValueRequested": false,
                            "memberName": "add",
                            "nodeType": "MemberAccess",
                            "referencedDeclaration": 6345,
                            "src": "7030:25:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_function_internal_pure$_t_uint256_$_t_uint256_$returns$_t_uint256_$bound_to$_t_uint256_$",
                              "typeString": "function (uint256,uint256) pure returns (uint256)"
                            }
                          },
                          "id": 1310,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "kind": "functionCall",
                          "lValueRequested": false,
                          "names": [],
                          "nodeType": "FunctionCall",
                          "src": "7030:30:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_uint256",
                            "typeString": "uint256"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_rational_320_by_1",
                            "typeString": "int_const 320"
                          },
                          {
                            "typeIdentifier": "t_uint256",
                            "typeString": "uint256"
                          }
                        ],
                        "expression": {
                          "argumentTypes": null,
                          "id": 1304,
                          "name": "_zeroExOrder",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 1280,
                          "src": "7006:12:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes_memory_ptr",
                            "typeString": "bytes memory"
                          }
                        },
                        "id": 1305,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "lValueRequested": false,
                        "memberName": "slice",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 4489,
                        "src": "7006:18:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$_t_uint256_$returns$_t_bytes_memory_ptr_$bound_to$_t_bytes_memory_ptr_$",
                          "typeString": "function (bytes memory,uint256,uint256) pure returns (bytes memory)"
                        }
                      },
                      "id": 1311,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "7006:55:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes_memory_ptr",
                        "typeString": "bytes memory"
                      }
                    },
                    "src": "6983:78:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_memory",
                      "typeString": "bytes memory"
                    }
                  },
                  "id": 1313,
                  "nodeType": "ExpressionStatement",
                  "src": "6983:78:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1331,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "lValueRequested": false,
                    "leftHandSide": {
                      "argumentTypes": null,
                      "expression": {
                        "argumentTypes": null,
                        "id": 1314,
                        "name": "order",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1292,
                        "src": "7071:5:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                          "typeString": "struct LibOrder.Order memory"
                        }
                      },
                      "id": 1316,
                      "isConstant": false,
                      "isLValue": true,
                      "isPure": false,
                      "lValueRequested": true,
                      "memberName": "takerAssetData",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4332,
                      "src": "7071:20:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes_memory",
                        "typeString": "bytes memory"
                      }
                    },
                    "nodeType": "Assignment",
                    "operator": "=",
                    "rightHandSide": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "arguments": [
                            {
                              "argumentTypes": null,
                              "hexValue": "333230",
                              "id": 1321,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "7152:3:8",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_320_by_1",
                                "typeString": "int_const 320"
                              },
                              "value": "320"
                            }
                          ],
                          "expression": {
                            "argumentTypes": [
                              {
                                "typeIdentifier": "t_rational_320_by_1",
                                "typeString": "int_const 320"
                              }
                            ],
                            "expression": {
                              "argumentTypes": null,
                              "id": 1319,
                              "name": "_makerAssetDataLength",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 1282,
                              "src": "7126:21:8",
                              "typeDescriptions": {
                                "typeIdentifier": "t_uint256",
                                "typeString": "uint256"
                              }
                            },
                            "id": 1320,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": false,
                            "lValueRequested": false,
                            "memberName": "add",
                            "nodeType": "MemberAccess",
                            "referencedDeclaration": 6345,
                            "src": "7126:25:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_function_internal_pure$_t_uint256_$_t_uint256_$returns$_t_uint256_$bound_to$_t_uint256_$",
                              "typeString": "function (uint256,uint256) pure returns (uint256)"
                            }
                          },
                          "id": 1322,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "kind": "functionCall",
                          "lValueRequested": false,
                          "names": [],
                          "nodeType": "FunctionCall",
                          "src": "7126:30:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_uint256",
                            "typeString": "uint256"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "arguments": [
                            {
                              "argumentTypes": null,
                              "id": 1328,
                              "name": "_takerAssetDataLength",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 1284,
                              "src": "7205:21:8",
                              "typeDescriptions": {
                                "typeIdentifier": "t_uint256",
                                "typeString": "uint256"
                              }
                            }
                          ],
                          "expression": {
                            "argumentTypes": [
                              {
                                "typeIdentifier": "t_uint256",
                                "typeString": "uint256"
                              }
                            ],
                            "expression": {
                              "argumentTypes": null,
                              "arguments": [
                                {
                                  "argumentTypes": null,
                                  "hexValue": "333230",
                                  "id": 1325,
                                  "isConstant": false,
                                  "isLValue": false,
                                  "isPure": true,
                                  "kind": "number",
                                  "lValueRequested": false,
                                  "nodeType": "Literal",
                                  "src": "7196:3:8",
                                  "subdenomination": null,
                                  "typeDescriptions": {
                                    "typeIdentifier": "t_rational_320_by_1",
                                    "typeString": "int_const 320"
                                  },
                                  "value": "320"
                                }
                              ],
                              "expression": {
                                "argumentTypes": [
                                  {
                                    "typeIdentifier": "t_rational_320_by_1",
                                    "typeString": "int_const 320"
                                  }
                                ],
                                "expression": {
                                  "argumentTypes": null,
                                  "id": 1323,
                                  "name": "_makerAssetDataLength",
                                  "nodeType": "Identifier",
                                  "overloadedDeclarations": [],
                                  "referencedDeclaration": 1282,
                                  "src": "7170:21:8",
                                  "typeDescriptions": {
                                    "typeIdentifier": "t_uint256",
                                    "typeString": "uint256"
                                  }
                                },
                                "id": 1324,
                                "isConstant": false,
                                "isLValue": false,
                                "isPure": false,
                                "lValueRequested": false,
                                "memberName": "add",
                                "nodeType": "MemberAccess",
                                "referencedDeclaration": 6345,
                                "src": "7170:25:8",
                                "typeDescriptions": {
                                  "typeIdentifier": "t_function_internal_pure$_t_uint256_$_t_uint256_$returns$_t_uint256_$bound_to$_t_uint256_$",
                                  "typeString": "function (uint256,uint256) pure returns (uint256)"
                                }
                              },
                              "id": 1326,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": false,
                              "kind": "functionCall",
                              "lValueRequested": false,
                              "names": [],
                              "nodeType": "FunctionCall",
                              "src": "7170:30:8",
                              "typeDescriptions": {
                                "typeIdentifier": "t_uint256",
                                "typeString": "uint256"
                              }
                            },
                            "id": 1327,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": false,
                            "lValueRequested": false,
                            "memberName": "add",
                            "nodeType": "MemberAccess",
                            "referencedDeclaration": 6345,
                            "src": "7170:34:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_function_internal_pure$_t_uint256_$_t_uint256_$returns$_t_uint256_$bound_to$_t_uint256_$",
                              "typeString": "function (uint256,uint256) pure returns (uint256)"
                            }
                          },
                          "id": 1329,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "kind": "functionCall",
                          "lValueRequested": false,
                          "names": [],
                          "nodeType": "FunctionCall",
                          "src": "7170:57:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_uint256",
                            "typeString": "uint256"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_uint256",
                            "typeString": "uint256"
                          },
                          {
                            "typeIdentifier": "t_uint256",
                            "typeString": "uint256"
                          }
                        ],
                        "expression": {
                          "argumentTypes": null,
                          "id": 1317,
                          "name": "_zeroExOrder",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 1280,
                          "src": "7094:12:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes_memory_ptr",
                            "typeString": "bytes memory"
                          }
                        },
                        "id": 1318,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "lValueRequested": false,
                        "memberName": "slice",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 4489,
                        "src": "7094:18:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$_t_uint256_$returns$_t_bytes_memory_ptr_$bound_to$_t_bytes_memory_ptr_$",
                          "typeString": "function (bytes memory,uint256,uint256) pure returns (bytes memory)"
                        }
                      },
                      "id": 1330,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "7094:143:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes_memory_ptr",
                        "typeString": "bytes memory"
                      }
                    },
                    "src": "7071:166:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_memory",
                      "typeString": "bytes memory"
                    }
                  },
                  "id": 1332,
                  "nodeType": "ExpressionStatement",
                  "src": "7071:166:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1333,
                    "name": "order",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 1292,
                    "src": "7255:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                      "typeString": "struct LibOrder.Order memory"
                    }
                  },
                  "functionReturnParameters": 1288,
                  "id": 1334,
                  "nodeType": "Return",
                  "src": "7248:12:8"
                }
              ]
            },
            "documentation": null,
            "id": 1336,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "constructZeroExOrder",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 1285,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1280,
                  "name": "_zeroExOrder",
                  "nodeType": "VariableDeclaration",
                  "scope": 1336,
                  "src": "4889:18:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1279,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "4889:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 1282,
                  "name": "_makerAssetDataLength",
                  "nodeType": "VariableDeclaration",
                  "scope": 1336,
                  "src": "4917:26:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 1281,
                    "name": "uint",
                    "nodeType": "ElementaryTypeName",
                    "src": "4917:4:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 1284,
                  "name": "_takerAssetDataLength",
                  "nodeType": "VariableDeclaration",
                  "scope": 1336,
                  "src": "4953:26:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 1283,
                    "name": "uint",
                    "nodeType": "ElementaryTypeName",
                    "src": "4953:4:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "4879:106:8"
            },
            "payable": false,
            "returnParameters": {
              "id": 1288,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1287,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 1336,
                  "src": "5033:14:8",
                  "stateVariable": false,
                  "storageLocation": "memory",
                  "typeDescriptions": {
                    "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                    "typeString": "struct LibOrder.Order"
                  },
                  "typeName": {
                    "contractScope": null,
                    "id": 1286,
                    "name": "LibOrder.Order",
                    "nodeType": "UserDefinedTypeName",
                    "referencedDeclaration": 4333,
                    "src": "5033:14:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_Order_$4333_storage_ptr",
                      "typeString": "struct LibOrder.Order"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "5032:23:8"
            },
            "scope": 1404,
            "src": "4850:2424:8",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 1369,
              "nodeType": "Block",
              "src": "7397:336:8",
              "statements": [
                {
                  "assignments": [
                    1344
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1344,
                      "name": "header",
                      "nodeType": "VariableDeclaration",
                      "scope": 1370,
                      "src": "7407:26:8",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                        "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader"
                      },
                      "typeName": {
                        "contractScope": null,
                        "id": 1343,
                        "name": "ZeroExHeader",
                        "nodeType": "UserDefinedTypeName",
                        "referencedDeclaration": 1164,
                        "src": "7407:12:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_ZeroExHeader_$1164_storage_ptr",
                          "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1348,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "id": 1346,
                        "name": "_orderData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1338,
                        "src": "7453:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      ],
                      "id": 1345,
                      "name": "parseOrderHeader",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 1189,
                      "src": "7436:16:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$returns$_t_struct$_ZeroExHeader_$1164_memory_ptr_$",
                        "typeString": "function (bytes memory) pure returns (struct ZeroExOrderDataHandler.ZeroExHeader memory)"
                      }
                    },
                    "id": 1347,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "7436:28:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                      "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader memory"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "7407:57:8"
                },
                {
                  "assignments": [
                    1352
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1352,
                      "name": "order",
                      "nodeType": "VariableDeclaration",
                      "scope": 1370,
                      "src": "7475:27:8",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                        "typeString": "struct LibOrder.Order"
                      },
                      "typeName": {
                        "contractScope": null,
                        "id": 1351,
                        "name": "LibOrder.Order",
                        "nodeType": "UserDefinedTypeName",
                        "referencedDeclaration": 4333,
                        "src": "7475:14:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_Order_$4333_storage_ptr",
                          "typeString": "struct LibOrder.Order"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1366,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "arguments": [
                          {
                            "argumentTypes": null,
                            "id": 1355,
                            "name": "_orderData",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 1338,
                            "src": "7556:10:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_bytes_memory_ptr",
                              "typeString": "bytes memory"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "expression": {
                              "argumentTypes": null,
                              "id": 1356,
                              "name": "header",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 1344,
                              "src": "7568:6:8",
                              "typeDescriptions": {
                                "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                                "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader memory"
                              }
                            },
                            "id": 1357,
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "memberName": "signatureLength",
                            "nodeType": "MemberAccess",
                            "referencedDeclaration": 1157,
                            "src": "7568:22:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "expression": {
                              "argumentTypes": null,
                              "id": 1358,
                              "name": "header",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 1344,
                              "src": "7592:6:8",
                              "typeDescriptions": {
                                "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                                "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader memory"
                              }
                            },
                            "id": 1359,
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "memberName": "orderLength",
                            "nodeType": "MemberAccess",
                            "referencedDeclaration": 1159,
                            "src": "7592:18:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          }
                        ],
                        "expression": {
                          "argumentTypes": [
                            {
                              "typeIdentifier": "t_bytes_memory_ptr",
                              "typeString": "bytes memory"
                            },
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            },
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          ],
                          "id": 1354,
                          "name": "sliceZeroExOrder",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 1278,
                          "src": "7539:16:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$_t_uint256_$returns$_t_bytes_memory_ptr_$",
                            "typeString": "function (bytes memory,uint256,uint256) pure returns (bytes memory)"
                          }
                        },
                        "id": 1360,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "kind": "functionCall",
                        "lValueRequested": false,
                        "names": [],
                        "nodeType": "FunctionCall",
                        "src": "7539:72:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "id": 1361,
                          "name": "header",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 1344,
                          "src": "7625:6:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                            "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader memory"
                          }
                        },
                        "id": 1362,
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": false,
                        "memberName": "makerAssetDataLength",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 1161,
                        "src": "7625:27:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "id": 1363,
                          "name": "header",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 1344,
                          "src": "7666:6:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                            "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader memory"
                          }
                        },
                        "id": 1364,
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": false,
                        "memberName": "takerAssetDataLength",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 1163,
                        "src": "7666:27:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        },
                        {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        },
                        {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      ],
                      "id": 1353,
                      "name": "constructZeroExOrder",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 1336,
                      "src": "7505:20:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$_t_uint256_$returns$_t_struct$_Order_$4333_memory_ptr_$",
                        "typeString": "function (bytes memory,uint256,uint256) pure returns (struct LibOrder.Order memory)"
                      }
                    },
                    "id": 1365,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "7505:198:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                      "typeString": "struct LibOrder.Order memory"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "7475:228:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1367,
                    "name": "order",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 1352,
                    "src": "7721:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                      "typeString": "struct LibOrder.Order memory"
                    }
                  },
                  "functionReturnParameters": 1342,
                  "id": 1368,
                  "nodeType": "Return",
                  "src": "7714:12:8"
                }
              ]
            },
            "documentation": null,
            "id": 1370,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "parseZeroExOrder",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 1339,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1338,
                  "name": "_orderData",
                  "nodeType": "VariableDeclaration",
                  "scope": 1370,
                  "src": "7306:16:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1337,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "7306:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "7305:18:8"
            },
            "payable": false,
            "returnParameters": {
              "id": 1342,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1341,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 1370,
                  "src": "7370:14:8",
                  "stateVariable": false,
                  "storageLocation": "memory",
                  "typeDescriptions": {
                    "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                    "typeString": "struct LibOrder.Order"
                  },
                  "typeName": {
                    "contractScope": null,
                    "id": 1340,
                    "name": "LibOrder.Order",
                    "nodeType": "UserDefinedTypeName",
                    "referencedDeclaration": 4333,
                    "src": "7370:14:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_Order_$4333_storage_ptr",
                      "typeString": "struct LibOrder.Order"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "7369:23:8"
            },
            "scope": 1404,
            "src": "7280:453:8",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 1402,
              "nodeType": "Block",
              "src": "7848:303:8",
              "statements": [
                {
                  "assignments": [
                    1378
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1378,
                      "name": "assetType",
                      "nodeType": "VariableDeclaration",
                      "scope": 1403,
                      "src": "7900:16:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes4",
                        "typeString": "bytes4"
                      },
                      "typeName": {
                        "id": 1377,
                        "name": "bytes4",
                        "nodeType": "ElementaryTypeName",
                        "src": "7900:6:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes4",
                          "typeString": "bytes4"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1383,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "hexValue": "30",
                        "id": 1381,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": true,
                        "kind": "number",
                        "lValueRequested": false,
                        "nodeType": "Literal",
                        "src": "7941:1:8",
                        "subdenomination": null,
                        "typeDescriptions": {
                          "typeIdentifier": "t_rational_0_by_1",
                          "typeString": "int_const 0"
                        },
                        "value": "0"
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_rational_0_by_1",
                          "typeString": "int_const 0"
                        }
                      ],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1379,
                        "name": "_assetData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1372,
                        "src": "7919:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1380,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "readBytes4",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4380,
                      "src": "7919:21:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$returns$_t_bytes4_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory,uint256) pure returns (bytes4)"
                      }
                    },
                    "id": 1382,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "7919:24:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes4",
                      "typeString": "bytes4"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "7900:43:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "commonType": {
                          "typeIdentifier": "t_bytes4",
                          "typeString": "bytes4"
                        },
                        "id": 1387,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "lValueRequested": false,
                        "leftExpression": {
                          "argumentTypes": null,
                          "id": 1385,
                          "name": "ERC20_SELECTOR",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 1152,
                          "src": "7974:14:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes4",
                            "typeString": "bytes4"
                          }
                        },
                        "nodeType": "BinaryOperation",
                        "operator": "==",
                        "rightExpression": {
                          "argumentTypes": null,
                          "id": 1386,
                          "name": "assetType",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 1378,
                          "src": "7992:9:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes4",
                            "typeString": "bytes4"
                          }
                        },
                        "src": "7974:27:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bool",
                          "typeString": "bool"
                        }
                      },
                      {
                        "argumentTypes": null,
                        "id": 1388,
                        "name": "INVALID_TOKEN_ADDRESS",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1155,
                        "src": "8015:21:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_string_memory",
                          "typeString": "string memory"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_bool",
                          "typeString": "bool"
                        },
                        {
                          "typeIdentifier": "t_string_memory",
                          "typeString": "string memory"
                        }
                      ],
                      "id": 1384,
                      "name": "require",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [
                        6902,
                        6903
                      ],
                      "referencedDeclaration": 6903,
                      "src": "7953:7:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_require_pure$_t_bool_$_t_string_memory_ptr_$returns$__$",
                        "typeString": "function (bool,string memory) pure"
                      }
                    },
                    "id": 1389,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "7953:93:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_tuple$__$",
                      "typeString": "tuple()"
                    }
                  },
                  "id": 1390,
                  "nodeType": "ExpressionStatement",
                  "src": "7953:93:8"
                },
                {
                  "assignments": [
                    1392
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1392,
                      "name": "tokenAddress",
                      "nodeType": "VariableDeclaration",
                      "scope": 1403,
                      "src": "8057:20:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      },
                      "typeName": {
                        "id": 1391,
                        "name": "address",
                        "nodeType": "ElementaryTypeName",
                        "src": "8057:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1399,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "arguments": [
                          {
                            "argumentTypes": null,
                            "hexValue": "34",
                            "id": 1396,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": true,
                            "kind": "number",
                            "lValueRequested": false,
                            "nodeType": "Literal",
                            "src": "8111:1:8",
                            "subdenomination": null,
                            "typeDescriptions": {
                              "typeIdentifier": "t_rational_4_by_1",
                              "typeString": "int_const 4"
                            },
                            "value": "4"
                          }
                        ],
                        "expression": {
                          "argumentTypes": [
                            {
                              "typeIdentifier": "t_rational_4_by_1",
                              "typeString": "int_const 4"
                            }
                          ],
                          "expression": {
                            "argumentTypes": null,
                            "id": 1394,
                            "name": "_assetData",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 1372,
                            "src": "8088:10:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_bytes_memory_ptr",
                              "typeString": "bytes memory"
                            }
                          },
                          "id": 1395,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "lValueRequested": false,
                          "memberName": "readBytes32",
                          "nodeType": "MemberAccess",
                          "referencedDeclaration": 4407,
                          "src": "8088:22:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$returns$_t_bytes32_$bound_to$_t_bytes_memory_ptr_$",
                            "typeString": "function (bytes memory,uint256) pure returns (bytes32)"
                          }
                        },
                        "id": 1397,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "kind": "functionCall",
                        "lValueRequested": false,
                        "names": [],
                        "nodeType": "FunctionCall",
                        "src": "8088:25:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes32",
                          "typeString": "bytes32"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_bytes32",
                          "typeString": "bytes32"
                        }
                      ],
                      "id": 1393,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": true,
                      "lValueRequested": false,
                      "nodeType": "ElementaryTypeNameExpression",
                      "src": "8080:7:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_type$_t_address_$",
                        "typeString": "type(address)"
                      },
                      "typeName": "address"
                    },
                    "id": 1398,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "typeConversion",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "8080:34:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "8057:57:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1400,
                    "name": "tokenAddress",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 1392,
                    "src": "8132:12:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "functionReturnParameters": 1376,
                  "id": 1401,
                  "nodeType": "Return",
                  "src": "8125:19:8"
                }
              ]
            },
            "documentation": null,
            "id": 1403,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "parseERC20TokenAddress",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 1373,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1372,
                  "name": "_assetData",
                  "nodeType": "VariableDeclaration",
                  "scope": 1403,
                  "src": "7771:16:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1371,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "7771:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "7770:18:8"
            },
            "payable": false,
            "returnParameters": {
              "id": 1376,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1375,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 1403,
                  "src": "7835:7:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 1374,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "7835:7:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "7834:9:8"
            },
            "scope": 1404,
            "src": "7739:412:8",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          }
        ],
        "scope": 1405,
        "src": "1031:7122:8"
      }
    ],
    "src": "597:7557:8"
  },
  "legacyAST": {
    "absolutePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/core/exchange-wrappers/lib/ZeroExOrderDataHandler.sol",
    "exportedSymbols": {
      "ZeroExOrderDataHandler": [
        1404
      ]
    },
    "id": 1405,
    "nodeType": "SourceUnit",
    "nodes": [
      {
        "id": 1132,
        "literals": [
          "solidity",
          "0.4",
          ".24"
        ],
        "nodeType": "PragmaDirective",
        "src": "597:23:8"
      },
      {
        "id": 1133,
        "literals": [
          "experimental",
          "ABIEncoderV2"
        ],
        "nodeType": "PragmaDirective",
        "src": "621:35:8"
      },
      {
        "absolutePath": "zeppelin-solidity/contracts/math/SafeMath.sol",
        "file": "zeppelin-solidity/contracts/math/SafeMath.sol",
        "id": 1135,
        "nodeType": "ImportDirective",
        "scope": 1405,
        "sourceUnit": 6347,
        "src": "658:73:8",
        "symbolAliases": [
          {
            "foreign": 1134,
            "local": null
          }
        ],
        "unitAlias": ""
      },
      {
        "absolutePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/external/0x/LibBytes.sol",
        "file": "../../../external/0x/LibBytes.sol",
        "id": 1137,
        "nodeType": "ImportDirective",
        "scope": 1405,
        "sourceUnit": 4491,
        "src": "732:61:8",
        "symbolAliases": [
          {
            "foreign": 1136,
            "local": null
          }
        ],
        "unitAlias": ""
      },
      {
        "absolutePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/external/0x/Exchange/libs/LibOrder.sol",
        "file": "../../../external/0x/Exchange/libs/LibOrder.sol",
        "id": 1139,
        "nodeType": "ImportDirective",
        "scope": 1405,
        "sourceUnit": 4342,
        "src": "794:75:8",
        "symbolAliases": [
          {
            "foreign": 1138,
            "local": null
          }
        ],
        "unitAlias": ""
      },
      {
        "baseContracts": [],
        "contractDependencies": [],
        "contractKind": "library",
        "documentation": "@title ZeroExOrderDataHandler\n@author Set Protocol\n * This library contains functions and structs to assist with parsing exchange orders data",
        "fullyImplemented": true,
        "id": 1404,
        "linearizedBaseContracts": [
          1404
        ],
        "name": "ZeroExOrderDataHandler",
        "nodeType": "ContractDefinition",
        "nodes": [
          {
            "id": 1142,
            "libraryName": {
              "contractScope": null,
              "id": 1140,
              "name": "SafeMath",
              "nodeType": "UserDefinedTypeName",
              "referencedDeclaration": 6346,
              "src": "1074:8:8",
              "typeDescriptions": {
                "typeIdentifier": "t_contract$_SafeMath_$6346",
                "typeString": "library SafeMath"
              }
            },
            "nodeType": "UsingForDirective",
            "src": "1068:27:8",
            "typeName": {
              "id": 1141,
              "name": "uint256",
              "nodeType": "ElementaryTypeName",
              "src": "1087:7:8",
              "typeDescriptions": {
                "typeIdentifier": "t_uint256",
                "typeString": "uint256"
              }
            }
          },
          {
            "id": 1145,
            "libraryName": {
              "contractScope": null,
              "id": 1143,
              "name": "LibBytes",
              "nodeType": "UserDefinedTypeName",
              "referencedDeclaration": 4490,
              "src": "1106:8:8",
              "typeDescriptions": {
                "typeIdentifier": "t_contract$_LibBytes_$4490",
                "typeString": "library LibBytes"
              }
            },
            "nodeType": "UsingForDirective",
            "src": "1100:25:8",
            "typeName": {
              "id": 1144,
              "name": "bytes",
              "nodeType": "ElementaryTypeName",
              "src": "1119:5:8",
              "typeDescriptions": {
                "typeIdentifier": "t_bytes_storage_ptr",
                "typeString": "bytes"
              }
            }
          },
          {
            "constant": true,
            "id": 1152,
            "name": "ERC20_SELECTOR",
            "nodeType": "VariableDeclaration",
            "scope": 1404,
            "src": "1175:73:8",
            "stateVariable": true,
            "storageLocation": "default",
            "typeDescriptions": {
              "typeIdentifier": "t_bytes4",
              "typeString": "bytes4"
            },
            "typeName": {
              "id": 1146,
              "name": "bytes4",
              "nodeType": "ElementaryTypeName",
              "src": "1175:6:8",
              "typeDescriptions": {
                "typeIdentifier": "t_bytes4",
                "typeString": "bytes4"
              }
            },
            "value": {
              "argumentTypes": null,
              "arguments": [
                {
                  "argumentTypes": null,
                  "arguments": [
                    {
                      "argumentTypes": null,
                      "hexValue": "4552433230546f6b656e286164647265737329",
                      "id": 1149,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": true,
                      "kind": "string",
                      "lValueRequested": false,
                      "nodeType": "Literal",
                      "src": "1225:21:8",
                      "subdenomination": null,
                      "typeDescriptions": {
                        "typeIdentifier": "t_stringliteral_f47261b06eedbfce68afd46d0f3c27c60b03faad319eaf33103611cf8f6456ad",
                        "typeString": "literal_string \"ERC20Token(address)\""
                      },
                      "value": "ERC20Token(address)"
                    }
                  ],
                  "expression": {
                    "argumentTypes": [
                      {
                        "typeIdentifier": "t_stringliteral_f47261b06eedbfce68afd46d0f3c27c60b03faad319eaf33103611cf8f6456ad",
                        "typeString": "literal_string \"ERC20Token(address)\""
                      }
                    ],
                    "id": 1148,
                    "name": "keccak256",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 6893,
                    "src": "1215:9:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_function_sha3_pure$__$returns$_t_bytes32_$",
                      "typeString": "function () pure returns (bytes32)"
                    }
                  },
                  "id": 1150,
                  "isConstant": false,
                  "isLValue": false,
                  "isPure": true,
                  "kind": "functionCall",
                  "lValueRequested": false,
                  "names": [],
                  "nodeType": "FunctionCall",
                  "src": "1215:32:8",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  }
                }
              ],
              "expression": {
                "argumentTypes": [
                  {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  }
                ],
                "id": 1147,
                "isConstant": false,
                "isLValue": false,
                "isPure": true,
                "lValueRequested": false,
                "nodeType": "ElementaryTypeNameExpression",
                "src": "1208:6:8",
                "typeDescriptions": {
                  "typeIdentifier": "t_type$_t_bytes4_$",
                  "typeString": "type(bytes4)"
                },
                "typeName": "bytes4"
              },
              "id": 1151,
              "isConstant": false,
              "isLValue": false,
              "isPure": true,
              "kind": "typeConversion",
              "lValueRequested": false,
              "names": [],
              "nodeType": "FunctionCall",
              "src": "1208:40:8",
              "typeDescriptions": {
                "typeIdentifier": "t_bytes4",
                "typeString": "bytes4"
              }
            },
            "visibility": "internal"
          },
          {
            "constant": true,
            "id": 1155,
            "name": "INVALID_TOKEN_ADDRESS",
            "nodeType": "VariableDeclaration",
            "scope": 1404,
            "src": "1255:73:8",
            "stateVariable": true,
            "storageLocation": "default",
            "typeDescriptions": {
              "typeIdentifier": "t_string_memory",
              "typeString": "string"
            },
            "typeName": {
              "id": 1153,
              "name": "string",
              "nodeType": "ElementaryTypeName",
              "src": "1255:6:8",
              "typeDescriptions": {
                "typeIdentifier": "t_string_storage_ptr",
                "typeString": "string"
              }
            },
            "value": {
              "argumentTypes": null,
              "hexValue": "41646472657373206973206e6f7420666f722045524332302061737365742e",
              "id": 1154,
              "isConstant": false,
              "isLValue": false,
              "isPure": true,
              "kind": "string",
              "lValueRequested": false,
              "nodeType": "Literal",
              "src": "1295:33:8",
              "subdenomination": null,
              "typeDescriptions": {
                "typeIdentifier": "t_stringliteral_86bd15f736bfc35ffa26d5b270c6a610858a1cd544a317069255ba4a0f5dda71",
                "typeString": "literal_string \"Address is not for ERC20 asset.\""
              },
              "value": "Address is not for ERC20 asset."
            },
            "visibility": "internal"
          },
          {
            "canonicalName": "ZeroExOrderDataHandler.ZeroExHeader",
            "id": 1164,
            "members": [
              {
                "constant": false,
                "id": 1157,
                "name": "signatureLength",
                "nodeType": "VariableDeclaration",
                "scope": 1164,
                "src": "1407:23:8",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 1156,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "1407:7:8",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  }
                },
                "value": null,
                "visibility": "internal"
              },
              {
                "constant": false,
                "id": 1159,
                "name": "orderLength",
                "nodeType": "VariableDeclaration",
                "scope": 1164,
                "src": "1440:19:8",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 1158,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "1440:7:8",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  }
                },
                "value": null,
                "visibility": "internal"
              },
              {
                "constant": false,
                "id": 1161,
                "name": "makerAssetDataLength",
                "nodeType": "VariableDeclaration",
                "scope": 1164,
                "src": "1469:28:8",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 1160,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "1469:7:8",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  }
                },
                "value": null,
                "visibility": "internal"
              },
              {
                "constant": false,
                "id": 1163,
                "name": "takerAssetDataLength",
                "nodeType": "VariableDeclaration",
                "scope": 1164,
                "src": "1507:28:8",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 1162,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "1507:7:8",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  }
                },
                "value": null,
                "visibility": "internal"
              }
            ],
            "name": "ZeroExHeader",
            "nodeType": "StructDefinition",
            "scope": 1404,
            "src": "1377:165:8",
            "visibility": "public"
          },
          {
            "canonicalName": "ZeroExOrderDataHandler.AssetDataAddresses",
            "id": 1169,
            "members": [
              {
                "constant": false,
                "id": 1166,
                "name": "makerTokenAddress",
                "nodeType": "VariableDeclaration",
                "scope": 1169,
                "src": "1584:25:8",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_address",
                  "typeString": "address"
                },
                "typeName": {
                  "id": 1165,
                  "name": "address",
                  "nodeType": "ElementaryTypeName",
                  "src": "1584:7:8",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  }
                },
                "value": null,
                "visibility": "internal"
              },
              {
                "constant": false,
                "id": 1168,
                "name": "takerTokenAddress",
                "nodeType": "VariableDeclaration",
                "scope": 1169,
                "src": "1619:25:8",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_address",
                  "typeString": "address"
                },
                "typeName": {
                  "id": 1167,
                  "name": "address",
                  "nodeType": "ElementaryTypeName",
                  "src": "1619:7:8",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  }
                },
                "value": null,
                "visibility": "internal"
              }
            ],
            "name": "AssetDataAddresses",
            "nodeType": "StructDefinition",
            "scope": 1404,
            "src": "1548:103:8",
            "visibility": "public"
          },
          {
            "body": {
              "id": 1188,
              "nodeType": "Block",
              "src": "3177:500:8",
              "statements": [
                {
                  "assignments": [],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1177,
                      "name": "header",
                      "nodeType": "VariableDeclaration",
                      "scope": 1189,
                      "src": "3187:26:8",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                        "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader"
                      },
                      "typeName": {
                        "contractScope": null,
                        "id": 1176,
                        "name": "ZeroExHeader",
                        "nodeType": "UserDefinedTypeName",
                        "referencedDeclaration": 1164,
                        "src": "3187:12:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_ZeroExHeader_$1164_storage_ptr",
                          "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1178,
                  "initialValue": null,
                  "nodeType": "VariableDeclarationStatement",
                  "src": "3187:26:8"
                },
                {
                  "assignments": [
                    1180
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1180,
                      "name": "orderDataAddr",
                      "nodeType": "VariableDeclaration",
                      "scope": 1189,
                      "src": "3224:21:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1179,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "3224:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1184,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [],
                    "expression": {
                      "argumentTypes": [],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1181,
                        "name": "_orderData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1171,
                        "src": "3248:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1182,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "contentAddress",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4357,
                      "src": "3248:25:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$returns$_t_uint256_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory) pure returns (uint256)"
                      }
                    },
                    "id": 1183,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "3248:27:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "3224:51:8"
                },
                {
                  "externalReferences": [
                    {
                      "header": {
                        "declaration": 1177,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3316:6:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1180,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3339:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "header": {
                        "declaration": 1177,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3397:6:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1180,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3420:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "header": {
                        "declaration": 1177,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3479:6:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1180,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3502:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "header": {
                        "declaration": 1177,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3570:6:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1180,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3593:13:8",
                        "valueSize": 1
                      }
                    }
                  ],
                  "id": 1185,
                  "nodeType": "InlineAssembly",
                  "operations": "{\n    mstore(header, mload(orderDataAddr))\n    mstore(add(header, 32), mload(add(orderDataAddr, 32)))\n    mstore(add(header, 64), mload(add(orderDataAddr, 64)))\n    mstore(add(header, 96), mload(add(orderDataAddr, 96)))\n}",
                  "src": "3286:377:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1186,
                    "name": "header",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 1177,
                    "src": "3664:6:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                      "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader memory"
                    }
                  },
                  "functionReturnParameters": 1175,
                  "id": 1187,
                  "nodeType": "Return",
                  "src": "3657:13:8"
                }
              ]
            },
            "documentation": null,
            "id": 1189,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "parseOrderHeader",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 1172,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1171,
                  "name": "_orderData",
                  "nodeType": "VariableDeclaration",
                  "scope": 1189,
                  "src": "3094:16:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1170,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "3094:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "3093:18:8"
            },
            "payable": false,
            "returnParameters": {
              "id": 1175,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1174,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 1189,
                  "src": "3159:12:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                    "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader"
                  },
                  "typeName": {
                    "contractScope": null,
                    "id": 1173,
                    "name": "ZeroExHeader",
                    "nodeType": "UserDefinedTypeName",
                    "referencedDeclaration": 1164,
                    "src": "3159:12:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_ZeroExHeader_$1164_storage_ptr",
                      "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "3158:14:8"
            },
            "scope": 1404,
            "src": "3068:609:8",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 1208,
              "nodeType": "Block",
              "src": "3786:211:8",
              "statements": [
                {
                  "assignments": [
                    1197
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1197,
                      "name": "orderDataAddr",
                      "nodeType": "VariableDeclaration",
                      "scope": 1209,
                      "src": "3796:21:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1196,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "3796:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1201,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [],
                    "expression": {
                      "argumentTypes": [],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1198,
                        "name": "_orderData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1191,
                        "src": "3820:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1199,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "contentAddress",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4357,
                      "src": "3820:25:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$returns$_t_uint256_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory) pure returns (uint256)"
                      }
                    },
                    "id": 1200,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "3820:27:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "3796:51:8"
                },
                {
                  "assignments": [],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1203,
                      "name": "fillAmount",
                      "nodeType": "VariableDeclaration",
                      "scope": 1209,
                      "src": "3857:18:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1202,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "3857:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1204,
                  "initialValue": null,
                  "nodeType": "VariableDeclarationStatement",
                  "src": "3857:18:8"
                },
                {
                  "externalReferences": [
                    {
                      "fillAmount": {
                        "declaration": 1203,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3909:10:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1197,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "3933:13:8",
                        "valueSize": 1
                      }
                    }
                  ],
                  "id": 1205,
                  "nodeType": "InlineAssembly",
                  "operations": "{\n    fillAmount := mload(add(orderDataAddr, 128))\n}",
                  "src": "3886:93:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1206,
                    "name": "fillAmount",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 1203,
                    "src": "3980:10:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "functionReturnParameters": 1195,
                  "id": 1207,
                  "nodeType": "Return",
                  "src": "3973:17:8"
                }
              ]
            },
            "documentation": null,
            "id": 1209,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "parseFillAmount",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 1192,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1191,
                  "name": "_orderData",
                  "nodeType": "VariableDeclaration",
                  "scope": 1209,
                  "src": "3708:16:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1190,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "3708:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "3707:18:8"
            },
            "payable": false,
            "returnParameters": {
              "id": 1195,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1194,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 1209,
                  "src": "3773:7:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 1193,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "3773:7:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "3772:9:8"
            },
            "scope": 1404,
            "src": "3683:314:8",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 1239,
              "nodeType": "Block",
              "src": "4103:291:8",
              "statements": [
                {
                  "assignments": [
                    1217
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1217,
                      "name": "orderDataAddr",
                      "nodeType": "VariableDeclaration",
                      "scope": 1240,
                      "src": "4113:21:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1216,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "4113:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1221,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [],
                    "expression": {
                      "argumentTypes": [],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1218,
                        "name": "_orderData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1211,
                        "src": "4137:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1219,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "contentAddress",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4357,
                      "src": "4137:25:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$returns$_t_uint256_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory) pure returns (uint256)"
                      }
                    },
                    "id": 1220,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "4137:27:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "4113:51:8"
                },
                {
                  "assignments": [],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1223,
                      "name": "signatureLength",
                      "nodeType": "VariableDeclaration",
                      "scope": 1240,
                      "src": "4174:23:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1222,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "4174:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1224,
                  "initialValue": null,
                  "nodeType": "VariableDeclarationStatement",
                  "src": "4174:23:8"
                },
                {
                  "externalReferences": [
                    {
                      "signatureLength": {
                        "declaration": 1223,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "4230:15:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1217,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "4255:13:8",
                        "valueSize": 1
                      }
                    }
                  ],
                  "id": 1225,
                  "nodeType": "InlineAssembly",
                  "operations": "{\n    signatureLength := mload(orderDataAddr)\n}",
                  "src": "4207:87:8"
                },
                {
                  "assignments": [
                    1227
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1227,
                      "name": "signature",
                      "nodeType": "VariableDeclaration",
                      "scope": 1240,
                      "src": "4289:22:8",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes_memory_ptr",
                        "typeString": "bytes"
                      },
                      "typeName": {
                        "id": 1226,
                        "name": "bytes",
                        "nodeType": "ElementaryTypeName",
                        "src": "4289:5:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_storage_ptr",
                          "typeString": "bytes"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1236,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "hexValue": "313630",
                        "id": 1230,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": true,
                        "kind": "number",
                        "lValueRequested": false,
                        "nodeType": "Literal",
                        "src": "4331:3:8",
                        "subdenomination": null,
                        "typeDescriptions": {
                          "typeIdentifier": "t_rational_160_by_1",
                          "typeString": "int_const 160"
                        },
                        "value": "160"
                      },
                      {
                        "argumentTypes": null,
                        "arguments": [
                          {
                            "argumentTypes": null,
                            "hexValue": "313630",
                            "id": 1233,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": true,
                            "kind": "number",
                            "lValueRequested": false,
                            "nodeType": "Literal",
                            "src": "4356:3:8",
                            "subdenomination": null,
                            "typeDescriptions": {
                              "typeIdentifier": "t_rational_160_by_1",
                              "typeString": "int_const 160"
                            },
                            "value": "160"
                          }
                        ],
                        "expression": {
                          "argumentTypes": [
                            {
                              "typeIdentifier": "t_rational_160_by_1",
                              "typeString": "int_const 160"
                            }
                          ],
                          "expression": {
                            "argumentTypes": null,
                            "id": 1231,
                            "name": "signatureLength",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 1223,
                            "src": "4336:15:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          "id": 1232,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "lValueRequested": false,
                          "memberName": "add",
                          "nodeType": "MemberAccess",
                          "referencedDeclaration": 6345,
                          "src": "4336:19:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_function_internal_pure$_t_uint256_$_t_uint256_$returns$_t_uint256_$bound_to$_t_uint256_$",
                            "typeString": "function (uint256,uint256) pure returns (uint256)"
                          }
                        },
                        "id": 1234,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "kind": "functionCall",
                        "lValueRequested": false,
                        "names": [],
                        "nodeType": "FunctionCall",
                        "src": "4336:24:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_rational_160_by_1",
                          "typeString": "int_const 160"
                        },
                        {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      ],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1228,
                        "name": "_orderData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1211,
                        "src": "4314:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1229,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "slice",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4489,
                      "src": "4314:16:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$_t_uint256_$returns$_t_bytes_memory_ptr_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory,uint256,uint256) pure returns (bytes memory)"
                      }
                    },
                    "id": 1235,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "4314:47:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_memory_ptr",
                      "typeString": "bytes memory"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "4289:72:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1237,
                    "name": "signature",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 1227,
                    "src": "4378:9:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_memory_ptr",
                      "typeString": "bytes memory"
                    }
                  },
                  "functionReturnParameters": 1215,
                  "id": 1238,
                  "nodeType": "Return",
                  "src": "4371:16:8"
                }
              ]
            },
            "documentation": null,
            "id": 1240,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "sliceSignature",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 1212,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1211,
                  "name": "_orderData",
                  "nodeType": "VariableDeclaration",
                  "scope": 1240,
                  "src": "4027:16:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1210,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "4027:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "4026:18:8"
            },
            "payable": false,
            "returnParameters": {
              "id": 1215,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1214,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 1240,
                  "src": "4092:5:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1213,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "4092:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "4091:7:8"
            },
            "scope": 1404,
            "src": "4003:391:8",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 1277,
              "nodeType": "Block",
              "src": "4544:300:8",
              "statements": [
                {
                  "assignments": [
                    1252
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1252,
                      "name": "orderDataAddr",
                      "nodeType": "VariableDeclaration",
                      "scope": 1278,
                      "src": "4554:21:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1251,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "4554:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1256,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [],
                    "expression": {
                      "argumentTypes": [],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1253,
                        "name": "_orderData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1242,
                        "src": "4578:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1254,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "contentAddress",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4357,
                      "src": "4578:25:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$returns$_t_uint256_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory) pure returns (uint256)"
                      }
                    },
                    "id": 1255,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "4578:27:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "4554:51:8"
                },
                {
                  "assignments": [
                    1258
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1258,
                      "name": "orderStartAddress",
                      "nodeType": "VariableDeclaration",
                      "scope": 1278,
                      "src": "4615:25:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1257,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "4615:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1263,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "id": 1261,
                        "name": "_signatureLength",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1244,
                        "src": "4661:16:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      ],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1259,
                        "name": "orderDataAddr",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1252,
                        "src": "4643:13:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "id": 1260,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "add",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 6345,
                      "src": "4643:17:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_uint256_$_t_uint256_$returns$_t_uint256_$bound_to$_t_uint256_$",
                        "typeString": "function (uint256,uint256) pure returns (uint256)"
                      }
                    },
                    "id": 1262,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "4643:35:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "4615:63:8"
                },
                {
                  "assignments": [
                    1265
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1265,
                      "name": "order",
                      "nodeType": "VariableDeclaration",
                      "scope": 1278,
                      "src": "4688:18:8",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes_memory_ptr",
                        "typeString": "bytes"
                      },
                      "typeName": {
                        "id": 1264,
                        "name": "bytes",
                        "nodeType": "ElementaryTypeName",
                        "src": "4688:5:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_storage_ptr",
                          "typeString": "bytes"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1274,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "id": 1268,
                        "name": "orderStartAddress",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1258,
                        "src": "4739:17:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      {
                        "argumentTypes": null,
                        "arguments": [
                          {
                            "argumentTypes": null,
                            "id": 1271,
                            "name": "_orderLength",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 1246,
                            "src": "4792:12:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          }
                        ],
                        "expression": {
                          "argumentTypes": [
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          ],
                          "expression": {
                            "argumentTypes": null,
                            "id": 1269,
                            "name": "orderStartAddress",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 1258,
                            "src": "4770:17:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          "id": 1270,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "lValueRequested": false,
                          "memberName": "add",
                          "nodeType": "MemberAccess",
                          "referencedDeclaration": 6345,
                          "src": "4770:21:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_function_internal_pure$_t_uint256_$_t_uint256_$returns$_t_uint256_$bound_to$_t_uint256_$",
                            "typeString": "function (uint256,uint256) pure returns (uint256)"
                          }
                        },
                        "id": 1272,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "kind": "functionCall",
                        "lValueRequested": false,
                        "names": [],
                        "nodeType": "FunctionCall",
                        "src": "4770:35:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        },
                        {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      ],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1266,
                        "name": "_orderData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1242,
                        "src": "4709:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1267,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "slice",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4489,
                      "src": "4709:16:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$_t_uint256_$returns$_t_bytes_memory_ptr_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory,uint256,uint256) pure returns (bytes memory)"
                      }
                    },
                    "id": 1273,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "4709:106:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_memory_ptr",
                      "typeString": "bytes memory"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "4688:127:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1275,
                    "name": "order",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 1265,
                    "src": "4832:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_memory_ptr",
                      "typeString": "bytes memory"
                    }
                  },
                  "functionReturnParameters": 1250,
                  "id": 1276,
                  "nodeType": "Return",
                  "src": "4825:12:8"
                }
              ]
            },
            "documentation": null,
            "id": 1278,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "sliceZeroExOrder",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 1247,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1242,
                  "name": "_orderData",
                  "nodeType": "VariableDeclaration",
                  "scope": 1278,
                  "src": "4426:16:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1241,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "4426:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 1244,
                  "name": "_signatureLength",
                  "nodeType": "VariableDeclaration",
                  "scope": 1278,
                  "src": "4444:21:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 1243,
                    "name": "uint",
                    "nodeType": "ElementaryTypeName",
                    "src": "4444:4:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 1246,
                  "name": "_orderLength",
                  "nodeType": "VariableDeclaration",
                  "scope": 1278,
                  "src": "4467:17:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 1245,
                    "name": "uint",
                    "nodeType": "ElementaryTypeName",
                    "src": "4467:4:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "4425:60:8"
            },
            "payable": false,
            "returnParameters": {
              "id": 1250,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1249,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 1278,
                  "src": "4533:5:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1248,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "4533:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "4532:7:8"
            },
            "scope": 1404,
            "src": "4400:444:8",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 1335,
              "nodeType": "Block",
              "src": "5060:2214:8",
              "statements": [
                {
                  "assignments": [],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1292,
                      "name": "order",
                      "nodeType": "VariableDeclaration",
                      "scope": 1336,
                      "src": "5070:27:8",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                        "typeString": "struct LibOrder.Order"
                      },
                      "typeName": {
                        "contractScope": null,
                        "id": 1291,
                        "name": "LibOrder.Order",
                        "nodeType": "UserDefinedTypeName",
                        "referencedDeclaration": 4333,
                        "src": "5070:14:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_Order_$4333_storage_ptr",
                          "typeString": "struct LibOrder.Order"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1293,
                  "initialValue": null,
                  "nodeType": "VariableDeclarationStatement",
                  "src": "5070:27:8"
                },
                {
                  "assignments": [
                    1295
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1295,
                      "name": "orderDataAddr",
                      "nodeType": "VariableDeclaration",
                      "scope": 1336,
                      "src": "5107:21:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      },
                      "typeName": {
                        "id": 1294,
                        "name": "uint256",
                        "nodeType": "ElementaryTypeName",
                        "src": "5107:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1299,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [],
                    "expression": {
                      "argumentTypes": [],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1296,
                        "name": "_zeroExOrder",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1280,
                        "src": "5131:12:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1297,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "contentAddress",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4357,
                      "src": "5131:27:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$returns$_t_uint256_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory) pure returns (uint256)"
                      }
                    },
                    "id": 1298,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "5131:29:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "5107:53:8"
                },
                {
                  "externalReferences": [
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6150:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6173:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6231:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6254:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6308:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6331:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6653:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6392:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6477:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6415:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6565:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6588:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6500:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6911:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6934:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6733:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6676:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "order": {
                        "declaration": 1292,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6813:5:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6756:13:8",
                        "valueSize": 1
                      }
                    },
                    {
                      "orderDataAddr": {
                        "declaration": 1295,
                        "isOffset": false,
                        "isSlot": false,
                        "src": "6836:13:8",
                        "valueSize": 1
                      }
                    }
                  ],
                  "id": 1300,
                  "nodeType": "InlineAssembly",
                  "operations": "{\n    mstore(order, mload(orderDataAddr))\n    mstore(add(order, 32), mload(add(orderDataAddr, 32)))\n    mstore(add(order, 64), mload(add(orderDataAddr, 64)))\n    mstore(add(order, 96), mload(add(orderDataAddr, 96)))\n    mstore(add(order, 128), mload(add(orderDataAddr, 128)))\n    mstore(add(order, 160), mload(add(orderDataAddr, 160)))\n    mstore(add(order, 192), mload(add(orderDataAddr, 192)))\n    mstore(add(order, 224), mload(add(orderDataAddr, 224)))\n    mstore(add(order, 256), mload(add(orderDataAddr, 256)))\n    mstore(add(order, 288), mload(add(orderDataAddr, 288)))\n}",
                  "src": "6120:868:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1312,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "lValueRequested": false,
                    "leftHandSide": {
                      "argumentTypes": null,
                      "expression": {
                        "argumentTypes": null,
                        "id": 1301,
                        "name": "order",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1292,
                        "src": "6983:5:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                          "typeString": "struct LibOrder.Order memory"
                        }
                      },
                      "id": 1303,
                      "isConstant": false,
                      "isLValue": true,
                      "isPure": false,
                      "lValueRequested": true,
                      "memberName": "makerAssetData",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4330,
                      "src": "6983:20:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes_memory",
                        "typeString": "bytes memory"
                      }
                    },
                    "nodeType": "Assignment",
                    "operator": "=",
                    "rightHandSide": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "hexValue": "333230",
                          "id": 1306,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": true,
                          "kind": "number",
                          "lValueRequested": false,
                          "nodeType": "Literal",
                          "src": "7025:3:8",
                          "subdenomination": null,
                          "typeDescriptions": {
                            "typeIdentifier": "t_rational_320_by_1",
                            "typeString": "int_const 320"
                          },
                          "value": "320"
                        },
                        {
                          "argumentTypes": null,
                          "arguments": [
                            {
                              "argumentTypes": null,
                              "hexValue": "333230",
                              "id": 1309,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "7056:3:8",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_320_by_1",
                                "typeString": "int_const 320"
                              },
                              "value": "320"
                            }
                          ],
                          "expression": {
                            "argumentTypes": [
                              {
                                "typeIdentifier": "t_rational_320_by_1",
                                "typeString": "int_const 320"
                              }
                            ],
                            "expression": {
                              "argumentTypes": null,
                              "id": 1307,
                              "name": "_makerAssetDataLength",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 1282,
                              "src": "7030:21:8",
                              "typeDescriptions": {
                                "typeIdentifier": "t_uint256",
                                "typeString": "uint256"
                              }
                            },
                            "id": 1308,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": false,
                            "lValueRequested": false,
                            "memberName": "add",
                            "nodeType": "MemberAccess",
                            "referencedDeclaration": 6345,
                            "src": "7030:25:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_function_internal_pure$_t_uint256_$_t_uint256_$returns$_t_uint256_$bound_to$_t_uint256_$",
                              "typeString": "function (uint256,uint256) pure returns (uint256)"
                            }
                          },
                          "id": 1310,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "kind": "functionCall",
                          "lValueRequested": false,
                          "names": [],
                          "nodeType": "FunctionCall",
                          "src": "7030:30:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_uint256",
                            "typeString": "uint256"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_rational_320_by_1",
                            "typeString": "int_const 320"
                          },
                          {
                            "typeIdentifier": "t_uint256",
                            "typeString": "uint256"
                          }
                        ],
                        "expression": {
                          "argumentTypes": null,
                          "id": 1304,
                          "name": "_zeroExOrder",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 1280,
                          "src": "7006:12:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes_memory_ptr",
                            "typeString": "bytes memory"
                          }
                        },
                        "id": 1305,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "lValueRequested": false,
                        "memberName": "slice",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 4489,
                        "src": "7006:18:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$_t_uint256_$returns$_t_bytes_memory_ptr_$bound_to$_t_bytes_memory_ptr_$",
                          "typeString": "function (bytes memory,uint256,uint256) pure returns (bytes memory)"
                        }
                      },
                      "id": 1311,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "7006:55:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes_memory_ptr",
                        "typeString": "bytes memory"
                      }
                    },
                    "src": "6983:78:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_memory",
                      "typeString": "bytes memory"
                    }
                  },
                  "id": 1313,
                  "nodeType": "ExpressionStatement",
                  "src": "6983:78:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1331,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "lValueRequested": false,
                    "leftHandSide": {
                      "argumentTypes": null,
                      "expression": {
                        "argumentTypes": null,
                        "id": 1314,
                        "name": "order",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1292,
                        "src": "7071:5:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                          "typeString": "struct LibOrder.Order memory"
                        }
                      },
                      "id": 1316,
                      "isConstant": false,
                      "isLValue": true,
                      "isPure": false,
                      "lValueRequested": true,
                      "memberName": "takerAssetData",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4332,
                      "src": "7071:20:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes_memory",
                        "typeString": "bytes memory"
                      }
                    },
                    "nodeType": "Assignment",
                    "operator": "=",
                    "rightHandSide": {
                      "argumentTypes": null,
                      "arguments": [
                        {
                          "argumentTypes": null,
                          "arguments": [
                            {
                              "argumentTypes": null,
                              "hexValue": "333230",
                              "id": 1321,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "7152:3:8",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_320_by_1",
                                "typeString": "int_const 320"
                              },
                              "value": "320"
                            }
                          ],
                          "expression": {
                            "argumentTypes": [
                              {
                                "typeIdentifier": "t_rational_320_by_1",
                                "typeString": "int_const 320"
                              }
                            ],
                            "expression": {
                              "argumentTypes": null,
                              "id": 1319,
                              "name": "_makerAssetDataLength",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 1282,
                              "src": "7126:21:8",
                              "typeDescriptions": {
                                "typeIdentifier": "t_uint256",
                                "typeString": "uint256"
                              }
                            },
                            "id": 1320,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": false,
                            "lValueRequested": false,
                            "memberName": "add",
                            "nodeType": "MemberAccess",
                            "referencedDeclaration": 6345,
                            "src": "7126:25:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_function_internal_pure$_t_uint256_$_t_uint256_$returns$_t_uint256_$bound_to$_t_uint256_$",
                              "typeString": "function (uint256,uint256) pure returns (uint256)"
                            }
                          },
                          "id": 1322,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "kind": "functionCall",
                          "lValueRequested": false,
                          "names": [],
                          "nodeType": "FunctionCall",
                          "src": "7126:30:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_uint256",
                            "typeString": "uint256"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "arguments": [
                            {
                              "argumentTypes": null,
                              "id": 1328,
                              "name": "_takerAssetDataLength",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 1284,
                              "src": "7205:21:8",
                              "typeDescriptions": {
                                "typeIdentifier": "t_uint256",
                                "typeString": "uint256"
                              }
                            }
                          ],
                          "expression": {
                            "argumentTypes": [
                              {
                                "typeIdentifier": "t_uint256",
                                "typeString": "uint256"
                              }
                            ],
                            "expression": {
                              "argumentTypes": null,
                              "arguments": [
                                {
                                  "argumentTypes": null,
                                  "hexValue": "333230",
                                  "id": 1325,
                                  "isConstant": false,
                                  "isLValue": false,
                                  "isPure": true,
                                  "kind": "number",
                                  "lValueRequested": false,
                                  "nodeType": "Literal",
                                  "src": "7196:3:8",
                                  "subdenomination": null,
                                  "typeDescriptions": {
                                    "typeIdentifier": "t_rational_320_by_1",
                                    "typeString": "int_const 320"
                                  },
                                  "value": "320"
                                }
                              ],
                              "expression": {
                                "argumentTypes": [
                                  {
                                    "typeIdentifier": "t_rational_320_by_1",
                                    "typeString": "int_const 320"
                                  }
                                ],
                                "expression": {
                                  "argumentTypes": null,
                                  "id": 1323,
                                  "name": "_makerAssetDataLength",
                                  "nodeType": "Identifier",
                                  "overloadedDeclarations": [],
                                  "referencedDeclaration": 1282,
                                  "src": "7170:21:8",
                                  "typeDescriptions": {
                                    "typeIdentifier": "t_uint256",
                                    "typeString": "uint256"
                                  }
                                },
                                "id": 1324,
                                "isConstant": false,
                                "isLValue": false,
                                "isPure": false,
                                "lValueRequested": false,
                                "memberName": "add",
                                "nodeType": "MemberAccess",
                                "referencedDeclaration": 6345,
                                "src": "7170:25:8",
                                "typeDescriptions": {
                                  "typeIdentifier": "t_function_internal_pure$_t_uint256_$_t_uint256_$returns$_t_uint256_$bound_to$_t_uint256_$",
                                  "typeString": "function (uint256,uint256) pure returns (uint256)"
                                }
                              },
                              "id": 1326,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": false,
                              "kind": "functionCall",
                              "lValueRequested": false,
                              "names": [],
                              "nodeType": "FunctionCall",
                              "src": "7170:30:8",
                              "typeDescriptions": {
                                "typeIdentifier": "t_uint256",
                                "typeString": "uint256"
                              }
                            },
                            "id": 1327,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": false,
                            "lValueRequested": false,
                            "memberName": "add",
                            "nodeType": "MemberAccess",
                            "referencedDeclaration": 6345,
                            "src": "7170:34:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_function_internal_pure$_t_uint256_$_t_uint256_$returns$_t_uint256_$bound_to$_t_uint256_$",
                              "typeString": "function (uint256,uint256) pure returns (uint256)"
                            }
                          },
                          "id": 1329,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "kind": "functionCall",
                          "lValueRequested": false,
                          "names": [],
                          "nodeType": "FunctionCall",
                          "src": "7170:57:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_uint256",
                            "typeString": "uint256"
                          }
                        }
                      ],
                      "expression": {
                        "argumentTypes": [
                          {
                            "typeIdentifier": "t_uint256",
                            "typeString": "uint256"
                          },
                          {
                            "typeIdentifier": "t_uint256",
                            "typeString": "uint256"
                          }
                        ],
                        "expression": {
                          "argumentTypes": null,
                          "id": 1317,
                          "name": "_zeroExOrder",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 1280,
                          "src": "7094:12:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes_memory_ptr",
                            "typeString": "bytes memory"
                          }
                        },
                        "id": 1318,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "lValueRequested": false,
                        "memberName": "slice",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 4489,
                        "src": "7094:18:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$_t_uint256_$returns$_t_bytes_memory_ptr_$bound_to$_t_bytes_memory_ptr_$",
                          "typeString": "function (bytes memory,uint256,uint256) pure returns (bytes memory)"
                        }
                      },
                      "id": 1330,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "7094:143:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes_memory_ptr",
                        "typeString": "bytes memory"
                      }
                    },
                    "src": "7071:166:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_memory",
                      "typeString": "bytes memory"
                    }
                  },
                  "id": 1332,
                  "nodeType": "ExpressionStatement",
                  "src": "7071:166:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1333,
                    "name": "order",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 1292,
                    "src": "7255:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                      "typeString": "struct LibOrder.Order memory"
                    }
                  },
                  "functionReturnParameters": 1288,
                  "id": 1334,
                  "nodeType": "Return",
                  "src": "7248:12:8"
                }
              ]
            },
            "documentation": null,
            "id": 1336,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "constructZeroExOrder",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 1285,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1280,
                  "name": "_zeroExOrder",
                  "nodeType": "VariableDeclaration",
                  "scope": 1336,
                  "src": "4889:18:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1279,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "4889:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 1282,
                  "name": "_makerAssetDataLength",
                  "nodeType": "VariableDeclaration",
                  "scope": 1336,
                  "src": "4917:26:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 1281,
                    "name": "uint",
                    "nodeType": "ElementaryTypeName",
                    "src": "4917:4:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 1284,
                  "name": "_takerAssetDataLength",
                  "nodeType": "VariableDeclaration",
                  "scope": 1336,
                  "src": "4953:26:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 1283,
                    "name": "uint",
                    "nodeType": "ElementaryTypeName",
                    "src": "4953:4:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "4879:106:8"
            },
            "payable": false,
            "returnParameters": {
              "id": 1288,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1287,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 1336,
                  "src": "5033:14:8",
                  "stateVariable": false,
                  "storageLocation": "memory",
                  "typeDescriptions": {
                    "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                    "typeString": "struct LibOrder.Order"
                  },
                  "typeName": {
                    "contractScope": null,
                    "id": 1286,
                    "name": "LibOrder.Order",
                    "nodeType": "UserDefinedTypeName",
                    "referencedDeclaration": 4333,
                    "src": "5033:14:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_Order_$4333_storage_ptr",
                      "typeString": "struct LibOrder.Order"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "5032:23:8"
            },
            "scope": 1404,
            "src": "4850:2424:8",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 1369,
              "nodeType": "Block",
              "src": "7397:336:8",
              "statements": [
                {
                  "assignments": [
                    1344
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1344,
                      "name": "header",
                      "nodeType": "VariableDeclaration",
                      "scope": 1370,
                      "src": "7407:26:8",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                        "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader"
                      },
                      "typeName": {
                        "contractScope": null,
                        "id": 1343,
                        "name": "ZeroExHeader",
                        "nodeType": "UserDefinedTypeName",
                        "referencedDeclaration": 1164,
                        "src": "7407:12:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_ZeroExHeader_$1164_storage_ptr",
                          "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1348,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "id": 1346,
                        "name": "_orderData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1338,
                        "src": "7453:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      ],
                      "id": 1345,
                      "name": "parseOrderHeader",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 1189,
                      "src": "7436:16:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$returns$_t_struct$_ZeroExHeader_$1164_memory_ptr_$",
                        "typeString": "function (bytes memory) pure returns (struct ZeroExOrderDataHandler.ZeroExHeader memory)"
                      }
                    },
                    "id": 1347,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "7436:28:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                      "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader memory"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "7407:57:8"
                },
                {
                  "assignments": [
                    1352
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1352,
                      "name": "order",
                      "nodeType": "VariableDeclaration",
                      "scope": 1370,
                      "src": "7475:27:8",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                        "typeString": "struct LibOrder.Order"
                      },
                      "typeName": {
                        "contractScope": null,
                        "id": 1351,
                        "name": "LibOrder.Order",
                        "nodeType": "UserDefinedTypeName",
                        "referencedDeclaration": 4333,
                        "src": "7475:14:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_struct$_Order_$4333_storage_ptr",
                          "typeString": "struct LibOrder.Order"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1366,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "arguments": [
                          {
                            "argumentTypes": null,
                            "id": 1355,
                            "name": "_orderData",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 1338,
                            "src": "7556:10:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_bytes_memory_ptr",
                              "typeString": "bytes memory"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "expression": {
                              "argumentTypes": null,
                              "id": 1356,
                              "name": "header",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 1344,
                              "src": "7568:6:8",
                              "typeDescriptions": {
                                "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                                "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader memory"
                              }
                            },
                            "id": 1357,
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "memberName": "signatureLength",
                            "nodeType": "MemberAccess",
                            "referencedDeclaration": 1157,
                            "src": "7568:22:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "expression": {
                              "argumentTypes": null,
                              "id": 1358,
                              "name": "header",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 1344,
                              "src": "7592:6:8",
                              "typeDescriptions": {
                                "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                                "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader memory"
                              }
                            },
                            "id": 1359,
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "memberName": "orderLength",
                            "nodeType": "MemberAccess",
                            "referencedDeclaration": 1159,
                            "src": "7592:18:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          }
                        ],
                        "expression": {
                          "argumentTypes": [
                            {
                              "typeIdentifier": "t_bytes_memory_ptr",
                              "typeString": "bytes memory"
                            },
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            },
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          ],
                          "id": 1354,
                          "name": "sliceZeroExOrder",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 1278,
                          "src": "7539:16:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$_t_uint256_$returns$_t_bytes_memory_ptr_$",
                            "typeString": "function (bytes memory,uint256,uint256) pure returns (bytes memory)"
                          }
                        },
                        "id": 1360,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "kind": "functionCall",
                        "lValueRequested": false,
                        "names": [],
                        "nodeType": "FunctionCall",
                        "src": "7539:72:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "id": 1361,
                          "name": "header",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 1344,
                          "src": "7625:6:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                            "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader memory"
                          }
                        },
                        "id": 1362,
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": false,
                        "memberName": "makerAssetDataLength",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 1161,
                        "src": "7625:27:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      },
                      {
                        "argumentTypes": null,
                        "expression": {
                          "argumentTypes": null,
                          "id": 1363,
                          "name": "header",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 1344,
                          "src": "7666:6:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_struct$_ZeroExHeader_$1164_memory_ptr",
                            "typeString": "struct ZeroExOrderDataHandler.ZeroExHeader memory"
                          }
                        },
                        "id": 1364,
                        "isConstant": false,
                        "isLValue": true,
                        "isPure": false,
                        "lValueRequested": false,
                        "memberName": "takerAssetDataLength",
                        "nodeType": "MemberAccess",
                        "referencedDeclaration": 1163,
                        "src": "7666:27:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        },
                        {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        },
                        {
                          "typeIdentifier": "t_uint256",
                          "typeString": "uint256"
                        }
                      ],
                      "id": 1353,
                      "name": "constructZeroExOrder",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 1336,
                      "src": "7505:20:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$_t_uint256_$returns$_t_struct$_Order_$4333_memory_ptr_$",
                        "typeString": "function (bytes memory,uint256,uint256) pure returns (struct LibOrder.Order memory)"
                      }
                    },
                    "id": 1365,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "7505:198:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                      "typeString": "struct LibOrder.Order memory"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "7475:228:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1367,
                    "name": "order",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 1352,
                    "src": "7721:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                      "typeString": "struct LibOrder.Order memory"
                    }
                  },
                  "functionReturnParameters": 1342,
                  "id": 1368,
                  "nodeType": "Return",
                  "src": "7714:12:8"
                }
              ]
            },
            "documentation": null,
            "id": 1370,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "parseZeroExOrder",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 1339,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1338,
                  "name": "_orderData",
                  "nodeType": "VariableDeclaration",
                  "scope": 1370,
                  "src": "7306:16:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1337,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "7306:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "7305:18:8"
            },
            "payable": false,
            "returnParameters": {
              "id": 1342,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1341,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 1370,
                  "src": "7370:14:8",
                  "stateVariable": false,
                  "storageLocation": "memory",
                  "typeDescriptions": {
                    "typeIdentifier": "t_struct$_Order_$4333_memory_ptr",
                    "typeString": "struct LibOrder.Order"
                  },
                  "typeName": {
                    "contractScope": null,
                    "id": 1340,
                    "name": "LibOrder.Order",
                    "nodeType": "UserDefinedTypeName",
                    "referencedDeclaration": 4333,
                    "src": "7370:14:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_struct$_Order_$4333_storage_ptr",
                      "typeString": "struct LibOrder.Order"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "7369:23:8"
            },
            "scope": 1404,
            "src": "7280:453:8",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 1402,
              "nodeType": "Block",
              "src": "7848:303:8",
              "statements": [
                {
                  "assignments": [
                    1378
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1378,
                      "name": "assetType",
                      "nodeType": "VariableDeclaration",
                      "scope": 1403,
                      "src": "7900:16:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes4",
                        "typeString": "bytes4"
                      },
                      "typeName": {
                        "id": 1377,
                        "name": "bytes4",
                        "nodeType": "ElementaryTypeName",
                        "src": "7900:6:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes4",
                          "typeString": "bytes4"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1383,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "hexValue": "30",
                        "id": 1381,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": true,
                        "kind": "number",
                        "lValueRequested": false,
                        "nodeType": "Literal",
                        "src": "7941:1:8",
                        "subdenomination": null,
                        "typeDescriptions": {
                          "typeIdentifier": "t_rational_0_by_1",
                          "typeString": "int_const 0"
                        },
                        "value": "0"
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_rational_0_by_1",
                          "typeString": "int_const 0"
                        }
                      ],
                      "expression": {
                        "argumentTypes": null,
                        "id": 1379,
                        "name": "_assetData",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1372,
                        "src": "7919:10:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_memory_ptr",
                          "typeString": "bytes memory"
                        }
                      },
                      "id": 1380,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "lValueRequested": false,
                      "memberName": "readBytes4",
                      "nodeType": "MemberAccess",
                      "referencedDeclaration": 4380,
                      "src": "7919:21:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$returns$_t_bytes4_$bound_to$_t_bytes_memory_ptr_$",
                        "typeString": "function (bytes memory,uint256) pure returns (bytes4)"
                      }
                    },
                    "id": 1382,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "7919:24:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes4",
                      "typeString": "bytes4"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "7900:43:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "commonType": {
                          "typeIdentifier": "t_bytes4",
                          "typeString": "bytes4"
                        },
                        "id": 1387,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "lValueRequested": false,
                        "leftExpression": {
                          "argumentTypes": null,
                          "id": 1385,
                          "name": "ERC20_SELECTOR",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 1152,
                          "src": "7974:14:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes4",
                            "typeString": "bytes4"
                          }
                        },
                        "nodeType": "BinaryOperation",
                        "operator": "==",
                        "rightExpression": {
                          "argumentTypes": null,
                          "id": 1386,
                          "name": "assetType",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 1378,
                          "src": "7992:9:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes4",
                            "typeString": "bytes4"
                          }
                        },
                        "src": "7974:27:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bool",
                          "typeString": "bool"
                        }
                      },
                      {
                        "argumentTypes": null,
                        "id": 1388,
                        "name": "INVALID_TOKEN_ADDRESS",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 1155,
                        "src": "8015:21:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_string_memory",
                          "typeString": "string memory"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_bool",
                          "typeString": "bool"
                        },
                        {
                          "typeIdentifier": "t_string_memory",
                          "typeString": "string memory"
                        }
                      ],
                      "id": 1384,
                      "name": "require",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [
                        6902,
                        6903
                      ],
                      "referencedDeclaration": 6903,
                      "src": "7953:7:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_require_pure$_t_bool_$_t_string_memory_ptr_$returns$__$",
                        "typeString": "function (bool,string memory) pure"
                      }
                    },
                    "id": 1389,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "7953:93:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_tuple$__$",
                      "typeString": "tuple()"
                    }
                  },
                  "id": 1390,
                  "nodeType": "ExpressionStatement",
                  "src": "7953:93:8"
                },
                {
                  "assignments": [
                    1392
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 1392,
                      "name": "tokenAddress",
                      "nodeType": "VariableDeclaration",
                      "scope": 1403,
                      "src": "8057:20:8",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      },
                      "typeName": {
                        "id": 1391,
                        "name": "address",
                        "nodeType": "ElementaryTypeName",
                        "src": "8057:7:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 1399,
                  "initialValue": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "arguments": [
                          {
                            "argumentTypes": null,
                            "hexValue": "34",
                            "id": 1396,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": true,
                            "kind": "number",
                            "lValueRequested": false,
                            "nodeType": "Literal",
                            "src": "8111:1:8",
                            "subdenomination": null,
                            "typeDescriptions": {
                              "typeIdentifier": "t_rational_4_by_1",
                              "typeString": "int_const 4"
                            },
                            "value": "4"
                          }
                        ],
                        "expression": {
                          "argumentTypes": [
                            {
                              "typeIdentifier": "t_rational_4_by_1",
                              "typeString": "int_const 4"
                            }
                          ],
                          "expression": {
                            "argumentTypes": null,
                            "id": 1394,
                            "name": "_assetData",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 1372,
                            "src": "8088:10:8",
                            "typeDescriptions": {
                              "typeIdentifier": "t_bytes_memory_ptr",
                              "typeString": "bytes memory"
                            }
                          },
                          "id": 1395,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "lValueRequested": false,
                          "memberName": "readBytes32",
                          "nodeType": "MemberAccess",
                          "referencedDeclaration": 4407,
                          "src": "8088:22:8",
                          "typeDescriptions": {
                            "typeIdentifier": "t_function_internal_pure$_t_bytes_memory_ptr_$_t_uint256_$returns$_t_bytes32_$bound_to$_t_bytes_memory_ptr_$",
                            "typeString": "function (bytes memory,uint256) pure returns (bytes32)"
                          }
                        },
                        "id": 1397,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "kind": "functionCall",
                        "lValueRequested": false,
                        "names": [],
                        "nodeType": "FunctionCall",
                        "src": "8088:25:8",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes32",
                          "typeString": "bytes32"
                        }
                      }
                    ],
                    "expression": {
                      "argumentTypes": [
                        {
                          "typeIdentifier": "t_bytes32",
                          "typeString": "bytes32"
                        }
                      ],
                      "id": 1393,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": true,
                      "lValueRequested": false,
                      "nodeType": "ElementaryTypeNameExpression",
                      "src": "8080:7:8",
                      "typeDescriptions": {
                        "typeIdentifier": "t_type$_t_address_$",
                        "typeString": "type(address)"
                      },
                      "typeName": "address"
                    },
                    "id": 1398,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "typeConversion",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "8080:34:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "8057:57:8"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 1400,
                    "name": "tokenAddress",
                    "nodeType": "Identifier",
                    "overloadedDeclarations": [],
                    "referencedDeclaration": 1392,
                    "src": "8132:12:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "functionReturnParameters": 1376,
                  "id": 1401,
                  "nodeType": "Return",
                  "src": "8125:19:8"
                }
              ]
            },
            "documentation": null,
            "id": 1403,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "parseERC20TokenAddress",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 1373,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1372,
                  "name": "_assetData",
                  "nodeType": "VariableDeclaration",
                  "scope": 1403,
                  "src": "7771:16:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_memory_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 1371,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "7771:5:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes_storage_ptr",
                      "typeString": "bytes"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "7770:18:8"
            },
            "payable": false,
            "returnParameters": {
              "id": 1376,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 1375,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 1403,
                  "src": "7835:7:8",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 1374,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "7835:7:8",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "7834:9:8"
            },
            "scope": 1404,
            "src": "7739:412:8",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          }
        ],
        "scope": 1405,
        "src": "1031:7122:8"
      }
    ],
    "src": "597:7557:8"
  },
  "compiler": {
    "name": "solc",
    "version": "0.4.24+commit.e67f0147.Emscripten.clang"
  },
  "networks": {},
  "schemaVersion": "2.0.0",
  "updatedAt": "2018-07-13T21:55:38.177Z"
}