import { useProgramVersionByIdQuery } from './queries/useProgramVersionQuery';
import { useRealmParams } from './getRealm';

const useProgramVersion = () => {
  const { data: realm } = useRealmParams();
  const queriedVersion = useProgramVersionByIdQuery(realm?.owner).data as
    | 1
    | 2
    | 3
    | undefined;
  return queriedVersion;
};

export default useProgramVersion;
