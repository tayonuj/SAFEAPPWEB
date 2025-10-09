<template>
    <div>
      <div>
        <div class="mt-3 mb-4">
          <nav style="--falcon-breadcrumb-divider: url(&#34;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Cpath d='M2.5 0L1 1.5 3.5 4 1 6.5 2.5 8l4-4-4-4z' fill='%23748194'/%3E%3C/svg%3E&#34;);" aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><a href="/">මුල් පිටුව</a></li>
              <li class="breadcrumb-item active" aria-current="page">Promotions</li>
            </ol>
          </nav>
        </div>
      </div>
        <Card class="mb-3">
            <CardBody>
                <CardHeader>
                    Promotions
                    &nbsp;&nbsp;&nbsp;
                    <button type="button" class="btn btn-outline-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalAddNews">
                        අලුතෙන් ඇතුලත් කරන්න
                    </button>
                </CardHeader>
                <div class="row">
                    <div class="col-xl-4 col-lg-4" v-for="(item,key) in newsData" :key="'news'+key">
                        <Card class="mb-3" @click="setSelectedNews(item)">
                            <CardBody>
                                <img :src="item.imageUrl" alt="" class="card-img-top">
                            </CardBody>
                            <CardBody >
                                <h5 class="card-title">{{item.title}}</h5>
                                <p style="font-size: small">{{item.subtitle}}</p>
                                <p class="mt-2">{{item.description}}</p>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </CardBody>
        </Card>



        <div class="modal fade" id="modalAddNews">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add Promotion</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <add-promotion />
                    </div>
                </div>
            </div>
        </div>

        <div class="modal fade" id="modalUpdateNews" ref="modalUpdateNews">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Update Promotion</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                            <update-promotion :data="selectedNews" />
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>


<script setup>
import {onMounted, ref,inject} from "vue";
import $ from "jquery";
import {useStore} from "vuex";
import { Modal } from 'bootstrap';
import Card from "../../bootstrap/Card.vue";
import CardBody from "../../bootstrap/CardBody.vue";
import AddPromotion from "./addPromotion.vue";
import generalAxiosRequest from "../../../composables/application/generalAxiosRequest";
import UpdatePromotion from "./updatePromotion.vue";
import CardHeader from "../../bootstrap/CardHeader.vue";



const loading = ref(false);
const newsData = ref([]);
const shortNewsData = ref([]);
const store = useStore();
const baseURL = inject("$baseURL");
const getNews = async () => {
    loading.value = true;
    let dataset = null;
        const payload = {
            url: baseURL+'/api/v1/general-queries/readData',
            data: JSON.stringify({
                collection: 'promotions',
            })
        }

        const {json_data} = await generalAxiosRequest('curl-requests/post', payload, false);
        localStorage.setItem('news',JSON.stringify(json_data.value));
        dataset = json_data.value

    newsData.value = dataset;
    console.log("promotions",dataset);
    loading.value = false;
}


const modalUpdateNews = ref(null);
const selectedNews = ref(null);
const setSelectedNews = (news) => {
    selectedNews.value = news;
    let element = modalUpdateNews.value
    let updateModal = new Modal(element, {})
    updateModal.show()
}



onMounted(()=>{
    getNews();
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
