<template>
  <div :class="{
    'components-root': true,
    'editor-to-tight': (!outLineFirstLoaded) && (showOutline),
    'editor-to-wide': (!outLineFirstLoaded) && (!showOutline)
  }">
  <n-spin class="uploading-mask" v-show="uploading"></n-spin>
    <VueEditor id="milkdown-root" :editor="editor" />
    <div class="side-icon-bar" :style="{ backgroundColor: customComponentThemeProvider.colorSet.halfDeep }">
      <n-icon :color="colorSet.fontColor2" size="24" class="icon bar-controller" @click="showSideBar = !showSideBar">
        <ChevronDown48Regular />
      </n-icon>
      <div :class="{
        'side-icon-container': true,
        'show-bar': (!sideBarFirstLoaded) && (showSideBar),
        'hide-bar': (!sideBarFirstLoaded) && (!showSideBar)
      }">
        <n-icon :color="colorSet.fontColor2" size="24" class="icon" @click="showOutline = !showOutline">
          <TextBulletListTree16Regular />
        </n-icon>
        <n-icon :color="colorSet.fontColor2" size="24" class="icon" @click="fullScreenStatus = !fullScreenStatus">
          <FullScreenMaximize24Regular v-show="!fullScreenStatus" />
          <FullScreenMinimize24Regular v-show="fullScreenStatus" />
        </n-icon>
        <div v-show=!readOnly>
          <n-icon :color="colorSet.fontColor2" size="24" class="icon" @click="showPictureSelectModal = true">
            <n-tooltip trigger="hover" placement="left-start">
              <template #trigger>
                <PictureOutlined />
              </template>
              上传图片
            </n-tooltip>
          </n-icon>
          <n-icon :color="colorSet.fontColor2" size="24" class="icon" @click="uploadDoc(false)">
            <n-tooltip trigger="hover" placement="left-start">
              <template #trigger>
                <CloudUploadOutlined />
              </template>
              {{ iconNotification('uploadDoc') }}
            </n-tooltip>
          </n-icon>
          <n-icon :color="colorSet.fontColor2" size="24" class="icon" @click="uploadDoc(true)"
            v-show="router.currentRoute.value.name !== 'editDoc'">
            <n-tooltip trigger="hover" placement="left-start">
              <template #trigger>
                <Save16Regular />
              </template>
              {{ iconNotification('uploadDraft') }}
            </n-tooltip>
          </n-icon>
        </div>
      </div>
    </div>
    <n-modal v-model:show="showPictureSelectModal" display-directive="show">
      <PictureUpload :extend-actions="imageActions"
        style="position: absolute;top:50%;left:50%;transform: translate(-50%,-50%)" />
    </n-modal>
    <DocOutline :outline="docOutlines" :outline-show="showOutline" />
  </div>
</template>
<script lang="ts">

export default {
  name: 'Milkdown',
}
/*export default defineComponent({
  name: "Milkdown",
});*/

</script>

<script setup lang="ts">
import { defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx, editorCtx } from '@milkdown/core';
import { clipboard } from '@milkdown/plugin-clipboard';
import { cursor } from '@milkdown/plugin-cursor';
import { diagram } from '@milkdown/plugin-diagram';
import { emoji } from '@milkdown/plugin-emoji';
import { history } from '@milkdown/plugin-history';
import { indent } from '@milkdown/plugin-indent';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { math } from '@milkdown/plugin-math';
import { menu } from '@milkdown/plugin-menu';
import { prism } from '@milkdown/plugin-prism';
import { slash } from '@milkdown/plugin-slash';
import { tooltip } from '@milkdown/plugin-tooltip';
import { upload } from '@milkdown/plugin-upload';
import { gfm } from '@milkdown/preset-gfm';
import { nordDark, nordLight } from '@milkdown/theme-nord';
import { insert, replaceAll, forceUpdate, switchTheme, outline } from '@milkdown/utils';
import { VueEditor, useEditor } from "@milkdown/vue";
import { defineComponent, defineProps, ref, Ref, onMounted, watch, computed } from "vue";
import { CloudUploadOutlined, PictureOutlined } from "@vicons/antd";
import { ChevronDown48Regular, TextBulletListTree16Regular, FullScreenMaximize24Regular, FullScreenMinimize24Regular, Save16Regular } from '@vicons/fluent'
import { NIcon, NEllipsis, NDialogProvider, useDialog, useNotification, NModal, NCard, NTooltip, NSpin } from "naive-ui";
import axios from 'axios';
import { AxiosRequestConfig } from 'axios'
import { DocApi, TagApi } from '../api-define'
import { vue } from '../main'
import { useRoute, useRouter, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { loginStatus, fullScreenStatus } from '../globalStatus'
import PictureUpload from './PictureUpload.vue'
import { ImageAction } from '../model/models'
import { blankTransport } from '../tooles'
import { customComponentThemeProvider,getOpacityColor } from '../theme'
import DocOutline from './sub/DocOutline.vue'

/**
 * {
 *   readOnly: Boolean, 只读
 *   preload: Boolean, 预加载内容，开启这项，该组件会尝试从 props.docId 和 URL 中获取文档ID,并获取相关的文档内容填充在编辑器内
 *   docId:String, 开启preload时，组件会优先从这里读取文档ID,若没有获取到则会去 URL 中读取
 * }
 */
const props = defineProps({
  readOnly: Boolean,
  preload: Boolean,
  docId: String,
})

/**
 * 对话框、通知工具
 */
const dialog = useDialog();
const notification = useNotification();

/**
 * 路由信息
 */
const route = useRoute();
const router = useRouter();

/**
 * 编辑器内的内容会同步到这个对象里
 */
const content = ref('');
const title = ref('');
const tags: Ref<string[]> = ref([]);
let titleOriginal: string = '';
let tagsOriginal: string[] = [];

//window.markdownContent = content;

//方便语义化
const editable = () => !props.readOnly;

/**
 * markdown编辑器的ref对象
 */
const editorRef: Ref<Editor | null> = ref(null);
/**
 * 创建编辑器
 */
const { editor } = useEditor((root) =>
  Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root);
      //监听文档内容更改
      ctx.get(listenerCtx)
        .mounted((ctx) => {
          //获取并绑定编辑器对象
          editorRef.value = ctx.get(editorCtx);
          loadDoc(ctx.get(editorCtx));
          loginStatus.registerAction(() => loadDoc(ctx.get(editorCtx)));
        })
        .markdownUpdated((ctx, markdown, prevMarkdown) => {
          refreshOutline();
          content.value = markdown;
        });
      //设置只读
      ctx.set(editorViewOptionsCtx, { editable });
      //设置默认值
      ctx.set(defaultValueCtx, '');
    })
    //.use(nordDark)
    .use(customComponentThemeProvider.value.editorTheme)
    .use(gfm)
    .use(listener)
    .use(clipboard)
    .use(history)
    .use(cursor)
    .use(prism)
    .use(diagram)
    .use(tooltip)
    .use(math)
    .use(emoji)
    .use(indent)
    .use(upload)
    .use(slash)
    .use(menu)
  ,)

//尝试获取url中的docId
const docIdInPath = useRoute().params.docId;

function getDocId(): string {
  if (props.docId === undefined) {
    return <string>docIdInPath;
  }
  return props.docId;
}

const docName: Ref<string> = ref('文档');

/**
 * 加载文档内容到编辑器内
 * @param editor
 */
function loadDoc(editor: Editor) {
  if (props.preload) {
    //加载文档内容
    axios.request(DocApi.getDocContent(getDocId())).then((response) => {
      if (response.data.code === '00000') {
        editor.action(replaceAll(response.data.data));
        //editor.action(insert(''))
        loadMetadata(response.data.data);
        refreshOutline();
        titleOriginal = title.value;
        tagsOriginal = tags.value;
        return
      }
      if (response.data.code !== 'A0200') {
        notification.create({
          content: response.data.message,
          duration: 3000
        })
      }
    }).catch()
  }
}

/**
 * 从文档内容解析标题和标签
 * @param content 文档内容。首行默认作为标签行，第二行默认作为标题行；若首行以'# '开头，则视为标题行。
 */
function loadMetadata(content: string) {
  title.value = '';//清空标题
  tags.value = [];//清空tag数组
  if (content.length === 0) {
    return;
  }
  let lineArray: string[] = content.split('\n');
  //处理空行
  const emptyLineRegex: RegExp = /^\s*$/
  let target: string[] = [];
  for (let i in lineArray) {
    if (lineArray[i].length > 0 && (!emptyLineRegex.test(lineArray[i]))) {
      target.push(lineArray[i])
    }
    if (target.length === 2) {
      break;//只取两行
    }
  }

  const firstLine: string = blankTransport(target[0]);

  //首行就是标题的情况
  if (firstLine.startsWith('# ')) {
    title.value = firstLine.substring(2);
    return;
  }
  //首行不是标题，尝试获取tags
  let tagsArray = firstLine.split(' ');
  for (let i in tagsArray) {
    //有的时候编辑器会自动加上\
    if (tagsArray[i].startsWith('\\#') && tagsArray[i].length > 2) {
      tags.value.push(tagsArray[i].substring(2, 21));
      continue;
    }
    if (tagsArray[i].startsWith('#') && tagsArray[i].length > 1) {
      tags.value.push(tagsArray[i].substring(1, 20));
    }
  }
  //尝试从第二行获取标题
  if (target.length >= 2 && target[1].startsWith('# ')) {
    title.value = blankTransport(target[1].substring(2));
  }
}

/**
 * 根据情况切换不同的api
 */
function getUploadAPI(isDraft: boolean): AxiosRequestConfig[] {
  const result: AxiosRequestConfig[] = [];
  //新增文档
  if (router.currentRoute.value.name === 'newDoc' && !isDraft) {
    if (tags.value.length === 0) {
      result.push(DocApi.newDoc(title.value, content.value));
    } else {
      result.push(DocApi.newDocWithTags(title.value, content.value, tags.value))
    }
    return result;
  }
  //新增草稿
  if (router.currentRoute.value.name === 'newDoc' && isDraft) {
    result.push(DocApi.saveDocAsDraft(title.value, content.value));
    return result;
  }
  //修改文档
  if (router.currentRoute.value.name === 'editDoc' && !isDraft) {
    const docId = getDocId();
    result.push(DocApi.changeDocName(title.value, docId));
    result.push(DocApi.modifyDoc(docId, content.value));
    if (tags.value.length === 0) {
      result.push(TagApi.deleteDocMap(docId));
    } else {
      result.push(TagApi.setMap(docId, tags.value));
    }
    return result;
  }
  if (router.currentRoute.value.name === 'editDoc' && isDraft) {
    notification.create({
      title: '错误',
      duration: 2500,
      content: '已发布的文档不能作为草稿保存',
      closable: false
    })
    return result;
  }
  //修改草稿
  if (router.currentRoute.value.name === 'editDraft' && isDraft) {
    const docId = getDocId();
    result.push(DocApi.changeDocName(title.value, docId));
    result.push(DocApi.modifyDoc(docId, content.value));
    return result;
  }
  //发布草稿
  if (router.currentRoute.value.name === 'editDraft' && !isDraft) {
    const docId = getDocId();
    result.push(DocApi.changeDocName(title.value, docId));
    result.push(DocApi.modifyDoc(docId, content.value));
    result.push(DocApi.submitDraft(docId, tags.value));
    return result;
  }
  return result;
}

//文档提交监控
let apiFailedCount = 0;
const apiCount: Ref<number> = ref(0);
let failedMessage = ''
watch(apiCount, async (newCount, oldCount) => {
  if (newCount === 0) {
    if (apiFailedCount === 0) {
      notification.create({
        title: '成功',
        duration: 2500,
        closable: false
      })
      return;
    }
    notification.create({
      title: '操作失败',
      duration: 2500,
      content: failedMessage,
      closable: false
    })
    return;
  }
})

const uploading: Ref<boolean> = ref(false);

/**
 * 上传文档
 */
async function uploadDoc(isDraft: boolean = false) {
  uploading.value = true;
  loadMetadata(content.value);
  //判断是否可提交
  if (title.value === '') {
    dialog.warning({
      title: '警告',
      content: '文档缺少标题，提交失败',
      positiveText: '确定'
    })
    uploading.value = false;
    return;
  }
  //上传
  const apis: AxiosRequestConfig[] = getUploadAPI(isDraft);
  if (apis.length === 0) {
    uploading.value = false;
    return;
  }
  failedMessage = '';
  apiCount.value = apis.length;//重置
  apiFailedCount = 0;//重置清零
  for (let i in apis) {
    //   axios.request(apis[i]).then(
    //       (response) => {
    //         if (response.data.code !== '00000') {
    //           console.log(response.data);
    //           if (failedMessage === '') {
    //             failedMessage = response.data.message;
    //           }
    //           apiFailedCount++;
    //         }
    //         if (response.data.code === 'A0200') {
    //           //loginStatus.loginFailed();
    //         }
    //         apiCount.value--;
    //       }
    //   ).catch(
    //       (response) => {
    //         console.log(response.data)
    //         apiFailedCount++;
    //         apiCount.value--;
    //         if (failedMessage === '' && response.data !== undefined && response.data.message !== undefined) {
    //           failedMessage = response.data.message;
    //         }
    //       }
    //   )
    // }
    try {
      const response = await axios.request(apis[i]);
      if (response.data.code !== '00000') {
        failedMessage = response.data.message;
        apiFailedCount++;
        apiCount.value = 0;
        uploading.value = false;
        return;
      }
      apiCount.value--;
    } catch (err) {
      failedMessage = '请求异常，请联系系统管理员';
      apiFailedCount++;
      apiCount.value = 0;
      uploading.value = false;
      return;
    }
  }
  uploading.value = false;
  router.push({ name: 'myDoc' });
}

const showPictureSelectModal: Ref<boolean> = ref(false);
const imageActions: ImageAction[] = [
  {
    title: '插入图标到光标处',
    action: (url: string): void => {
      editorRef.value?.action(insert('![](' + url + ')'));
    }
  }
]

//登录时清空编辑器的内容
loginStatus.registerAction(() => {
  editorRef.value?.action(replaceAll(''));
}, true)

watch(customComponentThemeProvider, (newV, oldV) => {
  editorRef.value?.action(switchTheme(newV.editorTheme))
})

const colorSet = computed<any>(() => {
  return customComponentThemeProvider.value.colorSet;
})

//侧边栏按钮区控制
const showSideBar: Ref<boolean> = ref(false);
const sideBarFirstLoaded: Ref<boolean> = ref(true);
watch(showSideBar, async (newV, oldV) => {
  sideBarFirstLoaded.value = false;
})

//大纲控制
const showOutline: Ref<boolean> = ref(false);
const outLineFirstLoaded: Ref<boolean> = ref(true);
watch(showOutline, async (newV, oldV) => {
  outLineFirstLoaded.value = false;
})
const docOutlines: Ref<any> = ref([]);
function refreshOutline() {
  docOutlines.value = editorRef.value?.action(outline());
}

//按钮提示内容控制
function iconNotification(iconName: string): string {
  if (router.currentRoute.value.name === 'newDoc' && iconName === 'uploadDoc') {
    return '上传文档'
  };
  if (router.currentRoute.value.name === 'newDoc' && iconName === 'uploadDraft') {
    return '保存文档为草稿'
  };
  if (router.currentRoute.value.name === 'editDoc' && iconName === 'uploadDoc') {
    return '更新文档'
  };
  if (router.currentRoute.value.name === 'editDoc' && iconName === 'uploadDraft') {
    return '不支持的操作'
  };
  if (router.currentRoute.value.name === 'editDraft' && iconName === 'uploadDoc') {
    return '发布草稿'
  };
  if (router.currentRoute.value.name === 'editDraft' && iconName === 'uploadDraft') {
    return '保存草稿'
  };
  return '错误';
}

//离开编辑器后自动退出编辑器全屏
onBeforeRouteLeave((to, from) => {
  fullScreenStatus.value = false;
});

</script>
<style scoped>
.components-root {
  position: absolute;
  width: 90%;
  left: 80px;
  height: 100%;
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

.editor-to-tight {
  animation-name: editor-to-tight;
}

.editor-to-wide {
  animation-name: editor-to-wide;
}

@keyframes editor-to-tight {
  0% {
    width: 90%
  }

  100% {
    width: calc(90% - 200px)
  }
}

@keyframes editor-to-wide {
  0% {
    width: calc(90% - 200px)
  }

  100% {
    width: 90%
  }
}

#milkdown-root {
  height: 100%;
}

:deep(.milkdown-menu-wrapper) {
  width: calc(100% - 32px);
  height: 100%;
}

:deep(.milkdown-menu-wrapper .milkdown) {
  height: calc(100% - 56px);
  overflow-y: scroll;
}

:deep(.milkdown-menu-wrapper .milkdown::-webkit-scrollbar) {
  display: none;
}

#milkdown-root> :deep(.milkdown) {
  height: 100%;
  overflow-y: scroll;
}

#milkdown-root> :deep(.milkdown::-webkit-scrollbar) {
  display: none;
}

.side-icon-bar {
  position: absolute;
  width: 52px;
  right: 0px;
  top: 0px;
  display: flex;
  flex-flow: column;
  height: 100%;
}

.bar-controller {
  position: absolute;
  top: 15px;
  right: 15px;
  transform-origin: center;
  transform: v-bind(showSideBar ? 'rotate(180deg)': 'rotate(0deg)');
}

.bar-controller:hover {
  cursor: pointer;
}

.side-icon-container {
  position: absolute;
  top: 54px;
  width: 100%;
  height: 0px;
  animation-fill-mode: both;
  animation-duration: 0.5s;
  overflow: hidden;
}

.show-bar {
  animation-name: bar-container-show;
}

.hide-bar {
  animation-name: bar-container-hide;
}

@keyframes bar-container-show {
  0% {
    height: 0px;
  }

  100% {
    height: 270px;
  }
}

@keyframes bar-container-hide {
  0% {
    height: 270px;
  }

  100% {
    height: 0px;
  }
}

.side-icon-container .icon {
  margin: 15px 15px 15px 15px;
}

.icon :focus {
  outline-width: 0px;
}

.side-icon-container .icon:hover {
  cursor: pointer;
}

.uploading-mask{
  position:absolute;
  height: 100%;
  width: 100%;
  z-index: 1;
  background-color:v-bind(getOpacityColor(colorSet.deep,0.7));
}
</style>