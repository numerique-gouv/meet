# Releasing new version

Whenever we are cooking a new release (e.g. `4.18.1`) we should follow a standard procedure described below:

1. Create a new branch named: `release/4.18.1`.
2. Bump the release number in the appropriate file, i.e. for backend in the `pyproject.toml` and `package.json` for node-based projects (tips:  find and replace all occurrences of the previous version number to ensure consistency across files).
3. Update the project's `Changelog` following the [keepachangelog](https://keepachangelog.com/en/0.3.0/) recommendations.
4. Update Docker image tag in Helm values files located at `src/helm/env.d` for both `preprod` and `production` environments:
    ```yaml
    image:
      repository: lasuite/meet-backend
      pullPolicy: Always
      tag: "v4.18.1" # Replace with the latest Docker image tag.
    ```
5. Commit your changes with a structured message:
   - Add a title including the version of the release and respecting the above described format using the 🔖 release emoji.
   - Paste in the body all changes from the changelog concerned by this release, removing only the Markdown tags and making sure that lines are shorter than 74 characters.

    ```
    🔖(minor) bump release to 4.18.0
    
    Added:
    
    - Implement base CLI commands (list, extract, fetch & push) for supported backends
    - Support for ElasticSearch database backend
    
    Changed:
    
    - Replace LDP storage backend by FS storage backend`
    ```

6. Open a pull request. 
7. Wait for an approval from your peers. 
8. Merge your pull request. 
9. Checkout and pull changes from the `main` branch to ensure you have the latest updates. 
10. Tag & push your commit: `git tag v4.18.1 && git push origin --tags`
11. Manually release your version on GitHub.
12. Ensure that the CI Docker job has successfully pushed the newly built Docker images to Docker Hub with the appropriate tags.
13. To deploy using ArgoCD, you need to update the `production` or `pre-production` tags. ArgoCD will automatically detect and deploy the new tag.
