<template>
  <div class="mt-4">
    <h2>Welcome to Ubaiboy ChatApps</h2>
    <form class="detail-box my-5">
      <div class="form-group my-3">
        <h4>Signup to Chat</h4>
        <input
          type="text"
          v-model="name"
          class="form-control mb-4 mt-4"
          placeholder="Enter your name..."
        />
        <input
          type="email"
          v-model="email"
          class="form-control mb-4"
          placeholder="Enter your email..."
        />
        <input
          type="password"
          v-model="password"
          class="form-control mb-4"
          placeholder="Enter your password..."
        />
        <router-link :to="{ path: '/' }">
          <h6 class="mb-3" style="font-weight: 600">Back to login</h6>
        </router-link>
        <button
          style="font-weight: 600"
          type="button"
          v-on:click="signup"
          class="btn btn-primary"
        >
          Signup
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { auth, db } from "../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";

export default {
  name: "Signup",
  data() {
    return {
      name: "",
      email: "",
      password: "",
    };
  },
  methods: {
    async signup() {
      const name = this.name;
      const email = this.email;
      const password = this.password;
      try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        console.log("res", res);
        const userRef = await addDoc(collection(db, "users"), {
          name,
          id: res.user.uid,
          email,
          URL: "",
          description: "",
        });
        localStorage.setItem("id", res.user.uid);
        localStorage.setItem("name", name);
        localStorage.setItem("email", email);
        localStorage.setItem("photoURL", "");
        localStorage.setItem("description", "");
        localStorage.setItem("FirebaseDocumentId", userRef.id);
        this.name = "";
        this.email = "";
        this.password = "";
        this.$router.push("/chat");
      } catch (err) {
        const errorCode = err.code;
        const errormessage = err.message;
        console.error("Error during signup:", err);
        if (errorCode === "auth/weak-password") {
          if (this.$toasted) {
            this.$toasted.show("Password too weak", { duration: 1500 });
          } else {
            console.error("Toasted is not defined");
          }
        } else {
          if (this.$toasted) {
            this.$toasted.show(errormessage, { duration: 1500 });
          } else {
            console.error("Toasted is not defined");
          }
        }
      }
    },
  },
};
</script>

<style scoped>
input[type="text"],
input[type="password"],
input[type="email"] {
  margin: 0 auto;
  width: 80%;
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
