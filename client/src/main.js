import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'

import ApolloClient from 'apollo-boost'
import VueApollo from 'vue-apollo'

import FormAlert from './components/Shared/FormAlert.vue'

// Register global component
Vue.component('form-alert', FormAlert)

Vue.use(VueApollo)

export const defaultClient = new ApolloClient({
  uri: 'https://fullstack-vue-graphql-starter-upubrmdywm.now.sh/graphql',
  // Include auth token with requests made to backend
  fetchOptions: {
    credentials: 'include'
  },
  request: operation => {
    // if no token with key of 'token in localStorage, add it
    if (!localStorage.token) localStorage.setItem('token', '')

    // operation adds the token to an authorization header, which is send to backend
    operation.setContext({
      headers: {
        authorization: localStorage.getItem('token')
      }
    })
  },
  onError: ({ graphQLErrors, networkError }) => {
    if (networkError) {
      console.log('[networkError]', networkError)
    }
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        console.dir(err)
        if (err.name === 'AuthenticationError') {
          // set auth error in state (to show in snackbar)
          store.commit('setAuthError', err)
          // signout user (to clean token)
          store.dispatch('signoutUser')
        }
      }
    }
  }
})

const apolloProvider = new VueApollo({ defaultClient })

Vue.config.productionTip = false

new Vue({
  apolloProvider,
  router,
  store,
  render: h => h(App),
  created() {
    // excute getCurrentUser query
    this.$store.dispatch('getCurrentUser')
  }
}).$mount('#app')
