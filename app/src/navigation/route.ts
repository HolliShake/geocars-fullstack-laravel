type RouteConfig<T extends string> = {
  key: T;
  parse: T extends `${string}:${string}`
    ? (...args: (string | number | undefined)[]) => string
    : () => string;
};

type RouteStructure = {
  Public: {
    Forbidden: RouteConfig<'/403'>;
    NotFound: RouteConfig<'/404'>;
  };
  Auth: {
    Login: RouteConfig<'/auth/login'>;
    Signup: RouteConfig<'/auth/signup'>;
    Profile: RouteConfig<'/profile'>;
  };
  Admin: {
    Dashboard: RouteConfig<'/admin/dashboard'>;
    UserConfig: RouteConfig<'/admin/user-config'>;
    CompanyConfig: RouteConfig<'/admin/company-config'>;
    CompanyCar: RouteConfig<'/admin/company-config/cars/:company_id'>;
    PlanConfig: RouteConfig<'/admin/plan-config'>;
    PlanFeatureConfig: RouteConfig<'/admin/plan-config/features/:id'>;
    RequirementConfig: RouteConfig<'/admin/requirement-config'>;
  };
  User: {
    Dashboard: RouteConfig<'/user/dashboard'>;
    CarRental: RouteConfig<'/user/car-rental'>;
    CarRentalApplication: RouteConfig<'/user/car-rental/application/:id'>;
    CarRentalViewLocation: RouteConfig<'/user/car-rental/:id/view-location'>;
    CarPosting: RouteConfig<'/user/car-posting'>;
    QuickCar: RouteConfig<'/user/quick-car'>;
    CompanyConfig: RouteConfig<'/user/company-config'>;
    Account: RouteConfig<'/user/account'>;
    CompanyCar: RouteConfig<'/user/company-config/cars/:company_id'>;
  };
  Renter: {
    Browse: RouteConfig<'/renter/browse'>;
    Application: RouteConfig<'/renter/browse/:postingId'>;
    Renter: RouteConfig<'/renter/rental'>;
    CheckoutSuccess: RouteConfig<'/renter/checkout/success'>;
    CheckoutCancel: RouteConfig<'/renter/checkout/cancel'>;
  };
};

function createRoute<T extends string>(key: T): RouteConfig<T> {
  const hasParams = key.includes(':');

  if (hasParams) {
    return {
      key,
      parse: (...args: (string | number | undefined)[]) => {
        let result = key;
        const params = key.match(/:(\w+)/g) || [];

        params.forEach((param, index) => {
          const value = args[index];
          result = result.replace(param, String(value ?? '')) as T;
        });

        return result;
      },
    } as RouteConfig<T>;
  }

  return {
    key,
    parse: () => key,
  } as RouteConfig<T>;
}

export const RouteKey: RouteStructure = Object.freeze<RouteStructure>({
  Public: {
    Forbidden: createRoute('/403'),
    NotFound: createRoute('/404'),
  },
  Auth: {
    Login: createRoute('/auth/login'),
    Signup: createRoute('/auth/signup'),
    Profile: createRoute('/profile'),
  },
  Admin: {
    Dashboard: createRoute('/admin/dashboard'),
    UserConfig: createRoute('/admin/user-config'),
    CompanyConfig: createRoute('/admin/company-config'),
    CompanyCar: createRoute('/admin/company-config/cars/:company_id'),
    PlanConfig: createRoute('/admin/plan-config'),
    PlanFeatureConfig: createRoute('/admin/plan-config/features/:id'),
    RequirementConfig: createRoute('/admin/requirement-config'),
  },
  User: {
    Dashboard: createRoute('/user/dashboard'),
    CarRental: createRoute('/user/car-rental'),
    CarRentalApplication: createRoute('/user/car-rental/application/:id'),
    CarRentalViewLocation: createRoute('/user/car-rental/:id/view-location'),
    CarPosting: createRoute('/user/car-posting'),
    QuickCar: createRoute('/user/quick-car'),
    CompanyConfig: createRoute('/user/company-config'),
    Account: createRoute('/user/account'),
    CompanyCar: createRoute('/user/company-config/cars/:company_id'),
  },
  Renter: {
    Browse: createRoute('/renter/browse'),
    Application: createRoute('/renter/browse/:postingId'),
    Renter: createRoute('/renter/rental'),
    CheckoutSuccess: createRoute('/renter/checkout/success'),
    CheckoutCancel: createRoute('/renter/checkout/cancel'),
  },
});
