<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CarController;
use App\Http\Controllers\CarPostingController;
use App\Http\Controllers\CarRentalController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PlanFeatureController;
use App\Http\Controllers\UserCompanyController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:api');


Route::controller(AuthController::class)->group(function () {
    Route::post('/Auth/login', 'login');
});

Route::middleware('auth:api')->controller(PlanController::class)->group(function () {
    Route::get('/Plan', 'index');
    Route::get('/Plan/{id}', 'show');
    Route::post('/Plan', 'store');
    Route::put('/Plan/{id}', 'update');
    Route::delete('/Plan/{id}', 'destroy');
});

Route::middleware('auth:api')->controller(UserController::class)->group(function () {
    Route::get('/User', 'index');
    Route::get('/User/{id}', 'show');
    Route::post('/User', 'store');
    Route::put('/User/{id}', 'update');
    Route::delete('/User/{id}', 'destroy');
});

Route::middleware('auth:api')->controller(UserCompanyController::class)->group(function () {
    Route::get('/UserCompany','index');
    Route::get('/UserCompany/{id}','show');
    Route::post('/UserCompany','store');
    Route::put('/UserCompany/{id}','update');
    Route::delete('/UserCompany/{id}', 'destroy');
});

Route::middleware('auth:api')->controller(PlanFeatureController::class)->group(function () {
    Route::get('/PlanFeature','index');
    Route::get('/PlanFeature/{id}','show');
    Route::post('/PlanFeature','store');
    Route::put('/PlanFeature/{id}','update');
    Route::delete('/PlanFeature/{id}', 'destroy');
});

Route::middleware('auth:api')->controller(CarController::class)->group(function () {
    Route::get('/Car','index');
    Route::get('/Car/{id}','show');
    Route::post('/Car','store');
    Route::put('/Car/{id}','update');
    Route::delete('/Car/{id}', 'destroy');
});

Route::middleware('auth:api')->controller(CarPostingController::class)->group(function () {
    Route::get('/CarPosting','index');
    Route::get('/CarPosting/{id}','show');
    Route::post('/CarPosting','store');
    Route::put('/CarPosting/{id}','update');
    Route::delete('/CarPosting/{id}', 'destroy');
});

Route::middleware('auth:api')->controller(CarRentalController::class)->group(function () {
    Route::get('/CarRental','index');
    Route::get('/CarRental/{id}','show');
    Route::post('/CarRental','store');
    Route::put('/CarRental/{id}','update');
    Route::delete('/CarRental/{id}', 'destroy');
});

