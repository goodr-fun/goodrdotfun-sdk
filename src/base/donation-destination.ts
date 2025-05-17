import { PublicKey } from '@solana/web3.js';
import { ChainType } from '../types/common';

export const enum DonationDestinationName {
  CustomDonation = 'Custom Donation',
  HealthcareAndWellbeing = 'Healthcare and Well-being',
  FoodSecurityAndPovertyAlleviation = 'Food Security and Poverty Alleviation',
  ChildrenAndYouth = 'Children and Youth',
  DisasterReliefAndHumanitarianAid = 'Disaster Relief and Humanitarian Aid',
  Biodiversity = 'Biodiversity',
  Forests = 'Forests',
  WaterResources = 'Water Resources',
  Climate = 'Climate',
  KnowledgeAndScience = 'Knowledge and Science',
  Education = 'Education',
  GenderEquality = 'Gender Equality',
  CultureAndTradition = 'Culture and Tradition',
  Energy = 'Energy',
  AI = 'AI',
  Technology = 'Technology',
  NoDonation = 'No Donation',
}

export type DonationDestination = {
  id: number;
  address: PublicKey;
  name: DonationDestinationName;
};

export const SONIC_DONATION_DESTINATIONS: Record<number, DonationDestination> =
  {
    16: {
      id: 16,
      name: DonationDestinationName.CustomDonation,
      address: new PublicKey('4PbK94ZopkBR8LGwoPrnFBxXMDhRoEAE7pSBGULymF8Z'),
    },
    1: {
      id: 1,
      name: DonationDestinationName.HealthcareAndWellbeing,
      address: new PublicKey('6BeDBmrJwirWB653ajwvATbJ1vvTQcSoGRB7gGJ7HPUj'),
    },
    2: {
      id: 2,
      name: DonationDestinationName.FoodSecurityAndPovertyAlleviation,
      address: new PublicKey('GDQTNTpjYXG8MHBAbM9znBW8vfi2Ca3Z4RPwsJuVqpNb'),
    },
    3: {
      id: 3,
      name: DonationDestinationName.ChildrenAndYouth,
      address: new PublicKey('C3yQSiFY4zvXFspQ1aeopQSQAkMSguJVBn4eutrqKtN7'),
    },
    4: {
      id: 4,
      name: DonationDestinationName.DisasterReliefAndHumanitarianAid,
      address: new PublicKey('6qPcgMSVk7paXPV3nqtiqECS6VBnA7w8KC3q7Y5Kt1zX'),
    },
    5: {
      id: 5,
      name: DonationDestinationName.Biodiversity,
      address: new PublicKey('6rdhGKomkXBLdy1WQsb85mUb3EP44X8x35Bg6qE2fopr'),
    },
    6: {
      id: 6,
      name: DonationDestinationName.Forests,
      address: new PublicKey('GUvoZzZNgEEe5DiFcZJUxaBP6vZXjfVfmEBkgewgTMAA'),
    },
    7: {
      id: 7,
      name: DonationDestinationName.WaterResources,
      address: new PublicKey('675fUiveJ3buuA1zSzzaKCdnqpbTh79i1R8d6CXckwsV'),
    },
    8: {
      id: 8,
      name: DonationDestinationName.Climate,
      address: new PublicKey('FMvFxThMkdMPrNTArdWWSUvTAgoi8Nxf9PR1xayeGFsi'),
    },
    9: {
      id: 9,
      name: DonationDestinationName.KnowledgeAndScience,
      address: new PublicKey('G9LrRScjCae2L5WJycTvhhPrG5LevWYjygGmUkJyNa62'),
    },
    10: {
      id: 10,
      name: DonationDestinationName.Education,
      address: new PublicKey('9yY94GLaw6MHT7zUD42WsgZ5M5kMtyMdcexMJqS51qGK'),
    },
    11: {
      id: 11,
      name: DonationDestinationName.GenderEquality,
      address: new PublicKey('GPt9RXiA4n1WQzSnZUsyW8woG5KNCk54vsMVNuxAwNSK'),
    },
    12: {
      id: 12,
      name: DonationDestinationName.CultureAndTradition,
      address: new PublicKey('44g3WpY1xYNyhVQVgHJ4L7xYrBeP2Pxk6qdAYxgseCFt'),
    },
    13: {
      id: 13,
      name: DonationDestinationName.Energy,
      address: new PublicKey('4ZuENUn2reZk25u8Vqx6w7tBxawdLkhY6S8PPNVDmBji'),
    },
    14: {
      id: 14,
      name: DonationDestinationName.NoDonation,
      address: new PublicKey('7cNG9EJcV63TdFnRbG3WamchetY6UrTiKXdw29a2mYGd'),
    },
    15: {
      id: 15,
      name: DonationDestinationName.Technology,
      address: new PublicKey('8WXjJB8NqXnwKUrX1T4oMFBe2SUhqUz2Z7zuMxj7GNb9'),
    },
  };

export const SOLANA_DONATION_DESTINATIONS: Record<number, DonationDestination> =
  {
    16: {
      id: 16,
      name: DonationDestinationName.CustomDonation,
      address: new PublicKey('CZT6ZSauAzxDXnfJ38MzD8sB9PF43RreiXDkqEVgDoWG'),
    },
    1: {
      id: 1,
      name: DonationDestinationName.HealthcareAndWellbeing,
      address: new PublicKey('8hG3SkkbdgjHreg73CP54gu9BSGNVu2eKXpx6JEFHGqb'),
    },
    2: {
      id: 2,
      name: DonationDestinationName.FoodSecurityAndPovertyAlleviation,
      address: new PublicKey('6hf15t69UMSZBVZyxaUTw7fFYQDL1M7yERNL6cPaAhdy'),
    },
    3: {
      id: 3,
      name: DonationDestinationName.ChildrenAndYouth,
      address: new PublicKey('5jnBrQXcwX8P8UUErY21Xdp13NAmH5kt1d8p9LgecKGW'),
    },
    4: {
      id: 4,
      name: DonationDestinationName.DisasterReliefAndHumanitarianAid,
      address: new PublicKey('3EVnYAQxNSoyv4U7uSSrsyUAoWXy8jYXokKC9ZY7JrgF'),
    },
    5: {
      id: 5,
      name: DonationDestinationName.Biodiversity,
      address: new PublicKey('6cS4rqpXZakJv3gJZ6roL5hzVtGkv57svRUwuqBhphfy'),
    },
    6: {
      id: 6,
      name: DonationDestinationName.Forests,
      address: new PublicKey('H3uKdXX3jMNsoi5jjEGpraL3oRUhwnvS6oFTGgkDT16G'),
    },
    7: {
      id: 7,
      name: DonationDestinationName.WaterResources,
      address: new PublicKey('C7bznvrLFhaYb4Q44TBCUzE1nXx2NdELQBY6FscQq4uM'),
    },
    8: {
      id: 8,
      name: DonationDestinationName.Climate,
      address: new PublicKey('4Lamivfci6BGaM6aK8uyi2xQAoBs1bpgAgD7hyaVZRZG'),
    },
    9: {
      id: 9,
      name: DonationDestinationName.KnowledgeAndScience,
      address: new PublicKey('8CP387xSLfWaFGD2Ux4LUKW4YzekRJ236CjjcjmmdRNJ'),
    },
    10: {
      id: 10,
      name: DonationDestinationName.Education,
      address: new PublicKey('CtaSEyLqN7LW5cUGaePHBizdMh6taZYthbeuxfC7vsvF'),
    },
    11: {
      id: 11,
      name: DonationDestinationName.GenderEquality,
      address: new PublicKey('DoAJbyutbs4pULjfN5EKb5rt4T6nuEZ2HWXfWVidRx5S'),
    },
    12: {
      id: 12,
      name: DonationDestinationName.CultureAndTradition,
      address: new PublicKey('HzR5Ydi3aPh5ZLic9hUqYeEmSS4KC5j9fryEaotHKScL'),
    },
    13: {
      id: 13,
      name: DonationDestinationName.Energy,
      address: new PublicKey('4syCTbNZTvZQRkr3geoFhDFAegcFTRTqtzmufKAFALoA'),
    },
    14: {
      id: 14,
      name: DonationDestinationName.NoDonation,
      address: new PublicKey('7cNG9EJcV63TdFnRbG3WamchetY6UrTiKXdw29a2mYGd'),
    },
    15: {
      id: 15,
      name: DonationDestinationName.Technology,
      address: new PublicKey('881HpK4ics5aJkbpUXNLFL7AEG36EjKuJxgYqHaeFQ8g'),
    },
  };

export const getDonationDestinationFromId = (
  chainType: ChainType,
  id: number,
): DonationDestination => {
  const donationLists =
    chainType === ChainType.SONIC
      ? SONIC_DONATION_DESTINATIONS
      : SOLANA_DONATION_DESTINATIONS;

  const destination = donationLists[id];
  if (!destination) {
    throw new Error(`Donation destination not found: ${id}`);
  }
  return destination;
};

export const getDonationDestinationFromName = (
  chainType: ChainType,
  name: DonationDestinationName,
): DonationDestination => {
  const donationLists =
    chainType === ChainType.SONIC
      ? SONIC_DONATION_DESTINATIONS
      : SOLANA_DONATION_DESTINATIONS;

  const destination = Object.values(donationLists).find(
    destination => destination.name === name,
  );
  if (!destination) {
    throw new Error(`Donation destination not found: ${name}`);
  }
  return destination;
};
