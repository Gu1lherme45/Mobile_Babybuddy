const os = require('node:os')

function getHostIpv4Addresses(networkInterfaces = os.networkInterfaces()) {
  const addresses = Object.values(networkInterfaces).flatMap((interfaces) => interfaces || [])
    .filter((address) => address.family === 'IPv4' && !address.internal)
    .map((address) => address.address)
    .filter((address) => !address.startsWith('169.254.'))

  return [...new Set(addresses)]
}

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiHostIps: getHostIpv4Addresses(),
  },
})

module.exports.getHostIpv4Addresses = getHostIpv4Addresses
