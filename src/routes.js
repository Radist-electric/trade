import { Switch, Route, Redirect } from 'react-router-dom'
import { Quotes  } from './pages/Quotes'
import { Ping } from './pages/Ping'
import { NotFoundPage } from './pages/NotFoundPage'


export const useRoutes = () => {

  return (
    <Switch>
      <Route exact path="/">
        <Quotes />
      </Route>
      <Route exact path="/ping">
        <Ping />
      </Route>
      <Route exact path="/404">
        <NotFoundPage />
      </Route>
      <Redirect to="/404" />
    </Switch>
  )

}