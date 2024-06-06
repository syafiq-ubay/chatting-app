<template>
  <div class="w-100 mt-3">
    <h2 class="fw-600">Welcome to Profile section</h2>
    <div class="profile">
      <img class="br-06" :src="photoURL" width="100%" height="100%" />
      <label class="avatar">
        <font-awesome-icon icon="pencil-alt" />
        <input type="file" name="upload" class="w-0" @change="changeAvatar" />
      </label>
    </div>
    <div class="form-group">
      <label>Name</label>
      <input type="text" name="name" class="form-control" v-model="name" />
    </div>
    <div class="form-group">
      <label>Tell me about yourself</label>
      <input
        type="text"
        name="aboutMe"
        class="form-control"
        v-model="aboutMe"
      />
    </div>
    <button type="button" class="btn btn-primary" v-on:click="uploadAvatar">
      Save
    </button>
    <button type="button" class="btn btn-info" v-on:click="goBack">Back</button>
  </div>
</template>

<script>
import { db, storage } from "../firebase/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import Vue from "vue";

export default {
  name: "Profile",
  data() {
    return {
      firebaseDocId: localStorage.getItem("FirebaseDocumentId"),
      id: localStorage.getItem("id"),
      name: localStorage.hasOwnProperty("name")
        ? localStorage.getItem("name")
        : "",
      aboutMe: localStorage.hasOwnProperty("description")
        ? localStorage.getItem("description")
        : "",
      photoURL: localStorage.getItem("photoURL"),
      newPhoto: null,
    };
  },
  methods: {
    goBack() {
      this.$router.push("/chat");
    },
    changeAvatar(event) {
      if (event.target.files && event.target.files[0]) {
        const fileType = event.target.files[0].type.toString();
        if (fileType.indexOf("image") !== 0) {
          Vue.toasted.show("Please choose an image").goAway(1500);
          return;
        }
        this.newPhoto = event.target.files[0];
        this.photoURL = URL.createObjectURL(event.target.files[0]);
      } else {
        Vue.toasted.show("Something went wrong!").goAway(1500);
      }
    },
    uploadAvatar() {
      if (this.newPhoto) {
        const storageRef = ref(storage, `avatars/${this.id}`);
        const uploadTask = uploadBytesResumable(storageRef, this.newPhoto);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Progress handling can be done here
          },
          (error) => {
            console.log("error", error.message);
            Vue.toasted.show("Upload failed").goAway(1500);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
              this.updateUserInfo(true, url);
            });
          }
        );
      } else {
        this.updateUserInfo(false, null);
      }
    },
    updateUserInfo(isUrlPresent, downloadURL) {
      const newInfo = isUrlPresent
        ? {
            name: this.name,
            description: this.aboutMe,
            URL: downloadURL,
          }
        : {
            name: this.name,
            description: this.aboutMe,
          };

      const userDoc = doc(db, "users", this.firebaseDocId);
      updateDoc(userDoc, newInfo)
        .then(() => {
          localStorage.setItem("name", this.name);
          localStorage.setItem("description", this.aboutMe);
          if (isUrlPresent) {
            localStorage.setItem("photoURL", downloadURL);
          }
          Vue.toasted.show("Profile updated").goAway(1500);
        })
        .catch((error) => {
          console.log("error", error.message);
          Vue.toasted.show("Update failed").goAway(1500);
        });
    },
  },
  created() {
    if (!localStorage.hasOwnProperty("id")) {
      this.$router.push("/");
    }
  },
};
</script>

<style scoped>
input[type="text"] {
  margin: 0 auto;
  width: 25%;
}
label {
  font-size: 18px;
  font-weight: 600;
}
.fw-600 {
  font-weight: 600;
}
.w-100 {
  width: 100vw;
}
.w-0 {
  width: 0;
}
.br-06 {
  border-radius: 0.6rem;
}
.profile {
  margin: 20px auto;
  width: 150px;
  height: 150px;
  background-color: royalblue;
  position: relative;
  border-radius: 0.6rem;
}
.avatar {
  width: 35px;
  height: 35px;
  background: #f46e13;
  border-radius: 0.6rem;
  position: absolute;
  top: 115px;
  right: 0px;
  padding: 2px 0px 0px 7px;
}
</style>
