<template>
  <div class="profile-container">
    <h2 class="profile-title">Edit Profile</h2>
    <h4 class="subtitle"></h4>
    <div class="profile">
      <div class="avatar-wrapper">
        <img class="avatar" :src="photoURL" alt="Avatar" />
        <label class="avatar-edit">
          <img src="../assets/edit.png" alt="" />
          <input type="file" class="input-file" @change="changeAvatar" />
        </label>
      </div>
    </div>
    <div class="form-group">
      <label for="name">Name</label>
      <input type="text" id="name" class="form-control" v-model="name" />
    </div>
    <div class="form-group">
      <label for="aboutMe">Bio</label>
      <textarea id="aboutMe" class="form-control" v-model="aboutMe"></textarea>
    </div>
    <div class="button-group">
      <button type="button" class="btn btn-primary" @click="uploadAvatar">
        Save
      </button>
      <button type="button" class="btn btn-secondary" @click="goBack">
        Back
      </button>
    </div>
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
      name: localStorage.getItem("name") || "",
      aboutMe: localStorage.getItem("description") || "",
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
        if (!fileType.startsWith("image")) {
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
          null,
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
            photoURL: downloadURL,
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
    if (!localStorage.getItem("id")) {
      this.$router.push("/");
    }
  },
};
</script>

<style scoped>
body {
  font-family: "Poppins", sans-serif;
  background: #e0e7ff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.profile-container {
  padding: 40px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 500px;
  text-align: center;
  margin: 200px auto;
}

.profile-title {
  color: #4a4a4a;
  font-weight: 700;
  margin-bottom: 10px;
}

.subtitle {
  color: #7a7a7a;
  font-weight: 400;
  margin-bottom: 30px;
}

.profile {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #fff;
}

.avatar-edit {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 35px;
  height: 35px;
  background: #e7e7e7;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 2px solid #fff;
}

.input-file {
  display: none;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #dcdcdc;
  border-radius: 5px;
  margin-bottom: 20px;
}

.form-control:focus {
  border-color: #a0a0a0;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}

textarea.form-control {
  resize: none;
  height: 50px;
}

.button-group {
  display: flex;
  justify-content: space-between;
}

.btn {
  width: 48%;
  padding: 10px;
  font-size: 14px;
  border-radius: 5px;
  color: #fff;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background-color: #6366f1;
}

.btn-primary:hover {
  background-color: #4f46e5;
}

.btn-secondary {
  background-color: #6c757d;
}
@media (max-width: 768px) {
  .profile-container {
    width: 100%;
    max-width: none;
    margin: 200px auto; /* Menengahkan secara horizontal */
  }
}
</style>
