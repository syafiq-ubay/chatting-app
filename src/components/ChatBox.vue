<template>
  <div style="display: flex; flex-direction: column; height: 100vh">
    <header>
      <div style="height: 60px; background: lightgrey">
        <img
          :src="currentPeerUser.URL"
          width="40px"
          height="40px"
          class="br-50 header-image"
        />
        <div class="header-image">
          <h6 class="mt-2" style="font-weight: 600">
            {{ currentPeerUser.name }}
          </h6>
        </div>
      </div>
    </header>
    <div
      style="background: #efe9e2; flex: 1; overflow-y: auto"
      ref="messagesContainer"
    >
      <div class="text-outer">
        <div
          :class="item.idFrom === currentUserId ? 'textFrom' : 'textTo'"
          class="text-inner"
          v-for="item in listMessage"
          :key="item.id"
        >
          <h6>{{ item.content }}</h6>
          <small>{{ formatTimestamp(item.timestamp) }}</small>
        </div>
      </div>
    </div>
    <footer>
      <div style="min-height: 60px; background: lightgrey">
        <div style="display: flex; padding: 15px; align-items: center">
          <input
            type="text"
            class="chat-input"
            v-model="inputValue"
            v-on:keyup.enter="sendMessage"
          />
          <img
            class="send-icon pointer"
            src="../assets/send.png"
            alt="send message"
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
      unsubscribe: null, // Untuk menyimpan referensi listener
      messagesCache: {}, // Cache pesan yang telah dimuat
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
      const timestamp = moment().toISOString();
      const message = {
        id: moment().valueOf().toString(),
        idFrom: this.currentUserId,
        idTo: this.currentPeerUser.id,
        timestamp: timestamp,
        content: this.inputValue.trim(),
      };
      try {
        await setDoc(
          doc(
            collection(db, "Messages", this.groupChatId, this.groupChatId),
            message.id
          ),
          message
        );
        this.inputValue = "";
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    },
    getMessages() {
      const userIds = [this.currentUserId, this.currentPeerUser.id];
      userIds.sort();
      const newGroupChatId = userIds.join("-");

      // Hanya panggil onSnapshot jika groupChatId berubah
      if (this.groupChatId !== newGroupChatId) {
        this.groupChatId = newGroupChatId;

        // Batalkan listener sebelumnya jika ada
        if (this.unsubscribe) {
          this.unsubscribe();
        }

        // Periksa cache pesan
        if (this.messagesCache[this.groupChatId]) {
          this.listMessage = this.messagesCache[this.groupChatId];
        } else {
          this.listMessage = [];
        }

        const messagesCollection = collection(
          db,
          "Messages",
          this.groupChatId,
          this.groupChatId
        );

        this.unsubscribe = onSnapshot(messagesCollection, (snapshot) => {
          const newMessages = [];
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const newMessage = change.doc.data();
              // Periksa apakah pesan sudah ada dalam listMessage
              if (!this.listMessage.some((msg) => msg.id === newMessage.id)) {
                newMessages.push(newMessage);
              }
            }
          });

          // Gabungkan pesan baru dengan yang sudah ada
          this.listMessage = [...this.listMessage, ...newMessages];
          this.messagesCache[this.groupChatId] = this.listMessage;

          // Tunggu hingga DOM diperbarui, lalu scroll ke bawah
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        });
      }
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer;
      container.scrollTop = container.scrollHeight;
    },
    formatTimestamp(timestamp) {
      const messageDate = moment(timestamp).format("YYYY-MM-DD");
      const currentDate = moment().format("YYYY-MM-DD");

      if (messageDate === currentDate) {
        // Tampilkan hanya jam
        return moment(timestamp).format("HH:mm");
      } else {
        // Tampilkan tanggal dan jam
        return moment(timestamp).format("DD-MM-YYYY HH:mm");
      }
    },
  },
  mounted() {
    this.getMessages();
  },
  beforeDestroy() {
    // Batalkan listener saat komponen dihancurkan
    if (this.unsubscribe) {
      this.unsubscribe();
    }
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
  background-image: url(../assets/background.png);
}
.text-inner {
  padding: 10px 10px 2px;
  border-radius: 0.5rem;
  width: 20%;
}
.textFrom {
  background-color: #009200;
  color: white;
  margin: 0% 0% 20px 75%;
  text-align: left;
}
.textTo {
  background-color: #55675d;
  color: rgb(253, 253, 253);
  margin: 0% 0% 20px 5%;
  text-align: right;
}
.pointer {
  cursor: pointer;
}
.chat-input {
  flex: 1; /*Perubahan dilakukan di sini */
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 5px 10px;
  margin-right: 10px; /* Perubahan dilakukan di sini */
}
.send-icon {
  margin-left: 10px; /* Perubahan dilakukan di sini */
}
</style>