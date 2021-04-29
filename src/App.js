import { useState, useEffect } from 'react'

export const App = () => {
  const [values, setValues] = useState({
    count: 0,
    sum: 0,
    average: 0,
    sumOfDeviations: 0,
    standardDeviation: 0
  })

  //ComponentDidMount
  useEffect(() => {
    console.log('ComponentDidMount')
  }, [])// eslint-disable-line react-hooks/exhaustive-deps


  const createConnection = () => {
    console.log('createConnection')
    const socket = new WebSocket('wss://trade.trademux.net:8800/?password=1234')

    // Слушаем открытие соединения
    socket.onopen = function (e) {
      console.log('[open] Соединение установлено')
      try {
        socket.send("ping")
      } catch (err) {
        console.log("Got invalid message from websocket on open", err, e.data);
      }
    }

    // Слушаем закрытие соединения
    socket.onclose = function (event) {
      if (event.wasClean) {
        console.log(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`)
      } else {
        // например, сервер убил процесс или сеть недоступна
        // обычно в этом случае event.code 1006
        console.log('[close] Соединение прервано')
      }
    }

    // Слушаем ошибки соединения
    socket.onerror = function (error) {
      console.log(`[error] ${error.message}`)
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
    console.log(values)
  }

  return (
    <div className="App">
      <button onClick={createConnection}>Старт</button>
      <button onClick={getStatistics}>Статистика</button>
    </div>
  )
}

