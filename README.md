# Euro banknotes, the duel

An unofficial, English/French/Czech pairwise comparison of the ten shortlisted future euro banknote designs. It is a dependency-free static site: all choices stay in the visitor's browser and nothing is submitted to the ECB.

Completed rankings can be shared through a score-only URL fragment. Shared links reveal no individual matchup choices, require no backend, and open as a read-only result without replacing the recipient's saved comparison.

## Run locally

```sh
npm run serve
```

Then open <http://localhost:8000>. Run the tournament and asset tests with `npm test`.

## Deploy

Push to the `main` branch and select **GitHub Actions** as the Pages source in the repository settings. The included workflow tests and deploys the contents of `site/` without a build step.

## Image use

The banknote images are unaltered design proposals sourced from the European Central Bank. This non-commercial project is informational and is not affiliated with or endorsed by the ECB or Eurosystem. See the [ECB's conditions of use](https://www.ecb.europa.eu/services/data-protection/privacy-statements/html/ecb.terms_use_design_proposals.en.html).
