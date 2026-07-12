# Changelog

All notable changes to F1 Telemetry (frontend) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/).

## About the version numbers here

F1 Telemetry (this repo) and its backend, `f1-api-ws`, ship independently and each
keeps its own `package.json` version for its own builds/releases. The versions in
**this file** track the product as a whole from a user's point of view, so they do
not have to match `package.json`'s `version` field, and `f1-api-ws`'s `CHANGELOG.md`
uses this same numbering. Bump the version here when a change is worth telling users
about, not on every commit.

A curated, translated subset of these entries is shown to users in-app at
`/changelog`, sourced from `lib/changelog/changelog.ts`. When you add an entry below
that's user-facing, add a matching item there (in English and Spanish) too.

## [Unreleased]

## [2.0.0] - 2026-07-12

### Added

- Role-based system: data and widgets are now shown/hidden depending on account type.
- In-app changelog at `/changelog`.

### Changed

- Reorganized the preferences menu, grouping options into categories.

### Fixed

- Session countdown timer bug.
- "Drivers about to be eliminated" indicator bug during qualifying.

### Removed

- Chat widget and the underlying chat system.
