<?php

namespace App\Interface\Service;

use App\Interface\Service\IGenericService;

interface IUserService extends IGenericService
{
    public function login(string $email, string $password): array;
}