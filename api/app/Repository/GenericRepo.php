<?php

namespace App\Repository;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use App\Interface\Repository\IGenericRepo;
use Illuminate\Database\Eloquent\Builder;
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

    /**
     * Get the query builder for the model
     *
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function query(): Builder {
        return $this->model::query();
    }

    /**
     * Paginate records with optional filtering and relations.
     *
     * @param int $page The page number
     * @param int $perPage The number of records per page
     * @param array $columns The columns to select
     * @param array $relations The relations to eager load
     * @param array $conditions The where conditions to apply
     * @param array $orderBy The order by clauses
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
        // Filter out empty columns and default to ['*'] if empty
        $columns = array_filter($columns, function($column) {
            return !empty(trim($column));
        });

        if (empty($columns)) {
            $columns = ['*'];
        }

        $query = $this->model::with($relations);

        $searchConditions = [];
        $filterConditions = [];
        $attributeConditions = [];

        foreach ($conditions as $column => $value) {
            // Check if column is an attribute reference
            if (str_starts_with($column, 'attr:')) {
                $attributeName = substr($column, 5); // Remove 'attr:' prefix
                if (is_array($value) && count($value) === 2) {
                    [$operator, $val] = $value;
                    $attributeConditions[] = [$attributeName, $operator, $val];
                } else {
                    $attributeConditions[] = [$attributeName, '=', $value];
                }
            } elseif (str_contains($column, '.')) {
                // Handle nested relationship conditions (e.g., 'car.user_company_id', 'user.name')
                $parts = explode('.', $column);
                $relation = array_shift($parts);
                $nestedColumn = implode('.', $parts);

                if (is_array($value) && count($value) === 2) {
                    [$operator, $val] = $value;
                    if ($operator === 'like' && !empty($val)) {
                        $query->whereHas($relation, function($q) use ($nestedColumn, $val) {
                            if (str_contains($nestedColumn, '.')) {
                                // Handle deeply nested relationships
                                $deepParts = explode('.', $nestedColumn);
                                $deepRelation = array_shift($deepParts);
                                $deepColumn = implode('.', $deepParts);
                                $q->whereHas($deepRelation, function($deepQ) use ($deepColumn, $val) {
                                    $deepQ->where($deepColumn, 'like', $val);
                                });
                            } else {
                                $q->where($nestedColumn, 'like', $val);
                            }
                        });
                    } elseif ($operator === '&=' && !is_null($val)) {
                        $query->whereHas($relation, function($q) use ($nestedColumn, $val) {
                            if (str_contains($nestedColumn, '.')) {
                                // Handle deeply nested relationships
                                $deepParts = explode('.', $nestedColumn);
                                $deepRelation = array_shift($deepParts);
                                $deepColumn = implode('.', $deepParts);
                                $q->whereHas($deepRelation, function($deepQ) use ($deepColumn, $val) {
                                    $deepQ->where($deepColumn, '=', $val);
                                });
                            } else {
                                $q->where($nestedColumn, '=', $val);
                            }
                        });
                    } elseif (!is_null($val)) {
                        $query->whereHas($relation, function($q) use ($nestedColumn, $operator, $val) {
                            if (str_contains($nestedColumn, '.')) {
                                // Handle deeply nested relationships
                                $deepParts = explode('.', $nestedColumn);
                                $deepRelation = array_shift($deepParts);
                                $deepColumn = implode('.', $deepParts);
                                $q->whereHas($deepRelation, function($deepQ) use ($deepColumn, $operator, $val) {
                                    $deepQ->where($deepColumn, $operator, $val);
                                });
                            } else {
                                $q->where($nestedColumn, $operator, $val);
                            }
                        });
                    }
                } elseif (!is_null($value) && $value !== '') {
                    $query->whereHas($relation, function($q) use ($nestedColumn, $value) {
                        if (str_contains($nestedColumn, '.')) {
                            // Handle deeply nested relationships
                            $deepParts = explode('.', $nestedColumn);
                            $deepRelation = array_shift($deepParts);
                            $deepColumn = implode('.', $deepParts);
                            $q->whereHas($deepRelation, function($deepQ) use ($deepColumn, $value) {
                                $deepQ->where($deepColumn, '=', $value);
                            });
                        } else {
                            $q->where($nestedColumn, '=', $value);
                        }
                    });
                }
            } elseif (is_array($value) && count($value) === 2) {
                [$operator, $val] = $value;

                if ($operator === 'like' && !empty($val)) {
                    $searchConditions[] = [$column, 'like', $val];
                } elseif ($operator === '&=' && !is_null($val)) {
                    $filterConditions[] = [$column, '=', $val];
                } elseif (!is_null($val)) {
                    $filterConditions[] = [$column, $operator, $val];
                }
            } elseif (!is_null($value) && $value !== '') {
                $filterConditions[] = [$column, '=', $value];
            }
        }

        // Apply filter conditions with AND logic
        foreach ($filterConditions as $condition) {
            $query->where($condition[0], $condition[1], $condition[2]);
        }

        // Apply search conditions with OR logic, but only if there are search conditions
        if (!empty($searchConditions)) {
            $query->where(function ($q) use ($searchConditions) {
                foreach ($searchConditions as $condition) {
                    $q->orWhere($condition[0], $condition[1], $condition[2]);
                }
            });
        }

        if (!empty($orderBy)) {
            $query->orderBy(...$orderBy);
        }

        $result = $query->paginate($perPage, $columns, 'page', $page);

        if (empty($attributeConditions)) {
            return $result;
        }

        $attributes = array_map(fn($c) => $c[0], $attributeConditions);
        $result = $result->appends($attributes);
        $result->setCollection(
            $result->getCollection()
                ->filter(function($model) use ($attributeConditions) {
                    foreach ($attributeConditions as $condition) {
                        [$attributeName, $operator, $value] = $condition;
                        $object = $model->toArray();
                        $attributeValue = $this->normalizeValue($object[$attributeName]);
                        $value = $this->normalizeValue($value);
                        if (!$this->compareValues($attributeValue, $value, $operator)) {
                            return false;
                        }
                    }
                    return true;
                }) // <-- uses accessor
                ->values()
        );

        return $result;
    }

    private function normalizeValue($value)
    {
        if (is_string($value)) {
            // Handle boolean string values
            if ($value === 'true' || $value === 'True' || $value === 'TRUE') {
                return true;
            } else if ($value === 'false' || $value === 'False' || $value === 'FALSE') {
                return false;
            }
            // Handle null string values
            else if ($value === 'null' || $value === 'NULL') {
                return null;
            }
            // Handle numeric string values
            else if (is_numeric($value)) {
                return str_contains($value, '.') ? (float)$value : (int)$value;
            }
            // Return as string for other cases
            return $value;
        } else if (is_numeric($value)) {
            // Convert numeric values to appropriate type
            return str_contains((string)$value, '.') ? (float)$value : (int)$value;
        } else if (is_bool($value)) {
            return $value;
        } else if (is_null($value)) {
            return null;
        } else if (is_array($value) || is_object($value)) {
            // For arrays and objects, return as-is or convert to string representation
            return $value;
        }

        // Default case for any other data types
        return $value;
    }

    private function compareValues($value1, $value2, $operator)
    {
        $result = match ($operator) {
            '='     => $value1 == $value2,
            '!='    => $value1 != $value2,
            '>'     => $value1 > $value2,
            '<'     => $value1 < $value2,
            '>='    => $value1 >= $value2,
            '<='    => $value1 <= $value2,
            'like'  => stripos((string)$value1, (string)$value2) !== false,
            default => false,
        };
        error_log(json_encode([">>", $value1, $operator, $value2, '==', $result]));
        return $result;
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
