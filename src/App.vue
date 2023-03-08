<template>
  <div id="lowest-background"></div>
  <n-config-provider :theme="customComponentThemeProvider.naiveUITheme.perSet" :theme-overrides="customComponentThemeProvider.naiveUITheme.override">
    <n-notification-provider>
      <n-dialog-provider>
        <LoginMask :is-login=loginStatus.isLogin @login-success='loginStatus.loginSuccess()'/>
        <div id="app-content">
          <HeadLine id="headline" :class="{'header-hide':(!componentFirstLoad)&&(fullScreenStatus),
                                           'header-show':(!componentFirstLoad)&&(!fullScreenStatus)}" />
        </div>
        <MiniOptionsPanel id="options-panel" :class="{'options-hide':(!componentFirstLoad)&&(fullScreenStatus),
                                                      'options-show':(!componentFirstLoad)&&(!fullScreenStatus)}" />
        <div id="main-div" :class="{'full-screen':(!componentFirstLoad)&&(fullScreenStatus),
                                    'exit-full-screen':(!componentFirstLoad)&&(!fullScreenStatus)}">
          <router-view :key="$route.path"></router-view>
        </div>
        <div id="extend-message" :class="{'options-hide':(!componentFirstLoad)&&(fullScreenStatus),
                                          'options-show':(!componentFirstLoad)&&(!fullScreenStatus)}">
          <svg :style="githubStyle" @click="goGithub">
            <LogoGithub />
          </svg>
          <br/>
          1.0.0-beta | MIT Licence
        </div>
      </n-dialog-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import {NConfigProvider,NButton,NIcon} from 'naive-ui';
import {loginStatus} from './globalStatus'
import {customComponentThemeProvider,ColorSet} from './theme.js'
import axios from "axios";
import {UserApi} from "./api-define";
import { onMounted,computed,Ref,ref,watch } from 'vue'
import {LogoGithub} from '@vicons/carbon'
import PictureUpload from './components/PictureUpload.vue'
import {fullScreenStatus} from './globalStatus'

function loadProfile(){
  axios.request(UserApi.getMyProfile()).then((response)=>{
    if(response.data.code === '00000'){
      loginStatus.standardProfile.name = response.data.data.userName;
      loginStatus.standardProfile.nickname = response.data.data.userNickname;
      loginStatus.standardProfile.createTime = new Date(response.data.data.createTimestamp).toLocaleDateString();
    }
  }).catch((response)=>console.log(response))
}

onMounted(()=>{
  loadProfile();
  loginStatus.registerAction(loadProfile,true);
})

const colorSet = computed<ColorSet>(()=>{
  return customComponentThemeProvider.value.colorSet;
})
const githubStyle = computed(()=>{
  return {
    height:'24px',
    width: '24px',
  }
})
function goGithub(){
  window.open("https://github.com/stonexthree/EasyMark","_blank");
}

//主区全屏控制
const componentFirstLoad:Ref<boolean> = ref(true);
watch(fullScreenStatus,async (newV,oldV)=>{
  componentFirstLoad.value=false;
} )


</script>

<script lang="ts">
import DocList from "./components/DocList.vue"
import HeadLine from "./components/HeadLine.vue"
import LoginMask from "./components/LoginMask.vue"
import MemberDoc from "./components/MemberDoc.vue"
import MilkDown from './components/Milkdown.vue'
import MiniOptionsPanel from './components/MiniOptionsPanel.vue'
import SearchTool from "./components/SearchTool.vue";
import MyDoc from './MyDoc.vue'
import ShowDoc from './components/ShowDoc.vue'
import Test from "./components/Test.vue"
import AccountProfile from "./components/AccountProfile.vue"
import {NDialogProvider, NNotificationProvider} from 'naive-ui'

export default {
  name: "App",
};
</script>
<style scoped>
#login-mask-top-div {
  width: 100%;
  height: 100%;
  z-index: 10;
  position: absolute;
}

#app-content {
  width: 100%;
  height: 100%;
  position: absolute;
  background-color: v-bind(colorSet.deep);
}

#headline {
  position: fixed;
  top: 0px;
  animation-duration: 1s;
  animation-fill-mode: both;
}

#side-options {
  position: fixed;
}

#options-panel {
  position: fixed;
  animation-duration: 1s;
  animation-fill-mode: both;
}

#extend-message{
  position: fixed;
  bottom: 20px;
  left: 48px;
  color: v-bind(colorSet.fontColor4);
  animation-duration: 1s;
  animation-fill-mode: both;
}

#main-div {
  position: absolute;
  top: 100px;
  height: calc(100% - 100px);
  width: calc(100% - 200px);
  left: 200px;
  display: flex;
  flex-flow: row;
  overflow-y: scroll;
  overflow-x: hidden;
  animation-duration: 1s;
  animation-fill-mode: both;
}
#main-div::-webkit-scrollbar{
  display: none;
}

svg:hover{
 cursor: pointer;
}

#lowest-background{
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: v-bind(colorSet.deep);
}

.full-screen{
  animation-name:main-div-fullscreen;
}
.exit-full-screen{
  animation-name: main-div-exit-fullscreen;
}

@keyframes main-div-fullscreen {
  0%{
    top:100px;
    left: 200px;
    height: calc(100% - 100px);
  width: calc(100% - 200px);
  }
  100%{
    top:0px;
    left: 0px;
    height: 100%;
  width: 100%;
  }
}

@keyframes main-div-exit-fullscreen {
  0%{
    top:0px;
    left:0px;
    height: 100%;
  width: 100%;
  }
  100%{
    top:100px;
    left:200px;
    height: calc(100% - 100px);
  width: calc(100% - 200px);
  }
}
.options-show{
  animation-name:options-show;
}
.options-hide{
  animation-name: options-hide;
}
@keyframes options-hide{
  0%{
    left:60px;
  }
  100%{
    left: -200px;
  }
}
@keyframes options-show{
  0%{
    left:-200px;
  }
  100%{
    left: 60px;
  }
}

.header-show{
  animation-name:header-show;
}
.header-hide{
  animation-name: header-hide;
}
@keyframes header-hide{
  0%{
    top:0px;
  }
  100%{
    top: -100px;
  }
}
@keyframes header-show{
  0%{
    top:-100px;
  }
  100%{
    top: 0px;
  }
}


</style>