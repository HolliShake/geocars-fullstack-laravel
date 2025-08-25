/* eslint-disable react-hooks/exhaustive-deps */
import useCompanyStore from '@/store/company.store';
import { useGetUserCompanyPaginated } from '@rest/api';
import { useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export default function CompanySelect(): React.ReactNode {
  const { data } = useGetUserCompanyPaginated({
    search: '',
    page: 1,
    rows: Number.MAX_SAFE_INTEGER,
    current_user: true,
  });

  const { selectedCompany, setSelectedCompany } = useCompanyStore();

  const companies = useMemo(() => {
    if (!data?.data?.data) return [];
    return data?.data.data.map((company) => company);
  }, [data]);

  const handleSelect = (value: string) => {
    const company = companies.find((company) => company.id?.toString() === value);
    if (company) {
      setSelectedCompany(company);
    }
  };

  useEffect(() => {
    if (companies.length > 0) {
      setSelectedCompany(companies[0]);
    }
  }, [companies]);

  return (
    <Select value={selectedCompany?.id?.toString() ?? '0'} onValueChange={handleSelect}>
      <SelectTrigger>
        <SelectValue placeholder="Select a company" />
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id?.toString() ?? '0'}>
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
