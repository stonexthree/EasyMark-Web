import { type } from "os"

export {UserApi, DocApi, TagApi, SearchApi,PictureApi,UrlConstructor,StatisticsApi}
const baseURL = '/api/'
const UserApi = {
    'login': (username: string, password: string) => {
        return {
            url: baseURL + 'login',
            method: 'POST',
            headers: {'Content-Type': 'multipart/form-data; '},
            data: {
                username: username,
                password: password
            }
        }
    },
    logout:()=>{
        return {
            url: baseURL + 'logout',
            method: 'GET'
        }
    },
    'getAllUsers': () => {
        return {
            url: baseURL + 'user/all',
            method: 'GET',
        }
    },
    getLoginUserNickname: () => {
        return {
            url: baseURL + 'user/nickname',
            method: 'GET'
        }
    },
    adminCheck: () => {
        return {
            url: baseURL + 'user/admin/check',
            method: 'GET'
        }
    },
    setPassword:(username:string,password:string) =>{
        return {
            url: baseURL + 'user/admin/password',
            method: 'POST',
            headers: {'Content-Type': 'multipart/form-data; '},
            data: {
                username: username,
                password: password
            }
        }
    },
    changePassword:(password:string) =>{
        return {
            url: baseURL + 'user/password',
            method: 'POST',
            headers: {'Content-Type': 'multipart/form-data; '},
            data: {
                newPassword: password
            }
        }
    },
    createAccount:(username:string,password:string) =>{
        return {
            url: baseURL + 'user/detail',
            method: 'POST',
            headers: {'Content-Type': 'multipart/form-data; '},
            data: {
                username: username,
                password: password
            }
        }
    },
    getMyProfile:()=>{
        return{
            url:baseURL + 'user/profile',
            method: 'GET'
        }
    },
    changeNickname:(nickname:string)=>{
        return{
            url:baseURL + 'user/nickname',
            method: 'PUT',
            headers: {'Content-Type': 'multipart/form-data; '},
            data: {
                nickname: nickname
            }
        }
    },
    listUserPhotos:(names:Array<string>) => {
        return {
            url: baseURL + 'user/photos',
            method: 'GET',
            params:{
                usernames: names.join(',')
            }
        }
    }
}

const DocApi = {
    'getAllDoc': () => {
        return {
            url: baseURL + 'doc/list',
            method: 'GET'
        }
    },
    'queryDocsById': (ids: string[])=>{
        const form: FormData = new FormData;
        for(let index in ids){
            form.append('id',ids[index]);
        }
        return{
            url: baseURL + 'doc/query/condition',
            method: 'POST',
            data: form
        }
    },
    'getDocByAuthor': (author: string) => {
        return {
            url: baseURL + 'doc/list/user-doc/' + author,
            method: 'GET'
        }
    },
    'getMyDocs': () => {
        return {
            url: baseURL + 'doc/my-doc',
            method: 'GET'
        }
    },
    'getMyDrafts': () => {
        return {
            url: baseURL + 'doc/my-drafts',
            method: 'GET'
        }
    },
    'getDocContent': (docId: string) => {
        return {
            url: baseURL + 'doc/markdown/' + docId,
            method: 'GET'
        }
    },
    'newDoc': (docName: string, content: string) => {
        return {
            url: baseURL + 'doc/markdown',
            method: 'POST',
            headers: {'Content-Type': 'multipart/form-data; '},
            data: {
                docName: docName,
                content: content
            }
        }
    },
    'newDocWithTags': (docName: string, content: string, tags: string[]) => {
        return {
            url: baseURL + 'doc/markdown_tags',
            method: 'POST',
            headers: {'Content-Type': 'multipart/form-data; '},
            data: {
                docName: docName,
                content: content,
                'label-name': tags.join(',')
            }
        }
    },
    'saveDocAsDraft': (docName: string, content: string) => {
        return {
            url: baseURL + 'doc/draft',
            method: 'POST',
            headers: {'Content-Type': 'multipart/form-data; '},
            data: {
                docName: docName,
                content: content
            }
        }
    },
    'modifyDoc': (docId: string, content: string) => {
        return {
            url: baseURL + 'doc/markdown/content/' + docId,
            method: 'PUT',
            headers: {'Content-Type': 'multipart/form-data; '},
            data: {
                content: content
            }
        }
    },
    'changeDocName': (title: string, docId: string) => {
        return {
            url: baseURL + 'doc/markdown/doc-name/' + docId,
            method: 'PUT',
            headers: {'Content-Type': 'multipart/form-data; '},
            data: {
                name: title
            }
        }
    },
    'submitDraft':(docId: string ,labelName:string[] = []) =>{
            return {
                url: baseURL + 'doc/draft/submit',
                method: 'PUT',
                headers: {'Content-Type': 'multipart/form-data; '},
                data: labelName.length === 0? {
                    'doc-id':docId,
                }:{
                    'doc-id':docId,
                    'label-name': labelName.join(',')
                }
            }
    },
    'collectDoc':(docId:string)=>{
        return {
            url: baseURL + 'doc/collections/' + docId,
            method: 'PUT'
        }
    },
    'removeCollected':(docId:string)=>{
        return {
            url: baseURL + 'doc/collections/' + docId,
            method: 'DELETE'
        }
    },
    'listMyCollections':()=>{
        return {
            url: baseURL + 'doc/collections',
            method: 'GET'
        }
    },
    'isDocCollected':(docId:string)=>{
        return {
            url: baseURL + 'doc/collect/status/' + docId,
            method: 'GET'
        }
    }
}

const TagApi = {
    'deleteDocMap': (docId: string) => {
        return {
            url: baseURL + 'label/map/doc/' + docId,
            method: 'DELETE',
        }
    },
    'setMap': (docId: string, tags: string[]) => {
        return {
            url: baseURL + 'label/map/set',
            method: 'POST',
            headers: {'Content-Type': 'multipart/form-data; '},
            data: {
                'doc-id': docId,
                'label-name': tags.join(',')
            }
        }
    },
    'searchTag': (keyword: string) => {
        return {
            url: baseURL + 'label/keyword/' + keyword,
            method: 'GET'
        }
    }
}

const SearchApi = {
    'searchDoc': (scope: string, keyword: string) => {
        return {
            url: baseURL + 'search/scope/' + scope + '/' + keyword,
            method: 'GET',
        }
    },
}

/**
 * 图片相关的Api
 * 
 * upload 上传图片
 * upoloadUserPhoto 上传图片作为当前用户头像
 */
const PictureApi = {
    upload:(form:FormData) => {
        return {
            url: baseURL + 'files/picture',
            method: 'POST',
            data: form
        }
    },
    upoloadUserPhoto:(form:FormData) => {
        return {
            url: baseURL + 'user/photo',
            method: 'POST',
            data: form
        }
    }
}

/**
 * 统计API
 * 
 * refreshCharts 重新触发服务端的排行榜统计
 */
const StatisticsApi = {
    getDocCounts:() =>{
        return {
            url: baseURL + 'statistics/doc-num',
            method: 'GET'
        }
    },
    getTop10Charts:(chartsType : ChartsType,useDictionary:boolean)=>{
        return {
            url: baseURL + 'statistics/charts/' + chartsType,
            method: 'GET',
            params:{'useDictionary':useDictionary}
        }
    },
    refreshCharts:()=>{
        return {
            url: baseURL + 'statistics/refresh',
            method: 'GET'
        }
    }
}
const UrlConstructor = {
    pictureUrl:(name:string):string=>{
        return '/picture/'+name;
    }
}
export type ChartsType = 'label'|'doc-view'|'doc-create';