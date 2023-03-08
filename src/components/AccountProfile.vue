<template>
  <div id="component-root">
    <div class="photo-area">
      <div class="photo-div" @click="photoUpload()">
        <n-icon class="default-photo" size="200" v-show="!photoAvailable">
          <UserOutlined />
        </n-icon>
        <img class="account-photo" :src="photoUrl" v-show="photoAvailable"/>
      </div>
    </div>
    <div class="data-area">
      <div class="data-line">
      <span class="item-name">用户名：</span><span class="item-value">{{loginStatus.standardProfile.name}}</span>
    </div>
    <div class="data-line">
      <span class="item-name">昵称：</span>
      <div id="nickname" >
        <n-input :status="nicknameCheck?'error':'success'" v-model:value="nickname" size="large" placeholder=""
        @keydown.enter="changeNickname"
        @blur="changeNickname"/>
      </div>
    </div>
    <div class="data-line">
      <span class="item-name">创建时间：</span><span class="item-value">{{loginStatus.standardProfile.createTime}}</span>
    </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "AccountProfile"
}
</script>

<script setup lang="ts">
import {loginStatus} from '../globalStatus'
import {NInput,useNotification,NIcon} from 'naive-ui'
import {ref,Ref,onMounted,computed,watch} from 'vue'
import {UserApi,PictureApi,UrlConstructor} from '../api-define'
import axios from 'axios'
import {customComponentThemeProvider} from "../theme";
import {UserOutlined} from '@vicons/antd'

const notification = useNotification();

const nickname:Ref<string> = ref('');
nickname.value = loginStatus.standardProfile.nickname;

const nicknameCheck = computed<boolean>(()=>{
  return (/\s/.test(nickname.value)||nickname.value.length<2||nickname.value.length>16);
})

function changeNickname(){
  const target = nickname.value;
  if(nicknameCheck.value){
    notification.create({
      title:'失败',
      content:'昵称中不能有空白字符且长度在 2-16 之间',
      duration:3000
    })
    return;
  }
  axios.request(UserApi.changeNickname(target)).then((response)=>{
    if(response.data.code==='00000'){
      loginStatus.standardProfile.nickname=target;
      notification.create({
        title:'成功',
        duration:2500
      })
      return;
    }
    notification.create({
      title:'失败',
      content:response.data.code + ': '+ response.data.message,
      duration:3000
    })
  }).catch((response)=>console.log(response));
}

const photoAvailable:Ref<boolean> = ref(false);
const photoUrl:Ref<string> = ref('');
function photoUpload(){
  const fileSelect = document.createElement('input');
  fileSelect.type = 'file';
  fileSelect.multiple=false;
  fileSelect.onchange=function (e:any){
    const fileArr:Array<Blob> = e.target.files;
    const form = new FormData();
    form.append('photo',fileArr[0]);
    axios.request(PictureApi.upoloadUserPhoto(form)).then((response)=> {
      if(response.data.code === '00000'){
        loadPhoto();
      }
    }).catch((response)=>console.log(response.data));
  }
  fileSelect.click();
}
function loadPhoto(){
  const username = loginStatus.standardProfile.name;
  let photoLocation = '';
  axios.request(UserApi.listUserPhotos([username])).then(response => {
    photoAvailable.value = false;
    if(response.data.code === '00000'){
      photoLocation = response.data.data[username];
    }
    if(photoLocation!== undefined && photoLocation !== ''){
      photoUrl.value = UrlConstructor.pictureUrl(photoLocation);
      photoAvailable.value = true;
    }
  })
}
watch(loginStatus.standardProfile,()=>{
  loadPhoto();
  nickname.value = loginStatus.standardProfile.nickname;
})
onMounted(()=>{
  loadPhoto();
})

///////////////////////
//样式部分
const colorSet = computed(()=>{
  return customComponentThemeProvider.value.colorSet;
})
</script>

<style scoped>
#component-root{
  position: absolute;
  width: 100%;
  height: 500px;
  overflow-x:hidden;
  overflow-y: scroll;
  left: 50%;
  transform: translateX(-50%);
  background-color: v-bind(colorSet.deep);
  border-radius: 10px;
}
#component-root::-webkit-scrollbar{
  display: none;
}
.photo-area{
  position: absolute;
  height: 100%;
  width: 40%;
  left: 0px;
}
.photo-div{
  height: 200px;
  width: 200px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  border-radius: 50%;
  overflow: hidden;
  background-color: v-bind(colorSet.deep);
}
.photo-div:hover{
  cursor: pointer;
}
.default-photo,.account-photo{
  position:absolute;
  height: calc(100% + 4px);
  width: calc(100% + 4px);
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  color: v-bind(colorSet.light);
}

.data-area{
  position: absolute;
  width: 50%;
  left: 40%;
  top: 50%;
  transform: translateY(-50%);
  background-color: v-bind(colorSet.halfDeep);
  border-radius:10px;
}
.data-line{
  margin:20px;
  position: relative;
  left: 0px;
  height: 40px;
  color: v-bind(colorSet.fontColor2);
}
.data-line .item-name{
  line-height: 100%;
  height: 100%;
  font-size: 24px;
  min-width: 200px;
  display: inline-block;
}
.data-line .item-value{
  line-height: 100%;
  height: 100%;
  font-size: 24px;
}
#nickname{
  height: 100%;
  top:0px;
  position: absolute;
  display: inline-block;
}

</style>