<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\HelperController;
use App\Http\Controllers\RecentContributionsController;
use App\Http\Controllers\RegistrationController;
use App\Http\Controllers\PersonController;
use App\Http\Controllers\SSFSotaController;
use App\Http\Controllers\SSFProfileController;
use App\Http\Controllers\SSFOrganizationController;
use App\Http\Controllers\SSFCaseStudyController;
use App\Http\Controllers\SSFBluejusticeController;
use App\Http\Controllers\SSFGuidelineController;
use App\Http\Controllers\SearchController;

use App\Models\UserProfile;
use App\Models\Country;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});


/*
|--------------------------------------------------------------------------
| ISSF BASE ROUTES
|--------------------------------------------------------------------------
*/
Route::get('/issf-base/get-all-contributors', fn() => UserProfile::orderBy('first_name', 'ASC')->get());
Route::get('/issf-base/get-all-countries', fn() => Cache::rememberForever('country-list', fn() => Country::all()));
Route::get('/issf-base/get-recent-contributions', [RecentContributionsController::class, 'get_recent_contributions']);
Route::get('/issf-base/get-records-by-country', [HelperController::class, 'get_record_by_country']);
Route::get('/issf-base/get-theme-issues/{issf_core_id}', [HelperController::class, 'get_theme_issues']);
Route::get('/issf-base/get-country-name-from-id/{country:country_id}', [HelperController::class, 'get_country_name']);
Route::get('/issf-base/get-person-link-for-user/{id}', [PersonController::class, 'get_person_for_user']);
Route::get('/issf-base/get-user/{user:id}', fn(UserProfile $user) => $user);
Route::get('/issf-base/search/{title}/{record_type}/{contributor_ids}/{countries}/{startYear}/{endYear}', [SearchController::class, 'search']);
Route::get('/issf-base/get-users-contributions/{contributor_id}', [HelperController::class, 'get_users_contributions']);
Route::get('/issf-base/get-all-contributions', [HelperController::class, 'get_all_contributions']);


/*
|--------------------------------------------------------------------------
| AUTHENTICATION ROUTES - LOGIN AND REGISTRATIONS
|--------------------------------------------------------------------------
*/
Route::post('/authentication/signup', [RegistrationController::class, 'register']);
Route::post('/authentication/login', [RegistrationController::class, 'login']);
Route::post('/authentication/get-username', [RegistrationController::class, 'send_username']);
Route::get('/authentication/login-status/{user_id}/{jti}', [RegistrationController::class, 'handle_login_tokens']);
Route::get('/authentication/activate/{token}/{user_id}', [RegistrationController::class, 'activate_account']);
Route::post('/authentication/resend-activation-link/', [RegistrationController::class, 'resend_activation_link']);
Route::post('/authentication/forgot-password', [RegistrationController::class, 'generate_password_verification_code']);
Route::post('/authentication/reset-password', [RegistrationController::class, 'reset_password']);

/*
|--------------------------------------------------------------------------
| SSF DETAILS ROUTES
|--------------------------------------------------------------------------
*/
Route::get('/details/person/{person:issf_core_id}', [PersonController::class, 'get_details']);
Route::get('/details/sota/{sota:issf_core_id}', [SSFSotaController::class, 'get_details']);
Route::get('/details/profile/{profile:issf_core_id}', [SSFProfileController::class, 'get_details']);
Route::get('/details/organization/{organization:issf_core_id}', [SSFOrganizationController::class, 'get_details']);
Route::get('/details/casestudy/{case:issf_core_id}', [SSFCaseStudyController::class, 'get_details']);
Route::get('/details/guidelines/{guideline:issf_core_id}', [SSFGuidelineController::class, 'get_details']);
Route::get('/details/bluejustice/{bluejustice:issf_core_id}', [SSFBluejusticeController::class, 'get_details']);

/*
|--------------------------------------------------------------------------
| DATA CREATION ROUTES
|--------------------------------------------------------------------------
*/
Route::post('/person/create', [PersonController::class, 'create']);
Route::post('/sota/create', [SSFSotaController::class, 'create']);
Route::post('/profile/create', [SSFProfileController::class, 'create']);
Route::post('/organization/create', [SSFOrganizationController::class, 'create']);
Route::post('/casestudy/create', [SSFCaseStudyController::class, 'create']);
Route::post('/bluejustice/create', [SSFBluejusticeController::class, 'create']);
Route::post('/guidelines/create', [SSFGuidelineController::class, 'create']);


/*
|--------------------------------------------------------------------------
| DATA UPDATE ROUTES
|--------------------------------------------------------------------------
*/
Route::post('/guidelines/update/{record:issf_core_id}', [SSFGuidelineController::class, 'update']);


/*
|--------------------------------------------------------------------------
| DATA DELETION ROUTES
|--------------------------------------------------------------------------
*/
Route::delete('/issf-base/delete/{record:issf_core_id}', [HelperController::class, 'delete_record']);
