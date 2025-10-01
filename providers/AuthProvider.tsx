import { StreamlinedAuthProvider, useStreamlinedAuth } from './StreamlinedAuthProvider';

export { User } from './StreamlinedAuthProvider';

export const AuthProvider = StreamlinedAuthProvider;
export const useAuth = useStreamlinedAuth;
