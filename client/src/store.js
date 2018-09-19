import Vue from 'vue'
import Vuex from 'vuex'
import router from './router'

import { defaultClient as apolloClient } from './main'
import {
  GET_POSTS,
  INFINITE_SCROLL_POSTS,
  GET_USER_POSTS,
  SEARCH_POSTS,
  ADD_POST,
  UPDATE_USER_POST,
  DELETE_USER_POST,
  SIGNIN_USER,
  GET_CURRENT_USER,
  SIGNUP_USER
} from './queries'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    posts: [],
    searchResults: [],
    user: null,
    userPosts: [],
    loading: false,
    error: null,
    authError: null
  },
  mutations: {
    setPosts: (state, payload) => {
      state.posts = payload
    },
    setUserPosts: (state, payload) => {
      state.userPosts = payload
    },
    setSearchResults: (state, payload) => {
      if (payload !== null) {
        state.searchResults = payload
      }
    },
    clearSearchResults: state => {
      state.searchResults = []
    },
    setUser: (state, payload) => {
      state.user = payload
    },
    clearUser: state => {
      state.user = null
    },
    setLoading: (state, payload) => {
      state.loading = payload
    },
    setError: (state, payload) => {
      state.error = payload
    },
    clearError: state => {
      state.error = null
    },
    setAuthError: (state, payload) => {
      state.authError = payload
    }
  },
  actions: {
    getCurrentUser: ({ commit }) => {
      commit('setLoading', true)
      apolloClient
        .query({
          query: GET_CURRENT_USER
        })
        .then(({ data }) => {
          commit('setLoading', false)
          commit('setUser', data.getCurrentUser)
        })
        .catch(err => {
          commit('setLoading', false)
          console.error(err)
        })
    },
    getPosts: ({ commit }) => {
      commit('setLoading', true)
      apolloClient
        .query({
          query: GET_POSTS
        })
        .then(({ data }) => {
          commit('setPosts', data.getPosts)
          commit('setLoading', false)
        })
        .catch(err => {
          commit('setLoading', false)
          console.error(err)
        })
    },
    getUserPosts: ({ commit }, payload) => {
      apolloClient
        .query({
          query: GET_USER_POSTS,
          variables: payload
        })
        .then(({ data }) => {
          commit('setUserPosts', data.getUserPosts)
        })
        .catch(err => {
          console.error(err)
        })
    },
    searchPosts: ({ commit }, payload) => {
      apolloClient
        .query({
          query: SEARCH_POSTS,
          variables: payload
        })
        .then(({ data }) => {
          commit('setSearchResults', data.searchPosts)
        })
        .catch(err => {
          console.error(err)
        })
    },
    addPost: ({ commit }, payload) => {
      apolloClient
        .mutate({
          mutation: ADD_POST,
          variables: payload,
          update: (cache, { data: { addPost } }) => {
            // console.log(cache, data)
            // first read the query you want to update
            const data = cache.readQuery({ query: GET_POSTS })
            // create updated data
            data.getPosts.unshift(addPost)
            // write updated data to query
            console.log(data)
            cache.writeQuery({
              query: GET_POSTS,
              data
            })
          },
          // Optimistic Response ensures data is added immediately as we specified for the update
          optimisticResponse: {
            __typename: 'Mutation',
            addPost: {
              __typename: 'Post',
              _id: -1,
              ...payload
            }
          },
          // Rerun specified queries after performing the mutation in order to get fresh data
          refetchQueries: [
            {
              query: INFINITE_SCROLL_POSTS,
              variables: {
                pageNum: 1,
                pageSize: 2
              }
            }
          ]
        })
        .then(({ data }) => {
          console.log(data.addPost)
        })
        .catch(err => {
          console.error(err)
        })
    },
    updateUserPost: ({ state, commit }, payload) => {
      apolloClient
        .mutate({
          mutation: UPDATE_USER_POST,
          variables: payload
        })
        .then(({ data }) => {
          const index = state.userPosts.findIndex(
            post => post._id === data.updateUserPost._id
          )
          const userPosts = [
            ...state.userPosts.slice(0, index),
            data.updateUserPost,
            ...state.userPosts.slice(index + 1)
          ]
          commit('setUserPosts', userPosts)
        })
        .catch(err => {
          console.error(err)
        })
    },
    deleteUserPost: ({ commit, state }, payload) => {
      apolloClient
        .mutate({
          mutation: DELETE_USER_POST,
          variables: payload
        })
        .then(({ data }) => {
          const index = state.userPosts.findIndex(
            post => post._id === data.deleteUserPost._id
          )
          const userPosts = [
            ...state.userPosts.slice(0, index),
            ...state.userPosts.slice(index + 1)
          ]
          commit('setUserPosts', userPosts)
        })
        .catch(err => {
          console.error(err)
        })
    },
    signinUser: ({ commit }, payload) => {
      commit('clearError')
      commit('setLoading', true)
      apolloClient
        .mutate({
          mutation: SIGNIN_USER,
          variables: payload
        })
        .then(({ data }) => {
          commit('setLoading', false)
          localStorage.setItem('token', data.signinUser.token)
          // to make sure created method is run in main.js (we run getCurrentUser), reload the page
          router.go()
          // console.log(data.signinUser)
        })
        .catch(err => {
          commit('setLoading', false)
          commit('setError', err)
          console.error(err)
        })
    },
    signoutUser: async ({ commit }) => {
      // clear user in state
      commit('clearUser')
      // remove token in localStorage
      localStorage.setItem('token', '')
      // end session
      await apolloClient.resetStore()
      // redirect to home - kick users out of private pages (i.e. profile)
      router.push('/')
    },
    signupUser: ({ commit }, payload) => {
      commit('clearError')
      commit('setLoading', true)
      apolloClient
        .mutate({
          mutation: SIGNUP_USER,
          variables: payload
        })
        .then(({ data }) => {
          commit('setLoading', false)
          localStorage.setItem('token', data.signupUser.token)
          // to make sure created method is run in main.js (we run getCurrentUser), reload the page
          router.go()
          // console.log(data.signinUser)
        })
        .catch(err => {
          commit('setLoading', false)
          commit('setError', err)
          console.error(err)
        })
    }
  },
  getters: {
    userFavorites: state => state.user && state.user.favorites
  }
})
