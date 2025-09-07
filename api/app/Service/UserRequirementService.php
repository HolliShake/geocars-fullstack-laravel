<?php

namespace App\Service;

use App\Interface\Repository\IRequirementRepo;
use App\Interface\Repository\IUserRequirementRepo;
use App\Interface\Service\IUserRequirementService;
use App\Models\UserRequirement;
use App\Service\GenericService;
use Illuminate\Database\Eloquent\Collection;

class UserRequirementService extends GenericService implements IUserRequirementService
{
    protected IRequirementRepo $requirementRepo;

    public function __construct(IUserRequirementRepo $repo, IRequirementRepo $requirementRepo)
    {
        parent::__construct($repo);
        $this->requirementRepo = $requirementRepo;
    }

    /**
     * Get the user requirements
     *
     * @param int $userId The user ID
     * @return Collection<UserRequirement>
     */
    public function getUserRequirements(int $userId, string $role): Collection
    {
        $results = $this->repo->query()
            ->from('requirements')
            ->leftJoin('user_requirements', function ($join) use ($userId) {
                $join->on('requirements.id', '=', 'user_requirements.requirement_id')
                    ->where('user_requirements.user_id', '=', $userId);
            })
            ->leftJoin('media', function ($join) {
                $join->on('user_requirements.id', '=', 'media.model_id')
                    ->where('media.model_type', '=', 'App\\Models\\UserRequirement')
                    ->where('media.collection_name', '=', 'user_requirements');
            })
            ->where('requirements.is_active', true)
            ->where('requirements.role', $role)
            ->selectRaw('
                user_requirements.id as id,
                requirements.created_at,
                requirements.updated_at,
                requirements.name,
                requirements.description,
                requirements.is_required,
                requirements.is_active,
                requirements.role,
                user_requirements.user_id,
                requirements.id as requirement_id,
                COALESCE(
                    JSON_ARRAYAGG(
                        CASE
                            WHEN media.id IS NOT NULL THEN JSON_OBJECT(
                                "id", media.id,
                                "file_name", media.file_name,
                                "mime_type", media.mime_type,
                                "size", media.size,
                                "url", media.disk
                            )
                        END
                    ),
                    JSON_ARRAY()
                ) as media
            ')
            ->groupBy(
                'user_requirements.id',
                'requirements.id',
                'requirements.created_at',
                'requirements.updated_at',
                'requirements.name',
                'requirements.description',
                'requirements.is_required',
                'requirements.is_active',
                'requirements.role',
                'user_requirements.user_id'
            )
            ->get()
            ->map(function ($item) {
                // Decode JSON string into array
                $media = array_values(array_filter(json_decode($item->media, true) ?: []));

                // Transform media items to include full URL
                $item->media = array_map(function ($mediaItem) use ($item) {
                    if (isset($mediaItem['url'])) {
                        // Generate full URL for the media file using Spatie Media Library method
                        $userRequirement = UserRequirement::find($item->id);
                        $mediaItem['url'] = $userRequirement ? $userRequirement->getFirstMediaUrl('user_requirements', 'thumb') : '';
                    }
                    return $mediaItem;
                }, $media);

                return $item;
            });

        return $results;
    }
}
