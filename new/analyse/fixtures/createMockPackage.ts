import { Package, PackageAfterDetermineVersion } from '../../types';

export const createMockPackage = (
  name: string,
  dependencies: Record<string, string> = {},
  peerDependencies: Record<string, string> = {},
  override: Partial<PackageAfterDetermineVersion> = {}
): Package => {
  return {
    currentVersion: '1.0.0',
    path: 'path/to/second/',
    packageJson: { name, dependencies, peerDependencies },
    messages: [],
    relatedMessages: [],
    determinedIncrementLevel: -1,
    dependingOnThis: [],
    dependsOn: [],
    ...override,
  };
};
