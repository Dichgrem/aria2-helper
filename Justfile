set shell := ["bash", "-c"]

@default:
	@just --list

@install:
	pnpm install

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

@download-ariang:
	pnpm run download:ariang

@lint:
	biome check entrypoints/ wxt.config.ts

@lint-fix:
	biome check --write --unsafe entrypoints/ wxt.config.ts

@format:
	biome format --write entrypoints/
