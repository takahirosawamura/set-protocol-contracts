export const CommonMath = 
{
  "contractName": "CommonMath",
  "abi": [],
  "bytecode": "0x604c602c600b82828239805160001a60731460008114601c57601e565bfe5b5030600052607381538281f30073000000000000000000000000000000000000000030146080604052600080fd00a165627a7a7230582007c77a5348a2963fcf392eeaf36342c8503730e33989a59095177e99cea8ddac0029",
  "deployedBytecode": "0x73000000000000000000000000000000000000000030146080604052600080fd00a165627a7a7230582007c77a5348a2963fcf392eeaf36342c8503730e33989a59095177e99cea8ddac0029",
  "sourceMap": "698:276:46:-;;132:2:-1;166:7;155:9;146:7;137:37;252:7;246:14;243:1;238:23;232:4;229:33;270:1;265:20;;;;222:63;;265:20;274:9;222:63;;298:9;295:1;288:20;328:4;319:7;311:22;352:7;343;336:24",
  "deployedSourceMap": "698:276:46:-;;;;;;;;",
  "source": "/*\n    Copyright 2018 Set Labs Inc.\n\n    Licensed under the Apache License, Version 2.0 (the \"License\");\n    you may not use this file except in compliance with the License.\n    You may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n\n    Unless required by applicable law or agreed to in writing, software\n    distributed under the License is distributed on an \"AS IS\" BASIS,\n    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n    See the License for the specific language governing permissions and\n    limitations under the License.\n*/\n\npragma solidity 0.4.24;\n\nimport { SafeMath } from \"zeppelin-solidity/contracts/math/SafeMath.sol\";\n\n\nlibrary CommonMath {\n    /**\n     * Calculates and returns the maximum value for a uint256\n     *\n     * @return  The maximum value for uint256\n     */\n    function maxUInt256()\n        internal\n        pure\n        returns (uint256)\n    {\n        return 2 ** 256 - 1;\n    }\n}\n    ",
  "sourcePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/lib/CommonMath.sol",
  "ast": {
    "absolutePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/lib/CommonMath.sol",
    "exportedSymbols": {
      "CommonMath": [
        4722
      ]
    },
    "id": 4723,
    "nodeType": "SourceUnit",
    "nodes": [
      {
        "id": 4707,
        "literals": [
          "solidity",
          "0.4",
          ".24"
        ],
        "nodeType": "PragmaDirective",
        "src": "597:23:46"
      },
      {
        "absolutePath": "zeppelin-solidity/contracts/math/SafeMath.sol",
        "file": "zeppelin-solidity/contracts/math/SafeMath.sol",
        "id": 4709,
        "nodeType": "ImportDirective",
        "scope": 4723,
        "sourceUnit": 6347,
        "src": "622:73:46",
        "symbolAliases": [
          {
            "foreign": 4708,
            "local": null
          }
        ],
        "unitAlias": ""
      },
      {
        "baseContracts": [],
        "contractDependencies": [],
        "contractKind": "library",
        "documentation": null,
        "fullyImplemented": true,
        "id": 4722,
        "linearizedBaseContracts": [
          4722
        ],
        "name": "CommonMath",
        "nodeType": "ContractDefinition",
        "nodes": [
          {
            "body": {
              "id": 4720,
              "nodeType": "Block",
              "src": "936:36:46",
              "statements": [
                {
                  "expression": {
                    "argumentTypes": null,
                    "commonType": {
                      "typeIdentifier": "t_rational_115792089237316195423570985008687907853269984665640564039457584007913129639935_by_1",
                      "typeString": "int_const 1157...(70 digits omitted)...9935"
                    },
                    "id": 4718,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": true,
                    "lValueRequested": false,
                    "leftExpression": {
                      "argumentTypes": null,
                      "commonType": {
                        "typeIdentifier": "t_rational_115792089237316195423570985008687907853269984665640564039457584007913129639936_by_1",
                        "typeString": "int_const 1157...(70 digits omitted)...9936"
                      },
                      "id": 4716,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": true,
                      "lValueRequested": false,
                      "leftExpression": {
                        "argumentTypes": null,
                        "hexValue": "32",
                        "id": 4714,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": true,
                        "kind": "number",
                        "lValueRequested": false,
                        "nodeType": "Literal",
                        "src": "953:1:46",
                        "subdenomination": null,
                        "typeDescriptions": {
                          "typeIdentifier": "t_rational_2_by_1",
                          "typeString": "int_const 2"
                        },
                        "value": "2"
                      },
                      "nodeType": "BinaryOperation",
                      "operator": "**",
                      "rightExpression": {
                        "argumentTypes": null,
                        "hexValue": "323536",
                        "id": 4715,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": true,
                        "kind": "number",
                        "lValueRequested": false,
                        "nodeType": "Literal",
                        "src": "958:3:46",
                        "subdenomination": null,
                        "typeDescriptions": {
                          "typeIdentifier": "t_rational_256_by_1",
                          "typeString": "int_const 256"
                        },
                        "value": "256"
                      },
                      "src": "953:8:46",
                      "typeDescriptions": {
                        "typeIdentifier": "t_rational_115792089237316195423570985008687907853269984665640564039457584007913129639936_by_1",
                        "typeString": "int_const 1157...(70 digits omitted)...9936"
                      }
                    },
                    "nodeType": "BinaryOperation",
                    "operator": "-",
                    "rightExpression": {
                      "argumentTypes": null,
                      "hexValue": "31",
                      "id": 4717,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": true,
                      "kind": "number",
                      "lValueRequested": false,
                      "nodeType": "Literal",
                      "src": "964:1:46",
                      "subdenomination": null,
                      "typeDescriptions": {
                        "typeIdentifier": "t_rational_1_by_1",
                        "typeString": "int_const 1"
                      },
                      "value": "1"
                    },
                    "src": "953:12:46",
                    "typeDescriptions": {
                      "typeIdentifier": "t_rational_115792089237316195423570985008687907853269984665640564039457584007913129639935_by_1",
                      "typeString": "int_const 1157...(70 digits omitted)...9935"
                    }
                  },
                  "functionReturnParameters": 4713,
                  "id": 4719,
                  "nodeType": "Return",
                  "src": "946:19:46"
                }
              ]
            },
            "documentation": "Calculates and returns the maximum value for a uint256\n     * @return  The maximum value for uint256",
            "id": 4721,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "maxUInt256",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 4710,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "873:2:46"
            },
            "payable": false,
            "returnParameters": {
              "id": 4713,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 4712,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 4721,
                  "src": "923:7:46",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 4711,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "923:7:46",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "922:9:46"
            },
            "scope": 4722,
            "src": "854:118:46",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          }
        ],
        "scope": 4723,
        "src": "698:276:46"
      }
    ],
    "src": "597:382:46"
  },
  "legacyAST": {
    "absolutePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/lib/CommonMath.sol",
    "exportedSymbols": {
      "CommonMath": [
        4722
      ]
    },
    "id": 4723,
    "nodeType": "SourceUnit",
    "nodes": [
      {
        "id": 4707,
        "literals": [
          "solidity",
          "0.4",
          ".24"
        ],
        "nodeType": "PragmaDirective",
        "src": "597:23:46"
      },
      {
        "absolutePath": "zeppelin-solidity/contracts/math/SafeMath.sol",
        "file": "zeppelin-solidity/contracts/math/SafeMath.sol",
        "id": 4709,
        "nodeType": "ImportDirective",
        "scope": 4723,
        "sourceUnit": 6347,
        "src": "622:73:46",
        "symbolAliases": [
          {
            "foreign": 4708,
            "local": null
          }
        ],
        "unitAlias": ""
      },
      {
        "baseContracts": [],
        "contractDependencies": [],
        "contractKind": "library",
        "documentation": null,
        "fullyImplemented": true,
        "id": 4722,
        "linearizedBaseContracts": [
          4722
        ],
        "name": "CommonMath",
        "nodeType": "ContractDefinition",
        "nodes": [
          {
            "body": {
              "id": 4720,
              "nodeType": "Block",
              "src": "936:36:46",
              "statements": [
                {
                  "expression": {
                    "argumentTypes": null,
                    "commonType": {
                      "typeIdentifier": "t_rational_115792089237316195423570985008687907853269984665640564039457584007913129639935_by_1",
                      "typeString": "int_const 1157...(70 digits omitted)...9935"
                    },
                    "id": 4718,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": true,
                    "lValueRequested": false,
                    "leftExpression": {
                      "argumentTypes": null,
                      "commonType": {
                        "typeIdentifier": "t_rational_115792089237316195423570985008687907853269984665640564039457584007913129639936_by_1",
                        "typeString": "int_const 1157...(70 digits omitted)...9936"
                      },
                      "id": 4716,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": true,
                      "lValueRequested": false,
                      "leftExpression": {
                        "argumentTypes": null,
                        "hexValue": "32",
                        "id": 4714,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": true,
                        "kind": "number",
                        "lValueRequested": false,
                        "nodeType": "Literal",
                        "src": "953:1:46",
                        "subdenomination": null,
                        "typeDescriptions": {
                          "typeIdentifier": "t_rational_2_by_1",
                          "typeString": "int_const 2"
                        },
                        "value": "2"
                      },
                      "nodeType": "BinaryOperation",
                      "operator": "**",
                      "rightExpression": {
                        "argumentTypes": null,
                        "hexValue": "323536",
                        "id": 4715,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": true,
                        "kind": "number",
                        "lValueRequested": false,
                        "nodeType": "Literal",
                        "src": "958:3:46",
                        "subdenomination": null,
                        "typeDescriptions": {
                          "typeIdentifier": "t_rational_256_by_1",
                          "typeString": "int_const 256"
                        },
                        "value": "256"
                      },
                      "src": "953:8:46",
                      "typeDescriptions": {
                        "typeIdentifier": "t_rational_115792089237316195423570985008687907853269984665640564039457584007913129639936_by_1",
                        "typeString": "int_const 1157...(70 digits omitted)...9936"
                      }
                    },
                    "nodeType": "BinaryOperation",
                    "operator": "-",
                    "rightExpression": {
                      "argumentTypes": null,
                      "hexValue": "31",
                      "id": 4717,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": true,
                      "kind": "number",
                      "lValueRequested": false,
                      "nodeType": "Literal",
                      "src": "964:1:46",
                      "subdenomination": null,
                      "typeDescriptions": {
                        "typeIdentifier": "t_rational_1_by_1",
                        "typeString": "int_const 1"
                      },
                      "value": "1"
                    },
                    "src": "953:12:46",
                    "typeDescriptions": {
                      "typeIdentifier": "t_rational_115792089237316195423570985008687907853269984665640564039457584007913129639935_by_1",
                      "typeString": "int_const 1157...(70 digits omitted)...9935"
                    }
                  },
                  "functionReturnParameters": 4713,
                  "id": 4719,
                  "nodeType": "Return",
                  "src": "946:19:46"
                }
              ]
            },
            "documentation": "Calculates and returns the maximum value for a uint256\n     * @return  The maximum value for uint256",
            "id": 4721,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "maxUInt256",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 4710,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "873:2:46"
            },
            "payable": false,
            "returnParameters": {
              "id": 4713,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 4712,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 4721,
                  "src": "923:7:46",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 4711,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "923:7:46",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "922:9:46"
            },
            "scope": 4722,
            "src": "854:118:46",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          }
        ],
        "scope": 4723,
        "src": "698:276:46"
      }
    ],
    "src": "597:382:46"
  },
  "compiler": {
    "name": "solc",
    "version": "0.4.24+commit.e67f0147.Emscripten.clang"
  },
  "networks": {},
  "schemaVersion": "2.0.0",
  "updatedAt": "2018-07-13T21:55:38.427Z"
}