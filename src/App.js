import { useState } from 'react'
import { useRoutes } from './routes'
import { BrowserRouter as Router } from 'react-router-dom'
import { AppContext } from './context/AppContext'
import { Header } from './components/header'

export const App = () => {
  const routes = useRoutes()
  const [values, setValues] = useState({
    count: 0,
    sum: 0,
    average: 0,
    sumOfDeviations: 0,
    standardDeviation: 0
  })
  const [show, setShow] = useState({
    average: 0,
    standardDeviation: 0
  })
  const [connect, setConnect] = useState(false)
  const [timer, setTimer] = useState({
    start: null,
    diff: null
  })

  const createConnection = () => {
    const socket = new WebSocket('wss://trade.trademux.net:8800/?password=1234')

    // Слушаем открытие соединения
    socket.onopen = function (e) {
      console.log('Соединение установлено')
      setConnect(true)
      setTimer({
        start: Date.now(),
        diff: null
      })
      try {
        socket.send('ping')
      } catch (err) {
        console.log('Получено сообщение об ошибке при открытии соединения:', err, e.data)
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
      setConnect(false)
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
        return {
          count: newCount,
          sum: newSum,
          average: newAverage,
          sumOfDeviations: newSumOfDeviations,
          standardDeviation: newStDev
        }
      })
    }

  }

  const getStatistics = () => {
    setShow({
      average: values.average,
      standardDeviation: values.standardDeviation
    })
    setTimer({ ...timer, diff: Date.now() - timer.start })
  }

  return (
    <AppContext.Provider value={{createConnection, getStatistics, show, timer, connect}}>
      <Router>
        <Header />
        <div className='App'>
          {routes}
        </div>
      </Router>
    </AppContext.Provider>
  )
}

