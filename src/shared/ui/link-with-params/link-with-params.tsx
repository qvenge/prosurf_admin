'use client';

import { Link, useSearchParams } from 'react-router';

type LinkProps = Parameters<typeof Link>[0];

export interface LinkWithParamsProps extends LinkProps {
  params?: Record<string, string>;
} 

export function LinkWithParams({ to: href, params, ...props }: LinkWithParamsProps) {
  const [searchParams] = useSearchParams();
  const query = {...Object.fromEntries(searchParams), ...params};

  return <Link
    to={{
      pathname: typeof href === 'string' ? href : href.pathname,
      search: new URLSearchParams(query).toString()
    }}
    {...props}
  />;
}