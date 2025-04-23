import { PublicKey } from '@solana/web3.js';

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

export const DONATION_DESTINATIONS: Record<number, DonationDestination> = {
  16: {
    id: 16,
    name: DonationDestinationName.CustomDonation,
    address: new PublicKey('CZT6ZSauAzxDXnfJ38MzD8sB9PF43RreiXDkqEVgDoWG'),
  },
  1: {
    id: 1,
    name: DonationDestinationName.HealthcareAndWellbeing,
    address: new PublicKey('DK82TXsicQFUs8tKBH2shEyU2FufQMHeRWZmHAqh24oa'),
  },
  2: {
    id: 2,
    name: DonationDestinationName.FoodSecurityAndPovertyAlleviation,
    address: new PublicKey('8hG3SkkbdgjHreg73CP54gu9BSGNVu2eKXpx6JEFHGqb'),
  },
  3: {
    id: 3,
    name: DonationDestinationName.ChildrenAndYouth,
    address: new PublicKey('6hf15t69UMSZBVZyxaUTw7fFYQDL1M7yERNL6cPaAhdy'),
  },
  4: {
    id: 4,
    name: DonationDestinationName.DisasterReliefAndHumanitarianAid,
    address: new PublicKey('5jnBrQXcwX8P8UUErY21Xdp13NAmH5kt1d8p9LgecKGW'),
  },
  5: {
    id: 5,
    name: DonationDestinationName.Biodiversity,
    address: new PublicKey('3EVnYAQxNSoyv4U7uSSrsyUAoWXy8jYXokKC9ZY7JrgF'),
  },
  6: {
    id: 6,
    name: DonationDestinationName.Forests,
    address: new PublicKey('6cS4rqpXZakJv3gJZ6roL5hzVtGkv57svRUwuqBhphfy'),
  },
  7: {
    id: 7,
    name: DonationDestinationName.WaterResources,
    address: new PublicKey('H3uKdXX3jMNsoi5jjEGpraL3oRUhwnvS6oFTGgkDT16G'),
  },
  8: {
    id: 8,
    name: DonationDestinationName.Climate,
    address: new PublicKey('C7bznvrLFhaYb4Q44TBCUzE1nXx2NdELQBY6FscQq4uM'),
  },
  9: {
    id: 9,
    name: DonationDestinationName.KnowledgeAndScience,
    address: new PublicKey('4Lamivfci6BGaM6aK8uyi2xQAoBs1bpgAgD7hyaVZRZG'),
  },
  10: {
    id: 10,
    name: DonationDestinationName.Education,
    address: new PublicKey('8CP387xSLfWaFGD2Ux4LUKW4YzekRJ236CjjcjmmdRNJ'),
  },
  11: {
    id: 11,
    name: DonationDestinationName.GenderEquality,
    address: new PublicKey('CtaSEyLqN7LW5cUGaePHBizdMh6taZYthbeuxfC7vsvF'),
  },
  12: {
    id: 12,
    name: DonationDestinationName.CultureAndTradition,
    address: new PublicKey('DoAJbyutbs4pULjfN5EKb5rt4T6nuEZ2HWXfWVidRx5S'),
  },
  13: {
    id: 13,
    name: DonationDestinationName.Energy,
    address: new PublicKey('HzR5Ydi3aPh5ZLic9hUqYeEmSS4KC5j9fryEaotHKScL'),
  },
  14: {
    id: 14,
    name: DonationDestinationName.NoDonation,
    address: new PublicKey('4syCTbNZTvZQRkr3geoFhDFAegcFTRTqtzmufKAFALoA'),
  },
  15: {
    id: 15,
    name: DonationDestinationName.Technology,
    address: new PublicKey('881HpK4ics5aJkbpUXNLFL7AEG36EjKuJxgYqHaeFQ8g'),
  },
};

export const getDonationDestinationFromId = (
  id: number,
): DonationDestination => {
  const destination = DONATION_DESTINATIONS[id];
  if (!destination) {
    throw new Error(`Donation destination not found: ${id}`);
  }
  return destination;
};

export const getDonationDestinationFromName = (
  name: DonationDestinationName,
): DonationDestination => {
  const destination = Object.values(DONATION_DESTINATIONS).find(
    destination => destination.name === name,
  );
  if (!destination) {
    throw new Error(`Donation destination not found: ${name}`);
  }
  return destination;
};
