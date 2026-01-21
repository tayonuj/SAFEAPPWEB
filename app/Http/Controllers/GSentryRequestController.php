<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\CurlRequestServices;
use Illuminate\Http\Request;

class GSentryRequestController extends Controller
{
    protected $curlRequestService;

    public function __construct(CurlRequestServices $curlRequestService)
    {
        ini_set('memory_limit', '-1');
        ini_set('max_execution_time', '900');
        $this->curlRequestService = $curlRequestService;
    }

    public function get(Request $request){
        $url = $request->input('url');
        $data = $request->input('data');
        if ($data) {
            $rtn_data = $this->curlRequestService->getRequest($url, $data);
        }
        else
            $rtn_data = $this->curlRequestService->getRequest($url);

        return response()->json(['data'=>$rtn_data]);
    }
    public function post(Request $request)
    {
        $url = $request->input('url');
        $data = $request->input('data');
        $header = $request->input('headers');
        $is_raw = $request->input('is_raw');

        if ($header) {
            $header = json_decode($header, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json(['message' => 'Invalid headers format'], 400);
            }
            if (!empty($header['Authorization'])) {
                // Clean up the Authorization header
                $header['Authorization'] = str_replace('"', '', $header['Authorization']);
            }
        }

//        return $header;
        if ($data) {
            $data = json_decode($data, true);
            $rtn_data = $this->curlRequestService->postRequest($url, $data, $is_raw, $header);
        } else {
            $rtn_data = $this->curlRequestService->postRequest($url, [], $is_raw, $header);
        }

        if (isset($rtn_data['status']) && $rtn_data['status'] === 401) {
            return response()->json(['message' => $rtn_data['message']], 401);
        }

        return response()->json($rtn_data);
    }

}
