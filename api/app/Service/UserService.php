<?php

namespace App\Service;

use App\Interface\Repository\IUserRepo;
use App\Interface\Service\IUserService;
use App\Service\GenericService;
use Http\Discovery\Exception\NotFoundException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserService extends GenericService implements IUserService
{
    public function __construct(IUserRepo $repo)
    {
        parent::__construct($repo);
    }

    public function login(string $email, string $password): array
    {
        $user = $this->repo->getByEmail($email);
        if (!$user) {
            throw new AuthenticationException('User not found');
        }
        if (!Hash::check($password, $user->password)) {
            throw new AuthenticationException('Invalid password');
        }

        if (!Auth::attempt(['email' => $email, 'password' => $password])) {
            throw new AuthenticationException('Invalid credentials');
        }

        $token = $user->createToken('auth_token')->accessToken;
        return [
            'token' => $token,
            'role' => $user->role,
        ];
    }

    public function logout(): void
    {
        $user = Auth::user();
        if (!$user) {
            throw new AuthenticationException('Unauthenticated');
        }
        $token = $user->token();
        $token->revoke();
        $token->delete();
    }

    public function getSession(): array
    {
        $user = Auth::user();
        if (!$user) {
            throw new AuthenticationException('Unauthenticated');
        }
        return [
            'token' => $user->createToken('auth_token')->accessToken,
            'role' => $user->role,
        ];
    }
}
