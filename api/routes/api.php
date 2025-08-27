<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CarController;
use App\Http\Controllers\CarPostingController;
use App\Http\Controllers\CarRentalController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\PlanFeatureController;
use App\Http\Controllers\RequirementController;
use App\Http\Controllers\UserCompanyController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserRequirementController;
use Illuminate\Support\Facades\Route;


Route::controller(AuthController::class)->group(function () {
    Route::middleware('auth:api')->get('/Auth/user', 'user');
    Route::post('/Auth/login', 'login');
    Route::middleware('auth:api')->post('/Auth/logout', 'logout');
    Route::middleware('auth:api')->get('/Auth/session', 'session');
});

Route::middleware(['auth:api', 'role:admin,user'])->controller(CarController::class)->group(function () {
    Route::get('/Car','index');
    Route::get('/Car/{id}','show');
    Route::middleware('role:user')->post('/Car','store');
    Route::middleware('role:user')->put('/Car/{id}','update');
    Route::middleware('role:user')->delete('/Car/{id}', 'destroy');
});

Route::middleware(['auth:api', 'role:admin,user'])->controller(CarPostingController::class)->group(function () {
    Route::get('/CarPosting','index');
    Route::get('/CarPosting/{id}','show');
    Route::middleware('role:user')->post('/CarPosting','store');
    Route::middleware('role:user')->put('/CarPosting/{id}','update');
    Route::middleware('role:user')->delete('/CarPosting/{id}', 'destroy');
});

Route::middleware(['auth:api', 'role:admin,user'])->controller(CarRentalController::class)->group(function () {
    Route::get('/CarRental','index');
    Route::get('/CarRental/{id}','show');
    Route::middleware('role:user')->post('/CarRental','store');
    Route::middleware('role:user')->put('/CarRental/{id}','update');
    Route::middleware('role:user')->delete('/CarRental/{id}', 'destroy');
});

Route::middleware(['auth:api', 'role:admin'])->controller(PlanController::class)->group(function () {
    Route::get('/Plan', 'index');
    Route::get('/Plan/{id}', 'show');
    Route::post('/Plan', 'store');
    Route::put('/Plan/{id}', 'update');
    Route::delete('/Plan/{id}', 'destroy');
});

Route::middleware(['auth:api', 'role:admin'])->controller(PlanFeatureController::class)->group(function () {
    Route::get('/PlanFeature','index');
    Route::get('/PlanFeature/{id}','show');
    Route::post('/PlanFeature','store');
    Route::put('/PlanFeature/{id}','update');
    Route::delete('/PlanFeature/{id}', 'destroy');
});

Route::middleware(['auth:api', 'role:admin,user'])->controller(RequirementController::class)->group(function () {
    Route::get('/Requirement','index');
    Route::get('/Requirement/{id}','show');
    Route::middleware('role:admin')->post('/Requirement','store');
    Route::middleware('role:admin')->put('/Requirement/{id}','update');
    Route::middleware('role:admin')->delete('/Requirement/{id}', 'destroy');
});

Route::middleware(['auth:api', 'role:admin,user'])->controller(UserCompanyController::class)->group(function () {
    Route::get('/UserCompany','index');
    Route::get('/UserCompany/{id}','show');
    Route::post('/UserCompany','store');
    Route::put('/UserCompany/{id}','update');
    Route::delete('/UserCompany/{id}', 'destroy');
});

Route::middleware(['auth:api', 'role:admin'])->controller(UserController::class)->group(function () {
    Route::get('/User', 'index');
    Route::get('/User/{id}', 'show');
    Route::post('/User', 'store');
    Route::put('/User/{id}', 'update');
    Route::delete('/User/{id}', 'destroy');
});

Route::middleware(['auth:api', 'role:admin,user'])->controller(UserRequirementController::class)->group(function () {
    Route::get('/UserRequirement','index');
    Route::get('/UserRequirement/{id}','show');
    Route::middleware('role:user')->post('/UserRequirement','store');
    Route::middleware('role:user')->put('/UserRequirement/{id}','update');
    Route::middleware('role:user')->delete('/UserRequirement/{id}', 'destroy');
});
