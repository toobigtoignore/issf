<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class JWTController extends Controller
{
    private $tokenSecret = "issf-authentication-token-25066742-f20a-493b-ac42-84dfc0bd73f9";


    public function base64UrlEncode($text){
        return str_replace(
            ['+', '/', '='],
            ['-', '_', ''],
            base64_encode($text)
        );
    }


    public function gen_JWT($payload){
        $headers = [ "alg" => "HS512"];
        $headers_encoded = $this->base64UrlEncode(json_encode($headers));
        $payload_encoded = $this->base64UrlEncode(json_encode($payload));
        $key = $this->tokenSecret;
        $signature = hash_hmac('sha512', "$headers_encoded.$payload_encoded", $key, true);
        $signature_encoded = $this->base64UrlEncode($signature);
        $token = "$headers_encoded.$payload_encoded.$signature_encoded";
        return $token;
    }
}
