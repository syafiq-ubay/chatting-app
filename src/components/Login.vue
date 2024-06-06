<template>
  <div class="mt-4">
    <h2>Welcome to Ubaiboy ChatApps</h2>
    <form class="detail-box my-5">
      <div class="form-group my-3">
        <h4>Login to Chat</h4>
        <input
          type="text"
          v-model="email"
          class="form-control mb-4 mt-4"
          placeholder="Enter your email..."
        />
        <input
          type="password"
          v-model="password"
          class="form-control mb-4"
          placeholder="Enter your password..."
          v-on:keyup.enter="login"
        />
        <router-link :to="{ path: 'signup' }">
          <h6 class="mb-3" style="font-weight: 600">Create account</h6>
        </router-link>

        <button
          type="button"
          v-on:click="login"
          class="btn btn-primary"
          style="font-weight: 600"
        >
          Login
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { auth, db } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import Vue from "vue";

export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    async login() {
      try {
        const res = await signInWithEmailAndPassword(
          auth,
          this.email,
          this.password
        );
        console.log(res);
        if (res.user) {
          const q = query(
            collection(db, "users"),
            where("id", "==", res.user.uid)
          );
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            let userData = doc.data();
            localStorage.setItem("id", userData.id);
            localStorage.setItem("name", userData.name);
            localStorage.setItem("email", userData.email);
            localStorage.setItem("password", userData.password);
            localStorage.setItem("photoURL", userData.URL);
            localStorage.setItem("description", userData.description);
            localStorage.setItem("FirebaseDocumentId", doc.id);
          });
          this.$router.push("/chat");
        }
      } catch (err) {
        var errorCode = err.code;
        var errormessage = err.message;
        Vue.toasted.show(errorCode).goAway(1500);
        Vue.toasted.show(errormessage).goAway(1500);
      }
    },
  },
  created() {
    // if (localStorage.getItem("id")) this.$router.push("/chat");x`x`
  },
};
</script>

<style scoped>
input[type="text"],
input[type="password"] {
  margin: 0 auto;
  width: 80%;
  border: 1px solid lightgrey;
}
.detail-box {
  padding: 5px;
  border: 1px solid lightgrey;
  width: 400px;
  min-height: 250px;
  margin: 0 auto;
}
h2,
h4 {
  color: dodgerblue;
  font-weight: 600;
}
</style>
