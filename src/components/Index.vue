<template>
    <div class="component-root">
        <div id="view-charts">
            <div class="charts-header">
                <n-icon>
                    <FireOutlined />
                </n-icon>
                热门文档
            </div>
            <div id="view-charts-content">
                <div v-for="(doc, index) in docViewCharts" class="doc-info-card" @click="router.push({name:'showDoc',params:{docId:doc.location}})">
                    <div class="list-rank" :style="{ color: rankColor(index + 1) }">
                        <n-icon class="trophy" size="20" v-show="index < 3">
                            <MdTrophy />
                        </n-icon>
                        {{ 'No.' + (index + 1) }}
                    </div>
                    <div class="main-info">
                        <div class="doc-name">{{ doc.docName }}</div>
                        <div class="doc-tags">
                            <!-- <div class="tag" v-for="tag in doc.labels">
                                <n-icon>
                                    <Tag20Regular />
                                </n-icon>
                                {{ tag }}
                            </div> -->
                        </div>
                    </div>
                    <div class="photo-area">
                        <n-image class="photo" :src="doc.docAuthorPhotoUrl" width="40" height="40" preview-disabled/>
                        <div class="author-nickname">{{ doc.docAuthorNickname }}</div>
                    </div>
                    <div class="views">{{ '浏览量：' + doc.views }}</div>
                </div>
            </div>
        </div>
        <div id="total-count">
            <div class="charts-header">
                <n-icon size="20">
                    <StorageRound />
                </n-icon>
                文档总数
            </div>
            <div id="count-content">
                <n-icon size="80" id="file-icon">
                    <File />
                </n-icon>
                <div id="file-count">
                    <n-number-animation ref="numberAnimationInstRef" :from="0" :to=docCounts />
                </div>
            </div>
        </div>
        <div id="other-charts">
            <div>
                <n-tabs type="line" size="large" :tabs-padding="20" pane-style="">
                    <n-tab-pane name="文档编写排行">
                        <div class="common-charts-content">
                            <div class="author-info" v-for="(author, index) in authorCharts">
                                <div class="author-rank">{{  index+1 }}</div>
                                <div class="author-photo">
                                    <n-image class="photo" :src="author.authorPhotoUrl" width="40" height="40" preview-disabled/>
                                </div>
                                <div class="author-nickname">{{ author.authorNickname }}</div>
                                    <!-- <n-icon size="24" class="file-display-icon">
                                        <File />
                                    </n-icon> -->
                                <div class="author-doc-counts">
                                    {{'文档数：' +  author.docCounts }}
                                </div>
                            </div>
                        </div>
                    </n-tab-pane>
                    <n-tab-pane name="标签使用排行">
                        <div class="common-charts-content">
                            <div class="tag-line" v-for="tag in tagUsedCharts">
                                <n-icon size="24" class="tag-icon">
                                <Tag20Regular />
                            </n-icon>
                            <div class="tag-name">
                                {{ tag.tagName}}
                            </div>
                            <div class="tag-used-counts">
                                {{ '标签使用量：'+tag.usedCounts }}
                            </div>
                            </div>

                        </div>
                    </n-tab-pane>
                </n-tabs>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'Index'
}
</script>

<script setup lang="ts">
import { customComponentThemeProvider } from '../theme'
import { ref, Ref, computed,onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { FireOutlined } from '@vicons/antd'
import { Tag20Regular } from '@vicons/fluent'
import { MdTrophy } from '@vicons/ionicons4'
import { File } from '@vicons/tabler'
import { FileStorage } from '@vicons/carbon'
import { StorageRound } from '@vicons/material'
import { NIcon, NImage, NNumberAnimation, NumberAnimationInst, NTabs, NTabPane } from 'naive-ui'
import { UrlConstructor,StatisticsApi,UserApi,DocApi } from '../api-define'
import axios from 'axios'
import {loginStatus} from '../globalStatus'

const router = useRouter();

const colorSet = computed(() => {
    return customComponentThemeProvider.value.colorSet;
})

interface DocInfo {
    docId: string,
    docName: string,
    docAuthor: string,
    docAuthorNickname: string,
    docAuthorPhotoUrl: string,
    views: string,
    location: string
}
interface authorInfo {
    authorName: string,
    authorNickname: string,
    authorPhotoUrl: string,
    docCounts: number
}
interface tagInfo{
    tagName: string,
    usedCounts: number
}
function mockViewCharts(): DocInfo[] {
    const arr: DocInfo[] = [];
    for (let i = 1; i < 11; i++) {
        arr.push({
            docId: i + '',
            docName: 'Doc' + i,
            docAuthor: 'user' + i,
            docAuthorNickname: '用户' + i,
            docAuthorPhotoUrl: UrlConstructor.pictureUrl('default.png'),
            views: (11 - i) * (11 - i) + '',
            location: ''
        })
    };
    return arr;
}
function mockedAuthorCharts(): authorInfo[] {
    const result: authorInfo[] = [];
    for (let i = 0; i < 10; i++) {
        result.push({
            authorName: 'author' + (i + 1),
            authorNickname: '作者' + (i + 1),
            authorPhotoUrl: UrlConstructor.pictureUrl('1.png'),
            docCounts: 11 - i
        })
    }
    return result;
}
function mockTagCharts():tagInfo[]{
    const result:tagInfo[] = [];
    for(let i=0;i<10;i++){
        result.push({
            tagName: '标签'+(i+1),
            usedCounts: (10-i)*(10-i)
        })
    }
    return result;
}
const mockedVC: DocInfo[] = mockViewCharts();
const mockedAC: authorInfo[] = mockedAuthorCharts();
const mockedTC:tagInfo[] = mockTagCharts();

const docCounts: Ref<number> = ref(0);
function loadDocCounts(){
    axios(StatisticsApi.getDocCounts()).then(response => {
        docCounts.value = response.data.data;
    }).catch();
}
const docViewCharts: Ref<DocInfo[]> = ref([]);
const authorCharts: Ref<authorInfo[]> = ref([]);
const tagUsedCharts: Ref<tagInfo[]> = ref([]);
function loadTagUsedCharts(){
    axios(StatisticsApi.getTop10Charts('label',false)).then((response)=>{
        //const docIds:Object[] = response.data.data;
        const data:any[] = response.data.data;
        for(let obj in data){
            let object:any = data[obj];
            for(let key in object){
                tagUsedCharts.value.push({
                    tagName: key,
                    usedCounts: object[key]});
            }
        }
    }).catch();
}
/**
 * 按照对应的顺序返回头像数组
 * @param usernames 用户名数组
 */
async function listUserPhotos(usernames:string[]):Promise<string[]>{
    const result:string[] = [];
    const response = await axios(UserApi.listUserPhotos(usernames));
    const dataObj:any = response.data.data;
        for(let index in usernames){
            let location = 'default.png';
            const username:string = usernames[index];
            if(dataObj[username] !== undefined && dataObj[username] !== ''){
                location = dataObj[username];
            }
            result.push(UrlConstructor.pictureUrl(location));
        }
    return result;
}

/**
 * 加载文档编写数排行
 */
async function loadAuthorCharts():Promise<void> {
    const response = await axios(StatisticsApi.getTop10Charts('doc-create',false));
    const responseWithNickname = await axios(StatisticsApi.getTop10Charts('doc-create',true));
    const chartsData = response.data.data;
    const usernames:string[] = [];
    for(let index in chartsData){
        const username:string = Object.keys(chartsData[index])[0];
        usernames.push(username);
    }
    const photos:string[] = await listUserPhotos(usernames);
    const nicknameData = responseWithNickname.data.data;
    const nicknames:string[] = [];
    for(let index in nicknameData){
        const nickname:string = Object.keys(nicknameData[index])[0];
        nicknames.push(nickname);
    }
    authorCharts.value = [];
    for(let index in usernames){
        authorCharts.value.push({
            authorName: usernames[index],
            authorNickname: nicknames[index],
            authorPhotoUrl: photos[index],
            docCounts:<number> Object.values(chartsData[index])[0]
        })
    }
}

async function loadViewCharts():Promise<void>{
    const response = await axios(StatisticsApi.getTop10Charts('doc-view',false));
    const chartsData = response.data.data;
    const docIds:string[] = [];
    for(let index in chartsData){
        docIds.push(Object.keys(chartsData[index])[0]);
    }
    /**构造文档信息的对象 */
    const docInfoResponse = await axios(DocApi.queryDocsById(docIds));
    const docInfoData = docInfoResponse.data.data;
    const docInfoObject:any = {};
    for(let index in docInfoData){
        const info:any = docInfoData[index];
        const id:string = info['docId'];
        docInfoObject[id] = info;
    }
    
    const authors:string[] = [];
    const result:DocInfo[] = [];
    /**构造不包含头像信息的响应结果 */
    for(let index in chartsData){
        const id = Object.keys(chartsData[index])[0];
        const views:string =<string> Object.values(chartsData[index])[0];
        if(docInfoObject[id] === undefined){
            console.warn('浏览量排行中有文档未能匹配到对应信息，文档id: '+ id);
            continue;
        }
        const info = docInfoObject[id];
        // 处于性能原因暂时不提供文档标签的结果，后续再优化
        result.push({
            docId: id,
            docName: info.docName,
            docAuthor: info.docAuthor,
            docAuthorNickname: info.authorNickname,
            docAuthorPhotoUrl: '',
            views: views,
            location: info.docLocation
        })
        authors.push(info.docAuthor);
    }
    const photos:string[] = await listUserPhotos(authors);
    //补上头像信息
    for(let index in result){
        result[index].docAuthorPhotoUrl = photos[index];
    }
    docViewCharts.value = result;
}

function loadAll():void{
    loadDocCounts();
    loadTagUsedCharts();
    loadAuthorCharts();
    loadViewCharts();
}

onMounted(()=>{
    loginStatus.registerAction(loadAll,false);
    loadAll();
})


function rankColor(rank: number) {
    if (rank === 1) {
        return colorSet.value.specialExtension.goldMedal;
    }
    if (rank === 2) {
        return colorSet.value.specialExtension.silverMedal;
    }
    if (rank === 3) {
        return colorSet.value.specialExtension.bronzMedal;
    }
    return "";
}
const numberAnimationInstRef = ref<NumberAnimationInst | null>(null);
numberAnimationInstRef.value?.play();
</script>

<style>
.component-root {
    position: absolute;
    top: 0px;
    width: 100%;
    min-width: 120px;
    height: calc(100%);
    overflow: scroll;
    left: 50%;
    transform: translateX(-50%);
}

#view-charts {
    position: absolute;
    top: 0px;
    left: 20px;
    width: calc(60% - 40px);
    height: calc(100% - 20px);
    border-radius: 10px;
    background-color: v-bind(colorSet.halfDeep);
    padding: 10px;
}

.charts-header {
    position: absolute;
    width: 100%;
    height: 40px;
    font-size: 20px;
    color: v-bind(colorSet.fontColor2)
}

#view-charts-content {
    position: absolute;
    width: 100%;
    height: calc(100% - 60px);
    top: 50px;
    overflow-x: scroll;
}

#view-charts-content::-webkit-scrollbar {
    display: none;
}

.doc-info-card {
    position: relative;
    width: calc(100% - 20px);
    height: 80px;
    margin-bottom: 5px;
    border-radius: 10px;
    background-color: v-bind(colorSet.deep);
    color: v-bind(colorSet.fontColor4);
    user-select: none;
}

.doc-info-card:hover {
    background-color: v-bind(colorSet.light);
}

.doc-info-card>.list-rank {
    position: absolute;
    left: 0px;
    width: 100px;
    text-align: center;
    font-size: 20px;
    font-style: italic;
    top: 50%;
    transform: translateY(-50%);
}

.doc-info-card>.main-info {
    position: absolute;
    left: 100px;
    height: 100%;
    width: calc(100% - 420px);
    white-space:nowrap;
    top: 50%;
    transform: translateY(-50%);
}

.main-info>.doc-name {
    position: absolute;
    font-size: 20px;
    overflow-x: scroll;
    word-break: keep-all;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    overflow-x: scroll;
    color: v-bind(colorSet.fontColor3);
}

.main-info>.doc-name::-webkit-scrollbar {
    display: none;
}

.main-info>.doc-tags {
    height: 20px;
    position: absolute;
    bottom: 5px;
    color: v-bind(colorSet.specialExtension.tag);
}

.tag {
    display: inline-block;
}

.doc-info-card>.photo-area {
    position: absolute;
    left: calc(100% - 320px);
    height: 100%;
    width: 200px;
}

.photo-area>.photo {
    position: absolute;
    top: 50%;
    left: 25%;
    transform: translate(-50%, -50%);
}

.photo-area>.author-nickname {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateY(-50%);
}

.doc-info-card>.views {
    position: absolute;
    left: calc(100% - 120px);
    width: 100px;
    top: 50%;
    transform: translateY(-50%);
    font-style: italic;
}

#total-count {
    position: absolute;
    top: 0px;
    right: 20px;
    width: calc(40% - 60px);
    height: 140px;
    border-radius: 10px;
    padding: 10px;
    overflow: hidden;
    background-color: v-bind(colorSet.halfDeep);
}

#count-content {
    position: absolute;
    width: calc(100% - 20px);
    height: calc(100% - 60px);
    top: 50px;
    overflow: hidden;
    border-radius: 10px;
    color: v-bind(colorSet.heightLight1);
    background-color: v-bind(colorSet.deep);
}

#file-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 20px;
}

#file-count {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 20px;
    font-size: 80px;
}

#other-charts {
    position: absolute;
    top: 170px;
    right: 20px;
    width: calc(40% - 60px);
    max-height: calc(100% - 190px);
    border-radius: 10px;
    padding: 10px;
    overflow: hidden;
    background-color: v-bind(colorSet.halfDeep);
}

.common-charts-content {
    padding: 10px;
    border-radius: 10px;
    max-height: 620px;
    overflow-y: scroll;
    background-color: v-bind(colorSet.deep);
}

.common-charts-content::-webkit-scrollbar {
    display: none;
}

.author-info {
    position: relative;
    width: 100%;
    height: 48px;
    overflow: hidden;
    margin: 6px 0px 6px 0px;
    padding: 0px 10px 0px 10px;
    user-select: none;
    color: v-bind(colorSet.fontColor2);
}

.author-info>.author-rank {
    position: absolute;
    height: 48px;
    width: 48px;
    line-height: 48px;
    font-size: 16px;
    font-style: italic;
}

.author-info>.author-photo {
    position: absolute;
    width: 48px;
    left: 80px;
    top: 50%;
    transform: translateY(-50%);
}

.author-info>.author-nickname {
    position: absolute;
    left: 160px;
    top: 50%;
    transform: translateY(-50%);
    width: 160px;
    font-size: 20px;
    color: v-bind(colorSet.fontColor3);
}
.author-info>.file-display-icon{
    position: absolute;
    height: 40px;
    top: 50%;
    right: 120px;
    transform: translateY(-50%);
    color: v-bind(colorSet.fontColor4);
}
.author-info>.author-doc-counts{
    position: absolute;
    height: 100%;
    line-height: 48px;
    right: 60px;
    font-size: 12px;
    font-style: italic;
    color: v-bind(colorSet.fontColor4);
}
.common-charts-content>.tag-line{
    position: relative;
    height: 32px;
    margin: 4px 0px 4px 0px;
    padding: 0px 10px 0px 10px;
    color: v-bind(colorSet.specialExtension.tag);
}
.tag-line>.tag-icon{
    position: absolute;
    left: 20px;
}
.tag-line>.tag-name{
    position: absolute;
    left: 60px;
    width: 120px;
    overflow: hidden;
}
.tag-line>.tag-used-counts{
    position: absolute;
    left: 300px;
    width: 140px;
    font-style: italic;
    font-size: 0.6em;
    overflow: hidden;
    color: v-bind(colorSet.fontColor4);
}

</style>