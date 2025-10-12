<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CarController;
use App\Http\Controllers\CarPostingController;
use App\Http\Controllers\CarRentalController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PlanFeatureController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\RequirementController;
use App\Http\Controllers\UserCompanyController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserRequirementController;
use Illuminate\Support\Facades\Route;


Route::controller(AuthController::class)->group(function () {
    Route::middleware('auth:api')->get('/Auth/user', 'user');
    Route::post('/Auth/login', 'login');
    Route::post('/Auth/signup', 'signup');
    Route::middleware('auth:api')->post('/Auth/logout', 'logout');
    Route::middleware('auth:api')->get('/Auth/session', 'session');
});

Route::middleware(['auth:api', 'role:admin,user'])->controller(CarController::class)->group(function () {
    Route::get('/Car','index');
    Route::get('/Car/{id}','show')->where('id', '[0-9]+');
    Route::middleware('role:user')->post('/Car','store');
    Route::middleware('role:user')->post('/Car/{id}','update')->where('id', '[0-9]+');
    Route::middleware('role:user')->delete('/Car/{id}', 'destroy')->where('id', '[0-9]+');
});

Route::middleware(['auth:api', 'role:admin,user,renter'])->controller(CarPostingController::class)->group(function () {
    Route::get('/CarPosting','index');
    Route::get('/CarPosting/{id}','show')->where('id', '[0-9]+');
    Route::middleware('role:user')->post('/CarPosting','store');
    Route::middleware('role:user')->put('/CarPosting/{id}','update')->where('id', '[0-9]+');
    Route::middleware('role:user')->delete('/CarPosting/{id}', 'destroy')->where('id', '[0-9]+');
});

Route::middleware(['auth:api'])->controller(CarPostingController::class)->group(function () {
    Route::get('/CarPosting/Browse', 'browse');
});

Route::middleware(['auth:api', 'role:admin,user,renter'])->controller(CarRentalController::class)->group(function () {
    Route::get('/CarRental','index');
    Route::get('/CarRental/{id}','show')->where('id', '[0-9]+');
    Route::get('/CarRental/CheckSubmission/{id}', 'checkSubmission')->where('id', '[0-9]+');
    Route::middleware('role:user,renter')->post('/CarRental','store');
    Route::middleware('role:user')->put('/CarRental/{id}','update')->where('id', '[0-9]+');
    Route::middleware('role:user')->delete('/CarRental/{id}', 'destroy')->where('id', '[0-9]+');
});

Route::middleware(['auth:api', 'role:admin'])->controller(PlanController::class)->group(function () {
    Route::get('/Plan', 'index');
    Route::get('/Plan/{id}', 'show')->where('id', '[0-9]+');
    Route::post('/Plan', 'store');
    Route::put('/Plan/{id}', 'update')->where('id', '[0-9]+');
    Route::delete('/Plan/{id}', 'destroy')->where('id', '[0-9]+');
});

Route::middleware(['auth:api', 'role:admin'])->controller(PlanFeatureController::class)->group(function () {
    Route::get('/PlanFeature','index');
    Route::get('/PlanFeature/{id}','show')->where('id', '[0-9]+');
    Route::post('/PlanFeature','store');
    Route::put('/PlanFeature/{id}','update')->where('id', '[0-9]+');
    Route::delete('/PlanFeature/{id}', 'destroy')->where('id', '[0-9]+');
});

Route::middleware(['auth:api', 'role:admin,user'])->controller(RequirementController::class)->group(function () {
    Route::get('/Requirement','index');
    Route::get('/Requirement/{id}','show')->where('id', '[0-9]+');
    Route::middleware('role:admin')->post('/Requirement','store');
    Route::middleware('role:admin')->put('/Requirement/{id}','update')->where('id', '[0-9]+');
    Route::middleware('role:admin')->delete('/Requirement/{id}', 'destroy')->where('id', '[0-9]+');
});

Route::middleware(['auth:api', 'role:admin,user'])->controller(UserCompanyController::class)->group(function () {
    Route::get('/UserCompany','index');
    Route::get('/UserCompany/{id}','show')->where('id', '[0-9]+');
    Route::post('/UserCompany','store');
    Route::put('/UserCompany/{id}','update')->where('id', '[0-9]+');
    Route::delete('/UserCompany/{id}', 'destroy')->where('id', '[0-9]+');
});

Route::middleware(['auth:api', 'role:admin,user,renter'])->controller(UserController::class)->group(function () {
    Route::get('/User', 'index');
    Route::middleware('role:admin')->get('/User/{id}', 'show')->where('id', '[0-9]+');
    Route::middleware('role:admin')->post('/User', 'store');
    Route::middleware('role:admin,user,renter')->put('/User/{id}', 'update')->where('id', '[0-9]+');
    Route::middleware('role:admin')->delete('/User/{id}', 'destroy')->where('id', '[0-9]+');
    Route::post('/User/uploadProfilePicture/{id}', 'uploadProfilePicture')->where('id', '[0-9]+');
});

Route::middleware(['auth:api', 'role:admin,user,renter'])->controller(UserRequirementController::class)->group(function () {
    Route::get('/UserRequirement/User', 'getUserRequirements');
    Route::get('/UserRequirement','index');
    Route::get('/UserRequirement/{id}','show')->where('id', '[0-9]+');
    Route::middleware('role:user,renter')->post('/UserRequirement','store');
    Route::middleware('role:user,renter')->put('/UserRequirement/{id}','update')->where('id', '[0-9]+');
    Route::middleware('role:user,renter')->delete('/UserRequirement/{id}', 'destroy')->where('id', '[0-9]+');
});

Route::middleware(['auth:api', 'role:admin,user,renter'])->controller(ReactionController::class)->group(function () {
    Route::post('/Reaction','store');
    Route::put('/Reaction/{id}','update')->where('id', '[0-9]+');
    Route::delete('/Reaction/{id}', 'destroy')->where('id', '[0-9]+');
});

Route::middleware(['auth:api', 'role:admin,user,renter'])->controller(CommentController::class)->group(function () {
    Route::get('/Comment','index');
    Route::get('/Comment/{id}','show')->where('id', '[0-9]+');
    Route::middleware('role:user,renter')->post('/Comment','store');
    Route::middleware('role:user,renter')->put('/Comment/{id}','update')->where('id', '[0-9]+');
    Route::middleware('role:user,renter')->delete('/Comment/{id}', 'destroy')->where('id', '[0-9]+');
});
