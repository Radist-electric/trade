import { createContext } from 'react'

function noop() {}

export const AppContext = createContext({
  createConnection: noop,
  getStatistics: noop,
  show: null,
  timer: null,
  connect: false,
  error: false
})