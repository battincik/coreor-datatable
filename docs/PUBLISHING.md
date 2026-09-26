# Publish the npm package

The showcase is a Next.js site. Only `packages/coreor-datatable/` is the publishable package. Publishing npm is deliberately a separate, manual action; a GitHub commit does not create an npm release.

## First release

1. Create or use your own npm account. The package is named `@battincik/coreor-datatable`, so your npm account must own the `battincik` scope; GitHub ownership alone does not grant it. If needed, change the scope in the package metadata and examples before the first release.
2. Enable 2FA on your npm account. Run `npm login` and `npm whoami` locally. Never commit a token or an `.npmrc` containing credentials.
3. Run the checks and inspect the tarball:

   ```bash
   npm install
   npm test
   npm run build
   npm run pack:dry
   ```

4. Update `packages/coreor-datatable/package.json` version if the version already exists on npm. Then publish from the repository root:

   ```bash
   npm publish ./packages/coreor-datatable --access public
   ```

5. Verify the package on npm, install it in a separate React project, and tag the matching git commit, e.g. `v0.1.0`.

## Later updates

- Fix or extend the library source in `src/components/` and `src/lib/`. Keep usage examples and `docs/API.md` in sync.
- Use a new [semantic version](https://semver.org/) for each release (patch for compatible fixes, minor for compatible features, major for breaking changes). A published name/version pair cannot be reused.
- Run `npm test`, `npm run build`, `npm run pack:dry`; review the package contents and the generated declarations. Publish again with `npm publish ./packages/coreor-datatable --access public`.
- Optionally configure npm trusted publishing through GitHub Actions using OIDC and protected GitHub environments. Add a release workflow only after the first manual release and account ownership are verified; avoid long-lived tokens.

Set `NEXT_PUBLIC_SITE_URL` to your deployed showcase's actual origin for canonical URLs, sitemap and Open Graph metadata before a site deployment. Request indexing for its sitemap from Google Search Console after the site is live and verified.
