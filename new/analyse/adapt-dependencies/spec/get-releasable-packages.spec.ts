/* eslint-env node, jest */
import type { Package, PackageAfterDetermineVersion } from '../../../types';

import { getReleasablePackages } from '../get-releasable-packages';

// mock Packages
const mockPackageBuilder: (
  name: string,
  incrementedVersion?: string
) => Package | PackageAfterDetermineVersion = (name, incrementedVersion) => ({
  currentVersion: '1.0.0',
  path: 'mock/path/to/package',
  packageJson: { name },
  messages: [],
  relatedMessages: [],
  determinedIncrementLevel: -1,
  dependingOnThis: [],
  dependsOn: [],
  ...(incrementedVersion ? { incrementedVersion } : {}),
});

describe('getReleasablePackages helper', () => {
  let result: string[];
  beforeAll(() => {
    const mockPackages: Record<string, Package | PackageAfterDetermineVersion> =
      {
        mockPackage1: mockPackageBuilder('mockPackage1', '1.0.0'),
        mockPackage2: mockPackageBuilder('mockPackage2'),
        mockPackage3: mockPackageBuilder('mockPackage3', '2.9.99'),
        mockPackage4: mockPackageBuilder('mockPackage4'),
      };
    result = getReleasablePackages(mockPackages);
  });

  it('filters releasable packages from non-releasable ones', () => {
    expect(result).toEqual(['mockPackage1', 'mockPackage3']);
  });
});
