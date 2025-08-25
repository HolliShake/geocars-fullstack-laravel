<?php

namespace App\Interface\Service;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;


interface IGenericService
{
    /**
     * Get a list of records with optional filtering.
     *
     * @param array $data The filter and pagination data
     * @return Collection<Model>
     */
    public function getAll(array $filters = [], array $sort = [], array $conditions = [], array $orderBy = []);

    /**
     * Paginate records with optional filtering.
     *
     * @param int $page The page number
     * @param int $rows The number of rows per page
     * @param array $filters The filter data
     * @param array $sort The sort data
     * @param array $conditions The conditions data
     * @param array $orderBy The order by data
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
     * Get a single record by ID.
     *
     * @param array $data The data containing ID and optional parameters
     * @return Model|null
     */
    public function get(int $id, array $columns = ['*'], array $relations = [], array $conditions = []): ?Model;

    /**
     * Create a new record.
     *
     * @param array $data The data to create the record with
     * @return Model|null
     */
    public function create(array $data): ?Model;

    /**
     * Update an existing record.
     *
     * @param int $id The ID of the record to update
     * @param array $data The data containing ID and update values
     * @return Model
     */
    public function update(int $id, array $data): Model;

    /**
     * Delete a record.
     *
     * @param int $id The ID of the record to delete
     * @return bool
     */
    public function delete(int $id): bool;
}
