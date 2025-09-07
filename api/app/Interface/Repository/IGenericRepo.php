<?php

namespace App\Interface\Repository;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;


interface IGenericRepo
{
    /**
     * Get the query builder for the model
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function query(): Builder;

    /**
     * Retrieve all records with optional filtering and relations.
     *
     * @param array $columns The columns to select
     * @param array $relations The relations to eager load
     * @param array $conditions The where conditions to apply
     * @param array $orderBy The order by clauses
     * @return Collection<Model>
     */
    public function all(array $columns = ['*'], array $relations = [], array $conditions = [], array $orderBy = []): Collection;

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
    ): LengthAwarePaginator;

    /**
     * Find a record by ID with optional relations and conditions.
     *
     * @param int $id The record ID
     * @param array $columns The columns to select
     * @param array $relations The relations to eager load
     * @param array $conditions Additional where conditions
     * @return Model|null
     */
    public function find(
        int   $id,
        array $columns    = ['*'],
        array $relations  = [],
        array $conditions = []
    ): ?Model;

    /**
     * Create a new record.
     *
     * @param array $data The data to create the record with
     * @return Model
     */
    public function create(array $data): ?Model;

    /**
     * Update a record by ID.
     *
     * @param int $id The record ID
     * @param array $data The data to update the record with
     * @return Model
     */
    public function update(int $id, array $data): Model;

    /**
     * Delete a record by ID.
     *
     * @param int $id The record ID
     * @return bool
     */
    public function delete(int $id): ?bool;
}
