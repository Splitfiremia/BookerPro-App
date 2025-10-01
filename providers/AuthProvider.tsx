import { StreamlinedAuthProvider, useStreamlinedAuth } from './StreamlinedAuthProvider';
import type { User } from './StreamlinedAuthProvider';

export type { User };
export const AuthProvider = StreamlinedAuthProvider;
export const useAuth = useStreamlinedAuth;
