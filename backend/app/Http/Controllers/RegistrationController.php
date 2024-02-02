<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\JWTController;
use App\Models\ActivationToken;
use App\Models\UserProfile;
use App\Models\LoginToken;
use App\Models\PasswordReset;
use App\Mail\VerificationEmail;
use App\Mail\ResendUsernameEmail;
use App\Mail\ResetPasswordEmail;


class RegistrationController extends Controller
{
    public function register(){
        $id = UserProfile::latest('id')->first()->id + 1;
        $validator = Validator::make(request()->all(), [
            'first_name' => 'required|max:30',
            'last_name' => 'required|max:30',
            'country_id' => 'required',
            'email' => 'required|email|max:100|unique:user_profile,email',
            'username' => 'required|max:30|unique:user_profile,username',
            'password' => 'required|min:8|max:512'
         ]);

         if($validator->fails()) {
            return [
                'success' => false,
                'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR'),
                'errors' => [
                    'validation' => $validator->messages()
                ]
            ];
        }

        UserProfile::create([
            'id' => $id,
            ...request()->all()
        ]);


        $token = $this->generate_verification_token();
        ActivationToken::create([
            'user_id' => $id,
            'token' => $token['id'],
            'expires_at' => $token['expires_at']
        ]);

        $email_sent = $this->sendVerificationEmail($id, $token['id']);
        if($email_sent) return [
            'status_code' => config('constants.RESPONSE_CODES.SUCCESS'),
            'success' => true
        ];

        return false;
    }


    public function activate_account($token, $user_id){
        $activation_token = ActivationToken::where('user_id', '=', $user_id)
                                            ->where('token', '=', $token)
                                            ->first();

        if(!$activation_token) return;

        if(time() < strtotime($activation_token->expires_at)){
            $user = UserProfile::find($user_id);
            $user->is_active = 1;
            $user->save();
            $activation_token->delete();
            return redirect(env('FRONTEND_URL') . '/registration/activated');
        }

        return redirect(env('FRONTEND_URL') . '/registration/activation-expired');
    }


    public function resend_activation_link(){
        $email = request('email');
        $user = UserProfile::where('email', '=', $email)->first();
        if(!$user) {
            return [
                'status_code' => config('constants.RESPONSE_CODES.BAD_REQUEST'),
                'errors' => [
                    'invalid_email' => true
                ]
            ];
        }

        if($user->is_active){
            return [
                'status_code' => config('constants.RESPONSE_CODES.BAD_REQUEST'),
                'errors' => [
                    'already_activated' => true
                ]
            ];
        }
        $activation_token = ActivationToken::where('user_id', '=', $user->id)->first();
        $activation_token->delete();
        $new_token = $this->generate_verification_token();
        ActivationToken::create([
            'user_id' => $user->id,
            'token' => $new_token['id'],
            'expires_at' => $new_token['expires_at']
        ]);

        $email_sent = $this->sendVerificationEmail($user->id, $new_token['id']);
        if($email_sent) return [
            'status_code' => config('constants.RESPONSE_CODES.SUCCESS'),
            'success' => true
        ];

        return false;
    }


    public function login(){
        $credentials = request()->all();
        $validator = Validator::make($credentials, [
            'username' => 'required|exists:user_profile,username',
            'password' => 'required'
         ]);

         if($validator->fails()) {
            return [
                'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR'),
                'errors' => [
                    'validation_failed' => $validator->messages()
                ]
            ];
        }

        $user = UserProfile::where('username', '=', $credentials['username'])->first();
        if(!$user->is_active) {
            return [
                'status_code' => config('constants.RESPONSE_CODES.BAD_REQUEST'),
                'errors' => [
                    'user_not_active' => true
                ]
            ];
        }

        // FOR LEGACY PASSWORD - FORCE USER TO RESET PASSWORD
        if(substr($user->password, 0, 7) === 'pbkdf2_'){
            return [
                'status_code' => config('constants.RESPONSE_CODES.BAD_REQUEST'),
                'errors' => [
                    'password_expired' => true
                ]
            ];
        }

        $authentication = Auth::attempt([
            'username' => request('username'),
            'password' => request('password')
        ]);

        if (!$authentication) {
            return [
                'status_code' => config('constants.RESPONSE_CODES.BAD_REQUEST'),
                'errors' => [
                    'wrong_credentials' => true
                ]
            ];
        }

        $token_id = uniqid();
        $access_token = (new JWTController())->gen_JWT([
            "user_id" => $user->id,
            "is_staff" => $user->is_staff,
            "exp" => strtotime('+7 days'),
            'jti' => $token_id
        ]);

        return [
            'status_code' => config('constants.RESPONSE_CODES.SUCCESS'),
            'success' => true,
            'token' => $access_token
        ];
    }


    public function handle_login_tokens($user_id, $jti){
        $token = LoginToken::where('user_id', '=', $user_id)
                            ->where('jti', '=', $jti)
                            ->first();

        if(!$token) return response()->json(false);

        if($token->expiry_timestamp > time()){
            $token->delete();
            return response()->json(false);
        }

        $new_jti = uniqid();
        $token->jti = $new_jti;
        $token->save();

        $new_access_token = (new JWTController())->gen_JWT([
            "id" => $user_id,
            "is_staff" => $user->is_staff,
            "exp" => strtotime('+1 minutes'),
            'jti' => $new_jti
        ]);

        return response()->json($new_access_token);
    }


    public function send_username(){
        $user = UserProfile::where('email', '=', request('email'))->first();

        if($user){
            \Mail::to($user->email)->send(new ResendUsernameEmail($user->username));
            return [
                'status_code' => config('constants.RESPONSE_CODES.SUCCESS'),
                'success' => true
            ];
        }

        return [
            'status_code' => config('constants.RESPONSE_CODES.NOT_FOUND'),
            'errors' => [
                'not_found' => true
            ]
        ];
    }


    public function generate_password_verification_code(){
        $user = UserProfile::where('email', '=', request('email'))->first();
        if(!$user){
            return [
                'status_code' => config('constants.RESPONSE_CODES.BAD_REQUEST'),
                'errors' => [
                    'invalid_email' => true
                ]
            ];
        }

        $verification_code = strtoupper(uniqid());

        \Mail::to(request('email'))->send(new ResetPasswordEmail($verification_code));

        return [
            'success' => true,
            'verification_code' => $verification_code
        ];
    }


    public function reset_password(){
        $validator = Validator::make(request()->all(), [
            'email' => 'exists:user_profile,email',
            'password' => 'required|min:8|max:512'
         ]);

         if($validator->fails()) {
            return [
                'status_code' => config('constants.RESPONSE_CODES.INTERNAL_SERVER_ERROR'),
                'errors' => [
                    'validation' => $validator->messages()
                ]
            ];
        }

        $user = UserProfile::where('email', '=', request('email'))->first();
        $user->password = request('password');
        $user->save();

        return [
            'status_code' => config('constants.RESPONSE_CODES.SUCCESS'),
            'success' => true
        ];
    }


    public function change_password(){
        $payload = request()->all();
        $validator = Validator::make($payload, [
            'email' => 'exists:user_profile,email',
            'current_password' => 'required|min:8|max:512',
            'new_password' => 'required|min:8|max:512',
            'confirm_password' => 'required|min:8|max:512'
         ]);

         if($validator->fails()) {
            return [
                'status_code' => config('constants.RESPONSE_CODES.BAD_REQUEST'),
                'errors' => [
                    'validation' => $validator->messages()
                ]
            ];
        }

        $user = UserProfile::where('email', request('email'))->first();
        if(!Hash::check($payload['current_password'], $user->password)){
            return [
                'status_code' => config('constants.RESPONSE_CODES.BAD_REQUEST'),
                'message' => "Your current password does not match with your account!"
            ];
        }

        $user->update([
            'password' => $payload['new_password']
        ]);

        return [
            'status_code' => config('constants.RESPONSE_CODES.SUCCESS'),
            'message' => "Your password has been updated successfully."
        ];
    }


    public function generate_verification_token(){
        return [
            'id' => "issf_verification_" . time() . uniqid(),
            'expires_at' => date('Y-m-d h:m:i', strtotime('+7 days'))
        ];
    }


    public function sendVerificationEmail($user_id, $token){
        return \Mail::to(request('email'))->send(new VerificationEmail($user_id, $token));
    }
}
