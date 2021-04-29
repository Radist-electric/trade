import { useState } from 'react'

export const App = () => {
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
    setTimer({...timer, diff: Date.now() - timer.start})
  }

  function getTime(ms) {
    const milliseconds = parseInt((ms % 1000) / 100),
      seconds = Math.floor((ms / 1000) % 60),
      minutes = Math.floor((ms / (1000 * 60)) % 60),
      hours = Math.floor((ms / (1000 * 60 * 60)) % 24),
      days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 365)
    
    return `${days}дн ${hours}ч ${minutes}мин ${seconds}.${milliseconds}с`
  }

  return (
    <div className='App'>
      <h1>Данные по котировкам</h1>
      <button className='button' onClick={createConnection} style={{ backgroundColor: connect ? '#4caf50' : '#1976d2' }}>Старт</button>
      <button className='button' onClick={getStatistics}>Статистика</button>
      <p>Среднее значение: <span className='value'>{show.average.toFixed(3)}</span></p>
      <p>Стандартное отклонение: <span className='value'>{show.standardDeviation.toFixed(3)}</span></p>
      <p>Время расчётов: <span className='value'>{getTime(timer.diff)}</span></p>
    </div>
  )
}

