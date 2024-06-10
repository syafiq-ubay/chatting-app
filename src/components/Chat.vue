<template>
  <div class="wrapper">
    <!-- Sidebar  -->
    <nav style="color: white" id="sidebar">
      <div class="sidebar-header d-flex justify-content-around">
        <div
          class="d-flex pointer"
          style="margin-right: 25px; width: 160px"
          v-on:click="onProfileClick"
        >
          <img
            :src="photoURL"
            alt="user"
            width="50px"
            height="50px"
            style="border-radius: 50%; background: white"
          />
        </div>
        <button type="button" class="btn btn-primary" v-on:click="logout">
          Logout
        </button>
      </div>
      <div style="height: 1px; border-bottom: 1px solid #00388b"></div>

      <!-- Search Input -->
      <div class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search..."
          class="form-control"
        />
      </div>

      <ul class="list-unstyled components">
        <li
          class="active mb-3"
          v-on:click="letsChat(item)"
          v-for="item in filteredUsers"
          :key="item.id"
          v-show="item.id != currentUserId"
        >
          <div
            class="d-flex"
            style="cursor: pointer; padding-bottom: 15px; width: 100%"
          >
            <div style="width: 30%">
              <img
                :src="item.URL"
                alt="user"
                width="50px"
                height="50px"
                style="border-radius: 50%; background: white"
              />
            </div>
            <div
              style="
                padding: 10px 0px 0px;
                width: 50%;
                display: flex;
                justify-content: space-between;
              "
            >
              <h6 style="line-height: 2; font-weight: 600">{{ item.name }}</h6>
            </div>
          </div>
          <div style="height: 1px; border-bottom: 1px solid #00388b"></div>
        </li>
      </ul>
    </nav>

    <!-- Konten Halaman  -->
    <div id="content" v-if="currentPeerUser === null">
      <div class="my-4">
        <img :src="photoURL" width="200px" height="200px" class="br-50" />
      </div>
      <div>
        <h2>Selamat datang {{ currentUserName }}</h2>
      </div>
    </div>
    <div v-else class="header-width">
      <ChatBox v-bind:currentPeerUser="currentPeerUser" />
    </div>
  </div>
</template>

<script>
import { auth, db } from "../firebase/firebase"; // Pastikan jalur impor benar
import { collection, getDocs } from "firebase/firestore";
import ChatBox from "./ChatBox";

export default {
  name: "Chat",
  components: {
    ChatBox,
  },
  data() {
    return {
      currentUserName: localStorage.getItem("name"),
      currentPeerUser: null,
      currentUserId: localStorage.getItem("id"),
      currentUserPhoto: localStorage.getItem("photoURL"),
      searchUsers: [],
      photoURL: localStorage.getItem("photoURL"),
      searchQuery: "", // New search query data property
    };
  },
  methods: {
    onProfileClick() {
      this.$router.push("/profile");
    },
    logout() {
      auth.signOut();
      this.$router.push("/");
      localStorage.clear();
    },
    letsChat(item) {
      this.currentPeerUser = item;
    },
    async getUserList() {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        querySnapshot.forEach((doc, index) => {
          this.searchUsers.push({
            key: index,
            documentKey: doc.id,
            id: doc.data().id,
            name: doc.data().name,
            URL: doc.data().URL,
            description: doc.data().description,
          });
        });
      } catch (error) {
        console.error("Error getting users: ", error);
      }
    },
  },
  computed: {
    filteredUsers() {
      return this.searchUsers.filter(user =>
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  created() {
    if (!localStorage.hasOwnProperty("id")) {
      this.$router.push("/");
    } else {
      this.getUserList();
    }
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
.br-50 {
  border-radius: 50%;
}
.header-width {
  width: calc(100% - 350px);
  min-height: 100vh;
  transition: all 0.3s;
  position: absolute;
  top: 0;
  right: 0;
}
.btn {
  background-color: #6366f1;
  height: 40px;
}
.search-bar {
  padding: 10px 0px;
  width: 310px;
}
.form-control {
  background-color: #fff;
  border: 1px solid #00388b;
  border-radius: 4px;
  color: #333;
  font-size: 14px;
  padding: 8px;
  width: calc(100% - 20px);
}
</style>
