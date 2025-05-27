import { PublicKey } from '@solana/web3.js';

export enum MemeDonationDestinationName {
  FarmMeme = 'Farm Meme',
  OGMeme = 'OG Meme',
}

export type MemeDonationDestination = {
  id: number;
  name: MemeDonationDestinationName;
  donationAmount: number;
  address: PublicKey;
};

export const MEME_DONATION_DESTINATIONS: Record<
  number,
  MemeDonationDestination
> = {
  17: {
    id: 17,
    name: MemeDonationDestinationName.FarmMeme,
    donationAmount: 300_000_000,
    address: new PublicKey('66R8vBGPgzBLw2PRb8cYyN3UqjbZDCvHNApsmWaciCid'),
  },
  18: {
    id: 18,
    name: MemeDonationDestinationName.OGMeme,
    donationAmount: 0,
    address: new PublicKey('66R8vBGPgzBLw2PRb8cYyN3UqjbZDCvHNApsmWaciCid'),
  },
};

export const getMemeDonationDestinationFromId = (
  id: number,
): MemeDonationDestination => {
  const destination = MEME_DONATION_DESTINATIONS[id];
  if (!destination) {
    throw new Error(`Meme donation destination not found: ${id}`);
  }
  return destination;
};

export const getMemeDonationDestinationFromName = (
  name: MemeDonationDestinationName,
): MemeDonationDestination => {
  const destination = Object.values(MEME_DONATION_DESTINATIONS).find(
    destination => destination.name === name,
  );
  if (!destination) {
    throw new Error(`Meme donation destination not found: ${name}`);
  }
  return destination;
};
