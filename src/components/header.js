import { NavLink } from 'react-router-dom'

const links = [
  {
    link: '/',
    title: 'Котировки',
  },
  {
    link: '/ping',
    title: 'Пингователь',
  }
]

export const Header = () => {

  const linksList = links.map((item, i) => (
    <NavLink to={item.link} exact key={i} className='header__link' activeStyle={{color: '#e8f533'}}>
      {item.title}
    </NavLink>
  ))

  return (
    <header className='header'>
      <div className='header__wrap'>
        {linksList}
      </div>
    </header>
  )
}
