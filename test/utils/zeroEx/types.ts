export interface EIP712Parameter {
    name: string;
    type: EIP712Types;
}

export interface EIP712Schema {
    name: string;
    parameters: EIP712Parameter[];
}

export enum EIP712Types {
    Address = 'address',
    Bytes = 'bytes',
    Bytes32 = 'bytes32',
    String = 'string',
    Uint256 = 'uint256',
}