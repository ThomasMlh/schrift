import { useSearchParams, useRouter, usePathname } from 'next/navigation';

type SetSearchParams = (params: URLSearchParams | Record<string, string>) => void;

export function useNextSearchParams(): [ReturnType<typeof useSearchParams>, SetSearchParams] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setSearchParams: SetSearchParams = (params) => {
    const qs =
      params instanceof URLSearchParams
        ? params.toString()
        : new URLSearchParams(params).toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  return [searchParams, setSearchParams];
}
