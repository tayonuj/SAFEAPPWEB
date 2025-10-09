<template>
    <div>
        <card class="mb-3">
            <card-body>
                <div id="carouselExample" class="carousel slide" data-ride="carousel">
                    <ol class="carousel-indicators">
                        <li  v-for="(item,key) in allImageArray" :data-bs-target="'#carousel'+key" :data-bs-slide-to="key" :class="key === 0 ?'active':''"></li>
                    </ol>
                    <div class="carousel-inner">
                        <div :class="key === 0 ?'carousel-item active':'carousel-item'" v-for="(item,key) in allImageArray">
                            <img :src="item" alt="" class="d-block w-100" />
                        </div>
                    </div>
                    <a class="carousel-control-prev" href="#carouselExample" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon"></span>
                    </a>
                    <a class="carousel-control-next" href="#carouselExample" data-bs-slide="next">
                        <span class="carousel-control-next-icon"></span>
                    </a>
                </div>
            </card-body>
            <card-body>

                <input type="text" class="form-control form-select-sm mb-3"  placeholder="Title" v-model="title">
                <input type="text" class="form-control form-select-sm mb-3"  placeholder="SubTitle" v-model="subtitle">
<!--                <Datepicker         ignore-time-validation class="mb-4"-->
<!--                                    v-model="date"  placeholder="Select date" />-->

                <div class="row">
                    <div class="col col-sm-8 col-lg-8">
                        <input class="form-control form-control-sm" id="formFileSm" type="file" @change="handleMainFileChange">
                    </div>
                    <div class="col col-sm-4 col-lg-4">
                        <button class="btn btn-sm btn-primary" @click="addToFiles('main',mainFile)">Upload Main Image</button>
                    </div>
                </div>
                <card class="mt-2 mb-4">
                    <card-body>
                        <img v-if="mainImage"  :src="mainImage"
                                alt="Main Image" height="100" width="100">
                    </card-body>
                </card>


                <div class="row">
                    <div class="col col-sm-8 col-lg-8">
                        <input class="form-control form-control-sm" id="formFileSm" type="file" @change="handleSubFileChange">
                    </div>
                    <div class="col col-sm-4 col-lg-4">
                        <button class="btn btn-sm btn-primary" @click="addToFiles('sub',subFile)">Add to Sub Images</button>
                    </div>
                </div>

                <card class="mt-2 mb-4">
                    <card-body>
                        <div class="row">
                            <div class="col-lg-3" v-for="(item,key) in subImages">
                                <img  :src="item"
                                      :alt="'SubImage'+key " height="100" width="100">
                            </div>
                        </div>

                    </card-body>
                </card>

                <textarea
                    class="form-control mb-4 mt-2"
                    rows="3"
                    placeholder="Description"
                    v-model="description"
                ></textarea>

                <div class="d-grid gap-2">
                    <button class="btn btn-outline-theme mt-3 col-md-6 offset-3"  @click="updateNews">Update</button>
                </div>
            </card-body>
        </card>

    </div>
</template>


<script setup>
import {defineProps, inject, onMounted, ref, watch} from "vue";
import CardBody from "../../bootstrap/CardBody.vue";
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";
import notificationHandling from "../../../composables/application/notificationHandling";
import generalFileuploadAxiosRequest from "../../../composables/application/generalFileuploadAxiosRequest";


const props = defineProps({
    data: String,
});

const title = ref("");
const subtitle = ref("");
const description = ref("");


const allImageArray = ref([]);
const mainImage = ref(null);
const subImages = ref([]);
const baseURL = inject("$baseURL");
watch(() => props.data, (data, oldEvent) => {
    if (data) {
        mainImage.value = data.imageUrl;
        title.value = data.title;
        subtitle.value = data.subtitle;
        description.value = data.description;
        if (data.images && data.images.length>1){
            let newList = data.images.slice(1,data.images.length)
            subImages.value = newList;
        }
        allImageArray.value = data.images;
    }
})


const $loading =  inject('$loading')

const updateNews = async () => {
    const loader = $loading.show();

    const payload = {
        url: baseURL+'/api/v1/general-queries/updateData',
        data: JSON.stringify({
            collection: 'news',
            identifier: props.data._id,
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

    const {json_data} = await generalFileuploadAxiosRequest('News', 'Images', file, true, $loading);

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
