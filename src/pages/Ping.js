import { useState, useEffect, useRef } from 'react'

export const Ping = () => {
  const input = useRef(null)
  const [error, setError] = useState(false)
  const [timer, setTimer] = useState({
    start: null,
    diff: null
  })
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!result) setResult(timer.diff)
  }, [timer.diff]) // eslint-disable-line react-hooks/exhaustive-deps

  // Проверить пинг сервера
  const checkPing = async (url) => {
    try {
      const data = await request(url)
      getTimeDiff()
      console.log('data', data)


    } catch (e) {
      getTimeDiff()
      console.error('checkPing error', e)
    }
  }


  // Запрос на сервер
  const request = async (url) => {
    try {
      const response = await fetch(url)
      const data = await response.json()
      return data

    } catch (e) {
      console.error('request error', e)
      getTimeDiff()
      throw e
    }
  }

  const clickHandler = () => {
    const url = input.current.value.trim()
    if(!url) {
      input.current.value = ''
      setError(true)
    }
    if (!url) return

    setTimer({
      start: Date.now(),
      diff: null
    })
    setResult(0)
    checkPing(url)
  }

  const getTimeDiff = () => {
    setTimer((prev) => {
      return { ...timer, diff: Date.now() - prev.start }
    })
  }

  return (
    <>
      <h1>Пингователь</h1>
      <input
        type='text'
        placeholder={error ? 'Поле не должно быть пустым' : 'Введите URL'}
        className={['input', error ? 'input_error' : ''].join(' ')}
        ref={input}
        onFocus={() => {setError(false)}}
      />
      <button
        className='button'
        onClick={clickHandler}
      >Проверить пинг</button>
      <p>Результат: <span className='value'>{result ? result : 0} мс</span></p>
    </>
  )
}