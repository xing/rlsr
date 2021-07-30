import type { Package, PackageAfterDetermineVersion } from '../types';

/**
 * Identifies and returns a collection of package names to be released
 */
export const getReleasablePackages = (
  packages: Record<string, Package | PackageAfterDetermineVersion>
): string[] =>
  Object.keys(packages).filter(
    (packageName) => 'incrementedVersion' in packages[packageName]
  );
