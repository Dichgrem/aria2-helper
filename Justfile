set shell := ["bash", "-c"]

@default:
	@just --list

@install:
	pnpm install

@download-ariang:
	pnpm run download:ariang

@format:
	biome format --write entrypoints/ lib/ scripts/

@lint:
	biome check entrypoints/ lib/ scripts/ wxt.config.ts

@lint-fix:
	biome check --write --unsafe entrypoints/ lib/ scripts/ wxt.config.ts

@test:
	pnpm run test

@test-watch:
	pnpm run test:watch

@dev:
	pnpm run dev

@dev-firefox:
  pnpm run dev:firefox

@build:
	pnpm run build

@build-firefox:
  pnpm run build:firefox

@zip:
	pnpm run zip

@zip-firefox:
  pnpm run zip:firefox
