<template>
    <div>

        <Card class="mb-3">
            <CardBody>
                <input type="text" class="form-control form-select-sm mb-3"  placeholder="මාතෘකාව" v-model="title">
                <input type="text" class="form-control form-select-sm mb-3"  placeholder="අනු මාතෘකාව" v-model="subtitle">
<!--                <Datepicker         ignore-time-validation class="mb-4"-->
<!--                                    v-model="date"  placeholder="Select date" />-->

                <div class="row">
                    <div class="col col-sm-8 col-lg-8">
                        <input class="form-control form-control-sm" id="formFileSm" type="file" @change="handleMainFileChange">
                    </div>
                    <div class="col col-sm-4 col-lg-4">
                        <button class="btn btn-sm btn-primary" @click="addToFiles('main',mainFile)">ප්‍රධාන පින්තූරය Upload කරන්න </button>
                    </div>
                </div>
                <Card class="mt-2 mb-4">
                    <CardBody>
                        <img v-if="mainImage"  :src="mainImage"
                                alt="Main Image" height="100" width="100">
                    </CardBody>
                </Card>


                <div class="row">
                    <div class="col col-sm-8 col-lg-8">
                        <input class="form-control form-control-sm" id="formFileSm" type="file" @change="handleSubFileChange">
                    </div>
                    <div class="col col-sm-4 col-lg-4">
                        <button class="btn btn-sm btn-primary" @click="addToFiles('sub',subFile)">අනු පින්තූර ඇතුලු කරන්න</button>
                    </div>
                </div>

                <Card class="mt-2 mb-4">
                    <CardBody>
                        <div class="row">
                            <div class="col-lg-3" v-for="(item,key) in subImages">
                                <img  :src="item"
                                      :alt="'SubImage'+key " height="100" width="100">
                            </div>
                        </div>

                    </CardBody>
                </Card>

                <textarea
                    class="form-control mb-4 mt-2"
                    rows="3"
                    placeholder="සම්පූරණ විස්තරය ..."
                    v-model="description"
                ></textarea>

                <div class="d-grid gap-2">
                    <button class="btn btn-falcon-primary"  @click="createPromo()">දත්ත ඇතුලත් කරන්න</button>
                </div>
            </CardBody>
        </Card>

    </div>
</template>


<script setup>
import {defineProps, inject, onMounted, ref, watch} from "vue";
import {useStore} from "vuex";


import CardBody from "../../bootstrap/CardBody.vue";
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";
import notificationHandling from "../../../composables/application/notificationHandling";
import generalFileuploadAxiosRequest from "../../../composables/application/generalFileuploadAxiosRequest";
import Card from "../../bootstrap/Card.vue";

const loading = ref(false);
const newsData = ref([]);
const shortNewsData = ref([]);
const store = useStore();

const title = ref("");
const subtitle = ref("");
const description = ref("");
const date = ref(new Date());

const $loading =  inject('$loading')

const allImageArray = ref([]);
const mainImage = ref(null);
const subImages = ref([]);
const baseURL = inject("$baseURL");
const createPromo = async () => {
    const loader = $loading.show();

    if (!mainImage.value || mainImage.value === ''){
      notificationHandling('error','කරුණාකර පින්තූරයක් ඇතුලත් කරන්න')
    }

    const payload = {
        url: baseURL+'/api/v1/general-queries/addData',
        data: JSON.stringify({
            collection: 'promotions',
            data: JSON.stringify({
                "imageUrl": mainImage.value,
                "title": title.value,
                "subtitle": subtitle.value,
                "description": description.value,
                "images": allImageArray.value,
            }),
        })
    }

    const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false);
    notificationHandling('info',json_data.value)
    loader.hide();
    window.location.reload();

}



const mainFile = ref(null);
const subFile = ref(null);

const handleMainFileChange = (event) => {
    mainFile.value = event.target.files[0];
};

const handleSubFileChange = (event) => {
    subFile.value = event.target.files[0];
};
const addToFiles = async (type, file) => {

    if (!file) {
        notificationHandling('error', 'Please Select an Image before upload', 'Image is Empty!');
        return false;
    }

    const {json_data} = await generalFileuploadAxiosRequest('SMFOOD', 'Promotions', file, true, $loading);

    if (type === 'main') {
        mainImage.value = 'https://storage.googleapis.com/safeapp/Files/' + json_data.value
    } else {
        subImages.value.push([
            'https://storage.googleapis.com/safeapp/Files/' + json_data.value
        ])
    }

    allImageArray.value.push(
        'https://storage.googleapis.com/safeapp/Files/' + json_data.value
    )
}


onMounted(() => {

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
