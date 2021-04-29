import { useState, useEffect } from 'react'
import { useRoutes } from './routes'
import { BrowserRouter as Router } from 'react-router-dom'
import { AppContext } from './context/AppContext'
import { Header } from './components/header'

const isLocalStorage = storageAvailable('localStorage')

function storageAvailable(x) {
  try {
    localStorage.setItem(x, x)
    localStorage.removeItem(x)
    return true
  }
  catch (e) {
    return false
  }
}

const storageValuesName = 'tradeValues',
  storageShowName = 'tradeShow',
  storageConnectName = 'tradeConnect',
  storageErrorName = 'tradeError',
  storageTimerName = 'tradeTimer'
let initValues,
  initShow,
  initConnect,
  initError,
  initTimer

if (isLocalStorage) {
  initValues = JSON.parse(localStorage.getItem(storageValuesName))
  initShow = JSON.parse(localStorage.getItem(storageShowName))
  initConnect = JSON.parse(localStorage.getItem(storageConnectName))
  initError = JSON.parse(localStorage.getItem(storageErrorName))
  initTimer = JSON.parse(localStorage.getItem(storageTimerName))
  // Если в LocalStorage нет данных, то подгружаем стартовый набор
  if (!initValues) {
    initValues = {
      count: 0,
      sum: 0,
      average: 0,
      sumOfDeviations: 0,
      standardDeviation: 0
    }
    localStorage.setItem(storageValuesName, JSON.stringify(initValues))

  }
  if (!initShow) {
    initShow = {
      average: 0,
      standardDeviation: 0
    }
    localStorage.setItem(storageShowName, JSON.stringify(initShow))
  }
  if (!initConnect) {
    initConnect = false
    localStorage.setItem(storageConnectName, JSON.stringify(initConnect))
  }
  if (!initError) {
    initError = false
    localStorage.setItem(storageErrorName, JSON.stringify(initError))
  }
  if (!initTimer) {
    initTimer = {
      start: null,
      diff: null
    }
    localStorage.setItem(storageTimerName, JSON.stringify(initTimer))
  }
} else {
  initValues = {
    count: 0,
    sum: 0,
    average: 0,
    sumOfDeviations: 0,
    standardDeviation: 0
  }
  initShow = {
    average: 0,
    standardDeviation: 0
  }
  initConnect = false
  initError = false
  initTimer = {
    start: null,
    diff: null
  }
}




export const App = () => {
  const routes = useRoutes()
  const [values, setValues] = useState(initValues)
  const [show, setShow] = useState(initShow)
  const [connect, setConnect] = useState(initConnect)
  const [error, setError] = useState(initError)
  const [timer, setTimer] = useState(initTimer)

  useEffect(() => {
    if (connect) createConnection()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const createConnection = () => {
    const socket = new WebSocket('wss://trade.trademux.net:8800/?password=1234')

    // Слушаем открытие соединения
    socket.onopen = function (e) {
      console.log('Соединение установлено')
      localStorage.setItem(storageConnectName, JSON.stringify(true))
      setConnect(true)
      localStorage.setItem(storageErrorName, JSON.stringify(false))
      setError(false)
      if (!connect) {
        const newTimer = {
          start: Date.now(),
          diff: null
        }
        localStorage.setItem(storageTimerName, JSON.stringify(newTimer))
        setTimer(newTimer)
      }
      try {
        socket.send('ping')
      } catch (err) {
        console.log('Получено сообщение об ошибке при открытии соединения:', err, e.data)
        localStorage.setItem(storageConnectName, JSON.stringify(false))
        setConnect(false)
      }
    }

    // Слушаем закрытие соединения
    socket.onclose = function (event) {
      if (event.wasClean) {
        console.log(`Соединение закрыто чисто, код=${event.code} причина=${event.reason}`)
      } else {
        console.log('Соединение прервано')
      }
    }

    // Слушаем ошибки соединения
    socket.onerror = function (error) {
      console.log(`[error] ${error.message}`)
      localStorage.setItem(storageConnectName, JSON.stringify(false))
      setConnect(false)
      localStorage.setItem(storageErrorName, JSON.stringify(true))
      setError(true)
    }

    // Слушаем наличие сообщения
    socket.onmessage = function (event) {
      const data = JSON.parse(event.data)
      setValues((prev) => {
        const newCount = prev.count + 1
        const newSum = prev.sum + data.value
        const newAverage = newSum / newCount
        const newSumOfDeviations = prev.sumOfDeviations + Math.pow(data.value - newAverage, 2)
        const newStDev = Math.sqrt(newSumOfDeviations / newCount)
        const newValues = {
          count: newCount,
          sum: newSum,
          average: newAverage,
          sumOfDeviations: newSumOfDeviations,
          standardDeviation: newStDev
        }
        localStorage.setItem(storageValuesName, JSON.stringify(newValues))
        return newValues
      })
    }

  }

  const getStatistics = () => {
    if (timer.start === null) return
    const newShow = {
      average: values.average,
      standardDeviation: values.standardDeviation
    }
    localStorage.setItem(storageShowName, JSON.stringify(newShow))
    setShow(newShow)
    setTimer((prev) => {
      const newTimer = { ...timer, diff: Date.now() - prev.start }
      localStorage.setItem(storageTimerName, JSON.stringify(newTimer))
      return newTimer
    })
  }

  return (
    <AppContext.Provider value={{ createConnection, getStatistics, show, timer, connect, error }}>
      <Router>
        <Header />
        <div className='App'>
          {routes}
        </div>
      </Router>
    </AppContext.Provider>
  )
}

