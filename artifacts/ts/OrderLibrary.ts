export const OrderLibrary = 
{
  "contractName": "OrderLibrary",
  "abi": [],
  "bytecode": "0x604c602c600b82828239805160001a60731460008114601c57601e565bfe5b5030600052607381538281f30073000000000000000000000000000000000000000030146080604052600080fd00a165627a7a723058201eb78b9af9a5eb477448e87774fb483da9fe1c7dd820ca5d1afcbfa7b9702ffc0029",
  "deployedBytecode": "0x73000000000000000000000000000000000000000030146080604052600080fd00a165627a7a723058201eb78b9af9a5eb477448e87774fb483da9fe1c7dd820ca5d1afcbfa7b9702ffc0029",
  "sourceMap": "772:4774:25:-;;132:2:-1;166:7;155:9;146:7;137:37;252:7;246:14;243:1;238:23;232:4;229:33;270:1;265:20;;;;222:63;;265:20;274:9;222:63;;298:9;295:1;288:20;328:4;319:7;311:22;352:7;343;336:24",
  "deployedSourceMap": "772:4774:25:-;;;;;;;;",
  "source": "/*\n    Copyright 2018 Set Labs Inc.\n\n    Licensed under the Apache License, Version 2.0 (the \"License\");\n    you may not use this file except in compliance with the License.\n    You may obtain a copy of the License at\n\n    http://www.apache.org/licenses/LICENSE-2.0\n\n    Unless required by applicable law or agreed to in writing, software\n    distributed under the License is distributed on an \"AS IS\" BASIS,\n    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n    See the License for the specific language governing permissions and\n    limitations under the License.\n*/\n\npragma solidity 0.4.24;\n\n\n/**\n * @title OrderLibrary\n * @author Set Protocol\n *\n * The Order Library contains functions for checking validation and hashing of Orders.\n *\n */\n\nlibrary OrderLibrary {\n\n    /* ============ Structs ============ */\n\n    /**\n     * Struct containing all parameters for the issuance order\n     *\n     * @param  setAddress                   Set the maker wants to mint\n     * @param  quantity                     Amount of Sets maker is looking to mint\n     * @param  requiredComponents           Components to be acquired by taker's exchange orders\n     * @param  requiredComponentAmounts     Amounts of each component to be acquired by exchange order\n     * @param  makerAddress                 Address of maker of the Issuance Order\n     * @param  makerToken                   Address of token maker wants to exchange for filling issuance order\n     * @param  makerTokenAmount             Amount of makerToken to be used to fill the order\n     * @param  expiration                   Timestamp marking when the order expires\n     * @param  relayerAddress               Address of relayer\n     * @param  relayerTokenAmount           Token relayer wants to be compensated in\n     * @param  relayerTokenAmount           Amount of tokens relayer wants to be compensated\n     * @param  salt                         Random number used to create unique orderHash\n     * @param  orderHash                    Unique order identifier used to log information about the order in the protocol\n     */\n    struct IssuanceOrder {\n        address setAddress;                 // _addresses[0]\n        uint256 quantity;                   // _values[0]\n        address[] requiredComponents;       // _requiredComponents\n        uint[] requiredComponentAmounts;    // _requiredComponentAmounts\n        address makerAddress;               // _addresses[1]\n        address makerToken;                 // _addresses[2]\n        uint256 makerTokenAmount;           // _values[1]\n        uint256 expiration;                 // _values[2]\n        address relayerAddress;             // _addresses[3]\n        address relayerToken;               // _addresses[4]\n        uint256 relayerTokenAmount;         // _values[3]\n        uint256 salt;                       // _values[4]\n        bytes32 orderHash;\n    }\n\n    /* ============ Internal Functions ============ */\n\n    /**\n     * Create hash of order parameters\n     *\n     * @param  _addresses                   [setAddress, makerAddress, makerToken, relayerAddress, relayerToken]\n     * @param  _values                      [quantity, makerTokenAmount, expiration, relayerTokenAmount, salt]\n     * @param  _requiredComponents          Components to be acquired by exchange order\n     * @param  _requiredComponentAmounts    Amounts of each component to be acquired by exchange order\n     */\n    function generateOrderHash(\n        address[5] _addresses,\n        uint[5] _values,\n        address[] _requiredComponents,\n        uint[] _requiredComponentAmounts\n    )\n        internal\n        pure\n        returns(bytes32)\n    {\n        // Hash the order parameters\n        return keccak256(\n            abi.encodePacked(\n                _addresses[0],              // setAddress\n                _addresses[1],              // makerAddress\n                _addresses[2],              // makerToken\n                _addresses[3],              // relayerAddress\n                _addresses[4],              // relayerToken\n                _values[0],                 // quantity\n                _values[1],                 // makerTokenAmount\n                _values[2],                 // expiration\n                _values[3],                 // relayerTokenAmount\n                _values[4],                 // salt\n                _requiredComponents,        // _requiredComponents\n                _requiredComponentAmounts   // _requiredComponentAmounts\n            )\n        );\n    }\n\n    /**\n     * Validate order signature\n     *\n     * @param  _orderHash       Hash of issuance order\n     * @param  _signerAddress   Address of Issuance Order signer\n     * @param  _v               v element of ECDSA signature\n     * @param  _r               r element of ECDSA signature\n     * @param  _s               s element of ECDSA signature\n     */\n    function validateSignature(\n        bytes32 _orderHash,\n        address _signerAddress,\n        uint8 _v,\n        bytes32 _r,\n        bytes32 _s\n    )\n        internal\n        pure\n        returns(bool)\n    {\n        // Public address returned by ecrecover function\n        address recAddress;\n\n        // Ethereum msg prefix\n        bytes memory msgPrefix = \"\\x19Ethereum Signed Message:\\n32\";\n\n        // Find what address signed the order\n        recAddress = ecrecover(\n            keccak256(abi.encodePacked(msgPrefix, _orderHash)),\n            _v,\n            _r,\n            _s\n        );\n\n        return recAddress == _signerAddress;\n    }\n}\n",
  "sourcePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/core/lib/OrderLibrary.sol",
  "ast": {
    "absolutePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/core/lib/OrderLibrary.sol",
    "exportedSymbols": {
      "OrderLibrary": [
        3752
      ]
    },
    "id": 3753,
    "nodeType": "SourceUnit",
    "nodes": [
      {
        "id": 3622,
        "literals": [
          "solidity",
          "0.4",
          ".24"
        ],
        "nodeType": "PragmaDirective",
        "src": "597:23:25"
      },
      {
        "baseContracts": [],
        "contractDependencies": [],
        "contractKind": "library",
        "documentation": "@title OrderLibrary\n@author Set Protocol\n * The Order Library contains functions for checking validation and hashing of Orders.\n ",
        "fullyImplemented": true,
        "id": 3752,
        "linearizedBaseContracts": [
          3752
        ],
        "name": "OrderLibrary",
        "nodeType": "ContractDefinition",
        "nodes": [
          {
            "canonicalName": "OrderLibrary.IssuanceOrder",
            "id": 3651,
            "members": [
              {
                "constant": false,
                "id": 3624,
                "name": "setAddress",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2147:18:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_address",
                  "typeString": "address"
                },
                "typeName": {
                  "id": 3623,
                  "name": "address",
                  "nodeType": "ElementaryTypeName",
                  "src": "2147:7:25",
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
                "id": 3626,
                "name": "quantity",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2208:16:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 3625,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "2208:7:25",
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
                "id": 3629,
                "name": "requiredComponents",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2266:28:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_array$_t_address_$dyn_storage_ptr",
                  "typeString": "address[]"
                },
                "typeName": {
                  "baseType": {
                    "id": 3627,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "2266:7:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "id": 3628,
                  "length": null,
                  "nodeType": "ArrayTypeName",
                  "src": "2266:9:25",
                  "typeDescriptions": {
                    "typeIdentifier": "t_array$_t_address_$dyn_storage_ptr",
                    "typeString": "address[]"
                  }
                },
                "value": null,
                "visibility": "internal"
              },
              {
                "constant": false,
                "id": 3632,
                "name": "requiredComponentAmounts",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2333:31:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_array$_t_uint256_$dyn_storage_ptr",
                  "typeString": "uint256[]"
                },
                "typeName": {
                  "baseType": {
                    "id": 3630,
                    "name": "uint",
                    "nodeType": "ElementaryTypeName",
                    "src": "2333:4:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "id": 3631,
                  "length": null,
                  "nodeType": "ArrayTypeName",
                  "src": "2333:6:25",
                  "typeDescriptions": {
                    "typeIdentifier": "t_array$_t_uint256_$dyn_storage_ptr",
                    "typeString": "uint256[]"
                  }
                },
                "value": null,
                "visibility": "internal"
              },
              {
                "constant": false,
                "id": 3634,
                "name": "makerAddress",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2406:20:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_address",
                  "typeString": "address"
                },
                "typeName": {
                  "id": 3633,
                  "name": "address",
                  "nodeType": "ElementaryTypeName",
                  "src": "2406:7:25",
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
                "id": 3636,
                "name": "makerToken",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2467:18:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_address",
                  "typeString": "address"
                },
                "typeName": {
                  "id": 3635,
                  "name": "address",
                  "nodeType": "ElementaryTypeName",
                  "src": "2467:7:25",
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
                "id": 3638,
                "name": "makerTokenAmount",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2528:24:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 3637,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "2528:7:25",
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
                "id": 3640,
                "name": "expiration",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2586:18:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 3639,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "2586:7:25",
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
                "id": 3642,
                "name": "relayerAddress",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2644:22:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_address",
                  "typeString": "address"
                },
                "typeName": {
                  "id": 3641,
                  "name": "address",
                  "nodeType": "ElementaryTypeName",
                  "src": "2644:7:25",
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
                "id": 3644,
                "name": "relayerToken",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2705:20:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_address",
                  "typeString": "address"
                },
                "typeName": {
                  "id": 3643,
                  "name": "address",
                  "nodeType": "ElementaryTypeName",
                  "src": "2705:7:25",
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
                "id": 3646,
                "name": "relayerTokenAmount",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2766:26:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 3645,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "2766:7:25",
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
                "id": 3648,
                "name": "salt",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2824:12:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 3647,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "2824:7:25",
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
                "id": 3650,
                "name": "orderHash",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2882:17:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_bytes32",
                  "typeString": "bytes32"
                },
                "typeName": {
                  "id": 3649,
                  "name": "bytes32",
                  "nodeType": "ElementaryTypeName",
                  "src": "2882:7:25",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  }
                },
                "value": null,
                "visibility": "internal"
              }
            ],
            "name": "IssuanceOrder",
            "nodeType": "StructDefinition",
            "scope": 3752,
            "src": "2116:790:25",
            "visibility": "public"
          },
          {
            "body": {
              "id": 3708,
              "nodeType": "Block",
              "src": "3674:859:25",
              "statements": [
                {
                  "expression": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "arguments": [
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3673,
                              "name": "_addresses",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3655,
                              "src": "3785:10:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_address_$5_memory_ptr",
                                "typeString": "address[5] memory"
                              }
                            },
                            "id": 3675,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "30",
                              "id": 3674,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "3796:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_0_by_1",
                                "typeString": "int_const 0"
                              },
                              "value": "0"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "3785:13:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3676,
                              "name": "_addresses",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3655,
                              "src": "3843:10:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_address_$5_memory_ptr",
                                "typeString": "address[5] memory"
                              }
                            },
                            "id": 3678,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "31",
                              "id": 3677,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "3854:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_1_by_1",
                                "typeString": "int_const 1"
                              },
                              "value": "1"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "3843:13:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3679,
                              "name": "_addresses",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3655,
                              "src": "3903:10:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_address_$5_memory_ptr",
                                "typeString": "address[5] memory"
                              }
                            },
                            "id": 3681,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "32",
                              "id": 3680,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "3914:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_2_by_1",
                                "typeString": "int_const 2"
                              },
                              "value": "2"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "3903:13:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3682,
                              "name": "_addresses",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3655,
                              "src": "3961:10:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_address_$5_memory_ptr",
                                "typeString": "address[5] memory"
                              }
                            },
                            "id": 3684,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "33",
                              "id": 3683,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "3972:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_3_by_1",
                                "typeString": "int_const 3"
                              },
                              "value": "3"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "3961:13:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3685,
                              "name": "_addresses",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3655,
                              "src": "4023:10:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_address_$5_memory_ptr",
                                "typeString": "address[5] memory"
                              }
                            },
                            "id": 3687,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "34",
                              "id": 3686,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "4034:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_4_by_1",
                                "typeString": "int_const 4"
                              },
                              "value": "4"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "4023:13:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3688,
                              "name": "_values",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3659,
                              "src": "4083:7:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_uint256_$5_memory_ptr",
                                "typeString": "uint256[5] memory"
                              }
                            },
                            "id": 3690,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "30",
                              "id": 3689,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "4091:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_0_by_1",
                                "typeString": "int_const 0"
                              },
                              "value": "0"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "4083:10:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3691,
                              "name": "_values",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3659,
                              "src": "4139:7:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_uint256_$5_memory_ptr",
                                "typeString": "uint256[5] memory"
                              }
                            },
                            "id": 3693,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "31",
                              "id": 3692,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "4147:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_1_by_1",
                                "typeString": "int_const 1"
                              },
                              "value": "1"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "4139:10:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3694,
                              "name": "_values",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3659,
                              "src": "4203:7:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_uint256_$5_memory_ptr",
                                "typeString": "uint256[5] memory"
                              }
                            },
                            "id": 3696,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "32",
                              "id": 3695,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "4211:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_2_by_1",
                                "typeString": "int_const 2"
                              },
                              "value": "2"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "4203:10:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3697,
                              "name": "_values",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3659,
                              "src": "4261:7:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_uint256_$5_memory_ptr",
                                "typeString": "uint256[5] memory"
                              }
                            },
                            "id": 3699,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "33",
                              "id": 3698,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "4269:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_3_by_1",
                                "typeString": "int_const 3"
                              },
                              "value": "3"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "4261:10:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3700,
                              "name": "_values",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3659,
                              "src": "4327:7:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_uint256_$5_memory_ptr",
                                "typeString": "uint256[5] memory"
                              }
                            },
                            "id": 3702,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "34",
                              "id": 3701,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "4335:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_4_by_1",
                                "typeString": "int_const 4"
                              },
                              "value": "4"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "4327:10:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "id": 3703,
                            "name": "_requiredComponents",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 3662,
                            "src": "4379:19:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_array$_t_address_$dyn_memory_ptr",
                              "typeString": "address[] memory"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "id": 3704,
                            "name": "_requiredComponentAmounts",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 3665,
                            "src": "4446:25:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_array$_t_uint256_$dyn_memory_ptr",
                              "typeString": "uint256[] memory"
                            }
                          }
                        ],
                        "expression": {
                          "argumentTypes": [
                            {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            },
                            {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            },
                            {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            },
                            {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            },
                            {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            },
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            },
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            },
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            },
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            },
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            },
                            {
                              "typeIdentifier": "t_array$_t_address_$dyn_memory_ptr",
                              "typeString": "address[] memory"
                            },
                            {
                              "typeIdentifier": "t_array$_t_uint256_$dyn_memory_ptr",
                              "typeString": "uint256[] memory"
                            }
                          ],
                          "expression": {
                            "argumentTypes": null,
                            "id": 3671,
                            "name": "abi",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 6886,
                            "src": "3751:3:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_magic_abi",
                              "typeString": "abi"
                            }
                          },
                          "id": 3672,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": true,
                          "lValueRequested": false,
                          "memberName": "encodePacked",
                          "nodeType": "MemberAccess",
                          "referencedDeclaration": null,
                          "src": "3751:16:25",
                          "typeDescriptions": {
                            "typeIdentifier": "t_function_abiencodepacked_pure$__$returns$_t_bytes_memory_ptr_$",
                            "typeString": "function () pure returns (bytes memory)"
                          }
                        },
                        "id": 3705,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "kind": "functionCall",
                        "lValueRequested": false,
                        "names": [],
                        "nodeType": "FunctionCall",
                        "src": "3751:765:25",
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
                      "id": 3670,
                      "name": "keccak256",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 6893,
                      "src": "3728:9:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_sha3_pure$__$returns$_t_bytes32_$",
                        "typeString": "function () pure returns (bytes32)"
                      }
                    },
                    "id": 3706,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "3728:798:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    }
                  },
                  "functionReturnParameters": 3669,
                  "id": 3707,
                  "nodeType": "Return",
                  "src": "3721:805:25"
                }
              ]
            },
            "documentation": "Create hash of order parameters\n     * @param  _addresses                   [setAddress, makerAddress, makerToken, relayerAddress, relayerToken]\n@param  _values                      [quantity, makerTokenAmount, expiration, relayerTokenAmount, salt]\n@param  _requiredComponents          Components to be acquired by exchange order\n@param  _requiredComponentAmounts    Amounts of each component to be acquired by exchange order",
            "id": 3709,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "generateOrderHash",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 3666,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 3655,
                  "name": "_addresses",
                  "nodeType": "VariableDeclaration",
                  "scope": 3709,
                  "src": "3481:21:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_array$_t_address_$5_memory_ptr",
                    "typeString": "address[5]"
                  },
                  "typeName": {
                    "baseType": {
                      "id": 3652,
                      "name": "address",
                      "nodeType": "ElementaryTypeName",
                      "src": "3481:7:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "id": 3654,
                    "length": {
                      "argumentTypes": null,
                      "hexValue": "35",
                      "id": 3653,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "number",
                      "lValueRequested": false,
                      "nodeType": "Literal",
                      "src": "3489:1:25",
                      "subdenomination": null,
                      "typeDescriptions": {
                        "typeIdentifier": null,
                        "typeString": null
                      },
                      "value": "5"
                    },
                    "nodeType": "ArrayTypeName",
                    "src": "3481:10:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_array$_t_address_$5_storage_ptr",
                      "typeString": "address[5]"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 3659,
                  "name": "_values",
                  "nodeType": "VariableDeclaration",
                  "scope": 3709,
                  "src": "3512:15:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_array$_t_uint256_$5_memory_ptr",
                    "typeString": "uint256[5]"
                  },
                  "typeName": {
                    "baseType": {
                      "id": 3656,
                      "name": "uint",
                      "nodeType": "ElementaryTypeName",
                      "src": "3512:4:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      }
                    },
                    "id": 3658,
                    "length": {
                      "argumentTypes": null,
                      "hexValue": "35",
                      "id": 3657,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "number",
                      "lValueRequested": false,
                      "nodeType": "Literal",
                      "src": "3517:1:25",
                      "subdenomination": null,
                      "typeDescriptions": {
                        "typeIdentifier": null,
                        "typeString": null
                      },
                      "value": "5"
                    },
                    "nodeType": "ArrayTypeName",
                    "src": "3512:7:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_array$_t_uint256_$5_storage_ptr",
                      "typeString": "uint256[5]"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 3662,
                  "name": "_requiredComponents",
                  "nodeType": "VariableDeclaration",
                  "scope": 3709,
                  "src": "3537:29:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_array$_t_address_$dyn_memory_ptr",
                    "typeString": "address[]"
                  },
                  "typeName": {
                    "baseType": {
                      "id": 3660,
                      "name": "address",
                      "nodeType": "ElementaryTypeName",
                      "src": "3537:7:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "id": 3661,
                    "length": null,
                    "nodeType": "ArrayTypeName",
                    "src": "3537:9:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_array$_t_address_$dyn_storage_ptr",
                      "typeString": "address[]"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 3665,
                  "name": "_requiredComponentAmounts",
                  "nodeType": "VariableDeclaration",
                  "scope": 3709,
                  "src": "3576:32:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_array$_t_uint256_$dyn_memory_ptr",
                    "typeString": "uint256[]"
                  },
                  "typeName": {
                    "baseType": {
                      "id": 3663,
                      "name": "uint",
                      "nodeType": "ElementaryTypeName",
                      "src": "3576:4:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      }
                    },
                    "id": 3664,
                    "length": null,
                    "nodeType": "ArrayTypeName",
                    "src": "3576:6:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_array$_t_uint256_$dyn_storage_ptr",
                      "typeString": "uint256[]"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "3471:143:25"
            },
            "payable": false,
            "returnParameters": {
              "id": 3669,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 3668,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 3709,
                  "src": "3661:7:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  },
                  "typeName": {
                    "id": 3667,
                    "name": "bytes32",
                    "nodeType": "ElementaryTypeName",
                    "src": "3661:7:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "3660:9:25"
            },
            "scope": 3752,
            "src": "3445:1088:25",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 3750,
              "nodeType": "Block",
              "src": "5104:440:25",
              "statements": [
                {
                  "assignments": [],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 3725,
                      "name": "recAddress",
                      "nodeType": "VariableDeclaration",
                      "scope": 3751,
                      "src": "5171:18:25",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      },
                      "typeName": {
                        "id": 3724,
                        "name": "address",
                        "nodeType": "ElementaryTypeName",
                        "src": "5171:7:25",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 3726,
                  "initialValue": null,
                  "nodeType": "VariableDeclarationStatement",
                  "src": "5171:18:25"
                },
                {
                  "assignments": [
                    3728
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 3728,
                      "name": "msgPrefix",
                      "nodeType": "VariableDeclaration",
                      "scope": 3751,
                      "src": "5231:22:25",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes_memory_ptr",
                        "typeString": "bytes"
                      },
                      "typeName": {
                        "id": 3727,
                        "name": "bytes",
                        "nodeType": "ElementaryTypeName",
                        "src": "5231:5:25",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_storage_ptr",
                          "typeString": "bytes"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 3730,
                  "initialValue": {
                    "argumentTypes": null,
                    "hexValue": "19457468657265756d205369676e6564204d6573736167653a0a3332",
                    "id": 3729,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": true,
                    "kind": "string",
                    "lValueRequested": false,
                    "nodeType": "Literal",
                    "src": "5256:34:25",
                    "subdenomination": null,
                    "typeDescriptions": {
                      "typeIdentifier": "t_stringliteral_178a2411ab6fbc1ba11064408972259c558d0e82fd48b0aba3ad81d14f065e73",
                      "typeString": "literal_string \"\u0019Ethereum Signed Message:\n32\""
                    },
                    "value": "\u0019Ethereum Signed Message:\n32"
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "5231:59:25"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 3744,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "lValueRequested": false,
                    "leftHandSide": {
                      "argumentTypes": null,
                      "id": 3731,
                      "name": "recAddress",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 3725,
                      "src": "5347:10:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
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
                              "arguments": [
                                {
                                  "argumentTypes": null,
                                  "id": 3736,
                                  "name": "msgPrefix",
                                  "nodeType": "Identifier",
                                  "overloadedDeclarations": [],
                                  "referencedDeclaration": 3728,
                                  "src": "5410:9:25",
                                  "typeDescriptions": {
                                    "typeIdentifier": "t_bytes_memory_ptr",
                                    "typeString": "bytes memory"
                                  }
                                },
                                {
                                  "argumentTypes": null,
                                  "id": 3737,
                                  "name": "_orderHash",
                                  "nodeType": "Identifier",
                                  "overloadedDeclarations": [],
                                  "referencedDeclaration": 3711,
                                  "src": "5421:10:25",
                                  "typeDescriptions": {
                                    "typeIdentifier": "t_bytes32",
                                    "typeString": "bytes32"
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
                                    "typeIdentifier": "t_bytes32",
                                    "typeString": "bytes32"
                                  }
                                ],
                                "expression": {
                                  "argumentTypes": null,
                                  "id": 3734,
                                  "name": "abi",
                                  "nodeType": "Identifier",
                                  "overloadedDeclarations": [],
                                  "referencedDeclaration": 6886,
                                  "src": "5393:3:25",
                                  "typeDescriptions": {
                                    "typeIdentifier": "t_magic_abi",
                                    "typeString": "abi"
                                  }
                                },
                                "id": 3735,
                                "isConstant": false,
                                "isLValue": false,
                                "isPure": true,
                                "lValueRequested": false,
                                "memberName": "encodePacked",
                                "nodeType": "MemberAccess",
                                "referencedDeclaration": null,
                                "src": "5393:16:25",
                                "typeDescriptions": {
                                  "typeIdentifier": "t_function_abiencodepacked_pure$__$returns$_t_bytes_memory_ptr_$",
                                  "typeString": "function () pure returns (bytes memory)"
                                }
                              },
                              "id": 3738,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": false,
                              "kind": "functionCall",
                              "lValueRequested": false,
                              "names": [],
                              "nodeType": "FunctionCall",
                              "src": "5393:39:25",
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
                            "id": 3733,
                            "name": "keccak256",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 6893,
                            "src": "5383:9:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_function_sha3_pure$__$returns$_t_bytes32_$",
                              "typeString": "function () pure returns (bytes32)"
                            }
                          },
                          "id": 3739,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "kind": "functionCall",
                          "lValueRequested": false,
                          "names": [],
                          "nodeType": "FunctionCall",
                          "src": "5383:50:25",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 3740,
                          "name": "_v",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 3715,
                          "src": "5447:2:25",
                          "typeDescriptions": {
                            "typeIdentifier": "t_uint8",
                            "typeString": "uint8"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 3741,
                          "name": "_r",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 3717,
                          "src": "5463:2:25",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 3742,
                          "name": "_s",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 3719,
                          "src": "5479:2:25",
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
                          },
                          {
                            "typeIdentifier": "t_uint8",
                            "typeString": "uint8"
                          },
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          },
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        ],
                        "id": 3732,
                        "name": "ecrecover",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 6891,
                        "src": "5360:9:25",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_ecrecover_pure$_t_bytes32_$_t_uint8_$_t_bytes32_$_t_bytes32_$returns$_t_address_$",
                          "typeString": "function (bytes32,uint8,bytes32,bytes32) pure returns (address)"
                        }
                      },
                      "id": 3743,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "5360:131:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "src": "5347:144:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "id": 3745,
                  "nodeType": "ExpressionStatement",
                  "src": "5347:144:25"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "commonType": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    },
                    "id": 3748,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "lValueRequested": false,
                    "leftExpression": {
                      "argumentTypes": null,
                      "id": 3746,
                      "name": "recAddress",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 3725,
                      "src": "5509:10:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "nodeType": "BinaryOperation",
                    "operator": "==",
                    "rightExpression": {
                      "argumentTypes": null,
                      "id": 3747,
                      "name": "_signerAddress",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 3713,
                      "src": "5523:14:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "src": "5509:28:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bool",
                      "typeString": "bool"
                    }
                  },
                  "functionReturnParameters": 3723,
                  "id": 3749,
                  "nodeType": "Return",
                  "src": "5502:35:25"
                }
              ]
            },
            "documentation": "Validate order signature\n     * @param  _orderHash       Hash of issuance order\n@param  _signerAddress   Address of Issuance Order signer\n@param  _v               v element of ECDSA signature\n@param  _r               r element of ECDSA signature\n@param  _s               s element of ECDSA signature",
            "id": 3751,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "validateSignature",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 3720,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 3711,
                  "name": "_orderHash",
                  "nodeType": "VariableDeclaration",
                  "scope": 3751,
                  "src": "4933:18:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  },
                  "typeName": {
                    "id": 3710,
                    "name": "bytes32",
                    "nodeType": "ElementaryTypeName",
                    "src": "4933:7:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 3713,
                  "name": "_signerAddress",
                  "nodeType": "VariableDeclaration",
                  "scope": 3751,
                  "src": "4961:22:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 3712,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "4961:7:25",
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
                  "id": 3715,
                  "name": "_v",
                  "nodeType": "VariableDeclaration",
                  "scope": 3751,
                  "src": "4993:8:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint8",
                    "typeString": "uint8"
                  },
                  "typeName": {
                    "id": 3714,
                    "name": "uint8",
                    "nodeType": "ElementaryTypeName",
                    "src": "4993:5:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint8",
                      "typeString": "uint8"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 3717,
                  "name": "_r",
                  "nodeType": "VariableDeclaration",
                  "scope": 3751,
                  "src": "5011:10:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  },
                  "typeName": {
                    "id": 3716,
                    "name": "bytes32",
                    "nodeType": "ElementaryTypeName",
                    "src": "5011:7:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 3719,
                  "name": "_s",
                  "nodeType": "VariableDeclaration",
                  "scope": 3751,
                  "src": "5031:10:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  },
                  "typeName": {
                    "id": 3718,
                    "name": "bytes32",
                    "nodeType": "ElementaryTypeName",
                    "src": "5031:7:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "4923:124:25"
            },
            "payable": false,
            "returnParameters": {
              "id": 3723,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 3722,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 3751,
                  "src": "5094:4:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bool",
                    "typeString": "bool"
                  },
                  "typeName": {
                    "id": 3721,
                    "name": "bool",
                    "nodeType": "ElementaryTypeName",
                    "src": "5094:4:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bool",
                      "typeString": "bool"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "5093:6:25"
            },
            "scope": 3752,
            "src": "4897:647:25",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          }
        ],
        "scope": 3753,
        "src": "772:4774:25"
      }
    ],
    "src": "597:4950:25"
  },
  "legacyAST": {
    "absolutePath": "/Users/inje/Documents/repos/set-protocol-contracts/contracts/core/lib/OrderLibrary.sol",
    "exportedSymbols": {
      "OrderLibrary": [
        3752
      ]
    },
    "id": 3753,
    "nodeType": "SourceUnit",
    "nodes": [
      {
        "id": 3622,
        "literals": [
          "solidity",
          "0.4",
          ".24"
        ],
        "nodeType": "PragmaDirective",
        "src": "597:23:25"
      },
      {
        "baseContracts": [],
        "contractDependencies": [],
        "contractKind": "library",
        "documentation": "@title OrderLibrary\n@author Set Protocol\n * The Order Library contains functions for checking validation and hashing of Orders.\n ",
        "fullyImplemented": true,
        "id": 3752,
        "linearizedBaseContracts": [
          3752
        ],
        "name": "OrderLibrary",
        "nodeType": "ContractDefinition",
        "nodes": [
          {
            "canonicalName": "OrderLibrary.IssuanceOrder",
            "id": 3651,
            "members": [
              {
                "constant": false,
                "id": 3624,
                "name": "setAddress",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2147:18:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_address",
                  "typeString": "address"
                },
                "typeName": {
                  "id": 3623,
                  "name": "address",
                  "nodeType": "ElementaryTypeName",
                  "src": "2147:7:25",
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
                "id": 3626,
                "name": "quantity",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2208:16:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 3625,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "2208:7:25",
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
                "id": 3629,
                "name": "requiredComponents",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2266:28:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_array$_t_address_$dyn_storage_ptr",
                  "typeString": "address[]"
                },
                "typeName": {
                  "baseType": {
                    "id": 3627,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "2266:7:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "id": 3628,
                  "length": null,
                  "nodeType": "ArrayTypeName",
                  "src": "2266:9:25",
                  "typeDescriptions": {
                    "typeIdentifier": "t_array$_t_address_$dyn_storage_ptr",
                    "typeString": "address[]"
                  }
                },
                "value": null,
                "visibility": "internal"
              },
              {
                "constant": false,
                "id": 3632,
                "name": "requiredComponentAmounts",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2333:31:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_array$_t_uint256_$dyn_storage_ptr",
                  "typeString": "uint256[]"
                },
                "typeName": {
                  "baseType": {
                    "id": 3630,
                    "name": "uint",
                    "nodeType": "ElementaryTypeName",
                    "src": "2333:4:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint256",
                      "typeString": "uint256"
                    }
                  },
                  "id": 3631,
                  "length": null,
                  "nodeType": "ArrayTypeName",
                  "src": "2333:6:25",
                  "typeDescriptions": {
                    "typeIdentifier": "t_array$_t_uint256_$dyn_storage_ptr",
                    "typeString": "uint256[]"
                  }
                },
                "value": null,
                "visibility": "internal"
              },
              {
                "constant": false,
                "id": 3634,
                "name": "makerAddress",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2406:20:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_address",
                  "typeString": "address"
                },
                "typeName": {
                  "id": 3633,
                  "name": "address",
                  "nodeType": "ElementaryTypeName",
                  "src": "2406:7:25",
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
                "id": 3636,
                "name": "makerToken",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2467:18:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_address",
                  "typeString": "address"
                },
                "typeName": {
                  "id": 3635,
                  "name": "address",
                  "nodeType": "ElementaryTypeName",
                  "src": "2467:7:25",
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
                "id": 3638,
                "name": "makerTokenAmount",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2528:24:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 3637,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "2528:7:25",
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
                "id": 3640,
                "name": "expiration",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2586:18:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 3639,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "2586:7:25",
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
                "id": 3642,
                "name": "relayerAddress",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2644:22:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_address",
                  "typeString": "address"
                },
                "typeName": {
                  "id": 3641,
                  "name": "address",
                  "nodeType": "ElementaryTypeName",
                  "src": "2644:7:25",
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
                "id": 3644,
                "name": "relayerToken",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2705:20:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_address",
                  "typeString": "address"
                },
                "typeName": {
                  "id": 3643,
                  "name": "address",
                  "nodeType": "ElementaryTypeName",
                  "src": "2705:7:25",
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
                "id": 3646,
                "name": "relayerTokenAmount",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2766:26:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 3645,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "2766:7:25",
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
                "id": 3648,
                "name": "salt",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2824:12:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_uint256",
                  "typeString": "uint256"
                },
                "typeName": {
                  "id": 3647,
                  "name": "uint256",
                  "nodeType": "ElementaryTypeName",
                  "src": "2824:7:25",
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
                "id": 3650,
                "name": "orderHash",
                "nodeType": "VariableDeclaration",
                "scope": 3651,
                "src": "2882:17:25",
                "stateVariable": false,
                "storageLocation": "default",
                "typeDescriptions": {
                  "typeIdentifier": "t_bytes32",
                  "typeString": "bytes32"
                },
                "typeName": {
                  "id": 3649,
                  "name": "bytes32",
                  "nodeType": "ElementaryTypeName",
                  "src": "2882:7:25",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  }
                },
                "value": null,
                "visibility": "internal"
              }
            ],
            "name": "IssuanceOrder",
            "nodeType": "StructDefinition",
            "scope": 3752,
            "src": "2116:790:25",
            "visibility": "public"
          },
          {
            "body": {
              "id": 3708,
              "nodeType": "Block",
              "src": "3674:859:25",
              "statements": [
                {
                  "expression": {
                    "argumentTypes": null,
                    "arguments": [
                      {
                        "argumentTypes": null,
                        "arguments": [
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3673,
                              "name": "_addresses",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3655,
                              "src": "3785:10:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_address_$5_memory_ptr",
                                "typeString": "address[5] memory"
                              }
                            },
                            "id": 3675,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "30",
                              "id": 3674,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "3796:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_0_by_1",
                                "typeString": "int_const 0"
                              },
                              "value": "0"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "3785:13:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3676,
                              "name": "_addresses",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3655,
                              "src": "3843:10:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_address_$5_memory_ptr",
                                "typeString": "address[5] memory"
                              }
                            },
                            "id": 3678,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "31",
                              "id": 3677,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "3854:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_1_by_1",
                                "typeString": "int_const 1"
                              },
                              "value": "1"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "3843:13:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3679,
                              "name": "_addresses",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3655,
                              "src": "3903:10:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_address_$5_memory_ptr",
                                "typeString": "address[5] memory"
                              }
                            },
                            "id": 3681,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "32",
                              "id": 3680,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "3914:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_2_by_1",
                                "typeString": "int_const 2"
                              },
                              "value": "2"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "3903:13:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3682,
                              "name": "_addresses",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3655,
                              "src": "3961:10:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_address_$5_memory_ptr",
                                "typeString": "address[5] memory"
                              }
                            },
                            "id": 3684,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "33",
                              "id": 3683,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "3972:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_3_by_1",
                                "typeString": "int_const 3"
                              },
                              "value": "3"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "3961:13:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3685,
                              "name": "_addresses",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3655,
                              "src": "4023:10:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_address_$5_memory_ptr",
                                "typeString": "address[5] memory"
                              }
                            },
                            "id": 3687,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "34",
                              "id": 3686,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "4034:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_4_by_1",
                                "typeString": "int_const 4"
                              },
                              "value": "4"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "4023:13:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3688,
                              "name": "_values",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3659,
                              "src": "4083:7:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_uint256_$5_memory_ptr",
                                "typeString": "uint256[5] memory"
                              }
                            },
                            "id": 3690,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "30",
                              "id": 3689,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "4091:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_0_by_1",
                                "typeString": "int_const 0"
                              },
                              "value": "0"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "4083:10:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3691,
                              "name": "_values",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3659,
                              "src": "4139:7:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_uint256_$5_memory_ptr",
                                "typeString": "uint256[5] memory"
                              }
                            },
                            "id": 3693,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "31",
                              "id": 3692,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "4147:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_1_by_1",
                                "typeString": "int_const 1"
                              },
                              "value": "1"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "4139:10:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3694,
                              "name": "_values",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3659,
                              "src": "4203:7:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_uint256_$5_memory_ptr",
                                "typeString": "uint256[5] memory"
                              }
                            },
                            "id": 3696,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "32",
                              "id": 3695,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "4211:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_2_by_1",
                                "typeString": "int_const 2"
                              },
                              "value": "2"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "4203:10:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3697,
                              "name": "_values",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3659,
                              "src": "4261:7:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_uint256_$5_memory_ptr",
                                "typeString": "uint256[5] memory"
                              }
                            },
                            "id": 3699,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "33",
                              "id": 3698,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "4269:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_3_by_1",
                                "typeString": "int_const 3"
                              },
                              "value": "3"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "4261:10:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "baseExpression": {
                              "argumentTypes": null,
                              "id": 3700,
                              "name": "_values",
                              "nodeType": "Identifier",
                              "overloadedDeclarations": [],
                              "referencedDeclaration": 3659,
                              "src": "4327:7:25",
                              "typeDescriptions": {
                                "typeIdentifier": "t_array$_t_uint256_$5_memory_ptr",
                                "typeString": "uint256[5] memory"
                              }
                            },
                            "id": 3702,
                            "indexExpression": {
                              "argumentTypes": null,
                              "hexValue": "34",
                              "id": 3701,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": true,
                              "kind": "number",
                              "lValueRequested": false,
                              "nodeType": "Literal",
                              "src": "4335:1:25",
                              "subdenomination": null,
                              "typeDescriptions": {
                                "typeIdentifier": "t_rational_4_by_1",
                                "typeString": "int_const 4"
                              },
                              "value": "4"
                            },
                            "isConstant": false,
                            "isLValue": true,
                            "isPure": false,
                            "lValueRequested": false,
                            "nodeType": "IndexAccess",
                            "src": "4327:10:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "id": 3703,
                            "name": "_requiredComponents",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 3662,
                            "src": "4379:19:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_array$_t_address_$dyn_memory_ptr",
                              "typeString": "address[] memory"
                            }
                          },
                          {
                            "argumentTypes": null,
                            "id": 3704,
                            "name": "_requiredComponentAmounts",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 3665,
                            "src": "4446:25:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_array$_t_uint256_$dyn_memory_ptr",
                              "typeString": "uint256[] memory"
                            }
                          }
                        ],
                        "expression": {
                          "argumentTypes": [
                            {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            },
                            {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            },
                            {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            },
                            {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            },
                            {
                              "typeIdentifier": "t_address",
                              "typeString": "address"
                            },
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            },
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            },
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            },
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            },
                            {
                              "typeIdentifier": "t_uint256",
                              "typeString": "uint256"
                            },
                            {
                              "typeIdentifier": "t_array$_t_address_$dyn_memory_ptr",
                              "typeString": "address[] memory"
                            },
                            {
                              "typeIdentifier": "t_array$_t_uint256_$dyn_memory_ptr",
                              "typeString": "uint256[] memory"
                            }
                          ],
                          "expression": {
                            "argumentTypes": null,
                            "id": 3671,
                            "name": "abi",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 6886,
                            "src": "3751:3:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_magic_abi",
                              "typeString": "abi"
                            }
                          },
                          "id": 3672,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": true,
                          "lValueRequested": false,
                          "memberName": "encodePacked",
                          "nodeType": "MemberAccess",
                          "referencedDeclaration": null,
                          "src": "3751:16:25",
                          "typeDescriptions": {
                            "typeIdentifier": "t_function_abiencodepacked_pure$__$returns$_t_bytes_memory_ptr_$",
                            "typeString": "function () pure returns (bytes memory)"
                          }
                        },
                        "id": 3705,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "kind": "functionCall",
                        "lValueRequested": false,
                        "names": [],
                        "nodeType": "FunctionCall",
                        "src": "3751:765:25",
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
                      "id": 3670,
                      "name": "keccak256",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 6893,
                      "src": "3728:9:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_function_sha3_pure$__$returns$_t_bytes32_$",
                        "typeString": "function () pure returns (bytes32)"
                      }
                    },
                    "id": 3706,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "kind": "functionCall",
                    "lValueRequested": false,
                    "names": [],
                    "nodeType": "FunctionCall",
                    "src": "3728:798:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    }
                  },
                  "functionReturnParameters": 3669,
                  "id": 3707,
                  "nodeType": "Return",
                  "src": "3721:805:25"
                }
              ]
            },
            "documentation": "Create hash of order parameters\n     * @param  _addresses                   [setAddress, makerAddress, makerToken, relayerAddress, relayerToken]\n@param  _values                      [quantity, makerTokenAmount, expiration, relayerTokenAmount, salt]\n@param  _requiredComponents          Components to be acquired by exchange order\n@param  _requiredComponentAmounts    Amounts of each component to be acquired by exchange order",
            "id": 3709,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "generateOrderHash",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 3666,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 3655,
                  "name": "_addresses",
                  "nodeType": "VariableDeclaration",
                  "scope": 3709,
                  "src": "3481:21:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_array$_t_address_$5_memory_ptr",
                    "typeString": "address[5]"
                  },
                  "typeName": {
                    "baseType": {
                      "id": 3652,
                      "name": "address",
                      "nodeType": "ElementaryTypeName",
                      "src": "3481:7:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "id": 3654,
                    "length": {
                      "argumentTypes": null,
                      "hexValue": "35",
                      "id": 3653,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "number",
                      "lValueRequested": false,
                      "nodeType": "Literal",
                      "src": "3489:1:25",
                      "subdenomination": null,
                      "typeDescriptions": {
                        "typeIdentifier": null,
                        "typeString": null
                      },
                      "value": "5"
                    },
                    "nodeType": "ArrayTypeName",
                    "src": "3481:10:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_array$_t_address_$5_storage_ptr",
                      "typeString": "address[5]"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 3659,
                  "name": "_values",
                  "nodeType": "VariableDeclaration",
                  "scope": 3709,
                  "src": "3512:15:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_array$_t_uint256_$5_memory_ptr",
                    "typeString": "uint256[5]"
                  },
                  "typeName": {
                    "baseType": {
                      "id": 3656,
                      "name": "uint",
                      "nodeType": "ElementaryTypeName",
                      "src": "3512:4:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      }
                    },
                    "id": 3658,
                    "length": {
                      "argumentTypes": null,
                      "hexValue": "35",
                      "id": 3657,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "number",
                      "lValueRequested": false,
                      "nodeType": "Literal",
                      "src": "3517:1:25",
                      "subdenomination": null,
                      "typeDescriptions": {
                        "typeIdentifier": null,
                        "typeString": null
                      },
                      "value": "5"
                    },
                    "nodeType": "ArrayTypeName",
                    "src": "3512:7:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_array$_t_uint256_$5_storage_ptr",
                      "typeString": "uint256[5]"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 3662,
                  "name": "_requiredComponents",
                  "nodeType": "VariableDeclaration",
                  "scope": 3709,
                  "src": "3537:29:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_array$_t_address_$dyn_memory_ptr",
                    "typeString": "address[]"
                  },
                  "typeName": {
                    "baseType": {
                      "id": 3660,
                      "name": "address",
                      "nodeType": "ElementaryTypeName",
                      "src": "3537:7:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "id": 3661,
                    "length": null,
                    "nodeType": "ArrayTypeName",
                    "src": "3537:9:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_array$_t_address_$dyn_storage_ptr",
                      "typeString": "address[]"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 3665,
                  "name": "_requiredComponentAmounts",
                  "nodeType": "VariableDeclaration",
                  "scope": 3709,
                  "src": "3576:32:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_array$_t_uint256_$dyn_memory_ptr",
                    "typeString": "uint256[]"
                  },
                  "typeName": {
                    "baseType": {
                      "id": 3663,
                      "name": "uint",
                      "nodeType": "ElementaryTypeName",
                      "src": "3576:4:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_uint256",
                        "typeString": "uint256"
                      }
                    },
                    "id": 3664,
                    "length": null,
                    "nodeType": "ArrayTypeName",
                    "src": "3576:6:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_array$_t_uint256_$dyn_storage_ptr",
                      "typeString": "uint256[]"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "3471:143:25"
            },
            "payable": false,
            "returnParameters": {
              "id": 3669,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 3668,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 3709,
                  "src": "3661:7:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  },
                  "typeName": {
                    "id": 3667,
                    "name": "bytes32",
                    "nodeType": "ElementaryTypeName",
                    "src": "3661:7:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "3660:9:25"
            },
            "scope": 3752,
            "src": "3445:1088:25",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          },
          {
            "body": {
              "id": 3750,
              "nodeType": "Block",
              "src": "5104:440:25",
              "statements": [
                {
                  "assignments": [],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 3725,
                      "name": "recAddress",
                      "nodeType": "VariableDeclaration",
                      "scope": 3751,
                      "src": "5171:18:25",
                      "stateVariable": false,
                      "storageLocation": "default",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      },
                      "typeName": {
                        "id": 3724,
                        "name": "address",
                        "nodeType": "ElementaryTypeName",
                        "src": "5171:7:25",
                        "typeDescriptions": {
                          "typeIdentifier": "t_address",
                          "typeString": "address"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 3726,
                  "initialValue": null,
                  "nodeType": "VariableDeclarationStatement",
                  "src": "5171:18:25"
                },
                {
                  "assignments": [
                    3728
                  ],
                  "declarations": [
                    {
                      "constant": false,
                      "id": 3728,
                      "name": "msgPrefix",
                      "nodeType": "VariableDeclaration",
                      "scope": 3751,
                      "src": "5231:22:25",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_bytes_memory_ptr",
                        "typeString": "bytes"
                      },
                      "typeName": {
                        "id": 3727,
                        "name": "bytes",
                        "nodeType": "ElementaryTypeName",
                        "src": "5231:5:25",
                        "typeDescriptions": {
                          "typeIdentifier": "t_bytes_storage_ptr",
                          "typeString": "bytes"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }
                  ],
                  "id": 3730,
                  "initialValue": {
                    "argumentTypes": null,
                    "hexValue": "19457468657265756d205369676e6564204d6573736167653a0a3332",
                    "id": 3729,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": true,
                    "kind": "string",
                    "lValueRequested": false,
                    "nodeType": "Literal",
                    "src": "5256:34:25",
                    "subdenomination": null,
                    "typeDescriptions": {
                      "typeIdentifier": "t_stringliteral_178a2411ab6fbc1ba11064408972259c558d0e82fd48b0aba3ad81d14f065e73",
                      "typeString": "literal_string \"\u0019Ethereum Signed Message:\n32\""
                    },
                    "value": "\u0019Ethereum Signed Message:\n32"
                  },
                  "nodeType": "VariableDeclarationStatement",
                  "src": "5231:59:25"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "id": 3744,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "lValueRequested": false,
                    "leftHandSide": {
                      "argumentTypes": null,
                      "id": 3731,
                      "name": "recAddress",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 3725,
                      "src": "5347:10:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
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
                              "arguments": [
                                {
                                  "argumentTypes": null,
                                  "id": 3736,
                                  "name": "msgPrefix",
                                  "nodeType": "Identifier",
                                  "overloadedDeclarations": [],
                                  "referencedDeclaration": 3728,
                                  "src": "5410:9:25",
                                  "typeDescriptions": {
                                    "typeIdentifier": "t_bytes_memory_ptr",
                                    "typeString": "bytes memory"
                                  }
                                },
                                {
                                  "argumentTypes": null,
                                  "id": 3737,
                                  "name": "_orderHash",
                                  "nodeType": "Identifier",
                                  "overloadedDeclarations": [],
                                  "referencedDeclaration": 3711,
                                  "src": "5421:10:25",
                                  "typeDescriptions": {
                                    "typeIdentifier": "t_bytes32",
                                    "typeString": "bytes32"
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
                                    "typeIdentifier": "t_bytes32",
                                    "typeString": "bytes32"
                                  }
                                ],
                                "expression": {
                                  "argumentTypes": null,
                                  "id": 3734,
                                  "name": "abi",
                                  "nodeType": "Identifier",
                                  "overloadedDeclarations": [],
                                  "referencedDeclaration": 6886,
                                  "src": "5393:3:25",
                                  "typeDescriptions": {
                                    "typeIdentifier": "t_magic_abi",
                                    "typeString": "abi"
                                  }
                                },
                                "id": 3735,
                                "isConstant": false,
                                "isLValue": false,
                                "isPure": true,
                                "lValueRequested": false,
                                "memberName": "encodePacked",
                                "nodeType": "MemberAccess",
                                "referencedDeclaration": null,
                                "src": "5393:16:25",
                                "typeDescriptions": {
                                  "typeIdentifier": "t_function_abiencodepacked_pure$__$returns$_t_bytes_memory_ptr_$",
                                  "typeString": "function () pure returns (bytes memory)"
                                }
                              },
                              "id": 3738,
                              "isConstant": false,
                              "isLValue": false,
                              "isPure": false,
                              "kind": "functionCall",
                              "lValueRequested": false,
                              "names": [],
                              "nodeType": "FunctionCall",
                              "src": "5393:39:25",
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
                            "id": 3733,
                            "name": "keccak256",
                            "nodeType": "Identifier",
                            "overloadedDeclarations": [],
                            "referencedDeclaration": 6893,
                            "src": "5383:9:25",
                            "typeDescriptions": {
                              "typeIdentifier": "t_function_sha3_pure$__$returns$_t_bytes32_$",
                              "typeString": "function () pure returns (bytes32)"
                            }
                          },
                          "id": 3739,
                          "isConstant": false,
                          "isLValue": false,
                          "isPure": false,
                          "kind": "functionCall",
                          "lValueRequested": false,
                          "names": [],
                          "nodeType": "FunctionCall",
                          "src": "5383:50:25",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 3740,
                          "name": "_v",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 3715,
                          "src": "5447:2:25",
                          "typeDescriptions": {
                            "typeIdentifier": "t_uint8",
                            "typeString": "uint8"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 3741,
                          "name": "_r",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 3717,
                          "src": "5463:2:25",
                          "typeDescriptions": {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        },
                        {
                          "argumentTypes": null,
                          "id": 3742,
                          "name": "_s",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 3719,
                          "src": "5479:2:25",
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
                          },
                          {
                            "typeIdentifier": "t_uint8",
                            "typeString": "uint8"
                          },
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          },
                          {
                            "typeIdentifier": "t_bytes32",
                            "typeString": "bytes32"
                          }
                        ],
                        "id": 3732,
                        "name": "ecrecover",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 6891,
                        "src": "5360:9:25",
                        "typeDescriptions": {
                          "typeIdentifier": "t_function_ecrecover_pure$_t_bytes32_$_t_uint8_$_t_bytes32_$_t_bytes32_$returns$_t_address_$",
                          "typeString": "function (bytes32,uint8,bytes32,bytes32) pure returns (address)"
                        }
                      },
                      "id": 3743,
                      "isConstant": false,
                      "isLValue": false,
                      "isPure": false,
                      "kind": "functionCall",
                      "lValueRequested": false,
                      "names": [],
                      "nodeType": "FunctionCall",
                      "src": "5360:131:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "src": "5347:144:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    }
                  },
                  "id": 3745,
                  "nodeType": "ExpressionStatement",
                  "src": "5347:144:25"
                },
                {
                  "expression": {
                    "argumentTypes": null,
                    "commonType": {
                      "typeIdentifier": "t_address",
                      "typeString": "address"
                    },
                    "id": 3748,
                    "isConstant": false,
                    "isLValue": false,
                    "isPure": false,
                    "lValueRequested": false,
                    "leftExpression": {
                      "argumentTypes": null,
                      "id": 3746,
                      "name": "recAddress",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 3725,
                      "src": "5509:10:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "nodeType": "BinaryOperation",
                    "operator": "==",
                    "rightExpression": {
                      "argumentTypes": null,
                      "id": 3747,
                      "name": "_signerAddress",
                      "nodeType": "Identifier",
                      "overloadedDeclarations": [],
                      "referencedDeclaration": 3713,
                      "src": "5523:14:25",
                      "typeDescriptions": {
                        "typeIdentifier": "t_address",
                        "typeString": "address"
                      }
                    },
                    "src": "5509:28:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bool",
                      "typeString": "bool"
                    }
                  },
                  "functionReturnParameters": 3723,
                  "id": 3749,
                  "nodeType": "Return",
                  "src": "5502:35:25"
                }
              ]
            },
            "documentation": "Validate order signature\n     * @param  _orderHash       Hash of issuance order\n@param  _signerAddress   Address of Issuance Order signer\n@param  _v               v element of ECDSA signature\n@param  _r               r element of ECDSA signature\n@param  _s               s element of ECDSA signature",
            "id": 3751,
            "implemented": true,
            "isConstructor": false,
            "isDeclaredConst": true,
            "modifiers": [],
            "name": "validateSignature",
            "nodeType": "FunctionDefinition",
            "parameters": {
              "id": 3720,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 3711,
                  "name": "_orderHash",
                  "nodeType": "VariableDeclaration",
                  "scope": 3751,
                  "src": "4933:18:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  },
                  "typeName": {
                    "id": 3710,
                    "name": "bytes32",
                    "nodeType": "ElementaryTypeName",
                    "src": "4933:7:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 3713,
                  "name": "_signerAddress",
                  "nodeType": "VariableDeclaration",
                  "scope": 3751,
                  "src": "4961:22:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_address",
                    "typeString": "address"
                  },
                  "typeName": {
                    "id": 3712,
                    "name": "address",
                    "nodeType": "ElementaryTypeName",
                    "src": "4961:7:25",
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
                  "id": 3715,
                  "name": "_v",
                  "nodeType": "VariableDeclaration",
                  "scope": 3751,
                  "src": "4993:8:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_uint8",
                    "typeString": "uint8"
                  },
                  "typeName": {
                    "id": 3714,
                    "name": "uint8",
                    "nodeType": "ElementaryTypeName",
                    "src": "4993:5:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_uint8",
                      "typeString": "uint8"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 3717,
                  "name": "_r",
                  "nodeType": "VariableDeclaration",
                  "scope": 3751,
                  "src": "5011:10:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  },
                  "typeName": {
                    "id": 3716,
                    "name": "bytes32",
                    "nodeType": "ElementaryTypeName",
                    "src": "5011:7:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "constant": false,
                  "id": 3719,
                  "name": "_s",
                  "nodeType": "VariableDeclaration",
                  "scope": 3751,
                  "src": "5031:10:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bytes32",
                    "typeString": "bytes32"
                  },
                  "typeName": {
                    "id": 3718,
                    "name": "bytes32",
                    "nodeType": "ElementaryTypeName",
                    "src": "5031:7:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bytes32",
                      "typeString": "bytes32"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "4923:124:25"
            },
            "payable": false,
            "returnParameters": {
              "id": 3723,
              "nodeType": "ParameterList",
              "parameters": [
                {
                  "constant": false,
                  "id": 3722,
                  "name": "",
                  "nodeType": "VariableDeclaration",
                  "scope": 3751,
                  "src": "5094:4:25",
                  "stateVariable": false,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_bool",
                    "typeString": "bool"
                  },
                  "typeName": {
                    "id": 3721,
                    "name": "bool",
                    "nodeType": "ElementaryTypeName",
                    "src": "5094:4:25",
                    "typeDescriptions": {
                      "typeIdentifier": "t_bool",
                      "typeString": "bool"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                }
              ],
              "src": "5093:6:25"
            },
            "scope": 3752,
            "src": "4897:647:25",
            "stateMutability": "pure",
            "superFunction": null,
            "visibility": "internal"
          }
        ],
        "scope": 3753,
        "src": "772:4774:25"
      }
    ],
    "src": "597:4950:25"
  },
  "compiler": {
    "name": "solc",
    "version": "0.4.24+commit.e67f0147.Emscripten.clang"
  },
  "networks": {},
  "schemaVersion": "2.0.0",
  "updatedAt": "2018-07-13T21:55:38.413Z"
}