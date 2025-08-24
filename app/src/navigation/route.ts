type RouteConfig<T extends string> = {
  key: T;
  parse: T extends `${string}:${string}`
    ? (...args: (string | number | undefined)[]) => string
    : () => string;
};

type RouteStructure = {
  Auth: {
    Login: RouteConfig<'/auth/login'>;
    Register: RouteConfig<'/auth/register'>;
  };
  Admin: {
    Dashboard: RouteConfig<'/admin/dashboard'>;
    UserConfig: RouteConfig<'/admin/user-config'>;
    CompanyConfig: RouteConfig<'/admin/company-config'>;
    PlanConfig: RouteConfig<'/admin/plan-config'>;
    PlanFeatureConfig: RouteConfig<'/admin/plan-config/features/:id'>;
  };
  User: {
    Dashboard: RouteConfig<'/user/dashboard'>;
    CompanyConfig: RouteConfig<'/user/company-config'>;
    CompanyCars: RouteConfig<'/user/company-config/cars/:company_id'>;
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
  Auth: {
    Login: createRoute('/auth/login'),
    Register: createRoute('/auth/register'),
  },
  Admin: {
    Dashboard: createRoute('/admin/dashboard'),
    UserConfig: createRoute('/admin/user-config'),
    CompanyConfig: createRoute('/admin/company-config'),
    PlanConfig: createRoute('/admin/plan-config'),
    PlanFeatureConfig: createRoute('/admin/plan-config/features/:id'),
  },
  User: {
    Dashboard: createRoute('/user/dashboard'),
    CompanyConfig: createRoute('/user/company-config'),
    CompanyCars: createRoute('/user/company-config/cars/:company_id'),
  },
});
