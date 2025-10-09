<template>
    <div>
        <card class="mb-3">
            <card-body>
                <card-header>
                    Short News Section
                </card-header>

                <textarea
                    class="form-control"
                    rows="3"
                    v-model="updatedNews"
                ></textarea>

                <div class="d-grid gap-2">
                    <button class="btn btn-outline-theme mt-3 col-md-6 offset-3"  @click="updateShortNews()">Update</button>
                </div>
            </card-body>
        </card>

    </div>
</template>


<script setup>
import {defineProps, inject, onMounted, ref, watch} from "vue";
import $ from "jquery";
import {useStore} from "vuex";
import CardHeader from "../../../bootstrap/CardHeader.vue";
import {findLocalStorage} from "../../../../composables/storage/LocalStorageHandler";
import generalAxiosRequest from "../../../../composables/application/generalAxiosRequest";
import EmployeeProfile from "../EmployeeProfile.vue";
import notificationHandling from "../../../../composables/application/notificationHandling";
const loading = ref(false);
const newsData = ref([]);
const shortNewsData = ref([]);
const store = useStore();

const props = defineProps({
    data: String,
});

const updatedNews = ref("");

watch(() => props.data, (data, oldEvent) => {
    if (data)
        updatedNews.value = data.news;
})

const $loading =  inject('$loading')

const updateShortNews = async () => {
    const loader = $loading.show();

    const payload = {
        url: 'https://services.logifortech.com/api/v1/general-queries/appendData',
        data: JSON.stringify({
            collection: 'short_news',
            fieldKey: 'news',
            identifier: props.data._id,
            data: updatedNews.value,
        })
    }

    const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false);
    notificationHandling('info',json_data.value)
    loader.hide();
    window.location.reload();

}



onMounted(()=>{

})
</script>



<!--<style scoped>-->
<!--.marquee {-->
<!--    width: 100%;-->
<!--    overflow: hidden;-->
<!--    white-space: nowrap;-->
<!--    box-sizing: border-box;-->
<!--}-->

<!--.marquee p {-->
<!--    display: inline-block;-->
<!--    padding-left: 100%;-->
<!--    animation: marquee 10s linear infinite;-->
<!--}-->

<!--@keyframes marquee {-->
<!--    from {-->
<!--        transform: translateX(100%);-->
<!--    }-->
<!--    to {-->
<!--        transform: translateX(-100%);-->
<!--    }-->
<!--}-->
<!--</style>-->
