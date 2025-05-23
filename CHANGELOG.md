# Changelog

## [3.1.0](https://github.com/folke/lovelace-styler/compare/v3.0.0...v3.1.0) (2025-05-12)


### Features

* **tile:** added fade animation (similar to pulse) ([e4fb6c9](https://github.com/folke/lovelace-styler/commit/e4fb6c90ffe60d0c656e56056def3c971bf79a2c))


### Bug Fixes

* support for HA 2025.5.1 ([14030aa](https://github.com/folke/lovelace-styler/commit/14030aa245602b4b696069549bbe1c6a5d2a70c8))
* **tile:** fix custom css for latest home assistant release ([c4cf5ad](https://github.com/folke/lovelace-styler/commit/c4cf5ad23939e1707930a96e4ab052eeaf862ee6))

## [3.0.0](https://github.com/folke/lovelace-styler/compare/v2.0.0...v3.0.0) (2024-03-09)


### ⚠ BREAKING CHANGES

* removed custom:tile-icon. Use type:tile with info=false instead

### Features

* added custom tile options info=false, animation=spin|pulse ([1d2ebad](https://github.com/folke/lovelace-styler/commit/1d2ebaddbc645e36ae87ac056ae356042f239bc8))
* removed custom:tile-icon. Use type:tile with info=false instead ([5e0e3ae](https://github.com/folke/lovelace-styler/commit/5e0e3ae0b52437af940163274f12c1a9a37742a2))

## [2.0.0](https://github.com/folke/lovelace-styler/compare/v1.5.1...v2.0.0) (2024-03-08)


### ⚠ BREAKING CHANGES

* ha core now supports `layout_options`, so use that instead of styler card_size and styler grid_size

### Features

* ha core now supports `layout_options`, so use that instead of styler card_size and styler grid_size ([b927732](https://github.com/folke/lovelace-styler/commit/b9277324e3933abc7a4aa461517fc21206e4b82b))

## [1.5.1](https://github.com/folke/lovelace-styler/compare/v1.5.0...v1.5.1) (2024-03-06)


### Bug Fixes

* **patch:** make sure existing tags are real custom elements before patching ([057ca0b](https://github.com/folke/lovelace-styler/commit/057ca0bac9e44f276545b1ea4b1473dcb2188aab))
* **styler:** always re-apply styles when a card's config changed ([177554f](https://github.com/folke/lovelace-styler/commit/177554f794a5ff30e079b8c2816286a000157746))

## [1.5.0](https://github.com/folke/lovelace-styler/compare/v1.4.1...v1.5.0) (2024-03-06)


### Features

* better and more correct way of hooking into custom elements ([96bea02](https://github.com/folke/lovelace-styler/commit/96bea02b06b0d107c692e338d6cccc0402abe6bf))
* helpers for dealing with grid cards ([fe90ca7](https://github.com/folke/lovelace-styler/commit/fe90ca79d5a46668f98a9ae003f936392b824a26))
* refactor ALL THE THINGS ([b704cd2](https://github.com/folke/lovelace-styler/commit/b704cd2043f0cb01f4a7baf2b7412902d615451e))
* simple tile-icon card ([e389fc5](https://github.com/folke/lovelace-styler/commit/e389fc5bdf9bf4f4746c967d196aa1e4ea14fc9c))
* visual editor support ([f816040](https://github.com/folke/lovelace-styler/commit/f816040470a7448e041afdf144bce47db1ea9b29))

## [1.4.1](https://github.com/folke/lovelace-styler/compare/v1.4.0...v1.4.1) (2024-02-08)


### Bug Fixes

* properly update when rendering inside the card editor ([b9519b7](https://github.com/folke/lovelace-styler/commit/b9519b7032d649356cccfc9733a926bc01601186))
* remove card style when an ancestor has `card: false` ([b824273](https://github.com/folke/lovelace-styler/commit/b8242731c6ce36cb993e11206715276292b9403d))

## [1.4.0](https://github.com/folke/lovelace-styler/compare/v1.3.0...v1.4.0) (2024-02-07)


### Features

* added image ([b380acd](https://github.com/folke/lovelace-styler/commit/b380acdef3c0e16a4dbebb2fcc70769798893c62))
* added support for styler.size ([ebcd724](https://github.com/folke/lovelace-styler/commit/ebcd72488eca3bd8371de491720f38a41890dee5))
* initial release ([26c6556](https://github.com/folke/lovelace-styler/commit/26c65562b30546455a8b5ec7ab78dce771bbfdfe))
* initial version ([2e6b857](https://github.com/folke/lovelace-styler/commit/2e6b857cba288d1c0c389954ceff684a80e13ef1))


### Bug Fixes

* always update the top-level card when in the preview editor ([845106c](https://github.com/folke/lovelace-styler/commit/845106cdb62855ab74a5cfebfa13d00e7262b70d))
* dont include tags in version for HACS ([ff76f92](https://github.com/folke/lovelace-styler/commit/ff76f9251b2ef4af7db58115076df62a4a24e08c))
* update version in src/styler.ts ([da73298](https://github.com/folke/lovelace-styler/commit/da732988173f1c78630ba914d96852745d3106c6))
* version for release-please ([ad64d18](https://github.com/folke/lovelace-styler/commit/ad64d18cb85eef1d915f747c2f4b65cfde7d77f6))

## [1.3.0](https://github.com/folke/lovelace-styler/compare/styler-v1.2.1...styler-v1.3.0) (2024-02-07)


### Features

* added image ([b380acd](https://github.com/folke/lovelace-styler/commit/b380acdef3c0e16a4dbebb2fcc70769798893c62))
* added support for styler.size ([ebcd724](https://github.com/folke/lovelace-styler/commit/ebcd72488eca3bd8371de491720f38a41890dee5))
* initial release ([26c6556](https://github.com/folke/lovelace-styler/commit/26c65562b30546455a8b5ec7ab78dce771bbfdfe))
* initial version ([2e6b857](https://github.com/folke/lovelace-styler/commit/2e6b857cba288d1c0c389954ceff684a80e13ef1))


### Bug Fixes

* always update the top-level card when in the preview editor ([845106c](https://github.com/folke/lovelace-styler/commit/845106cdb62855ab74a5cfebfa13d00e7262b70d))
* update version in src/styler.ts ([da73298](https://github.com/folke/lovelace-styler/commit/da732988173f1c78630ba914d96852745d3106c6))
* version for release-please ([ad64d18](https://github.com/folke/lovelace-styler/commit/ad64d18cb85eef1d915f747c2f4b65cfde7d77f6))

## [1.2.1](https://github.com/folke/lovelace-styler/compare/v1.2.0...v1.2.1) (2024-02-07)


### Bug Fixes

* always update the top-level card when in the preview editor ([845106c](https://github.com/folke/lovelace-styler/commit/845106cdb62855ab74a5cfebfa13d00e7262b70d))
* update version in src/styler.ts ([da73298](https://github.com/folke/lovelace-styler/commit/da732988173f1c78630ba914d96852745d3106c6))

## [1.2.0](https://github.com/folke/lovelace-styler/compare/v1.1.0...v1.2.0) (2024-02-07)


### Features

* added image ([b380acd](https://github.com/folke/lovelace-styler/commit/b380acdef3c0e16a4dbebb2fcc70769798893c62))

## [1.1.0](https://github.com/folke/lovelace-styler/compare/v1.0.0...v1.1.0) (2024-02-07)


### Features

* added support for styler.size ([ebcd724](https://github.com/folke/lovelace-styler/commit/ebcd72488eca3bd8371de491720f38a41890dee5))
* initial release ([26c6556](https://github.com/folke/lovelace-styler/commit/26c65562b30546455a8b5ec7ab78dce771bbfdfe))
* initial version ([2e6b857](https://github.com/folke/lovelace-styler/commit/2e6b857cba288d1c0c389954ceff684a80e13ef1))

## 1.0.0 (2024-02-07)


### Features

* added support for styler.size ([ebcd724](https://github.com/folke/lovelace-styler/commit/ebcd72488eca3bd8371de491720f38a41890dee5))
* initial release ([26c6556](https://github.com/folke/lovelace-styler/commit/26c65562b30546455a8b5ec7ab78dce771bbfdfe))
* initial version ([2e6b857](https://github.com/folke/lovelace-styler/commit/2e6b857cba288d1c0c389954ceff684a80e13ef1))

## 1.0.0 (2024-02-07)


### Features

* added support for styler.size ([ebcd724](https://github.com/folke/lovelace-styler/commit/ebcd72488eca3bd8371de491720f38a41890dee5))
* initial release ([841a626](https://github.com/folke/lovelace-styler/commit/841a626512ff20ceb4f0679e7365e60dcd110889))
* initial version ([2e6b857](https://github.com/folke/lovelace-styler/commit/2e6b857cba288d1c0c389954ceff684a80e13ef1))

## 1.0.0 (2024-02-07)


### Features

* added support for styler.size ([ebcd724](https://github.com/folke/lovelace-styler/commit/ebcd72488eca3bd8371de491720f38a41890dee5))
* initial version ([2e6b857](https://github.com/folke/lovelace-styler/commit/2e6b857cba288d1c0c389954ceff684a80e13ef1))
* prepping first release ([bba335d](https://github.com/folke/lovelace-styler/commit/bba335d1ae4f90104ac3246fa5c27c9dd482d5e6))
