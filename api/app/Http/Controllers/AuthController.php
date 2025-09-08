<?php

namespace App\Http\Controllers;

use App\Service\UserService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    public function __construct(protected UserService $service) {
    }

    /**
     * Store a newly created resource in storage.
     */
    #[OA\Post(
        path: "/api/Auth/login",
        summary: "Login",
        tags: ["Auth"],
        description:" Login with the provided details",
        operationId: "loginWithCredentials",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/LoginRequest")
    )]
    #[OA\Response(
        response: 200,
        description: "Auth created successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/AuthResponse200")
    )]
    #[OA\Response(
        response: 422,
        description: "Validation error",
        content: new OA\JsonContent(ref: "#/components/schemas/ValidationErrorResponse")
    )]
    #[OA\Response(
        response: 500,
        description: "Internal server error",
        content: new OA\JsonContent(ref: "#/components/schemas/InternalServerErrorResponse")
    )]
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email'    => 'required|email|exists:users,email',
                'password' => 'required|min:8|max:255',
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();
            $rawEmail = $validated['email'];
            $rawPassword = $validated['password'];

            return $this->ok($this->service->login($rawEmail, $rawPassword));
        } catch (AuthenticationException $e) {
            return $this->unauthorized($e->getMessage());
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    #[OA\Post(
        path: "/api/Auth/logout",
        summary: "Logout",
        tags: ["Auth"],
        description: "Logout the current user",
        operationId: "logout",
    )]
    #[OA\Response(
        response: 204,
        description: "Logout successful",
        content: new OA\JsonContent(ref: "#/components/schemas/NoContentResponse")
    )]
    #[OA\Response(
        response: 401,
        description: "Unauthorized",
        content: new OA\JsonContent(ref: "#/components/schemas/UnauthorizedResponse")
    )]
    #[OA\Response(
        response: 500,
        description: "Internal server error",
        content: new OA\JsonContent(ref: "#/components/schemas/InternalServerErrorResponse")
    )]
    public function logout(Request $request)
    {
        try {
            $this->service->logout();
            return $this->noContent();
        } catch (AuthenticationException $e) {
            return $this->unauthorized($e->getMessage());
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    #[OA\Post(
        path: "/api/Auth/signup",
        summary: "Signup",
        tags: ["Auth"],
        description: "Signup with the provided details",
        operationId: "signupWithCredentials",
    )]
    #[OA\RequestBody(
        required: true,
        content: new OA\JsonContent(ref: "#/components/schemas/SignupRequest")
    )]
    #[OA\Response(
        response: 200,
        description: "Signup successful",
        content: new OA\JsonContent(ref: "#/components/schemas/AuthResponse200")
    )]
    public function signup(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'firstname' => 'required|string|max:255',
                'lastname' => 'required|string|max:255',
                'username' => 'required|string|max:255|unique:users,username',
                'phone' => 'nullable|string|max:255',
                'country' => 'nullable|string|max:255',
                'city' => 'nullable|string|max:255',
                'address' => 'nullable|string|max:255',
                'postal_code' => 'nullable|string|max:255',
                'email' => 'required|email|max:255|unique:users,email',
                'password' => 'required|string|min:8|confirmed'
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            $validated = $validator->validated();
            return $this->ok($this->service->signup($validated));
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    #[OA\Get(
        path: "/api/Auth/session",
        summary: "Session",
        tags: ["Auth"],
        description: "Get the current session",
        operationId: "getSession",
    )]
    #[OA\Response(
        response: 200,
        description: "Session retrieved successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/AuthResponse200")
    )]
    #[OA\Response(
        response: 401,
        description: "Unauthorized",
        content: new OA\JsonContent(ref: "#/components/schemas/UnauthorizedResponse")
    )]
    #[OA\Response(
        response: 403,
        description: "Forbidden",
        content: new OA\JsonContent(ref: "#/components/schemas/ForbiddenResponse")
    )]
    #[OA\Response(
        response: 500,
        description: "Internal server error",
        content: new OA\JsonContent(ref: "#/components/schemas/InternalServerErrorResponse")
    )]
    public function session(Request $request)
    {
        try {
            return $this->ok($this->service->getSession());
        } catch (AuthenticationException $e) {
            return $this->unauthorized($e->getMessage());
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }

    #[OA\Get(
        path: "/api/Auth/user",
        summary: "User",
        tags: ["Auth"],
        description: "Get the current user",
        operationId: "getUser",
    )]
    #[OA\Response(
        response: 200,
        description: "User retrieved successfully",
        content: new OA\JsonContent(ref: "#/components/schemas/GetUserResponse200")
    )]
    #[OA\Response(
        response: 401,
        description: "Unauthorized",
        content: new OA\JsonContent(ref: "#/components/schemas/UnauthorizedResponse")
    )]
    #[OA\Response(
        response: 500,
        description: "Internal server error",
        content: new OA\JsonContent(ref: "#/components/schemas/InternalServerErrorResponse")
    )]
    public function user(Request $request)
    {
        try {
            return $this->ok(Auth::user());
        } catch (AuthenticationException $e) {
            return $this->unauthorized($e->getMessage());
        } catch (\Exception $e) {
            return $this->internalServerError($e->getMessage());
        }
    }
}
