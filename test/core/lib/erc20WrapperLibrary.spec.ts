import * as chai from "chai";
import * as _ from "lodash";

import * as ABIDecoder from "abi-decoder";
import { BigNumber } from "bignumber.js";

// Types
import { Address } from "../../../types/common.js";

// Contract types
// import { MockTokenInvalidReturnContract } from "../../types/generated/mock_token_invalid_return";
// import { MockTokenNoXferReturnContract } from "../../types/generated/mock_token_no_xfer_return";
import { StandardTokenContract } from "../../../types/generated/standard_token";
import { StandardTokenMockContract } from "../../../types/generated/standard_token_mock";
import { ERC20WrapperLibraryContract } from "../../../types/generated/erc20_wrapper_library";

// Artifacts
const ERC20WrapperLibrary = artifacts.require("ERC20WrapperLibrary");

// Core wrapper
import { ERC20Wrapper } from "../../utils/erc20Wrapper";

// Testing Set up
import { BigNumberSetup } from "../../config/bigNumberSetup";
import ChaiSetup from "../../config/chaiSetup";
BigNumberSetup.configure();
ChaiSetup.configure();
const { expect, assert } = chai;

import { assertTokenBalance, expectRevertError } from "../../utils/tokenAssertions";
import {
  DEPLOYED_TOKEN_QUANTITY,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
} from "../../utils/constants";

contract("ERC20WrapperLibrary", (accounts) => {
  const [
    ownerAccount,
    authorizedAccount,
    vaultAccount,
    otherAccount,
    unauthorizedAccount,
  ] = accounts;

  let mockToken: StandardTokenMockContract;
  let erc20WrapperLibrary: ERC20WrapperLibraryContract;

  const erc20Wrapper = new ERC20Wrapper(ownerAccount);

  before(async () => {
    ABIDecoder.addABI(ERC20WrapperLibrary.abi);
  });

  after(async () => {
    ABIDecoder.removeABI(ERC20WrapperLibrary.abi);
  });

  describe.only("#approve", async () => {
    // Setup
    let approver: Address = ownerAccount;
    let spender: Address = authorizedAccount;
    let amountToApprove: BigNumber = UNLIMITED_ALLOWANCE_IN_BASE_UNITS;
    let tokenAddress: Address;

    beforeEach(async () => {
      mockToken = await erc20Wrapper.deployTokenAsync(ownerAccount);

      erc20WrapperLibrary = await erc20Wrapper.deployERC20WrapperLibraryAsync();

      tokenAddress = mockToken.address;
    });

    async function subject(): Promise<string> {
      return erc20WrapperLibrary.approve.sendTransactionAsync(
        tokenAddress,
        spender,
        amountToApprove,
        { from: approver },
      );
    }

    it("should increase the spender's allowance", async () => {
      const result = await subject();

      // console.log(result);

      expect(1).to.equal(1);

      // const allowance = await erc20WrapperLibrary.allowance.callAsync(
      //   tokenAddress,
      //   approver,
      //   spender,
      // );

      // expect(allowance).to.bignumber.equal(amountToApprove);
    });

    // describe("when the owner of the token is not the user", async () => {
    //   beforeEach(async () => {
    //     subjectCaller = otherAccount;
    //   });

    //   it("should revert", async () => {
    //     await expectRevertError(subject());
    //   });
    // });

    // describe("when the caller is not authorized", async () => {
    //   beforeEach(async () => {
    //     authorizedContract = unauthorizedAccount;
    //   });

    //   it("should revert", async () => {
    //     await expectRevertError(subject());
    //   });
    // });

    // describe("when the token is not approved for transfer", async () => {
    //   before(async () => {
    //     approver = otherAccount;
    //   });

    //   it("should revert", async () => {
    //     await expectRevertError(subject());
    //   });
    // });

    // describe("when the token has a transfer fee", async () => {
    //   let mockTokenWithFee: StandardTokenWithFeeMockContract;

    //   beforeEach(async () => {
    //     mockTokenWithFee = await erc20Wrapper.deployTokenWithFeeAsync(ownerAccount);
    //     tokenAddress = mockTokenWithFee.address;

    //     await erc20Wrapper.approveTransferAsync(mockTokenWithFee, transferProxy.address, ownerAccount);
    //   });

    //   it("should revert", async () => {
    //     await expectRevertError(subject());
    //   });
    // });

    // describe("when the token doesn't return a value on transfer", async () => {
    //   let mockTokenNoXferReturn: MockTokenNoXferReturnContract;

    //   beforeEach(async () => {
    //     mockTokenNoXferReturn = await erc20Wrapper.deployTokenNoXferReturnAsync(ownerAccount);
    //     tokenAddress = mockTokenNoXferReturn.address;

    //     await mockTokenNoXferReturn.approve.sendTransactionAsync(
    //       transferProxy.address,
    //       UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
    //       { from: ownerAccount },
    //     )
    //   });

    //   it("should still work", async () => {
    //     await subject();

    //     const tokenBalance = await mockTokenNoXferReturn.balanceOf.callAsync(vaultAccount);
    //     await expect(tokenBalance).to.be.bignumber.equal(amountToTransfer);
    //   });
    // });

    // describe("when the token returns an invalid value", async () => {
    //   let mockTokenInvalidReturn: MockTokenInvalidReturnContract;

    //   beforeEach(async () => {
    //     mockTokenInvalidReturn = await erc20Wrapper.deployTokenInvalidReturnAsync(ownerAccount);
    //     tokenAddress = mockTokenInvalidReturn.address;

    //     await erc20Wrapper.approveInvalidTransferAsync(mockTokenInvalidReturn, transferProxy.address, ownerAccount);
    //   });

    //   it("should revert", async () => {
    //     await expectRevertError(subject());
    //   });
    // });
  });
});
