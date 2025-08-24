<?php

namespace App\Service;

use App\Interface\Repository\IUserRepo;
use App\Interface\Service\IUserService;
use App\Service\GenericService;
use Illuminate\Auth\AuthenticationException;
use Hash;

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
        $token = $user->createToken('auth_token')->accessToken;
        return [
            'token' => $token,
            'role' => $user->role,
        ];
    }
}