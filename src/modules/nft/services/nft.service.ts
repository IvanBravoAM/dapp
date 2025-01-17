// Third Party Dependencies.
import { Contract, ethers, Wallet } from 'ethers';
import { Injectable } from '@nestjs/common';

// Local Dependencies.
import ERC721_ABI from '../../../contracts/abis/ERC721_ABI.json';
import ERC721Factory_ABI from '../../../contracts/abis/ERC721Factory_ABI.json';
import { WalletService } from '../../wallet/services/wallet.service';
import { ConfigService } from '../../../config/config.service';
import { Blockchain } from '../../../config/config.keys';

@Injectable()
export class NftService {
  constructor(
    private readonly configService: ConfigService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * @todo Refactor this.
   * @task Deploy ERC721 Token.
   * @description This method will deploy an ERC721 Token.
   */
  async deployERC721Token(
    tokenParams: { name: string; symbol: string; baseURI: string },
  ): Promise<{ "hash": string, "address": string }> {
    const { name, symbol, baseURI } = tokenParams;
    //const methodName = 'createNewERC721Token(string,string,string)';
    const methodName = 'createNewERC721Token';
    const contract = this.getERC721TokenFactory();
    try {
      //const tx = await contract[methodName](name, symbol, baseURI);
      const tx = await contract.createNewERC721Token(name, symbol, baseURI);
      const receipt = await tx.wait();
      console.log(`Smart Contract Method "${methodName}" tx:`, tx);
      console.log(`Smart Contract Method "${methodName}" receipt:`, receipt);
      const address = receipt.logs[0].address;
      const hash = receipt.hash;
      return { "address": address, "hash": hash };
    } catch (error) {
      throw error;
    }
  }

  /**
   * @todo Refactor this.
   * @task Get ERC721 Contract.
   * @description This method will return the ERC721 Contract.
   */
  getERC721TokenFactory(): Contract {
    // Get Wallet to Sign.
    const wallet = this.walletService.getWallet();
    const contract = new ethers.Contract(
      this.configService.get(Blockchain.ERC721_FACTORY_ADDRESS),
      ERC721Factory_ABI,
      wallet,
    );

    return contract;
  }

  async getERC721Tokens() {
    const contract = this.getERC721TokenFactory();
    const tokens = await contract.getAllERC721Tokens();
    return tokens;
  }

  /**
   * @todo Refactor this.
   * @task Get Owner of ERC721 Token.
   * @description This method will return the owner of an ERC721 Token.
   */
  async getOwner(token: string, tokenId: string): Promise<string> {
    const provider = this.walletService.getProvider();
    const contract = new ethers.Contract(token, ERC721_ABI, provider);
    try {
      // if (!(await contract.ownerOf(tokenId)).call()) {
      //   throw new Error('Token no existente');
      // }
      return await contract.ownerOf(tokenId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * @todo Refactor this.
   * @task Get Token URI.
   * @description This method will return the URI of an ERC721 Token.
   */
  async getTokenURI(token: string, tokenId: string): Promise<string> {
    const provider = this.walletService.getProvider();
    const contract = new ethers.Contract(token, ERC721_ABI, provider);
    try {
      return await contract.tokenURI(tokenId);
    } catch (error) {
      throw error;
    }
  }

  async safeMint(token: string, to: string, tokenId: number, uri: string): Promise<string> {
    const contract = this.getERC721TokenFactory();
    const tx = await contract.callSafeMint(token, to, tokenId, uri);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async safeTransfer(token: string, from: string, to: string, tokenId: number): Promise<string> {
    const contract = this.getERC721TokenFactory();
    const tx = await contract.callSafeTransfer(token, from, to, tokenId);
    const receipt = await tx.wait();
    return receipt.hash;
  }

  async burn(token: string, from: string, tokenId: number): Promise<string> {
    const contract = this.getERC721TokenFactory();
    const tx = await contract.callBurn(token, from, tokenId);
    const receipt = await tx.wait();
    return receipt.hash;
  }

}