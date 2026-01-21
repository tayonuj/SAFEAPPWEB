<?php
// app/Services/CurlRequestServices.php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;

class CurlRequestServices
{
    protected $client;

    public function __construct()
    {
        $this->client = new Client();
    }

    /**
     * Send a GET request to a URL.
     *
     * @param string $url
     * @param array $params
     * @return mixed
     */
    public function getRequest($url, $params = [])
    {
        try {
            $response = $this->client->request('GET', $url, [
                'query' => $params,
                'verify' => false,
            ]);
            $response->getBody()->rewind();
            return json_decode($response->getBody()->getContents(), true);
        } catch (GuzzleException $e) {
            return $e->getMessage();
        }
    }

    /**
     * Send a POST request to a URL.
     *
     * @param string $url
     * @param array $data
     * @param bool $isRaw
     * @return mixed
     */
    public function postRequest($url, $data = [], $isRaw = false, $headers = null)
    {
        try {
            $options = [
                $isRaw ? 'json' : 'form_params' => $data,
                'verify' => false
            ];

            // Include headers if provided
            if (!empty($headers)) {
                $options['headers'] = $headers;
            }
//            if ($isRaw){
//                return $options['body'];
//            }
            $response = $this->client->request('POST', $url, $options);
            $response->getBody()->rewind();


            return json_decode($response->getBody()->getContents(), true);
        } catch (GuzzleException $e) {
            if ($e->getCode() === 401) {
                // Return a specific response for 401 Unauthorized
                return [
                    'status' => 401,
                    'message' => 'Unauthorized access'
                ];
            }

            return [
                'status' => $e->getCode(),
                'message' => $e->getMessage()
            ];
        }
    }

}
