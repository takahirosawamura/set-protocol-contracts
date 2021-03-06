export const IAssetProxy = 
{
  "contractName": "IAssetProxy",
  "abi": [
    {
      "constant": false,
      "inputs": [
        {
          "name": "target",
          "type": "address"
        }
      ],
      "name": "addAuthorizedAddress",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "target",
          "type": "address"
        }
      ],
      "name": "removeAuthorizedAddress",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "target",
          "type": "address"
        },
        {
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "removeAuthorizedAddressAtIndex",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getAuthorizedAddresses",
      "outputs": [
        {
          "name": "",
          "type": "address[]"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "assetData",
          "type": "bytes"
        },
        {
          "name": "from",
          "type": "address"
        },
        {
          "name": "to",
          "type": "address"
        },
        {
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getProxyId",
      "outputs": [
        {
          "name": "",
          "type": "bytes4"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ],
  "bytecode": "0x",
  "deployedBytecode": "0x",
  "sourceMap": "",
  "deployedSourceMap": "",
  "source": "/*\n\n  Copyright 2018 ZeroEx Intl.\n\n  Licensed under the Apache License, Version 2.0 (the \"License\");\n  you may not use this file except in compliance with the License.\n  You may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n\n  Unless required by applicable law or agreed to in writing, software\n  distributed under the License is distributed on an \"AS IS\" BASIS,\n  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n  See the License for the specific language governing permissions and\n  limitations under the License.\n\n*/\n\npragma solidity ^0.4.24;\npragma experimental ABIEncoderV2;\n\nimport \"./IAuthorizable.sol\";\n\ncontract IAssetProxy is\n    IAuthorizable\n{\n\n    /// @dev Transfers assets. Either succeeds or throws.\n    /// @param assetData Byte array encoded for the respective asset proxy.\n    /// @param from Address to transfer asset from.\n    /// @param to Address to transfer asset to.\n    /// @param amount Amount of asset to transfer.\n    function transferFrom(\n        bytes assetData,\n        address from,\n        address to,\n        uint256 amount\n    )\n        external;\n    \n    /// @dev Gets the proxy id associated with the proxy address.\n    /// @return Proxy id.\n    function getProxyId()\n        external\n        view\n        returns (bytes4);\n}\n",
  "sourcePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/external/0x/AssetProxy/interfaces/IAssetProxy.sol",
  "ast": {
    "absolutePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/external/0x/AssetProxy/interfaces/IAssetProxy.sol",
    "exportedSymbols": {
      "IAssetProxy": [
        3792
      ]
    },
    "id": 3793,
    "nodeType": "SourceUnit",
    "nodes": [
      {
        "id": 3771,
        "literals": [
          "solidity",
          "^",
          "0.4",
          ".24"
        ],
        "nodeType": "PragmaDirective",
        "src": "580:24:27"
      },
      {
        "id": 3772,
        "literals": [
          "experimental",
          "ABIEncoderV2"
        ],
        "nodeType": "PragmaDirective",
        "src": "605:33:27"
      },
      {
        "absolutePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/external/0x/AssetProxy/interfaces/IAuthorizable.sol",
        "file": "./IAuthorizable.sol",
        "id": 3773,
        "nodeType": "ImportDirective",
        "scope": 3793,
        "sourceUnit": 3828,
        "src": "640:29:27",
        "symbolAliases": [],
        "unitAlias": ""
      },
      {
        "baseContracts": [
          {
            "arguments": null,
            "baseName": {
              "contractScope": null,
              "id": 3774,
              "name": "IAuthorizable",
              "nodeType": "UserDefinedTypeName",
              "referencedDeclaration": 3827,
              "src": "699:13:27",
              "typeDescriptions": {
                "typeIdentifier": "t_contract$_IAuthorizable_$3827",
                "typeString": "contract IAuthorizable"
              }
            },
            "id": 3775,
            "nodeType": "InheritanceSpecifier",
            "src": "699:13:27"
          }
        ],
        "contractDependencies": [
          3801,
          3827
        ],
        "contractKind": "contract",
        "documentation": null,
        "fullyImplemented": false,
        "id": 3792,
        "linearizedBaseContracts": [
          3792,
          3827,
          3801
        ],
        "name": "IAssetProxy",
        "nodeType": "ContractDefinition",
        "nodes": [
          {
            "body": null,
            "documentation": "@dev Transfers assets. Either succeeds or throws.\n @param assetData Byte array encoded for the respective asset proxy.\n @param from Address to transfer asset from.\n @param to Address to transfer asset to.\n @param amount Amount of asset to transfer.",
            "id": 3786,
            "implemented": false,
            "isConstructor": false,
            "isDeclaredConst": false,
            "modifiers": [],
            "name": "transferFrom",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 3784,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 3777,
                  "name": "assetData",
                  "nodeType": "VariableDeclaration",
                  "scope": 3786,
                  "src": "1036:15:27",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_calldata_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 3776,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "1036:5:27",
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
                  "id": 3779,
                  "name": "from",
                  "nodeType": "VariableDeclaration",
                  "scope": 3786,
                  "src": "1061:12:27",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 3778,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "1061:7:27",
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
                  "id": 3781,
                  "name": "to",
                  "nodeType": "VariableDeclaration",
                  "scope": 3786,
                  "src": "1083:10:27",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 3780,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "1083:7:27",
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
                  "id": 3783,
                  "name": "amount",
                  "nodeType": "VariableDeclaration",
                  "scope": 3786,
                  "src": "1103:14:27",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 3782,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "1103:7:27",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "1026:97:27"
            },
            "payable": false,
            "returnParameters": {
              "id": 3785,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "1140:0:27"
            },
            "scope": 3792,
            "src": "1005:136:27",
            "stateMutability": "nonpayable",
            "superFunction": null,
            "visibility": "external"
          },
          {
            "body": null,
            "documentation": "@dev Gets the proxy id associated with the proxy address.\n @return Proxy id.",
            "id": 3791,
            "implemented": false,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "getProxyId",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 3787,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "1262:2:27"
            },
            "payable": false,
            "returnParameters": {
              "id": 3790,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 3789,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 3791,
                  "src": "1312:6:27",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes4",
                    "typeString": "bytes4"
                  },
                  "typeName": {
                    "id": 3788,
                    "name": "bytes4",
                    "nodeType": "ElementaryTypeName",
                    "src": "1312:6:27",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes4",
                      "typeString": "bytes4"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "1311:8:27"
            },
            "scope": 3792,
            "src": "1243:77:27",
            "stateMutability": "view",
            "superFunction": null,
            "visibility": "external"
          }
        ],
        "scope": 3793,
        "src": "671:651:27"
      }
    ],
    "src": "580:743:27"
  },
  "legacyAST": {
    "absolutePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/external/0x/AssetProxy/interfaces/IAssetProxy.sol",
    "exportedSymbols": {
      "IAssetProxy": [
        3792
      ]
    },
    "id": 3793,
    "nodeType": "SourceUnit",
    "nodes": [
      {
        "id": 3771,
        "literals": [
          "solidity",
          "^",
          "0.4",
          ".24"
        ],
        "nodeType": "PragmaDirective",
        "src": "580:24:27"
      },
      {
        "id": 3772,
        "literals": [
          "experimental",
          "ABIEncoderV2"
        ],
        "nodeType": "PragmaDirective",
        "src": "605:33:27"
      },
      {
        "absolutePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/external/0x/AssetProxy/interfaces/IAuthorizable.sol",
        "file": "./IAuthorizable.sol",
        "id": 3773,
        "nodeType": "ImportDirective",
        "scope": 3793,
        "sourceUnit": 3828,
        "src": "640:29:27",
        "symbolAliases": [],
        "unitAlias": ""
      },
      {
        "baseContracts": [
          {
            "arguments": null,
            "baseName": {
              "contractScope": null,
              "id": 3774,
              "name": "IAuthorizable",
              "nodeType": "UserDefinedTypeName",
              "referencedDeclaration": 3827,
              "src": "699:13:27",
              "typeDescriptions": {
                "typeIdentifier": "t_contract$_IAuthorizable_$3827",
                "typeString": "contract IAuthorizable"
              }
            },
            "id": 3775,
            "nodeType": "InheritanceSpecifier",
            "src": "699:13:27"
          }
        ],
        "contractDependencies": [
          3801,
          3827
        ],
        "contractKind": "contract",
        "documentation": null,
        "fullyImplemented": false,
        "id": 3792,
        "linearizedBaseContracts": [
          3792,
          3827,
          3801
        ],
        "name": "IAssetProxy",
        "nodeType": "ContractDefinition",
        "nodes": [
          {
            "body": null,
            "documentation": "@dev Transfers assets. Either succeeds or throws.\n @param assetData Byte array encoded for the respective asset proxy.\n @param from Address to transfer asset from.\n @param to Address to transfer asset to.\n @param amount Amount of asset to transfer.",
            "id": 3786,
            "implemented": false,
            "isConstructor": false,
            "isDeclaredConst": false,
            "modifiers": [],
            "name": "transferFrom",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 3784,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 3777,
                  "name": "assetData",
                  "nodeType": "VariableDeclaration",
                  "scope": 3786,
                  "src": "1036:15:27",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes_calldata_ptr",
                    "typeString": "bytes"
                  },
                  "typeName": {
                    "id": 3776,
                    "name": "bytes",
                    "nodeType": "ElementaryTypeName",
                    "src": "1036:5:27",
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
                  "id": 3779,
                  "name": "from",
                  "nodeType": "VariableDeclaration",
                  "scope": 3786,
                  "src": "1061:12:27",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 3778,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "1061:7:27",
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
                  "id": 3781,
                  "name": "to",
                  "nodeType": "VariableDeclaration",
                  "scope": 3786,
                  "src": "1083:10:27",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 3780,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "1083:7:27",
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
                  "id": 3783,
                  "name": "amount",
                  "nodeType": "VariableDeclaration",
                  "scope": 3786,
                  "src": "1103:14:27",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint256",
                    "typeString": "uint256"
                  },
                  "typeName": {
                    "id": 3782,
                    "name": "uint256",
                    "nodeType": "ElementaryTypeName",
                    "src": "1103:7:27",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "1026:97:27"
            },
            "payable": false,
            "returnParameters": {
              "id": 3785,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "1140:0:27"
            },
            "scope": 3792,
            "src": "1005:136:27",
            "stateMutability": "nonpayable",
            "superFunction": null,
            "visibility": "external"
          },
          {
            "body": null,
            "documentation": "@dev Gets the proxy id associated with the proxy address.\n @return Proxy id.",
            "id": 3791,
            "implemented": false,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "getProxyId",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 3787,
              "nodeType": "ParameterList",
              "parameters": [],
              "src": "1262:2:27"
            },
            "payable": false,
            "returnParameters": {
              "id": 3790,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 3789,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 3791,
                  "src": "1312:6:27",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes4",
                    "typeString": "bytes4"
                  },
                  "typeName": {
                    "id": 3788,
                    "name": "bytes4",
                    "nodeType": "ElementaryTypeName",
                    "src": "1312:6:27",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes4",
                      "typeString": "bytes4"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "1311:8:27"
            },
            "scope": 3792,
            "src": "1243:77:27",
            "stateMutability": "view",
            "superFunction": null,
            "visibility": "external"
          }
        ],
        "scope": 3793,
        "src": "671:651:27"
      }
    ],
    "src": "580:743:27"
  },
  "compiler": {
    "name": "solc",
    "version": "0.4.24+commit.e67f0147.Emscripten.clang"
  },
  "networks": {},
  "schemaVersion": "2.0.0",
  "updatedAt": "2018-07-13T21:55:38.414Z"
}