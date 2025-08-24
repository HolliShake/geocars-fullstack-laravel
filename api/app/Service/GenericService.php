<?php

namespace App\Service;

use App\Interface\Repository\IGenericRepo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class GenericService
{
    public function __construct(protected IGenericRepo $repo) 
    {
    }

    /**
     * Retrieve all records with optional filtering and relations.
     *
     * @param array $columns The columns to select
     * @param array $relations The relations to eager load
     * @param array $conditions The where conditions to apply
     * @param array $orderBy The order by clauses
     * @return Collection<Model>
     */
    public function getAll(array $columns = ['*'], array $relations = [], array $conditions = [], array $orderBy = []): Collection
    {
        return $this->repo->all($columns, $relations, $conditions, $orderBy);
    }

    /**
     * Paginate records with optional filtering and relations.
     *
     * @param array $columns The columns to select
     * @param array $relations The relations to eager load
     * @param array $conditions The where conditions to apply
     * @param array $orderBy The order by clauses
     * @param int $page The page number
     * @param int $perPage The number of records per page
     * @return LengthAwarePaginator
     */
    public function paginate(
        int   $page       = 1,
        int   $perPage    = 15,
        array $columns    = ['*'],
        array $relations  = [],
        array $conditions = [],
        array $orderBy    = []
    ): LengthAwarePaginator
    {
        return $this->repo->paginate($page, $perPage, $columns, $relations, $conditions, $orderBy);
    }

    /**
     * Find a record by ID with optional relations and conditions.
     *
     * @param int $id The record ID
     * @param array $columns The columns to select
     * @param array $relations The relations to eager load
     * @param array $conditions Additional where conditions
     * @return Model|null
     */
    public function get(int $id, array $columns = ['*'], array $relations = [], array $conditions = []): ?Model
    {
        return $this->repo->find($id, $columns, $relations, $conditions);
    }

    /**
     * Create a new record.
     *
     * @param array $data The data to create the record with
     * @return Model|null
     */
    public function create(array $data): ?Model
    {
        return $this->repo->create($data);
    }

    /**
     * Update a record by ID.
     *
     * @param int $id The record ID
     * @param array $data The data to update the record with
     * @return Model|null
     */
    public function update(int $id, array $data): ?Model
    {
        return $this->repo->update($id, $data);
    }

    /**
     * Delete a record by ID.
     *
     * @param int $id The record ID
     * @return bool
     */
    public function delete(int $id): bool
    {
        return $this->repo->delete($id);
    }
}
