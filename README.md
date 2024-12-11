# h3m-studio-ai-web3

## Development Workflow

### Standard Development Process
1. **Start New Work**
   ```bash
   # Ensure you're up to date
   git checkout development
   git pull origin development
   
   # Create feature branch
   git checkout -b feature/your-feature-name
   ```

2. **During Development**
   - Make small, focused commits
   - Keep changes atomic and related
   - Update README.md if you've made:
     - Architecture changes
     - New dependencies
     - API changes
     - Configuration changes
     - New features
     - Workflow changes

3. **Before Committing**
   ```bash
   # Review your changes
   git status
   git diff
   
   # Update README if needed
   vim README.md  # Or your editor of choice
   
   # Stage and commit
   git add .
   git commit -m "type: Brief description
   
   - Detailed bullet points
   - Explaining the changes
   - And their impact"
   ```

4. **Commit Message Format**
   ```
   type: Subject line (50 chars max)
   
   - Detailed explanation point 1
   - Impact of changes
   - Breaking changes
   - New dependencies
   - Migration steps if any
   ```
   Types:
   - feat: New feature
   - fix: Bug fix
   - docs: Documentation
   - style: Formatting
   - refactor: Code restructure
   - test: Testing
   - chore: Maintenance

5. **Push Changes**
   ```bash
   # First push
   git push -u origin feature/your-feature-name
   
   # Subsequent pushes
   git push
   ```

6. **Create Pull Request**
   - Create PR to development branch
   - Fill out PR template
   - Request reviews
   - Address feedback

### README Update Guidelines
Always update README.md when you:
- Add new environment variables
- Change configuration files
- Add new dependencies
- Create new scripts
- Change build process
- Add new commands
- Modify deployment steps
- Change architecture
- Add new features

### Code Quality Checklist
Before submitting PR:
- [ ] Updated README if necessary
- [ ] Added/Updated tests
- [ ] Checked lint errors
- [ ] Verified build succeeds
- [ ] Tested locally
- [ ] Updated dependencies
- [ ] Added error handling
- [ ] Included types
- [ ] Documented complex logic

## GitHub Pipeline & Branching Strategy

### Branch Structure
```
main (production)
  └── development (main development branch)
      └── staging (pre-production testing)
          └── feature branches (e.g., admin-dashboard)
```

### Branch Purposes
- **main**: Production branch, contains deployed code
- **development**: Main integration branch for features
- **staging**: Pre-production testing environment
- **feature branches**: Individual feature development

### Workflow
1. **Feature Development**
   ```bash
   # Create feature branch from development
   git checkout development
   git pull
   git checkout -b feature/new-feature
   
   # Work on feature and commit
   git add .
   git commit -m "feat: Add new feature"
   
   # Push to remote
   git push -u origin feature/new-feature
   ```

2. **Code Review Process**
   - Create PR from feature branch to `development`
   - Required reviews: 1
   - Pass all CI checks
   - No merge conflicts
   - Up-to-date with base branch

3. **Integration Testing**
   ```bash
   # After PR merge to development
   git checkout staging
   git pull
   git merge development
   git push origin staging
   ```

4. **Production Deployment**
   ```bash
   # After staging verification
   git checkout main
   git pull
   git merge staging
   git push origin main
   ```

### CI/CD Pipeline Stages

1. **Feature Branch Pipeline**
   - Lint checking
   - Type checking
   - Unit tests
   - Build verification

2. **Development Branch Pipeline**
   - All feature branch checks
   - Integration tests
   - Development deployment
   - E2E tests

3. **Staging Branch Pipeline**
   - All development checks
   - Performance tests
   - Security scans
   - Staging deployment

4. **Main Branch Pipeline**
   - All staging checks
   - Production build
   - Production deployment
   - Smoke tests

### Protection Rules

1. **Main Branch**
   - No direct pushes
   - Require PR reviews
   - Must be up to date
   - Must pass CI/CD
   - Linear history required

2. **Development/Staging**
   - No direct pushes
   - Require PR reviews
   - Must pass CI/CD
   - Allow rebase merging

3. **Feature Branches**
   - Must pass basic CI
   - Regular cleanup

### Deployment Environments

1. **Development**
   - Automatic deployment on merge
   - Development database
   - Debug enabled
   - Test API endpoints

2. **Staging**
   - Manual trigger required
   - Staging database
   - Production-like config
   - Staging API endpoints

3. **Production**
   - Manual approval required
   - Production database
   - Optimized build
   - Production API endpoints

### Quality Gates

1. **Code Quality**
   - ESLint rules pass
   - TypeScript strict mode
   - Test coverage > 80%
   - No critical security issues

2. **Performance**
   - Lighthouse score > 90
   - Bundle size limits
   - API response times
   - Memory usage thresholds

3. **Security**
   - OWASP scan pass
   - Dependency audit
   - ENV variables check
   - Authentication verification

### Emergency Procedures

1. **Hotfix Process**
   ```bash
   # Create hotfix branch from main
   git checkout main
   git checkout -b hotfix/critical-fix
   
   # Fix and commit
   git commit -m "fix: Critical issue"
   
   # Create PR to main AND development
   ```

2. **Rollback Process**
   ```bash
   # Revert last main commit
   git checkout main
   git revert HEAD
   git push origin main
   
   # Update other branches
   git checkout development
   git revert HEAD
   git push origin development
   ```

Remember to:
- Keep commits atomic and well-described
- Update documentation with changes
- Maintain clean git history
- Regular dependency updates
- Monitor deployment health
