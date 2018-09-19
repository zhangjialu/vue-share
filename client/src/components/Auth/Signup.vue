<template>
  <v-container text-xs-center mt-5 pt-5>
    <!-- Signup Title -->
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <h1>Get Started Here</h1>
      </v-flex>
    </v-layout>
    <!-- Error Alert -->
    <v-layout v-if="error" row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <form-alert :message="error.message"></form-alert>
      </v-flex>
    </v-layout>
    <!-- Signup Form -->
    <v-layout row wrap>
      <v-flex xs12 sm6 offset-sm3>
        <v-card color="accent" dark>
          <v-container>
            <v-form v-model="isFormValid" lazy-validation ref="form" @submit.prevent="handleSignupUser">

              <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="usernameRules" v-model="username" prepend-icon="face" label="Username" type="text" required></v-text-field>
                </v-flex>
              </v-layout>

              <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="emailRules" v-model="email" prepend-icon="email" label="Email" type="email" required></v-text-field>
                </v-flex>
              </v-layout>

              <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="passwordRules" v-model="password" prepend-icon="extension" label="Password" type="password" required></v-text-field>
                </v-flex>
              </v-layout>

              <v-layout row>
                <v-flex xs12>
                  <v-text-field :rules="passwordRules" v-model="passwordComfirmation" prepend-icon="gavel" label="Confirm Password" type="password" required></v-text-field>
                </v-flex>
              </v-layout>

              <v-layout row>
                <v-flex xs12>
                  <v-btn :loading="loading" :disabled="!isFormValid || loading" color="info" type="submit">
                    Signup
                    <span slot="loader" class="custom-loader">
                      <v-icon light>cached</v-icon>
                    </span>
                  </v-btn>
                  <h3>
                    Already have an account?
                    <router-link to="/signin">Signin</router-link>
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
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Signup',
  data() {
    return {
      isFormValid: true,
      username: '',
      email: '',
      password: '',
      passwordComfirmation: '',
      usernameRules: [
        // Check if username in input
        username => !!username || 'Username is required!',
        // Make sure username is less than 10 characters
        username =>
          username.length < 10 || 'Username cannot be more than 10 characters!'
      ],
      emailRules: [
        // Check if username in input
        email => !!email || 'Email is required!',
        // Check if is a valid email
        email =>
          /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(email) ||
          'Email must be valid!'
      ],
      passwordRules: [
        // Check if password in input
        password => !!password || 'Password is required!',
        // Make sure password is at least 4 characters
        password =>
          password.length >= 4 || 'Password must be at least 4 characters!',
        confirmation => confirmation === this.password || 'Password must match'
      ]
    }
  },
  computed: {
    ...mapState(['loading', 'error', 'user'])
  },
  methods: {
    ...mapActions(['signupUser']),
    handleSignupUser() {
      if (this.$refs.form.validate()) {
        this.signupUser({
          username: this.username,
          email: this.email,
          password: this.password
        })
      }
    }
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