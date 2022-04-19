export interface IPoolInfo {
  amm: string;
  poolMint: string;
  feeAccount: string;
  pythAccount: string;
  pythPcAccount: string;
  configAccount: string;
  poolCoinTokenAccount: string;
  poolCoinMint: string;
  poolCoinDecimal: number;
  poolPcTokenAccount: string;
  poolPcMint: string;
  poolPcDecimal: number;
  poolMintDecimal: number;
  pythBaseDecimal: number;
}

export const PoolList: { [poolLabel: string]: IPoolInfo } = {
  'UXD-USDC': {
    amm: '5BJUhcBnysAmCpaU6pABof7FUqxx7ZnCZXbctpP48o3C',
    poolMint: 'DM2Grhnear76DwNiRUSfeiFMt6jSj2op9GWinQDc7Yqh',
    feeAccount: '9pKxj6GTTdJ2biQ6uTyv7CTmVmnjz6cXGCz7rXg7Nm2N',
    configAccount: '86MM38X9P5mxzRHFVX8ahtB9dCFKSk8AFhb33f5Zz8VW',
    pythAccount: '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
    pythPcAccount: '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
    poolCoinTokenAccount: '5BUkh9e3JF9yUvSw6P3HHqkdMuujRG942hYNSkAEghFs',
    poolCoinMint: '7kbnvuGBxxj8AG9qp8Scn56muWGaRaFqxg1FsRp3PaFT',
    poolPcTokenAccount: 'BbwCGgAHEUfu7PUEz8hR877aK2snseqorfLbvtcVbjhj',
    poolPcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    poolCoinDecimal: 6,
    poolPcDecimal: 6,
    poolMintDecimal: 6,
    pythBaseDecimal: 8,
  },
  'SOL-USDC': {
    amm: 'amgK1WE8Cvae4mVdj4AhXSsknWsjaGgo1coYicasBnM',
    poolMint: '3WzrkFYq4SayCrhBw8BgsPiTVKTDjyV6wRqP7HL9Eyyw',
    feeAccount: 'AD5DFr1AXMB9h6fw5KFtkEfwf7kYSAiaSueeu4NGrLKY',
    configAccount: '2iT9h99mhDqetoZGNj7KKrqBnoDmFvAytGrnFYuR7MwN',
    pythAccount: 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
    pythPcAccount: 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
    poolCoinTokenAccount: '2uySTNgvGT2kwqpfgLiSgeBLR3wQyye1i1A2iQWoPiFr',
    poolCoinMint: 'So11111111111111111111111111111111111111112',
    poolPcTokenAccount: '32SjGNjesiCZgmZb4YxAGgjnym6jAvTWbqihR4CvvXkZ',
    poolPcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    poolCoinDecimal: 9,
    poolPcDecimal: 6,
    poolMintDecimal: 9,
    pythBaseDecimal: 11,
  },
  'SOL-USDT': {
    amm: '2x8Bmv9wj2a4LxADBWKiLyGRgAosr8yJXuZyvS8adirK',
    poolMint: 'BRchiwrv9yCr4jAi6xF4epQdtNtmJH93rrerpHpMhK1Z',
    feeAccount: 'GFj8cNTP4mzWG7ywyJ35Ls2V8CbqDk3p4xNT1pAawoCh',
    configAccount: 'Hor7j9oYfNH6EJgmnXQRiQSahduR5p4bfKyCZaQUqNKd',
    pythAccount: 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG',
    pythPcAccount: '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
    poolCoinTokenAccount: '5pH2DBMZg7y5bN4J3oLKRETGXyVYPJpeaCH6AkdAcxqp',
    poolCoinMint: 'So11111111111111111111111111111111111111112',
    poolPcTokenAccount: '7Cct2MJUwruQef5vQrP2bxYCNyVajJ3SiC1GYUmwmjUm',
    poolPcMint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    poolCoinDecimal: 9,
    poolPcDecimal: 6,
    poolMintDecimal: 9,
    pythBaseDecimal: 11,
  },
  'BTC-USDC': {
    amm: 'HeH3s7B3a6nynim1rBGS6TRaYECgSNjt7Kp65mhW9P4k',
    poolMint: 'BzuTSoWFHrnRQvn4sr5ErPQyMaRB9g2rsbKCruGtcvMa',
    feeAccount: '5HpNeHBBpg6x7fzTgbvP9UukQmDmvxbggwqo951BYkba',
    configAccount: 'HuLmRVTfYjNYYGBpPtJEk7JKkosbbPF4zzBHnf3TfyCn',
    pythAccount: 'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU',
    pythPcAccount: 'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU',
    poolCoinTokenAccount: 'FAFShq3gZYXWtk5EkeKPKcwSkz2rjfMDuD1i7KiYwjVM',
    poolCoinMint: '9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E',
    poolPcTokenAccount: '3ReY1xscSAEV9Qg1NshkU4KRWQs33nu5JMg8AnoU7duG',
    poolPcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    poolCoinDecimal: 6,
    poolPcDecimal: 6,
    poolMintDecimal: 9,
    pythBaseDecimal: 8,
  },
  'ETH-USDC': {
    amm: 'E32Z6DYwJELMTrVJVchN8PWbyhSoC3bRorMb7Cw2R9Xz',
    poolMint: '8FxRyaE8X6ENLmNbaBvgS6vMsN1GJ8J7CmKy8K8uN6wM',
    feeAccount: '5yXQ399ti5rKMcRMAZvFUqAgKHUP55bvhoYWd9bVrnu9',
    configAccount: '5JXrQpWAPNrvVN1R6Mz9MhA1EYUB948kceZjCxRzQzf5',
    pythAccount: 'JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB',
    pythPcAccount: 'JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB',
    poolCoinTokenAccount: 'BRFwAToCofwzP29jVGzb6VZ4AGpw867AE5VsXfMsmEGk',
    poolCoinMint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
    poolPcTokenAccount: 'FDCjDSbFCVRVBsWkJWfgZ9x3Dizm1MJjtzYw3R2fxXRv',
    poolPcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    poolCoinDecimal: 8,
    poolPcDecimal: 6,
    poolMintDecimal: 9,
    pythBaseDecimal: 10,
  },
  'RAY-USDC': {
    amm: 'FcxHANr1dguexPZ2PoPGBajgiednXFMYHGGx4YMgedkM',
    poolMint: 'HUpvKUafPCMwhua6QtHXk1V8D6LZYyQmUKYPFZgRiiiX',
    feeAccount: 'DyR91PiiRopbdcizbjdXejodjxEeVSs4uCkyhL7wCvxw',
    configAccount: '2EXv6K3cYDMXXKFfzGjqnjkbngUymnVwBoC4kwrCKwFy',
    pythAccount: 'AnLf8tVYCM816gmBjiy8n53eXKKEDydT5piYjjQDPgTB',
    pythPcAccount: 'AnLf8tVYCM816gmBjiy8n53eXKKEDydT5piYjjQDPgTB',
    poolCoinTokenAccount: 'BhG9r4CkTBRtpLtxA8Hd72vCkikqyVhiq8pFunZNERV8',
    poolCoinMint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    poolPcTokenAccount: '8HAVXU7bdS2SEkkrqFBdWPFxFTrWxtu4GTjP46BDzdTc',
    poolPcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    poolCoinDecimal: 6,
    poolPcDecimal: 6,
    poolMintDecimal: 6,
    pythBaseDecimal: 8,
  },
  'USDT-USDC': {
    amm: 'Cm3L8YhKq9h1SYoQLJnxKJbMtw62nF2CHy3yjAFuwVGy',
    poolMint: '9d5GhGFbbX5LGYyXxPDMvsREgF69cFTGv6jxqtKkE58j',
    feeAccount: 'BBAsd3c1Nr4VAZE1Z9fwZKNRuaySyKsK5yiACgLKoNA6',
    configAccount: '62hK67DcFR2ywxtiAzxj4C1v5i2BtxzVt5ArNBgwYeUz',
    pythAccount: '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
    pythPcAccount: '3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL',
    poolCoinTokenAccount: 'Hn9BgYCSxTyCPnKpjnjHVzqQG4szceDaCpQedjW4Ug3c',
    poolCoinMint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    poolPcTokenAccount: '74ZXM4EgYcovVijnCuceXJrGCNu3KJPniRSvBpZzDig',
    poolPcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    poolCoinDecimal: 6,
    poolPcDecimal: 6,
    poolMintDecimal: 6,
    pythBaseDecimal: 8,
  },
  'UST-USDC': {
    amm: 'DVJHq6RB56Ertd9cBwJ99cckQ3g192TCuSLphWuXs6yh',
    poolMint: 'GgXkVjtMrPbc6AvUwjApcnLsR63SeD1BPB7nSSjzH5CX',
    feeAccount: '9unwWtiQJFsJJp9UjFcdGYTrzttGBc4GPgd7h6PSRswn',
    configAccount: '9v1viMjw6fWfBdKacU861ncyXUP9SChm8BK1wtiDkoJx',
    pythAccount: 'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU',
    pythPcAccount: 'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU',
    poolCoinTokenAccount: '6Qqdyy6RtbTA75aZHVxuBBS37u24uZyeptCBErGhQhHL',
    poolCoinMint: '9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i',
    poolPcTokenAccount: '9cbaGjEJBz7CuvwLsMdPZXMFovQJ91pDDqZSuWsPRMVY',
    poolPcMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    poolCoinDecimal: 6,
    poolPcDecimal: 6,
    poolMintDecimal: 6,
    pythBaseDecimal: 8,
  },
};
