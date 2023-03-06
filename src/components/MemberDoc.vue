<template>
  <div class="component-root" :style="{ width: widthPercent + '%' }">
    <div class="member-area" :style="memberAreaStyle">
      <!-- <div :class="{'user-name':true,'selected-user-name':selectedMember === member.name}"
           v-for="member in memberArray"
           @click="clickMember(member.name)">
        {{ member.nickname }}
      </div> -->
    </div>
    <div class="doc-area">
      <DocList :docs-api-config="docApiConfig" :style="{ top: '0px', height: '100%' }" :loading="false" />
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "MemberDoc"
}
</script>

<script setup lang="ts">
import DocList from "./DocList.vue"
import { DocInfo } from "../model/models"
import { ref, onMounted, reactive, Ref, computed } from "vue";
import axios from 'axios'
import { UserApi, DocApi, UrlConstructor } from '../api-define'
import { loginStatus } from "../globalStatus";
import { customComponentThemeProvider, ColorSet } from '../theme'

interface member { name: string, nickname: string, photoUrl: string };

const memberArray = ref<member[]>([]);

function mockMember(mock: boolean, mockSize: number): member[] {
  const result: member[] = [];
  if (mock) {
    for (let i = 0; i < mockSize; i++) {
      result.push({ name: "用户" + i, nickname: "昵称" + i, photoUrl: UrlConstructor.pictureUrl('default.png') })
    }
  }
  return result;
}

const selectedMember = ref<string>("none")
const docs: Ref<DocInfo[]> = ref([])
const docApiConfig = ref<Object>({});
function clickMember(memberName: string): void {
  selectedMember.value = memberName;
  docs.value = [];
  docApiConfig.value = DocApi.getDocByAuthor(memberName);
}

async function getAllUser() {
  //memberArray.value = mockMember(true, 10);
  const result: member[] = [];
  const response = await axios.request(UserApi.getAllUsers());
  const memberNameArr: string[] = [];
  if (response.data.code === '00000') {
    for (const i in response.data.data) {
      const member = response.data.data[i];
      result.push({ name: member.userName, nickname: member.userNickname, photoUrl: '' });
      memberNameArr.push(member.userName);
    }
  }
  if(result.length === 0){
    return;
  }
  const photoResponse = await axios.request(UserApi.listUserPhotos(memberNameArr));
  for (let index in result){
    let url = '';
    let location = photoResponse.data.data[result[index].name];
    if(location!==''&&location!==undefined){
      url = UrlConstructor.pictureUrl(location);
    }
    result[index].photoUrl = url;
  }
  memberArray.value = result;
}

onMounted(
  () => {
    getAllUser();
    loginStatus.registerAction(getAllUser);
  }
)

defineProps({
  loading: Boolean,
  widthPercent: Number
})

////////////////////////
//样式
const memberAreaStyle = computed<any>(() => {
  return {
    backgroundColor: customComponentThemeProvider.value.colorSet.halfLight
  }
})
const colorSet = computed<ColorSet>(() => {
  return customComponentThemeProvider.value.colorSet;
})
</script>

<style  scoped>
.component-root {
  position: absolute;
  width: 100%;
  height: calc(100%);
  left: 50%;
  transform: translateX(-50%);
}

.doc-area {
  position: absolute;
  left: 20%;
  width: 80%;
  min-width: 240px;
  height: 100%;
  background-color: transparent;
}

.member-area {
  position: absolute;
  left: 0%;
  width: 20%;
  min-width: 60px;
  height: 100%;
  overflow: scroll;
}

.member-area::-webkit-scrollbar {
  display: none;
}

.user-name {
  height: 40px;
  font-size: 1.2em;
  line-height: 40px;
  padding-left: 10px;
  user-select: none;
}

.user-name {
  color: v-bind(colorSet.fontColor3);
}

.user-name:hover {
  cursor: pointer;
  font-size: 1.5em;
  animation-name: text-shining;
  animation-fill-mode: both;
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

@keyframes text-shining {
  0% {
    color: v-bind(colorSet.fontColor3);
    text-shadow: 0 0 5px v-bind(colorSet.fontColor3);
  }

  100% {
    color: v-bind(colorSet.fontColor);
    text-shadow: 0 0 5px v-bind(colorSet.fontColor);
  }
}

.selected-user-name {
  background-color: v-bind(colorSet.deep);
  text-align: center;
}
</style>