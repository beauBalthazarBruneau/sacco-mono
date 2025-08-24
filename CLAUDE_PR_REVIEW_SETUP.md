# Claude Code PR Review Setup

This document explains how to set up automated Claude Code PR reviews for the Sacco monorepo.

## 🚀 Quick Setup

1. **Install Claude GitHub App** (Repository Owner Required)
   ```bash
   # Go to your GitHub repository settings
   # Navigate to "Apps" or "Integrations"
   # Install the Claude GitHub App
   ```

2. **Add Required Secrets**
   In your GitHub repository, go to **Settings → Secrets and Variables → Actions** and add:
   
   ```bash
   # Required Secret
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   
   # GITHUB_TOKEN is automatically provided by GitHub Actions
   ```

3. **Enable Workflow**
   The workflow is automatically enabled once you have the secrets configured.

## 🏗️ How It Works

### Change Detection
The workflow uses `dorny/paths-filter` to detect which parts of the monorepo have changed:

- **Frontend**: `react-frontend/**` → Uses `react-frontend/CLAUDE.md`
- **Extension**: `chrome-extension/**` → Uses `chrome-extension/CLAUDE.md` 
- **Backend**: `backend-api/**` → Uses `backend-api/CLAUDE.md`
- **Supabase**: `supabase/**` → Uses `supabase/CLAUDE.md`
- **Root**: `*.md`, `*.json`, `*.js`, `*.ts`, `.github/**` → Uses root `CLAUDE.md`

### Review Process
For each changed area, Claude will:

1. **Load Context**: Read the appropriate CLAUDE.md file(s)
2. **Analyze Changes**: Review only the changed files (not entire codebase)
3. **Provide Feedback**: Comment on the PR with specific, actionable feedback
4. **Focus Areas**: Each workspace has tailored review criteria

### Security Review
Every PR gets an additional security-focused review regardless of changed files.

## 🎛️ Configuration

### Workspace-Specific Reviews

#### Frontend Review Focus
- Code Quality (TypeScript, React best practices)
- Mantine UI usage
- Supabase authentication integration
- React Router implementation  
- Performance optimization
- Accessibility compliance
- Error handling

#### Extension Review Focus
- Plasmo framework usage
- Manifest V3 compliance
- Security (content scripts, message passing)
- Performance (background scripts)
- Chrome extension API usage
- Mantine integration in extension context

#### Backend Review Focus
- Express.js structure and middleware
- TypeScript type safety
- Data processing and CSV handling
- Supabase database integration
- Security (validation, auth)
- API design principles

#### Supabase Review Focus
- Database schema and relationships
- Migration safety
- Row Level Security policies
- Database functions and triggers
- Performance optimization
- Data integrity constraints

### Customizing Review Prompts

Edit `.github/workflows/claude-pr-review.yml` to customize the `review-prompt` for each workspace:

```yaml
review-prompt: |
  Your custom review criteria here...
  
  Reference the workspace/CLAUDE.md for guidelines.
  Only comment on changed files.
```

### Changing Claude Model

Update the `claude-model` parameter in the workflow:

```yaml
claude-model: "claude-3-5-sonnet-20241022"  # Current
# claude-model: "claude-3-5-haiku-20241022"   # Faster, cheaper
# claude-model: "claude-3-opus-20240229"      # Most capable
```

## 🔒 Security Features

### Secrets Management
- API keys stored as GitHub Secrets (encrypted)
- No sensitive data in workflow files
- GitHub token has minimal required permissions

### Review Scope
- Only reviews changed files (not entire codebase)
- Cannot access private repositories without explicit permission
- Cannot modify code, only provide comments

### Permissions
The workflow requires these permissions:
```yaml
permissions:
  contents: read          # Read repository files
  pull-requests: write    # Comment on PRs  
  issues: write          # Comment on issues
```

## 💰 Cost Optimization

### Token Usage
- Only analyzes changed files (reduces tokens)
- Uses workspace-specific CLAUDE.md files (focused context)
- Separate jobs run in parallel (faster completion)

### Rate Limiting
- GitHub Actions provides natural rate limiting
- Failed reviews can be re-triggered manually
- Anthropic API has built-in rate limiting

## 🐛 Troubleshooting

### Workflow Not Triggering
1. Check that `ANTHROPIC_API_KEY` secret is set
2. Verify the Claude GitHub App is installed
3. Ensure PR targets `main` or `staging` branch

### Review Quality Issues
1. Update the relevant `CLAUDE.md` files with better context
2. Adjust the `review-prompt` in the workflow
3. Consider switching Claude models for different capabilities

### Performance Issues
1. Use `claude-3-5-haiku` for faster reviews
2. Reduce context file size if needed
3. Split large changes into smaller PRs

### Error Messages
Common errors and solutions:

```bash
# API Key Issues
Error: Invalid API key → Check ANTHROPIC_API_KEY secret

# Permission Issues  
Error: Resource not accessible → Check GitHub App permissions

# Rate Limiting
Error: Rate limit exceeded → Wait and retry, or reduce usage
```

## 🔄 Workflow Triggers

The workflow runs on:
- **Opened PRs**: New pull requests
- **Synchronize**: New commits pushed to existing PR
- **Reopened**: Previously closed PR is reopened

Target branches:
- `main` (production)
- `staging` (integration)

## 📊 Monitoring

### GitHub Actions Tab
- View workflow runs and logs
- Check individual job success/failure
- Download workflow artifacts if needed

### PR Comments
- Claude reviews appear as PR comments
- Each workspace gets separate review comments
- Security review appears as additional comment

### Usage Analytics
Track your usage in:
- GitHub Actions usage dashboard
- Anthropic Console (API usage)
- Claude GitHub App dashboard (when available)

## 🚀 Advanced Configuration

### Custom Workflow Triggers
Add custom triggers by modifying the workflow:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches: [main, staging, develop]  # Add more branches
  push:
    branches: [main]  # Review direct pushes
```

### Integration with Other Tools
Combine with other actions:

```yaml
- name: Run Tests Before Review
  run: npm test
  
- name: Claude Review
  uses: anthropics/claude-github-action@v1
  # ... configuration
```

### Custom Context Files
Include additional context files:

```yaml
context-files: |
  react-frontend/CLAUDE.md
  CLAUDE.md
  docs/coding-standards.md
  .eslintrc.js
```

## 📚 Next Steps

1. **Test the Setup**: Create a test PR to verify the workflow
2. **Refine Prompts**: Adjust review prompts based on initial feedback
3. **Monitor Usage**: Track API costs and adjust as needed
4. **Team Training**: Educate team on how to work with Claude reviews
5. **Iterate**: Continuously improve CLAUDE.md files and prompts

---

*This setup provides comprehensive, intelligent code reviews tailored to each part of your monorepo while maintaining security and cost efficiency.*