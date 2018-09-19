import store from './store'

export default (to, from, next) => {
  if (!store.state.user) {
    next({
      path: '/signin'
    })
  } else {
    next()
  }
}
