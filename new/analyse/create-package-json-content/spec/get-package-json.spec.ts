/* eslint-env node, jest */
import { CoreProperties as PackageJson } from '@schemastore/package';

import type {
  Env,
  Package,
  PackageAfterPrepareChangelogs,
  PackageAfterCreatePackageJsonContent,
  RelatedPackageDependsOn,
} from '../../../types';
import { getPackageJson } from '../get-package-json';

// mock Packages
const mockPackageJsonBuilder = (
  packageName: string,
  dependencies: PackageJson['dependencies'],
  devDependencies: PackageJson['devDependencies'],
  peerDependencies: PackageJson['peerDependencies']
): PackageJson => ({
  name: packageName,
  version: '1.2.3',
  dependencies,
  devDependencies,
  peerDependencies,
});

const getDependsOn = (
  dependencies: NonNullable<
    | PackageJson['dependencies']
    | PackageJson['devDependencies']
    | PackageJson['peerDependencies']
  >,
  type: RelatedPackageDependsOn['type']
): RelatedPackageDependsOn[] =>
  Object.entries(dependencies).map(([name, version]) => ({
    name,
    range: version,
    type,
  }));

const mockPackageBuilder = (
  id: number,
  dependencies: PackageJson['dependencies'] = {},
  devDependencies: PackageJson['devDependencies'] = {},
  peerDependencies: PackageJson['peerDependencies'] = {}
): Package | PackageAfterPrepareChangelogs => ({
  path: `mock/path/to/package_${id}/`,
  packageJson: mockPackageJsonBuilder(
    `mock${id}Package`,
    dependencies,
    peerDependencies,
    devDependencies
  ),
  messages: [],
  relatedMessages: [],
  determinedIncrementLevel: 1,
  dependingOnThis: [],
  dependsOn: [
    ...getDependsOn(dependencies, 'default'),
    ...getDependsOn(devDependencies, 'dev'),
    ...getDependsOn(peerDependencies, 'peer'),
  ],
  incrementedVersion: '1.1.3',
});

const externalPackages = {
  lodash: '5.0.0',
  react: '17.0.0',
};

describe('get-package-json helper', () => {
  describe.each`
    dependencies                                      | peerDependencies                                  | devDependencies                                   | type
    ${{}}                                             | ${{}}                                             | ${{}}                                             | ${'npm'}
    ${{}}                                             | ${{}}                                             | ${{}}                                             | ${'git'}
    ${{ ...externalPackages }}                        | ${{}}                                             | ${{}}                                             | ${'npm'}
    ${{ ...externalPackages }}                        | ${{}}                                             | ${{}}                                             | ${'git'}
    ${{}}                                             | ${{ ...externalPackages }}                        | ${{}}                                             | ${'npm'}
    ${{}}                                             | ${{ ...externalPackages }}                        | ${{}}                                             | ${'git'}
    ${{}}                                             | ${{}}                                             | ${{ ...externalPackages }}                        | ${'npm'}
    ${{}}                                             | ${{}}                                             | ${{ ...externalPackages }}                        | ${'git'}
    ${{ mockPackage2: '1.2.3' }}                      | ${{}}                                             | ${{}}                                             | ${'npm'}
    ${{ mockPackage2: '1.2.3' }}                      | ${{}}                                             | ${{}}                                             | ${'git'}
    ${{}}                                             | ${{ mockPackage3: '1.0.0' }}                      | ${{}}                                             | ${'npm'}
    ${{}}                                             | ${{ mockPackage3: '1.0.0' }}                      | ${{}}                                             | ${'git'}
    ${{}}                                             | ${{}}                                             | ${{ mockPackage4: '2.5.0' }}                      | ${'npm'}
    ${{}}                                             | ${{}}                                             | ${{ mockPackage4: '2.5.0' }}                      | ${'git'}
    ${{ mockPackage2: '1.2.3' }}                      | ${{ mockPackage3: '1.0.0' }}                      | ${{ mockPackage4: '2.5.0' }}                      | ${'npm'}
    ${{ mockPackage2: '1.2.3' }}                      | ${{ mockPackage3: '1.0.0' }}                      | ${{ mockPackage4: '2.5.0' }}                      | ${'git'}
    ${{ mockPackage2: '1.2.3', ...externalPackages }} | ${{ mockPackage3: '1.0.0' }}                      | ${{ mockPackage4: '2.5.0' }}                      | ${'npm'}
    ${{ mockPackage2: '1.2.3', ...externalPackages }} | ${{ mockPackage3: '1.0.0' }}                      | ${{ mockPackage4: '2.5.0' }}                      | ${'git'}
    ${{ mockPackage2: '1.2.3' }}                      | ${{ mockPackage3: '1.0.0', ...externalPackages }} | ${{ mockPackage4: '2.5.0' }}                      | ${'npm'}
    ${{ mockPackage2: '1.2.3' }}                      | ${{ mockPackage3: '1.0.0', ...externalPackages }} | ${{ mockPackage4: '2.5.0' }}                      | ${'git'}
    ${{ mockPackage2: '1.2.3' }}                      | ${{ mockPackage3: '1.0.0' }}                      | ${{ mockPackage4: '2.5.0', ...externalPackages }} | ${'npm'}
    ${{ mockPackage2: '1.2.3' }}                      | ${{ mockPackage3: '1.0.0' }}                      | ${{ mockPackage4: '2.5.0', ...externalPackages }} | ${'git'}
  `(
    'processing package for $type with $dependencies dependencies, $peerDependencies peerDependencies and $devDependencies devDependencies',
    ({ dependencies, peerDependencies, devDependencies, type }) => {
      let result:
        | PackageAfterCreatePackageJsonContent['packageJsonNpm']
        | PackageAfterCreatePackageJsonContent['packageJsonGit'];

      let isNpm = type === 'npm';
      let packages: NonNullable<Env['packages']> = {
        mockPackage1: mockPackageBuilder(
          1,
          dependencies,
          peerDependencies,
          devDependencies
        ),
        mockPackage2: mockPackageBuilder(2),
        mockPackage3: mockPackageBuilder(3),
        mockPackage4: mockPackageBuilder(4),
      };
      beforeAll(() => {
        result = getPackageJson(packages, 'mockPackage1', type);
      });

      Object.entries(dependencies).forEach(([name, version]) => {
        if (name in packages) {
          it(`sets version for "${name}" (internal dependency) to "${
            isNpm ? version : '*'
          }"`, () => {
            expect(result).toHaveProperty(
              `dependencies.${name}`,
              isNpm ? version : '*'
            );
          });
        } else {
          it(`version for "${name}" (external dependency) is left untouched on "${version}"`, () => {
            expect(result).toHaveProperty(`dependencies.${name}`, version);
          });
        }
      });
      Object.entries(peerDependencies).forEach(([name, version]) => {
        if (name in packages) {
          it(`sets version for "${name}" (internal peerDependency) to "${
            isNpm ? version : '*'
          }"`, () => {
            expect(result).toHaveProperty(
              `peerDependencies.${name}`,
              isNpm ? version : '*'
            );
          });
        } else {
          it(`version for "${name}" (external peerDependency) is left untouched on "${version}"`, () => {
            expect(result).toHaveProperty(`peerDependencies.${name}`, version);
          });
        }
      });

      Object.entries(devDependencies).forEach(([name, version]) => {
        const devDependencyPath = `devDependencies.${name}`;
        if (name in packages) {
          it(`sets version for "${name}" (internal devDependency) to`, () => {
            expect(result).toHaveProperty(devDependencyPath, '*');
          });
        } else {
          it(`version for "${name}" (external devDependency) is left untouched on ${version}`, () => {
            expect(result).toHaveProperty(devDependencyPath, version);
          });
        }
      });

      if (
        Object.keys(dependencies).length === 0 &&
        Object.keys(devDependencies).length === 0 &&
        Object.keys(peerDependencies).length === 0
      ) {
        it('returns the packageJson untouched', () => {
          expect(result).toEqual(packages.mockPackage1.packageJson);
        });
      }
    }
  );
});
