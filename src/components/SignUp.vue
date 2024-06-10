<template>
  <div class="signup-container">
    <form class="signup-box" @submit.prevent="signup">
      <h2 class="title">Register</h2>
      <h4 class="subtitle"> </h4>
      <input
        type="text"
        v-model="name"
        class="form-control mb-3"
        placeholder="name"
      />
      <input
        type="email"
        v-model="email"
        class="form-control mb-3"
        placeholder="email"
      />
      <input
        type="password"
        v-model="password"
        class="form-control mb-3"
        placeholder="password"
      />
      <div class="avatar-upload mb-3">
        <label for="avatar" class="avatar-label">
          <img v-if="avatarPreview" :src="avatarPreview" alt="Avatar Preview" class="avatar-preview"/>
          Add an avatar
        </label>
        <input
          type="file"
          id="avatar"
          class="avatar-input"
          @change="onFileChange"
        />
      </div>
      <button type="submit" class="btn btn-primary mb-3">Sign up</button>
      <div class="alternative-option">
        You do have an account? 
        <router-link :to="{ path: '/' }" class="login-link">
          Login
        </router-link>
      </div>
    </form>
  </div>
</template>

<script>
import { auth, db, storage } from "../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import Vue from "vue";

export default {
  name: "Signup",
  data() {
    return {
      name: "",
      email: "",
      password: "",
      avatar: null,
      avatarPreview: null,
    };
  },
  methods: {
    onFileChange(event) {
      if (event.target.files && event.target.files[0]) {
        const fileType = event.target.files[0].type.toString();
        if (fileType.indexOf("image") !== 0) {
          Vue.toasted.show("Please choose an image").goAway(1500);
          return;
        }
        this.avatar = event.target.files[0];
        this.avatarPreview = URL.createObjectURL(event.target.files[0]);
      } else {
        Vue.toasted.show("Something went wrong!").goAway(1500);
      }
    },
    async signup() {
      const name = this.name;
      const email = this.email;
      const password = this.password;
      try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        console.log("res", res);

        let photoURL = "";
        if (this.avatar) {
          const storageRef = ref(storage, `avatars/${res.user.uid}`);
          const uploadTask = uploadBytesResumable(storageRef, this.avatar);
          await new Promise((resolve, reject) => {
            uploadTask.on(
              "state_changed",
              null,
              reject,
              () => {
                getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                  photoURL = url;
                  resolve();
                });
              }
            );
          });
        } else {
          // Assign default URL if no avatar is added
          photoURL = "https://firebasestorage.googleapis.com/v0/b/chatingsapp-1719f.appspot.com/o/avatars%2FWiaEd4O6imP1sc0eaDSlWK2ypF43?alt=media&token=1288c025-085d-44c5-8c22-b239aaa9044b";
        }

        const userRef = await addDoc(collection(db, "users"), {
          name,
          id: res.user.uid,
          email,
          URL: photoURL,
          description: "",
        });
        localStorage.setItem("id", res.user.uid);
        localStorage.setItem("name", name);
        localStorage.setItem("email", email);
        localStorage.setItem("photoURL", photoURL);
        localStorage.setItem("description", "");
        localStorage.setItem("FirebaseDocumentId", userRef.id);
        this.name = "";
        this.email = "";
        this.password = "";
        this.avatar = null;
        this.avatarPreview = null;
        this.$router.push("/chat");
      } catch (err) {
        const errorCode = err.code;
        const errormessage = err.message;
        console.error("Error during signup:", err);
        if (errorCode === "auth/weak-password") {
          Vue.toasted.show("Massukan password minimal 6 charakter.").goAway(1500);
        } else {
          Vue.toasted.show(errormessage).goAway(1500);
        }
      }
    },
  },
};
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #e0e7ff;
}

.signup-box {
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

.avatar-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.avatar-label {
  color: #6366f1;
  cursor: pointer;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.avatar-preview {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.avatar-input {
  display: none;
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

.login-link {
  color: #6366f1;
  font-weight: 600;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

</style>
