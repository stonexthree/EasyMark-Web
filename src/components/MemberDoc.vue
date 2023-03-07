<template>
  <div class="component-root" :style="{ width: widthPercent + '%' }">
    <div class="member-area" :style="memberAreaStyle">
      <!-- <div :class="{'user-name':true,'selected-user-name':selectedMember === member.name}"
           v-for="member in memberArray"
           @click="clickMember(member.name)">
        {{ member.nickname }}
      </div> -->
      <div class="selected-member" @click="clickSelectedMember" >
        <div class="selected-photo">
          <n-icon class="default-icon" size="200" v-show="selectedMember.photoUrl === ''">
            <UserOutlined />
          </n-icon>
          <img class="selected-photo-img" :src="selectedMember.photoUrl" v-show="selectedMember.photoUrl !== ''" />
        </div>
        <div class="selected-nickname">{{ selectedMember.nickname }}</div>
      </div>
      <div :class="membersListClass">
        <div class="member-line" v-for="member in memberArray" @click="clickMember(member)">
          <div class="line-photo">
            <n-icon class="default-icon" size="32" v-show="member.photoUrl === ''">
              <UserOutlined />
            </n-icon>
            <img class="line-photo-img" :src="member.photoUrl" v-if="member.photoUrl !== ''" />
          </div>
          <div class="member-nickname">{{ member.nickname }}</div>
        </div>
      </div>
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
import { UserOutlined } from '@vicons/antd'
import { NIcon } from 'naive-ui'

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

const defaultMember: member = { name: 'system-all', nickname: '所有用户', photoUrl: '' };
const selectedMember: Ref<member> = ref<member>(defaultMember);
const docApiConfig = ref<Object>({});

async function getAllUser() {
  //memberArray.value = mockMember(true, 10);
  const result: member[] = [defaultMember];
  const response = await axios.request(UserApi.getAllUsers());
  const memberNameArr: string[] = [];
  if (response.data.code === '00000') {
    for (const i in response.data.data) {
      const member = response.data.data[i];
      result.push({ name: member.userName, nickname: member.userNickname, photoUrl: '' });
      memberNameArr.push(member.userName);
    }
  }
  if (result.length === 0) {
    return;
  }
  const photoResponse = await axios.request(UserApi.listUserPhotos(memberNameArr));
  for (let index in result) {
    let url = '';
    let location = photoResponse.data.data[result[index].name];
    if (location !== '' && location !== undefined) {
      url = UrlConstructor.pictureUrl(location);
    }
    result[index].photoUrl = url;
  }
  memberArray.value = result;
}

onMounted(
  () => {
    getAllUser();
    docApiConfig.value = DocApi.getAllDoc();
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
const memberListShow:Ref<boolean> = ref(false);
const firstLoaded:Ref<boolean> = ref(true);
const membersListClass = computed(()=>{
  if(firstLoaded.value){
    return ['other-members'];
  }
  if(memberListShow.value){
    return ['other-members','other-members-show'];
  }
  return ['other-members','other-members-hide'];
})
function clickMember(theMember: member): void {
  firstLoaded.value = false;
  memberListShow.value = false;
  selectedMember.value = theMember;
  if(theMember.name === 'system-all'){
    docApiConfig.value = DocApi.getAllDoc();
    return;
  }
  docApiConfig.value = DocApi.getDocByAuthor(theMember.name);
}
function clickSelectedMember(){
  console.log(1);
  memberListShow.value=true;
  firstLoaded.value = false;
}

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
  overflow: hidden;
}

.member-area::-webkit-scrollbar {
  display: none;
}

.selected-member {
  position: absolute;
  top: 0px;
  width: 100%;
  height: 350px;
}

.selected-member:hover {
  cursor: pointer;
  box-shadow: 0px 0px 6px 6px rgba(0, 0, 0, 20%);
}

.selected-photo {
  position: absolute;
  height: 200px;
  width: 200px;
  top: 50px;
  left: calc(50% - 100px);
  overflow: hidden;
  border-radius: 50%;
}

.default-icon {
  position: absolute;
  background-color: v-bind(colorSet.halfDeep);
  color: v-bind(colorSet.light);
}

.selected-photo-img {
  position: absolute;
  width: 204px;
  height: 204px;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
}

.selected-nickname {
  position: absolute;
  top: 270px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  user-select: none;
  color: v-bind(colorSet.fontColor3);
}

.other-members{
  position:absolute;
  top: 400px;
  height: 0px;
  width: 100%;
  overflow-y: scroll;
  animation-duration: 1s;
  animation-fill-mode:both;
}
.other-members::-webkit-scrollbar{
  display: none;
}
.member-line{
  position: relative;
  height: 32px;
  width: calc(100% - 20px);
  top: 0px;
  left: 10px;
  padding: 16px 0px 16px 0px;
}
.line-photo{
  position: absolute;
  height: 32px;
  width: 32px;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  border-radius: 50%;
  overflow: hidden;
}
.line-photo > .default-icon{
  position: absolute;
  height: 32px;
  width: 32px;
}
.line-photo > .line-photo-img{
  position: absolute;
  height: 32px;
  width: 32px;
}

.member-line > .member-nickname{
  position: absolute;
  left: 50px;
  top: 50%;
  transform: translateY(-50%);
  user-select: none;
  color: v-bind(colorSet.fontColor4);
}

.member-line:hover{
  cursor: pointer;
  background-color: v-bind(colorSet.deep);
}
.other-members-show{
  animation-name: other-member-list-show;
}
.other-members-hide{
  animation-name: other-member-list-hide;
}
@keyframes other-member-list-show{
  0%{
    height: 0px;
  }
  100%{
    height: calc(100% - 400px);
  }
}
@keyframes other-member-list-hide{
  0%{
    height: calc(100% - 400px);
  }
  100%{
    height: 0px;
  }
}

</style>