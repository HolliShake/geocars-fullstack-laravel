<?php

namespace App\Repository;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use App\Interface\Repository\IGenericRepo;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Generic Repository Class
 * 
 * A generic repository implementation that provides common CRUD operations
 * for Eloquent models. This class implements the IGenericRepo interface
 * and can be used as a base repository for any Eloquent model.
 */
class GenericRepo implements IGenericRepo
{
    /**
     * The Eloquent model instance
     * 
     * @var string
     */
    protected $model;

    /**
     * Create a new GenericRepo instance
     * 
     * @param string $model The fully qualified class name of the Eloquent model
     */
    public function __construct($model)
    {
        if (!class_exists($model) || !is_subclass_of($model, Model::class)) {
            throw new \InvalidArgumentException("The model must be a valid Eloquent model.");
        }
        
        $this->model = $model;
    }
    public function paginate(
        int   $page       = 1,
        int   $perPage    = 15,
        array $columns    = ['*'],
        array $relations  = [],
        array $conditions = [],
        array $orderBy    = []
    ): LengthAwarePaginator
    {
        // Filter out empty columns and default to ['*'] if empty
        $columns = array_filter($columns, function($column) {
            return !empty(trim($column));
        });
        
        if (empty($columns)) {
            $columns = ['*'];
        }
        
        $query = $this->model
            ::with($relations)
            ->where(function ($query) use ($conditions) {
                foreach ($conditions as $column => $value) {
                    if (is_array($value) && count($value) === 2) {
                        [$operator, $val] = $value;   // e.g. ['like', '%Dog%']
                        $query->where($column, $operator, $val);
                    } elseif (!is_null($value)) {
                        $query->where($column, '=', $value);
                    }
                }
            });
            
        if (!empty($orderBy)) {
            $query->orderBy(...$orderBy);
        }
        
        return $query->paginate($perPage, $columns, 'page', $page);
    }

    /**
     * Retrieve all records from the database
     * 
     * @param array $columns The columns to select (default: ['*'])
     * @param array $relations The relationships to eager load
     * @param array $conditions The where conditions to apply
     * @param array $orderBy The order by clause [column, direction]
     * @return Collection Collection of model instances
     */
    public function all(array $columns = ['*'], array $relations = [], array $conditions = [], array $orderBy = []): Collection
    {
        $columns = collect($columns)
            ->map(fn($col) => trim($col))
            ->filter()
            ->all() ?: ['*'];

        $query = $this->model::query()
            ->when($conditions, fn($q) => collect($conditions)->each(fn($c) => $q->where($c)))
            ->when($relations, fn($q) => $q->with($relations))
            ->select($columns)
            ->when($orderBy, fn($q) => $q->orderBy(...$orderBy));

        return $query->get();
    }

    /**
     * Find a specific record by ID
     * 
     * @param int $id The primary key value
     * @param array $columns The columns to select (default: ['*'])
     * @param array $relations The relationships to eager load
     * @param array $conditions Additional where conditions to apply
     * @return Model The found model instance
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If model not found
     */
    public function find(
        int $id, 
        array $columns    = ['*'], 
        array $relations  = [], 
        array $conditions = []
    ): Model
    {
        return $this->model::query()
            ->when($conditions, fn($q) => collect($conditions)->each(fn($c) => $q->where($c)))
            ->when($relations, fn($q) => $q->with($relations))
            ->select($columns)
            ->findOrFail($id);
    }

    /**
     * Create a new record in the database
     * 
     * @param array $data The data to create the model with
     * @return Model The newly created model instance
     */
    public function create(array $data): Model
    {
        return tap(new $this->model, fn($m) => $m->forceFill($data)->save());
    }

    /**
     * Update an existing record in the database
     * 
     * @param int $id The primary key value of the record to update
     * @param array $data The data to update the model with
     * @return Model The updated model instance
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If model not found
     */
    public function update(int $id, array $data): Model
    {
        return tap($this->find($id), fn($model) => $model->forceFill($data)->save());
    }

    /**
     * Delete a record from the database
     * 
     * @param int $id The primary key value of the record to delete
     * @return bool True if the deletion was successful
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If model not found
     */
    public function delete(int $id): ?bool
    {
        $model = $this->find($id);

        // Delete the model from the database
        return $model->delete();
    }
}