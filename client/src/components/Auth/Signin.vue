<template>
  <v-container text-xs-center mt-5 pt-5>
    <!-- Signin Title -->
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <h1>Welcome Back!</h1>
      </v-flex>
    </v-layout>
    <!-- Error Alert -->
    <v-layout v-if="error" row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <form-alert :message="error.message"></form-alert>
      </v-flex>
    </v-layout>
    <!-- Signin Form -->
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <v-card color="secondary" dark>
          <v-container>
            <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleSigninUser">

              <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="usernameRules" v-model="username" prepend-icon="face" label="Username" type="text" required></v-text-field>
                </v-flex>
              </v-layout>

              <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="passwordRules" v-model="password" prepend-icon="extension" label="Password" type="password" required></v-text-field>
                </v-flex>
              </v-layout>

              <v-layout row>
                <v-flex xs12>
                  <v-btn :loading="loading" :disabled="!isFormValid || loading" color="accent" type="submit">
                    Signin
                    <span slot="loader" class="custom-loader">
                      <v-icon light>cached</v-icon>
                    </span>
                  </v-btn>
                  <h3>
                    Don't have an account?
                    <router-link to="/signup">Signup</router-link>
                  </h3>
                </v-flex>
              </v-layout>

            </v-form>
          </v-container>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Signin',
  data() {
    return {
      isFormValid: true,
      username: '',
      password: '',
      usernameRules: [
        // Check if username in input
        username => !!username || 'Username is required!',
        // Make sure username is less than 10 characters
        username =>
          username.length < 10 || 'Username must be less than 10 characters!'
      ],
      passwordRules: [
        // Check if password in input
        password => !!password || 'Password is required!',
        // Make sure password is at least 4 characters
        password =>
          password.length >= 4 || 'Password must be at least 4 characters!'
      ]
    }
  },
  methods: {
    ...mapActions(['signinUser']),
    handleSigninUser() {
      if (this.$refs.form.validate()) {
        this.signinUser({ username: this.username, password: this.password })
      }
    }
  },
  computed: {
    ...mapState(['user', 'error', 'loading'])
  },
  watch: {
    user(value) {
      // if user value changes, redirect to home page
      if (value) {
        this.$router.push('/')
      }
    }
  }
}
</script>