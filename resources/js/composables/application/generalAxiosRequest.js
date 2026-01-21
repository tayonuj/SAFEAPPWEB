import {ref} from 'vue';
import notificationHandling from "../application/notificationHandling";
import { useLoading } from 'vue3-loading-overlay';
import axios from 'axios';

/**
 * this method is used to generate axios URL generally
 * request is sending to this application
 * using api version 1
 * this is a dynamic method that can use for every project to use axios requests
 * @param url is the Request url without base ex: is the url = mycontroller/getData the request URL will be /api/v1/mycontroller/getData
 * @param payload
 * @param allow_loading
 * @param function_name
 * @param $loading
 * @param $is_raw
 * @returns {{json_data: Array}} returning the dataset generally. Initial result is null
 */
const generalAxiosRequest =  async (url,payload,allow_loading = true,function_name,$loading,is_raw = false) => {
    let loader = null;
    const json_data = ref([]);
    let local_user = localStorage.getItem('user');
    let user = {};
    if (local_user) {
        user = JSON.parse(local_user);
    }
    // if (user) {
    payload.headers = JSON.stringify({
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('Token')}` ,// Retrieve the token dynamically,
        'User-Email': user.Email || 'unknown_user@example.com',
        'User-Name': user.Name || 'Unknown Username',
        'x-api-key': 'change-me-please',
        'Function-Name': function_name,
        'Project-ID': 'safecard',
    })
    payload.is_raw = is_raw;
    // }
    if (allow_loading)
        loader = $loading.show();
    await axios.post('/api/v1/'+url, payload)
        .then((response) => {
            if (response.data && response.data.data){
                if (response.data.current_page){
                    json_data.value = response.data; // Update the layerData property
                }else{
                    json_data.value = response.data.data; // Update the layerData property
                }
            }else{
                console.log("Error",JSON.stringify(response.data))

                // notificationHandling("error","No Data Available")
            }

            console.log('MAIN data', json_data.value);
            // console.log("fucking loader",loader)
            if (loader)
                loader.hide();
        })
        .catch((error) => {
            notificationHandling("error",error.message);
            if (error.response && error.response.status === 401) {
                notificationHandling("error", "Session Timeout. Redirecting to login page...");
                localStorage.clear();
                window.location.reload();
            } else {
                notificationHandling("error", error.message);
            }
            if (loader)
                loader.hide();
        });

    return {json_data}
}

export default generalAxiosRequest;
