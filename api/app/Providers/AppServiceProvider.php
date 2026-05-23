<?php

namespace App\Providers;

use App\Interface\Repository\ICarPostingRepo;
use App\Interface\Repository\ICarRentalRepo;
use App\Interface\Repository\ICarRepo;
use App\Interface\Repository\ICommentRepo;
use App\Interface\Repository\IDeviceRepo;
use App\Interface\Repository\IDeviceLocationRepo;
use App\Interface\Repository\IRequirementRepo;
use App\Interface\Repository\IPlanFeatureRepo;
use App\Interface\Repository\IPlanRepo;
use App\Interface\Repository\IReactionRepo;
use App\Interface\Repository\IUserCompanyRepo;
use App\Interface\Repository\IUserRepo;
use App\Interface\Repository\IUserRequirementRepo; // Added
use App\Interface\Repository\IUserSubscriptionRepo;
use App\Interface\Service\ICarPostingService;
use App\Interface\Service\ICarRentalService;
use App\Interface\Service\ICarService;
use App\Interface\Service\ICommentService;
use App\Interface\Service\IDeviceService;
use App\Interface\Service\IDeviceLocationService;
use App\Interface\Service\IRequirementService;
use App\Interface\Service\IPlanFeatureService;
use App\Interface\Service\IPlanService;
use App\Interface\Service\IReactionService;
use App\Interface\Service\IUserCompanyService;
use App\Interface\Service\IUserRequirementService; // Added
use App\Interface\Service\IUserService;
use App\Interface\Service\IUserSubscriptionService;
use App\Repository\CarPostingRepo;
use App\Repository\CarRentalRepo;
use App\Repository\CarRepo;
use App\Repository\CommentRepo;
use App\Repository\DeviceRepo;
use App\Repository\DeviceLocationRepo;
use App\Repository\PlanFeatureRepo;
use App\Repository\PlanRepo;
use App\Repository\ReactionRepo;
use App\Repository\UserCompanyRepo;
use App\Repository\UserRepo;
use App\Repository\UserRequirementRepo; // Added
use App\Repository\RequirementRepo;
use App\Repository\UserSubscriptionRepo;
use App\Service\CarPostingService;
use App\Service\CarRentalService;
use App\Service\CarService;
use App\Service\CommentService;
use App\Service\DeviceService;
use App\Service\DeviceLocationService;
use App\Service\RequirementService;
use App\Service\PlanFeatureService;
use App\Service\PlanService;
use App\Service\ReactionService;
use App\Service\UserCompanyService;
use App\Service\UserRequirementService; // Added
use App\Service\UserService;
use Carbon\CarbonInterval;
use Illuminate\Support\ServiceProvider;
use Laravel\Passport\Passport;
use UserSubscriptionService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Repo
        $this->app->bind(IUserRepo::class, UserRepo::class);
        $this->app->bind(IPlanRepo::class, PlanRepo::class);
        $this->app->bind(IUserCompanyRepo::class, UserCompanyRepo::class);
        $this->app->bind(IPlanFeatureRepo::class, PlanFeatureRepo::class);
        $this->app->bind(ICarRepo::class, CarRepo::class);
        $this->app->bind(ICarPostingRepo::class, CarPostingRepo::class);
        $this->app->bind(ICarRentalRepo::class, CarRentalRepo::class);
        $this->app->bind(
            IUserRequirementRepo::class,
            UserRequirementRepo::class,
        );
        $this->app->bind(IRequirementRepo::class, RequirementRepo::class);
        $this->app->bind(
            IUserSubscriptionRepo::class,
            UserSubscriptionRepo::class,
        );
        $this->app->bind(IReactionRepo::class, ReactionRepo::class);
        $this->app->bind(ICommentRepo::class, CommentRepo::class);
        $this->app->bind(IDeviceRepo::class, DeviceRepo::class);
        $this->app->bind(IDeviceLocationRepo::class, DeviceLocationRepo::class);
        // Services
        $this->app->bind(IUserService::class, UserService::class);
        $this->app->bind(IPlanService::class, PlanService::class);
        $this->app->bind(IUserCompanyService::class, UserCompanyService::class);
        $this->app->bind(IPlanFeatureService::class, PlanFeatureService::class);
        $this->app->bind(ICarService::class, CarService::class);
        $this->app->bind(ICarPostingService::class, CarPostingService::class);
        $this->app->bind(ICarRentalService::class, CarRentalService::class);
        $this->app->bind(
            IUserRequirementService::class,
            UserRequirementService::class,
        );
        $this->app->bind(IRequirementService::class, RequirementService::class);
        $this->app->bind(
            IUserSubscriptionService::class,
            UserSubscriptionService::class,
        );
        $this->app->bind(IReactionService::class, ReactionService::class);
        $this->app->bind(ICommentService::class, CommentService::class);
        $this->app->bind(IDeviceService::class, DeviceService::class);
        $this->app->bind(
            IDeviceLocationService::class,
            DeviceLocationService::class,
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
        Passport::tokensExpireIn(CarbonInterval::days(15));
        Passport::refreshTokensExpireIn(CarbonInterval::days(30));
        Passport::personalAccessTokensExpireIn(CarbonInterval::months(6));
    }
}
