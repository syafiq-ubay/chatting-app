<template>
  <div style="display: flex; flex-direction: column; height: 100vh">
    <header>
      <div style="height: 60px; background: lightgrey">
        <img
          :src="currentPeerUser.URL"
          width="40px"
          class="br-50 header-image"
        />
        <div class="header-image">
          <h6 class="mt-2" style="font-weight: 600">
            {{ currentPeerUser.name }}
          </h6>
        </div>
      </div>
    </header>
    <div style="background: #efe9e2; flex: 1; overflow-y: auto">
      <h2 class="welcome">Welcome to Chatbox</h2>
      <div class="text-outer">
        <div
          :class="item.idFrom === currentUserId ? 'textFrom' : 'textTo'"
          class="text-inner"
          v-for="item in listMessage"
          :key="item.id"
        >
          <h6>{{ item.content }}</h6>
        </div>
      </div>
    </div>
    <footer>
      <div style="min-height: 60px; background: lightgrey">
        <div style="display: flex; padding: 15px">
          <img
            class="mr-3 pointer"
            src="../assets/picture.png"
            alt="select picture"
            width="30px"
            height="30px"
          />
          <img
            class="mr-3 pointer"
            src="../assets/sticker.png"
            alt="select sticker"
            width="30px"
            height="30px"
          />
          <input
            type="text"
            style="
              width: 85%;
              border: 1px solid transparent;
              border-radius: 4px;
              padding: 5px 10px;
            "
            class="mr-3"
            v-model="inputValue"
            v-on:keyup.enter="sendMessage"
          />
          <img
            class="mr-2 pointer"
            src="../assets/send.png"
            alt="send message"
            width="30px"
            height="30px"
            v-on:click="sendMessage"
          />
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { db } from "../firebase/firebase";
import { collection, doc, setDoc, onSnapshot } from "firebase/firestore";
import moment from "moment";

export default {
  name: "ChatBox",
  props: ["currentPeerUser"],
  data() {
    return {
      currentUserName: localStorage.getItem("name"),
      currentUserId: localStorage.getItem("id"),
      currentUserPhoto: localStorage.getItem("photoURL"),
      inputValue: "",
      listMessage: [],
      groupChatId: null,
    };
  },
  watch: {
    currentPeerUser: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.getMessages();
      }
    },
  },
  methods: {
    async sendMessage() {
      if (this.inputValue.trim() === "") {
        return;
      }
      const timestamp = moment().valueOf().toString();
      const message = {
        id: timestamp,
        idFrom: this.currentUserId,
        idTo: this.currentPeerUser.id,
        timestamp: timestamp,
        content: this.inputValue.trim(),
      };
      try {
        await setDoc(
          doc(
            collection(db, "Messages", this.groupChatId, this.groupChatId),
            timestamp
          ),
          message
        );
        this.inputValue = "";
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    },
    getMessages() {
      const userIds = [this.currentUserId, this.currentPeerUser.id];
      userIds.sort();
      this.groupChatId = userIds.join("-");

      const messagesCollection = collection(
        db,
        "Messages",
        this.groupChatId,
        this.groupChatId
      );
      onSnapshot(messagesCollection, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            this.listMessage.push(change.doc.data());
          }
        });
      });
    },
  },
  mounted() {
    this.getMessages();
  },
};
</script>

<style scoped>
.welcome {
  color: #635a5a;
  font-weight: 600;
  margin: 10px 0px 32px;
}
.br-50 {
  border-radius: 50%;
}
.header-image {
  float: left;
  margin-left: 10px;
  margin-top: 10px;
}
.text-outer {
  display: flex;
  flex-direction: column;
}
.text-inner {
  padding: 10px 10px 2px;
  border-radius: 0.5rem;
  width: 20%;
}
.textFrom {
  background: teal;
  color: white;
  margin: 0% 0% 20px 70%;
}
.textTo {
  background: lightcoral;
  color: black;
  margin: 0% 0% 20px 5%;
}
.pointer {
  cursor: pointer;
}
</style>
