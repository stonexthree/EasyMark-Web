import {createApp, render} from 'vue'
//import './style.css'
import App from './App.vue'
import {createRouter, createWebHistory} from "vue-router";
import Index from "./components/Index.vue"
import DocList from "./components/DocList.vue";
import Milkdown from "./components/Milkdown.vue";
import MemberDoc from "./components/MemberDoc.vue";
import MyDoc from "./components/MyDoc.vue";
import MyDrafts from './components/MyDrafts.vue';
import Test from "./components/Test.vue";
import ShowDoc from './components/ShowDoc.vue'
import AccountManagement from './components/AccountManagement.vue'
import AccountProfile from './components/AccountProfile.vue'
import {searchStatus,loginStatus} from './globalStatus'
import axios from 'axios'
import {DocApi} from './api-define'
import { ThemeStatus } from './theme';

//控制缩放
function bodyScale() {
    const deviceWidth = document.documentElement.clientWidth;
    const scale =  (1440 *0.8)/deviceWidth;
    (<any>document.body.style).zoom = scale;
}
window.onload = window.onresize = function () {
    bodyScale();
};
//axios 全局异常处理
axios.interceptors.response.use(function (response) {
    if(response.data.code === 'A0200'){
        loginStatus.loginFailed();
    }
    return response;
}, function (error) {
    console.log(error);
    return Promise.reject(error);
});
//路由配置
const webRoute = [
    {
        name: 'index',
        path: '/index',
        component: Index
    },
    {
        name: 'docs',
        path: "/docs", component: MemberDoc, props: {
            widthPercent: 90
        }
    },
    {
        name: 'myDoc',
        path: "/my-doc", component: MyDoc, props: {
            loading: false,
            widthPercent: 90
        }
    },
    {
        name: 'myDraft',
        path: "/my-draft", component: MyDrafts, props: {
            loading: false,
            widthPercent: 90
        }
    },
    {
        name: 'myCollection',
        path: "/my-collection", component: DocList,
        props(){
            return {
                docsApiConfig:DocApi.listMyCollections(),
                loading: false,
                widthPercent: 90
            }
        }
    },
    {
        name:'newDoc',
        path: "/new-doc", component: Milkdown
    },
    {
        name:'showDoc',
        path: '/doc/:docId', component: ShowDoc, props: {
            readOnly: true,
        }
    },
    {
        name: 'editDoc',
        path: '/edit-doc/:docId', component: Milkdown, props: {
            preload: true,
        }
    },
    {
        name: 'editDraft',
        path: '/edit-draft/:docId', component: Milkdown, props: {
            preload: true,
        }
    },
    {
        name: 'searchResult',
        path: "/result", component: DocList,
        props(){
            return {
                docsApiConfig:searchStatus.value.searchApi,
                loading: false,
                widthPercent: 90
            }
        }
    },
    {
        name: 'accountManagement',
        path: '/account-management',
        component: AccountManagement
    },
    // {
    //     name:'accountProfile',
    //     path:'/profile',
    //     component: AccountProfile
    // }
    // ,
    {
        name: 'test',
        path: '/test',component: Test
    }
]
const router = createRouter({
    history: createWebHistory(),
    routes: webRoute
})
router.beforeEach(async (to,from)=>{
    if(to.fullPath === '/' || to.fullPath === ''){
        return {name: 'index'}
    }
})

const vue = createApp(App);
vue.use(router).mount('#app');
export {vue,webRoute};

//默认主题跟随系统
const themeMedia = window.matchMedia("(prefers-color-scheme: light)");
if(themeMedia.matches){
    ThemeStatus.value.change('NordSnowStorm');
}else{
    ThemeStatus.value.change('NordPolarNight');
}
//系统主题切换时跟随变化
themeMedia.addEventListener( "change",e => {
    if(themeMedia.matches){
        ThemeStatus.value.change('NordSnowStorm');
    }else{
        ThemeStatus.value.change('NordPolarNight');
    }
} )
