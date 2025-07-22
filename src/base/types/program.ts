/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/pump_fun.json`.
 */
export type GoodrFun = {
  address: 'D3A3qyRtoha8DmnhP4zrz4JRUmWRB8pWgtLYktsj8Tip';
  metadata: {
    name: 'pumpFun';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'addDonationDestinations';
      discriminator: [181, 167, 104, 71, 53, 42, 112, 52];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'global';
          writable: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'donationDestinations';
          type: {
            vec: 'pubkey';
          };
        },
      ];
    },
    {
      name: 'buy';
      discriminator: [102, 6, 61, 18, 1, 218, 235, 234];
      accounts: [
        {
          name: 'global';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
        {
          name: 'mint';
          writable: true;
        },
        {
          name: 'creatorWallet';
          docs: ['CHECK'];
          writable: true;
        },
        {
          name: 'operatingWallet';
          docs: ['CHECK'];
          writable: true;
        },
        {
          name: 'associatedBondingCurve';
          writable: true;
        },
        {
          name: 'bondingCurve';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'associatedUser';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'user';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'tokenProgram';
          address: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'maxCostSol';
          type: 'u64';
        },
      ];
    },
    {
      name: 'buyWithSpl';
      discriminator: [86, 194, 224, 114, 187, 0, 129, 53];
      accounts: [
        {
          name: 'global';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
        {
          name: 'mint';
          writable: true;
        },
        {
          name: 'sonicMint';
        },
        {
          name: 'creatorWallet';
          writable: true;
        },
        {
          name: 'operatingWallet';
          writable: true;
        },
        {
          name: 'userSonicAccount';
          writable: true;
        },
        {
          name: 'creatorSonicAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'creatorWallet';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'sonicMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'operatingSonicAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'operatingWallet';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'sonicMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'bondingCurveTokenAccount';
          writable: true;
        },
        {
          name: 'bondingCurveSonicAccount';
          writable: true;
        },
        {
          name: 'bondingCurve';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  118,
                  50,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'userTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'user';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'tokenProgram';
          address: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'maxCostSonic';
          type: 'u64';
        },
      ];
    },
    {
      name: 'create';
      discriminator: [24, 30, 200, 40, 5, 28, 7, 119];
      accounts: [
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'global';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
        {
          name: 'mint';
          writable: true;
          signer: true;
        },
        {
          name: 'donationDestination';
          docs: ['CHECK'];
          writable: true;
        },
        {
          name: 'associatedBondingCurve';
          docs: ['CHECK'];
          writable: true;
        },
        {
          name: 'associatedDonationDestination';
          docs: ['CHECK'];
          writable: true;
        },
        {
          name: 'bondingCurve';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'tokenProgram';
          address: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'name';
          type: 'string';
        },
        {
          name: 'symbol';
          type: 'string';
        },
        {
          name: 'uri';
          type: 'string';
        },
        {
          name: 'donationAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'createWithSpl';
      discriminator: [196, 31, 67, 197, 71, 205, 128, 242];
      accounts: [
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'global';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
        {
          name: 'sonicMint';
        },
        {
          name: 'mint';
          writable: true;
          signer: true;
        },
        {
          name: 'donationDestination';
          writable: true;
        },
        {
          name: 'associatedBondingCurve';
          writable: true;
        },
        {
          name: 'associatedDonationDestination';
          writable: true;
        },
        {
          name: 'bondingCurveSonicAccount';
          writable: true;
        },
        {
          name: 'bondingCurve';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  118,
                  50,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'tokenProgram';
          address: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        },
        {
          name: 'splTokenProgram';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'name';
          type: 'string';
        },
        {
          name: 'symbol';
          type: 'string';
        },
        {
          name: 'uri';
          type: 'string';
        },
        {
          name: 'donationAmount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'initialize';
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'global';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [];
    },
    {
      name: 'removeDonationDestinations';
      discriminator: [45, 169, 120, 148, 4, 97, 96, 53];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'global';
          writable: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'donationDestinations';
          type: {
            vec: 'pubkey';
          };
        },
      ];
    },
    {
      name: 'sell';
      discriminator: [51, 230, 133, 164, 1, 127, 131, 173];
      accounts: [
        {
          name: 'global';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
        {
          name: 'mint';
          writable: true;
        },
        {
          name: 'operatingWallet';
          docs: ['CHECK'];
          writable: true;
        },
        {
          name: 'creatorWallet';
          docs: ['CHECK'];
          writable: true;
        },
        {
          name: 'associatedBondingCurve';
          writable: true;
        },
        {
          name: 'bondingCurve';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'associatedUser';
          writable: true;
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'tokenProgram';
          address: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'minOut';
          type: 'u64';
        },
      ];
    },
    {
      name: 'sellWithSpl';
      discriminator: [138, 14, 220, 187, 19, 0, 46, 94];
      accounts: [
        {
          name: 'global';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
        {
          name: 'mint';
          writable: true;
        },
        {
          name: 'sonicMint';
        },
        {
          name: 'operatingWallet';
          writable: true;
        },
        {
          name: 'creatorWallet';
          writable: true;
        },
        {
          name: 'userSonicAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'user';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'sonicMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'creatorSonicAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'creatorWallet';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'sonicMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'operatingSonicAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'operatingWallet';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'sonicMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'bondingCurveTokenAccount';
          writable: true;
        },
        {
          name: 'bondingCurveSonicAccount';
          writable: true;
        },
        {
          name: 'bondingCurve';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  118,
                  50,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'userTokenAccount';
          writable: true;
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'tokenProgram';
          address: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
        {
          name: 'minSonicOutput';
          type: 'u64';
        },
      ];
    },
    {
      name: 'setParams';
      discriminator: [27, 234, 178, 52, 147, 2, 187, 141];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'global';
          writable: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'feeRecipient';
          type: 'pubkey';
        },
        {
          name: 'initialVirtualTokenReserves';
          type: 'u64';
        },
        {
          name: 'initialVirtualSolReserves';
          type: 'u64';
        },
        {
          name: 'initialRealTokenReserves';
          type: 'u64';
        },
        {
          name: 'tokenTotalSupply';
          type: 'u64';
        },
        {
          name: 'operatingFeeBasisPoints';
          type: 'u64';
        },
        {
          name: 'creatorFeeBasisPoints';
          type: 'u64';
        },
        {
          name: 'sonicMint';
          type: {
            option: 'pubkey';
          };
        },
        {
          name: 'sonicDecimals';
          type: {
            option: 'u8';
          };
        },
        {
          name: 'sonicInitialVirtualTokenReserves';
          type: {
            option: 'u64';
          };
        },
        {
          name: 'sonicInitialVirtualBaseReserves';
          type: {
            option: 'u64';
          };
        },
        {
          name: 'sonicInitialRealTokenReserves';
          type: {
            option: 'u64';
          };
        },
      ];
    },
    {
      name: 'updateAuthority';
      discriminator: [32, 46, 64, 28, 149, 75, 243, 88];
      accounts: [
        {
          name: 'authority';
          writable: true;
          signer: true;
        },
        {
          name: 'global';
          writable: true;
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'newAuthority';
          type: 'pubkey';
        },
      ];
    },
    {
      name: 'withdraw';
      discriminator: [183, 18, 70, 156, 148, 109, 161, 34];
      accounts: [
        {
          name: 'global';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
        {
          name: 'mint';
          writable: true;
        },
        {
          name: 'associatedBondingCurve';
          writable: true;
        },
        {
          name: 'associatedUser';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'user';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'bondingCurve';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'tokenProgram';
          address: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [];
    },
    {
      name: 'withdrawSpl';
      discriminator: [181, 154, 94, 86, 62, 115, 6, 186];
      accounts: [
        {
          name: 'global';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [103, 108, 111, 98, 97, 108];
              },
            ];
          };
        },
        {
          name: 'mint';
          writable: true;
        },
        {
          name: 'sonicMint';
        },
        {
          name: 'bondingCurveTokenAccount';
          writable: true;
        },
        {
          name: 'bondingCurveSonicAccount';
          writable: true;
        },
        {
          name: 'authorityTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'user';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'authoritySonicAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'user';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'sonicMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'bondingCurve';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  98,
                  111,
                  110,
                  100,
                  105,
                  110,
                  103,
                  95,
                  99,
                  117,
                  114,
                  118,
                  101,
                  95,
                  118,
                  50,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
          };
        },
        {
          name: 'user';
          writable: true;
          signer: true;
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'tokenProgram';
          address: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
        {
          name: 'rent';
          address: 'SysvarRent111111111111111111111111111111111';
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: 'bondingCurve';
      discriminator: [23, 183, 248, 55, 96, 216, 172, 96];
    },
    {
      name: 'bondingCurveV2';
      discriminator: [164, 39, 209, 40, 144, 178, 79, 52];
    },
    {
      name: 'global';
      discriminator: [167, 232, 232, 177, 200, 108, 114, 127];
    },
  ];
  events: [
    {
      name: 'completeEvent';
      discriminator: [95, 114, 97, 156, 212, 46, 152, 8];
    },
    {
      name: 'createEvent';
      discriminator: [27, 114, 169, 77, 222, 235, 99, 118];
    },
    {
      name: 'setParamsEvent';
      discriminator: [223, 195, 159, 246, 62, 48, 143, 131];
    },
    {
      name: 'tradeEvent';
      discriminator: [189, 219, 127, 211, 78, 230, 97, 238];
    },
    {
      name: 'updateAuthorityEvent';
      discriminator: [18, 34, 243, 151, 72, 51, 65, 156];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'alreadyInitialized';
      msg: 'The program is already initialized.';
    },
    {
      code: 6001;
      name: 'notAuthorized';
      msg: 'The given account is not authorized to execute this instruction.';
    },
    {
      code: 6002;
      name: 'tooMuchSolRequired';
      msg: 'slippage: Too much SOL required to buy the given amount of tokens.';
    },
    {
      code: 6003;
      name: 'tooLittleSolReceived';
      msg: 'slippage: Too little SOL received to sell the given amount of tokens.';
    },
    {
      code: 6004;
      name: 'mintDoesNotMatchBondingCurve';
      msg: 'The mint does not match the bonding curve.';
    },
    {
      code: 6005;
      name: 'bondingCurveComplete';
      msg: 'The bonding curve has completed and liquidity migrated to raydium.';
    },
    {
      code: 6006;
      name: 'bondingCurveNotComplete';
      msg: 'The bonding curve has not completed yet.';
    },
    {
      code: 6007;
      name: 'notInitialized';
      msg: 'The program is not initialized.';
    },
    {
      code: 6008;
      name: 'notAuthorizedDonationDestination';
      msg: 'The donation destination is not authorized.';
    },
    {
      code: 6009;
      name: 'insufficientTokens';
      msg: 'Insufficient Tokens';
    },
    {
      code: 6010;
      name: 'minBuy';
      msg: 'Min buy is 1 Token';
    },
    {
      code: 6011;
      name: 'minSell';
      msg: 'Min sell is 1 Token';
    },
    {
      code: 6012;
      name: 'insufficientSol';
      msg: 'Insufficient SOL';
    },
    {
      code: 6013;
      name: 'invalidMintAccountSpace';
      msg: 'Invalid Mint Account Space';
    },
    {
      code: 6014;
      name: 'cantInitializeMetadataPointer';
      msg: "Can't Initialize Metadata Pointer";
    },
    {
      code: 6015;
      name: 'invalidSonicMint';
      msg: 'The SONIC mint does not match the global configuration.';
    },
    {
      code: 6016;
      name: 'tooMuchSonicRequired';
      msg: 'slippage: Too much SONIC required to buy the given amount of tokens.';
    },
    {
      code: 6017;
      name: 'tooLittleSonicReceived';
      msg: 'slippage: Too little SONIC received to sell the given amount of tokens.';
    },
    {
      code: 6018;
      name: 'insufficientSonic';
      msg: 'Insufficient SONIC tokens';
    },
  ];
  types: [
    {
      name: 'bondingCurve';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'creator';
            type: 'pubkey';
          },
          {
            name: 'virtualTokenReserves';
            type: 'u64';
          },
          {
            name: 'virtualSolReserves';
            type: 'u64';
          },
          {
            name: 'realTokenReserves';
            type: 'u64';
          },
          {
            name: 'realSolReserves';
            type: 'u64';
          },
          {
            name: 'tokenTotalSupply';
            type: 'u64';
          },
          {
            name: 'complete';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'bondingCurveV2';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'creator';
            type: 'pubkey';
          },
          {
            name: 'baseCurrencyMint';
            type: 'pubkey';
          },
          {
            name: 'virtualTokenReserves';
            type: 'u64';
          },
          {
            name: 'virtualBaseReserves';
            type: 'u64';
          },
          {
            name: 'realTokenReserves';
            type: 'u64';
          },
          {
            name: 'realBaseReserves';
            type: 'u64';
          },
          {
            name: 'tokenTotalSupply';
            type: 'u64';
          },
          {
            name: 'complete';
            type: 'bool';
          },
        ];
      };
    },
    {
      name: 'completeEvent';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'user';
            type: 'pubkey';
          },
          {
            name: 'mint';
            type: 'pubkey';
          },
          {
            name: 'bondingCurve';
            type: 'pubkey';
          },
          {
            name: 'timestamp';
            type: 'i64';
          },
        ];
      };
    },
    {
      name: 'createEvent';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'name';
            type: 'string';
          },
          {
            name: 'symbol';
            type: 'string';
          },
          {
            name: 'uri';
            type: 'string';
          },
          {
            name: 'mint';
            type: 'pubkey';
          },
          {
            name: 'bondingCurve';
            type: 'pubkey';
          },
          {
            name: 'donationDestination';
            type: 'pubkey';
          },
          {
            name: 'user';
            type: 'pubkey';
          },
          {
            name: 'baseCurrencyMint';
            type: {
              option: 'pubkey';
            };
          },
        ];
      };
    },
    {
      name: 'global';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'initialized';
            type: 'bool';
          },
          {
            name: 'authority';
            type: 'pubkey';
          },
          {
            name: 'operatingWallet';
            type: 'pubkey';
          },
          {
            name: 'initialVirtualTokenReserves';
            type: 'u64';
          },
          {
            name: 'initialVirtualSolReserves';
            type: 'u64';
          },
          {
            name: 'initialRealTokenReserves';
            type: 'u64';
          },
          {
            name: 'initialRealSolReserves';
            type: 'u64';
          },
          {
            name: 'tokenTotalSupply';
            type: 'u64';
          },
          {
            name: 'operatingFeeBasisPoints';
            type: 'u64';
          },
          {
            name: 'creatorFeeBasisPoints';
            type: 'u64';
          },
          {
            name: 'sonicMint';
            type: 'pubkey';
          },
          {
            name: 'sonicDecimals';
            type: 'u8';
          },
          {
            name: 'sonicInitialVirtualTokenReserves';
            type: 'u64';
          },
          {
            name: 'sonicInitialVirtualBaseReserves';
            type: 'u64';
          },
          {
            name: 'sonicInitialRealTokenReserves';
            type: 'u64';
          },
          {
            name: 'donationDestinations';
            type: {
              vec: 'pubkey';
            };
          },
        ];
      };
    },
    {
      name: 'setParamsEvent';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'operatingWallet';
            type: 'pubkey';
          },
          {
            name: 'initialVirtualTokenReserves';
            type: 'u64';
          },
          {
            name: 'initialVirtualSolReserves';
            type: 'u64';
          },
          {
            name: 'initialRealTokenReserves';
            type: 'u64';
          },
          {
            name: 'tokenTotalSupply';
            type: 'u64';
          },
          {
            name: 'operatingFeeBasisPoints';
            type: 'u64';
          },
          {
            name: 'creatorFeeBasisPoints';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'tradeEvent';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'mint';
            type: 'pubkey';
          },
          {
            name: 'solAmount';
            type: 'u64';
          },
          {
            name: 'tokenAmount';
            type: 'u64';
          },
          {
            name: 'isBuy';
            type: 'bool';
          },
          {
            name: 'user';
            type: 'pubkey';
          },
          {
            name: 'timestamp';
            type: 'i64';
          },
          {
            name: 'virtualSolReserves';
            type: 'u64';
          },
          {
            name: 'virtualTokenReserves';
            type: 'u64';
          },
          {
            name: 'realTokenReserves';
            type: 'u64';
          },
          {
            name: 'realSolReserves';
            type: 'u64';
          },
          {
            name: 'baseCurrencyMint';
            type: {
              option: 'pubkey';
            };
          },
        ];
      };
    },
    {
      name: 'updateAuthorityEvent';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'newAuthority';
            type: 'pubkey';
          },
        ];
      };
    },
  ];
};
