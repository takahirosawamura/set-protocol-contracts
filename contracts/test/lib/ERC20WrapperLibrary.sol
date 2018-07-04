pragma solidity 0.4.24;
pragma experimental "ABIEncoderV2";

import { ERC20Wrapper } from "../../core/lib/ERC20Wrapper.sol";

// Mock contract implementation of ERC20Wrapper functions
contract ERC20WrapperLibrary {
    function allowance(
        address _tokenAddress,
        address _tokenOwner,
        address _spender
    )
        external
        view
        returns (uint256)
    {
        return ERC20Wrapper.allowance(_tokenAddress, _tokenOwner, _spender);
    }

    function approve(
        address _tokenAddress,
        address _spender,
        uint256 _quantity
    )
        external
    {
        ERC20Wrapper.approve(_tokenAddress, _spender, _quantity);
    }
}

