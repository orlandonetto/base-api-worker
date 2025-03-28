import stubs from './stubs'

import '../src/config'

// eslint-disable-next-line no-console
console.log('setting stubs...')

stubs()

jest.setTimeout(60000)
