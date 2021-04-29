import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

export const Quotes = () => {
  const context = useContext(AppContext)

  function getTime(ms) {
    const milliseconds = parseInt((ms % 1000) / 100),
      seconds = Math.floor((ms / 1000) % 60),
      minutes = Math.floor((ms / (1000 * 60)) % 60),
      hours = Math.floor((ms / (1000 * 60 * 60)) % 24),
      days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 365)

    return `${days}дн ${hours}ч ${minutes}мин ${seconds}.${milliseconds}с`
  }

  let bg
  if (context.connect) {
    bg = '#4caf50'
  } else if (context.error) {
    bg = '#FF0000'
  } else {
    bg = '#1976d2'
  }

  return (
    <>
      <h1>Данные по котировкам</h1>
      <button
        className='button'
        onClick={context.connect ? null : context.createConnection}
        style={{ backgroundColor: bg }}
      >Старт</button>
      <button
        className='button'
        onClick={context.getStatistics}
      >Статистика</button>
      <p>Среднее значение: <span className='value'>{context.show.average.toFixed(3)}</span></p>
      <p>Стандартное отклонение: <span className='value'>{context.show.standardDeviation.toFixed(3)}</span></p>
      <p>Время расчётов: <span className='value'>{getTime(context.timer.diff)}</span></p>
    </>
  )
}