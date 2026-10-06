const { getHostIpv4Addresses } = require('./app.config')

describe('getHostIpv4Addresses', () => {
  it('mantém IPv4 externos e ignora loopback, IPv6 e endereços link-local', () => {
    expect(getHostIpv4Addresses({
      WiFi: [
        { address: '192.168.1.12', family: 'IPv4', internal: false },
        { address: 'fe80::1234', family: 'IPv6', internal: false },
        { address: '169.254.10.20', family: 'IPv4', internal: false },
      ],
      Loopback: [{ address: '127.0.0.1', family: 'IPv4', internal: true }],
      Ethernet: [{ address: '192.168.1.12', family: 'IPv4', internal: false }],
    })).toEqual(['192.168.1.12'])
  })
})
