<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PlanFeatureController;
use App\Http\Controllers\UserCompanyController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:api');


Route::controller(PlanController::class)->group(function () {
    Route::get('/Plan', 'index');
    Route::get('/Plan/{id}', 'show');
    Route::post('/Plan', 'store');
    Route::put('/Plan/{id}', 'update');
    Route::delete('/Plan/{id}', 'destroy');
});

Route::controller(UserController::class)->group(function () {
    Route::get('/User', 'index');
    Route::get('/User/{id}', 'show');
    Route::post('/User', 'store');
    Route::put('/User/{id}', 'update');
    Route::delete('/User/{id}', 'destroy');
});

Route::controller(UserCompanyController::class)->group(function () {
    Route::get('/UserCompany','index');
    Route::get('/UserCompany/{id}','show');
    Route::post('/UserCompany','store');
    Route::put('/UserCompany/{id}','update');
    Route::delete('/UserCompany/{id}', 'destroy');
});

Route::controller(PlanFeatureController::class)->group(function () {
    Route::get('/PlanFeature','index');
    Route::get('/PlanFeature/{id}','show');
    Route::post('/PlanFeature','store');
    Route::put('/PlanFeature/{id}','update');
    Route::delete('/PlanFeature/{id}', 'destroy');
});

Route::controller(AuthController::class)->group(function () {
    Route::post('/Auth/login', 'login');
});