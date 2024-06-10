<template>
  <div class="login-container">
    <form class="login-box" @submit.prevent="login">
      <h2 class="title">Login</h2>
      <h4 class="subtitle"></h4>
      <input
        type="text"
        v-model="email"
        class="form-control mb-3"
        placeholder="email"
      />
      <input
        type="password"
        v-model="password"
        class="form-control mb-3"
        placeholder="password"
        v-on:keyup.enter="login"
      />
      <button type="submit" class="btn btn-primary mb-3">Sign in</button>
      <div class="alternative-option">
        You don't have an account?
        <router-link :to="{ path: 'signup' }" class="register-link">
          Register
        </router-link>
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

          const currentRoute = this.$route.path;
          const targetRoute = "/chat";

          if (currentRoute !== targetRoute) {
            this.$router.push(targetRoute);
          } else {
            console.log("Already on the target route:", targetRoute);
          }
        }
      } catch (err) {
        let errorMessage;
        switch (err.code) {
          case "auth/invalid-email":
            errorMessage = "Format email tidak valid.";
            break;
          case "auth/user-disabled":
            errorMessage = "Akun pengguna telah dinonaktifkan.";
            break;
          case "auth/user-not-found":
            errorMessage = "Email pengguna tidak terdaftar.";
            break;
          case "auth/wrong-password":
            errorMessage = "Email atau kata sandi salah.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Terlalu banyak percobaan login. Coba lagi nanti.";
            break;
          default:
            errorMessage = "Email atau password salah. Silakan coba lagi.";
            break;
        }
        Vue.toasted.show(errorMessage).goAway(5000);
      }
    },
  },
  created() {
    // if (localStorage.getItem("id")) this.$router.push("/chat");
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #e0e7ff;
}

.login-box {
  padding: 40px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 350px;
  text-align: center;
}

.title {
  color: #4a4a4a;
  font-weight: 700;
  margin-bottom: 10px;
}

.subtitle {
  color: #7a7a7a;
  font-weight: 400;
  margin-bottom: 30px;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #dcdcdc;
  border-radius: 5px;
  margin-bottom: 20px;
}

.form-control:focus {
  border-color: #a0a0a0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: #6366f1;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #4f46e5;
}

.alternative-option {
  margin-top: 20px;
  color: #7a7a7a;
}

.register-link {
  color: #6366f1;
  font-weight: 600;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}
</style>
