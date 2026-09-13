# Salesforce CI/CD

This project uses GitHub Actions for two gates:

- Pull requests to `main` run linting, LWC tests, formatting checks, and a Salesforce validation deployment.
- Pushes to `main` run the same checks and deploy `force-app` to the configured Salesforce org.

## One-time GitHub setup

1. Create a GitHub repository and push this project to it.
2. In GitHub, open **Settings > Environments** and create:
   - `salesforce-validation`
   - `salesforce-production`
3. Add the repository secret `SFDX_AUTH_URL` to both environments. Use a dedicated CI integration user and connected app for this secret, not a personal password.
4. Add a required status check for `Verify source` on the `main` branch. Protect `main` so changes arrive through pull requests.
5. Add an approval rule to `salesforce-production` if production deployment should require a human approval.

The workflow intentionally skips Salesforce validation for pull requests from forks because GitHub does not expose repository secrets to fork workflows. The source checks still run.

## Authentication secret

The secret must contain the Salesforce SFDX auth URL for the CI user. Generate it from a secure machine using the Salesforce CLI auth-url command or your organization's approved connected-app process. Never commit the URL, an access token, or a private key to Git.

## Local workflow

```powershell
git checkout -b feature/my-change
npm run ci:verify
git add .
git commit -m "Add my change"
git push -u origin feature/my-change
```

Open a pull request into `main`. After review and a successful validation, merge it. The push to `main` then deploys the metadata automatically.
