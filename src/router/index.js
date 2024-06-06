import Vue from "vue";
import VueRouter from "vue-router";
import Login from "@/components/Login.vue";
import SignUp from "@/components/SignUp.vue";
import Chat from "@/components/Chat.vue";
import Profile from "@/components/Profile.vue";
import ChatBox from "@/components/ChatBox.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: Login,
  },
  {
    path: "/signup",
    component: SignUp,
  },
  {
    path: "/chat",
    component: Chat,
  },
  {
    path: "/profile",
    component: Profile,
  },
  {
    path: "/chatbox",
    component: ChatBox,
  },
];

const router = new VueRouter({
  routes,
  mode: "history",
});

export default router;
