<template>
  <Teleport to="body">
    <n-tree :class="{outline:true,
                    show:(!firstLoaded)&&outlineShow,
                    hide:(!firstLoaded)&&(!outlineShow)}"
            block-line
            :data="tree"
            selectable
            :node-props="nodeProps"
    />
  </Teleport>
</template>

<script lang="ts">
export default {
  name: "DocOutline"
}
</script>
<script setup lang="ts">
import {NTree, TreeOption} from 'naive-ui'
import {ref, Ref, computed, Teleport, watch} from 'vue'
import {useRouter} from 'vue-router'

interface Outline {
  level: number,
  text: string
}

const mockTree: Outline[] = [
  {
    level: 1,
    text: '标题1',
  },
  {
    level: 2,
    text: '标题2',
  },
  {
    level: 3,
    text: '标题3',
  },
  {
    level: 2,
    text: '标题4',
  },
];

const props = defineProps({
  outline: Array,
  outlineShow: Boolean
})

const router = useRouter();

//console.log(mockOriginTreeArray(2,3,3));

function createTree(outlines: Outline[]): TreeOption[] {
  const result: TreeOption[] = [];
  //topLevel: 上一个一级标签的绝对索引，midLevel: 上一个二级标签的相对位置
  let cursor: { topLevel: number, midLevel: number } = {
    topLevel: -1,
    midLevel: -1
  }
  for (let i in outlines) {
    switch (outlines[i].level) {
      case 1: {
        result.push({
          key: 'key' + i,
          label: outlines[i].text,
          children: []
        })
        cursor.topLevel++;
        cursor.midLevel = -1;
      }
        ;
        break;
      case 2: {
        if (cursor.topLevel === -1) {
          result.push({
            key: 'key' + i,
            label: outlines[i].text,
            children: []
          })
          cursor.topLevel++;
          cursor.midLevel = -1;
          continue;
        }
        result[cursor.topLevel].children?.push({
          key: 'key' + i,
          label: outlines[i].text,
          children: []
        })
        cursor.midLevel++;
      }
        ;
        break;
      case 3: {
        if (cursor.topLevel === -1) {
          result.push({
            key: 'key' + i,
            label: outlines[i].text,
            children: []
          })
          cursor.topLevel++;
          cursor.midLevel = -1;
          continue;
        }
        if (cursor.midLevel === -1) {
          result[cursor.topLevel].children?.push({
            key: 'key' + i,
            label: outlines[i].text,
            children: []
          })
          cursor.midLevel++;
          continue;
        }
        const target1: any = result[cursor.topLevel].children;
        const target2: any = target1[cursor.midLevel].children;
        target2.push({
          key: 'key' + i,
          label: outlines[i].text
        })
      }
        ;
        break;
      default: {
        continue;
      }
    }
  }
  return result;
}

const tree = computed<TreeOption[]>(() => {
  const result = createTree(<Outline[]>props.outline);

  return result;
})
const firstLoaded: Ref<boolean> = ref(true);
const showComputed = computed(() => {
  return props.outlineShow;
})
watch(showComputed, async (newV, oldV) => {
  firstLoaded.value = false;
})
const nodeProps: (arg: any) => any = ({option}: { option: TreeOption }) => {
  return {
    onClick() {
      const a = document.createElement('a') as HTMLAnchorElement;
      const targetId = option.label?.replaceAll(' ','-').toLowerCase();
      a.href='#' + targetId;
      //router.push(router.currentRoute.value.path + '#' + option.label);
      a.click();
    }
  }
}
</script>

<style scoped>
.outline {
  position: fixed;
  right: -200px;
  top: 100px;
  width: 200px;
  overflow: scroll;
  height: 600px;
  animation-duration: 1s;
  animation-fill-mode: both;
}

.show {
  animation-name: outline-show;
}

.hide {
  animation-name: outline-hide;
}

.outline::-webkit-scrollbar {
  display: none;
}

@keyframes outline-hide {
  0% {
    right: 50px;
  }
  100% {
    right: -200px;
  }
}

@keyframes outline-show {
  0% {
    right: -200px;
  }
  100% {
    right: 50px;
  }
}
</style>