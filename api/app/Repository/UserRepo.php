<?php

namespace App\Repository;

use App\Interface\Repository\IUserRepo;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class UserRepo extends GenericRepo implements IUserRepo
{
    public function __construct()
    {
        parent::__construct(User::class);
    }

    public function getByEmail(string $email): ?Model {
        return $this->model::where('email', $email)->first();
    }

    // Override create
    public function create(array $data): Model {
        $user = new $this->model;
        $user->password = Hash::make($data["lastname"].'.'.$data["firstname"]); // Default password is the "last name" '.' "first name"
        return tap($user, fn($m) => $m->forceFill($data)->save());
    }

    public function update(int $id, array $data): Model {
        $user = $this->model::find($id);
        if (!$user) {
            throw new ModelNotFoundException('User not found');
        }
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            $data['password'] = $user->password;
        }
        return tap($user, fn($m) => $m->forceFill($data)->save());
    }
}
