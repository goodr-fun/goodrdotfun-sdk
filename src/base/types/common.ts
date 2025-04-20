import {
  PublicKey,
  TokenAmount,
  VersionedTransactionResponse,
} from '@solana/web3.js';
import { BigNumber } from 'bignumber.js';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export const DECIMALS = 6;

export const TokenMetadataAttributeKeys = {
  DonationDestination: 'Donation Destination',
  DonationAmount: 'Donation Amount',
  TwitterUrl: 'Twitter URL',
  TelegramUrl: 'Telegram URL',
  WebsiteUrl: 'Website URL',
} as const;

export interface TokenMetadataJSON {
  name: string;
  symbol: string;
  description: string;
  image: string;
  animation_url: string;
  external_url: string;
  attributes: {
    // TraitType is value of TokenMetadataAttributeKeys
    trait_type: (typeof TokenMetadataAttributeKeys)[keyof typeof TokenMetadataAttributeKeys];
    value: string;
  }[];
}

export class TokenMetadata {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsString()
  @IsNotEmpty()
  ticker?: string;

  @IsString()
  donationAmount?: string;

  @IsString()
  twitterUrl?: string;

  @IsString()
  telegramUrl?: string;

  @IsString()
  websiteUrl?: string;

  @IsNumber()
  @IsNotEmpty()
  donationDestinationId?: number;

  @IsString()
  imageUrl?: string;

  constructor(params: Partial<TokenMetadata>) {
    Object.assign(this, params);
  }

  static fromJSON(json: TokenMetadataJSON): TokenMetadata {
    return new TokenMetadata({
      name: json.name,
      ticker: json.symbol,
      description: json.description,
      imageUrl: json.image,
      donationAmount: json.attributes.find(
        attr => attr.trait_type === TokenMetadataAttributeKeys.DonationAmount,
      )?.value,
      twitterUrl: json.attributes.find(
        attr => attr.trait_type === TokenMetadataAttributeKeys.TwitterUrl,
      )?.value,
      telegramUrl: json.attributes.find(
        attr => attr.trait_type === TokenMetadataAttributeKeys.TelegramUrl,
      )?.value,
      websiteUrl: json.attributes.find(
        attr => attr.trait_type === TokenMetadataAttributeKeys.WebsiteUrl,
      )?.value,
      donationDestinationId: parseInt(
        json.attributes.find(
          attr =>
            attr.trait_type === TokenMetadataAttributeKeys.DonationDestination,
        )?.value || '0',
      ),
    });
  }

  toJSON(): TokenMetadataJSON {
    const result: TokenMetadataJSON = {
      name: this.name || '',
      symbol: this.ticker || '',
      description: this.description || '',
      image: this.imageUrl || '',
      animation_url: '',
      external_url: 'https://goodr.fun/tokens',
      attributes: [],
    };

    // Add attributes
    // donationDestinationId
    result.attributes.push({
      trait_type: TokenMetadataAttributeKeys.DonationDestination,
      value: this.donationDestinationId?.toString() || '0',
    });

    // donationAmount
    result.attributes.push({
      trait_type: TokenMetadataAttributeKeys.DonationAmount,
      value: this.donationAmount || '',
    });

    // twitterUrl
    result.attributes.push({
      trait_type: TokenMetadataAttributeKeys.TwitterUrl,
      value: this.twitterUrl || '',
    });

    // telegramUrl
    result.attributes.push({
      trait_type: TokenMetadataAttributeKeys.TelegramUrl,
      value: this.telegramUrl || '',
    });

    // websiteUrl
    result.attributes.push({
      trait_type: TokenMetadataAttributeKeys.WebsiteUrl,
      value: this.websiteUrl || '',
    });

    return result;
  }
}

export interface TokenBalanceRow {
  account: PublicKey;
  mint: string;
  balance: TokenAmount;
  delta: BigNumber;
  accountIndex: number;
}

export interface PriceData {
  price: BigNumber;
  marketCap: BigNumber;
  totalSupply: BigNumber;
}

export interface TokenState {
  priceData: PriceData;
  bondingCurveProgress: number;
  totalSupply: BigNumber;
}

export interface PriorityFee {
  unitLimit: number;
  unitPrice: number;
}

export interface TransactionResult {
  signature?: string;
  error?: unknown;
  results?: VersionedTransactionResponse;
  success: boolean;
}
