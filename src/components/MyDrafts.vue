<template>
  <DocList :result-editable="true" :docs-api-config="docApiConfig" :loading="loading" :click-row="clickRow" :width-percent="widthPercent" />
</template>

<script lang="ts">
import DocList from "./DocList.vue";
export default {
  name: "MyDrafts",
  components: {DocList}
}
</script>
<script setup lang="ts" >
import {onMounted,Ref,ref} from 'vue';
import {DocInfo} from "../model/models";
import axios from "axios";
import {DocApi} from "../api-define";
import {loginStatus} from "../globalStatus";
import {useRouter} from 'vue-router';

defineProps({
  docs: Array,
  loading: Boolean,
  actionEnabled: Boolean,
  widthPercent: Number,
  showEditIcon: Boolean
})

const docApiConfig = ref<Object>(DocApi.getMyDrafts());
const router = useRouter();

function clickRow(docId:string):void{
  router.push({name:'editDraft',params:{docId:docId}})
}

</script>

<style scoped>
</style>