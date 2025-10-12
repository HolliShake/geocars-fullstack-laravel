<?php

namespace App\Interface\Repository;

use Illuminate\Database\Eloquent\Model;

interface IUserRepo extends IGenericRepo
{
    public function getByEmail(string $email): ?Model;
}
