// workaround for ESM module loader errors
// see https://github.com/vercel/next.js/issues/25454
const withTM = require('next-transpile-modules')(['react-markdown'])

module.exports = withTM({
  target: 'serverless',
  webpack: (config, { isServer }) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@project-serum/anchor$': '@project-serum/anchor/dist/esm',
      },
    }
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })
    if (!isServer) config.resolve.fallback.fs = false
    return config
  },
  env: {
    REALM: process.env.REALM,
  },
})
