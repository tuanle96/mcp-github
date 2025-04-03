# GitHub MCP Server

MCP Server for the GitHub API, enabling file operations, repository management, search functionality, and more.

### Features

- **Automatic Branch Creation**: When creating/updating files or pushing changes, branches are automatically created if they don't exist
- **Comprehensive Error Handling**: Clear error messages for common issues
- **Git History Preservation**: Operations maintain proper Git history without force pushing
- **Batch Operations**: Support for both single-file and multi-file operations
- **Advanced Search**: Support for searching code, issues/PRs, and users
- **Project Management**: Complete toolset for GitHub Projects (classic) management, including creating projects, managing columns, and working with cards


## Tools

1. `create_or_update_file`
   - Create or update a single file in a repository
   - Inputs:
     - `owner` (string): Repository owner (username or organization)
     - `repo` (string): Repository name
     - `path` (string): Path where to create/update the file
     - `content` (string): Content of the file
     - `message` (string): Commit message
     - `branch` (string): Branch to create/update the file in
     - `sha` (optional string): SHA of file being replaced (for updates)
   - Returns: File content and commit details

2. `push_files`
   - Push multiple files in a single commit
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `branch` (string): Branch to push to
     - `files` (array): Files to push, each with `path` and `content`
     - `message` (string): Commit message
   - Returns: Updated branch reference

3. `search_repositories`
   - Search for GitHub repositories
   - Inputs:
     - `query` (string): Search query
     - `page` (optional number): Page number for pagination
     - `perPage` (optional number): Results per page (max 100)
   - Returns: Repository search results

4. `create_repository`
   - Create a new GitHub repository
   - Inputs:
     - `name` (string): Repository name
     - `description` (optional string): Repository description
     - `private` (optional boolean): Whether repo should be private
     - `autoInit` (optional boolean): Initialize with README
   - Returns: Created repository details

5. `get_file_contents`
   - Get contents of a file or directory
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `path` (string): Path to file/directory
     - `branch` (optional string): Branch to get contents from
   - Returns: File/directory contents

6. `create_issue`
   - Create a new issue
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `title` (string): Issue title
     - `body` (optional string): Issue description
     - `assignees` (optional string[]): Usernames to assign
     - `labels` (optional string[]): Labels to add
     - `milestone` (optional number): Milestone number
   - Returns: Created issue details

7. `create_pull_request`
   - Create a new pull request
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `title` (string): PR title
     - `body` (optional string): PR description
     - `head` (string): Branch containing changes
     - `base` (string): Branch to merge into
     - `draft` (optional boolean): Create as draft PR
     - `maintainer_can_modify` (optional boolean): Allow maintainer edits
   - Returns: Created pull request details

8. `fork_repository`
   - Fork a repository
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `organization` (optional string): Organization to fork to
   - Returns: Forked repository details

9. `create_branch`
   - Create a new branch
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `branch` (string): Name for new branch
     - `from_branch` (optional string): Source branch (defaults to repo default)
   - Returns: Created branch reference

10. `list_issues`
    - List and filter repository issues
    - Inputs:
      - `owner` (string): Repository owner
      - `repo` (string): Repository name
      - `state` (optional string): Filter by state ('open', 'closed', 'all')
      - `labels` (optional string[]): Filter by labels
      - `sort` (optional string): Sort by ('created', 'updated', 'comments')
      - `direction` (optional string): Sort direction ('asc', 'desc')
      - `since` (optional string): Filter by date (ISO 8601 timestamp)
      - `page` (optional number): Page number
      - `per_page` (optional number): Results per page
    - Returns: Array of issue details

11. `update_issue`
    - Update an existing issue
    - Inputs:
      - `owner` (string): Repository owner
      - `repo` (string): Repository name
      - `issue_number` (number): Issue number to update
      - `title` (optional string): New title
      - `body` (optional string): New description
      - `state` (optional string): New state ('open' or 'closed')
      - `labels` (optional string[]): New labels
      - `assignees` (optional string[]): New assignees
      - `milestone` (optional number): New milestone number
    - Returns: Updated issue details

12. `add_issue_comment`
    - Add a comment to an issue
    - Inputs:
      - `owner` (string): Repository owner
      - `repo` (string): Repository name
      - `issue_number` (number): Issue number to comment on
      - `body` (string): Comment text
    - Returns: Created comment details

13. `search_code`
    - Search for code across GitHub repositories
    - Inputs:
      - `q` (string): Search query using GitHub code search syntax
      - `sort` (optional string): Sort field ('indexed' only)
      - `order` (optional string): Sort order ('asc' or 'desc')
      - `per_page` (optional number): Results per page (max 100)
      - `page` (optional number): Page number
    - Returns: Code search results with repository context

14. `search_issues`
    - Search for issues and pull requests
    - Inputs:
      - `q` (string): Search query using GitHub issues search syntax
      - `sort` (optional string): Sort field (comments, reactions, created, etc.)
      - `order` (optional string): Sort order ('asc' or 'desc')
      - `per_page` (optional number): Results per page (max 100)
      - `page` (optional number): Page number
    - Returns: Issue and pull request search results

15. `search_users`
    - Search for GitHub users
    - Inputs:
      - `q` (string): Search query using GitHub users search syntax
      - `sort` (optional string): Sort field (followers, repositories, joined)
      - `order` (optional string): Sort order ('asc' or 'desc')
      - `per_page` (optional number): Results per page (max 100)
      - `page` (optional number): Page number
    - Returns: User search results

16. `list_commits`
   - Gets commits of a branch in a repository
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `page` (optional string): page number
     - `per_page` (optional string): number of record per page
     - `sha` (optional string): branch name
   - Returns: List of commits

17. `get_issue`
   - Gets the contents of an issue within a repository
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `issue_number` (number): Issue number to retrieve
   - Returns: Github Issue object & details

18. `delete_issue`
   - Deletes an issue from a GitHub repository using GraphQL API
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `issue_number` (number): Issue number to delete
   - Returns: Deletion confirmation with repository information

19. `get_pull_request`
   - Get details of a specific pull request
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `pull_number` (number): Pull request number
   - Returns: Pull request details including diff and review status

20. `list_pull_requests`
   - List and filter repository pull requests
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `state` (optional string): Filter by state ('open', 'closed', 'all')
     - `head` (optional string): Filter by head user/org and branch
     - `base` (optional string): Filter by base branch
     - `sort` (optional string): Sort by ('created', 'updated', 'popularity', 'long-running')
     - `direction` (optional string): Sort direction ('asc', 'desc')
     - `per_page` (optional number): Results per page (max 100)
     - `page` (optional number): Page number
   - Returns: Array of pull request details

21. `create_pull_request_review`
   - Create a review on a pull request
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `pull_number` (number): Pull request number
     - `body` (string): Review comment text
     - `event` (string): Review action ('APPROVE', 'REQUEST_CHANGES', 'COMMENT')
     - `commit_id` (optional string): SHA of commit to review
     - `comments` (optional array): Line-specific comments, each with:
       - `path` (string): File path
       - `position` (number): Line position in diff
       - `body` (string): Comment text
   - Returns: Created review details

22. `merge_pull_request`
   - Merge a pull request
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `pull_number` (number): Pull request number
     - `commit_title` (optional string): Title for merge commit
     - `commit_message` (optional string): Extra detail for merge commit
     - `merge_method` (optional string): Merge method ('merge', 'squash', 'rebase')
   - Returns: Merge result details

23. `get_pull_request_files`
   - Get the list of files changed in a pull request
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `pull_number` (number): Pull request number
   - Returns: Array of changed files with patch and status details

24. `get_pull_request_status`
   - Get the combined status of all status checks for a pull request
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `pull_number` (number): Pull request number
   - Returns: Combined status check results and individual check details

25. `update_pull_request_branch`
   - Update a pull request branch with the latest changes from the base branch (equivalent to GitHub's "Update branch" button)
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `pull_number` (number): Pull request number
     - `expected_head_sha` (optional string): The expected SHA of the pull request's HEAD ref
   - Returns: Success message when branch is updated

26. `get_pull_request_comments`
   - Get the review comments on a pull request
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `pull_number` (number): Pull request number
   - Returns: Array of pull request review comments with details like the comment text, author, and location in the diff

27. `get_pull_request_reviews`
   - Get the reviews on a pull request
   - Inputs:
     - `owner` (string): Repository owner
     - `repo` (string): Repository name
     - `pull_number` (number): Pull request number
   - Returns: Array of pull request reviews with details like the review state (APPROVED, CHANGES_REQUESTED, etc.), reviewer, and review body

28. `create_project`
   - Create a new project in a GitHub repository
   - Inputs:
     - `owner` (string): Repository owner (username or organization)
     - `repo` (string): Repository name
     - `name` (string): Name of the project
     - `body` (optional string): Description of the project
   - Returns: Created project details

29. `get_project`
   - Get details about a specific project
   - Inputs:
     - `owner` (string): Repository owner (username or organization)
     - `repo` (string): Repository name
     - `project_number` (number): The project number
   - Returns: Project details

30. `update_project`
   - Update an existing project's details
   - Inputs:
     - `project_id` (number): The unique identifier of the project
     - `name` (optional string): New name of the project
     - `body` (optional string): New description of the project
     - `state` (optional string): State of the project ('open' or 'closed')
   - Returns: Updated project details

31. `list_projects`
   - List all projects in a GitHub repository
   - Inputs:
     - `owner` (string): Repository owner (username or organization)
     - `repo` (string): Repository name
     - `state` (optional string): Filter projects by state ('open', 'closed', 'all')
     - `page` (optional number): Page number for pagination (starts at 1)
     - `per_page` (optional number): Number of results per page (max 100)
   - Returns: Array of project details

32. `create_project_column`
   - Create a new column in a project
   - Inputs:
     - `owner` (string): Repository owner (username or organization)
     - `repo` (string): Repository name
     - `project_number` (number): The project number
     - `name` (string): Name of the column
   - Returns: Created column details

33. `list_project_columns`
   - List all columns in a project
   - Inputs:
     - `project_id` (number): The unique identifier of the project
     - `page` (optional number): Page number for pagination (starts at 1)
     - `per_page` (optional number): Number of results per page (max 100)
   - Returns: Array of project column details

34. `update_project_column`
   - Update an existing project column
   - Inputs:
     - `column_id` (number): The unique identifier of the column
     - `name` (string): New name of the column
   - Returns: Updated column details

35. `delete_project_column`
   - Delete a project column
   - Inputs:
     - `column_id` (number): The unique identifier of the column
   - Returns: Success message

36. `add_card_to_column`
   - Add a new card to a project column
   - Inputs:
     - `owner` (string): Repository owner (username or organization)
     - `repo` (string): Repository name
     - `column_id` (string): The ID of the column to add card to
     - `content_type` (string): Type of content for the card ('Issue', 'PullRequest', 'Note')
     - `content_id` (optional number): ID of the issue or pull request (required if content_type is Issue or PullRequest)
     - `note` (optional string): The note content for the card (required if content_type is Note)
   - Returns: Created card details

37. `list_column_cards`
   - List all cards in a project column
   - Inputs:
     - `column_id` (number): The unique identifier of the column
     - `archived_state` (optional string): Filter by card archived state ('all', 'archived', 'not_archived')
     - `page` (optional number): Page number for pagination (starts at 1)
     - `per_page` (optional number): Number of results per page (max 100)
   - Returns: Array of card details

38. `move_card`
   - Move a card to a different position or column
   - Inputs:
     - `card_id` (number): The unique identifier of the card
     - `position` (string): The position of the card ('top', 'bottom', or 'after:<card_id>')
     - `column_id` (optional number): The column ID to move the card to
   - Returns: Success message

39. `delete_card`
   - Delete a card from a project
   - Inputs:
     - `card_id` (number): The unique identifier of the card
   - Returns: Success message

40. `list_organization_projects`
   - List all projects in a GitHub organization (at organization level, not repository level)
   - Inputs:
     - `org` (string): Organization name
     - `state` (optional string): Filter projects by state ('open', 'closed', 'all')
     - `page` (optional number): Page number for pagination
     - `per_page` (optional number): Number of results per page (max 100)
   - Returns: Array of organization project details

## Projects V2 Tools (GitHub's New Projects Experience)

41. `list_organization_projects_v2`
   - List projects V2 in a GitHub organization using GraphQL API
   - Inputs:
     - `org` (string): Organization name
     - `first` (optional number): Number of projects to fetch (max 100)
     - `after` (optional string): Cursor for pagination
     - `orderBy` (optional object): How to order the projects
   - Returns: Array of projects with pagination info

42. `get_project_v2`
   - Get details of a GitHub project V2 using GraphQL API
   - Inputs:
     - `id` (string): The node ID of the project
   - Returns: Detailed project information including fields and views

43. `create_project_v2`
   - Create a new GitHub project V2 using GraphQL API
   - Inputs:
     - `ownerId` (string): The node ID of the organization or user
     - `title` (string): Title of the project
     - `description` (optional string): Description of the project
   - Returns: Created project details

44. `update_project_v2`
   - Update a GitHub project V2 using GraphQL API
   - Inputs:
     - `projectId` (string): The node ID of the project
     - `title` (optional string): New title for the project
     - `description` (optional string): New description for the project
     - `closed` (optional boolean): Whether to close the project
   - Returns: Updated project details

45. `add_item_to_project_v2`
   - Add an issue or pull request to a GitHub project V2 using GraphQL API
   - Inputs:
     - `projectId` (string): The node ID of the project
     - `contentId` (string): The node ID of the issue or pull request to add
   - Returns: Added item details

46. `list_project_v2_items`
   - List items in a GitHub project V2 using GraphQL API
   - Inputs:
     - `projectId` (string): The node ID of the project
     - `first` (optional number): Number of items to fetch (max 100)
     - `after` (optional string): Cursor for pagination
     - `filterBy` (optional object): Filters for the items
   - Returns: Array of project items with their field values

47. `update_project_v2_item_field`
   - Update a field value for an item in a GitHub project V2 using GraphQL API
   - Inputs:
     - `projectId` (string): The node ID of the project
     - `itemId` (string): The node ID of the item
     - `fieldId` (string): The node ID of the field
     - `value` (any): The new value for the field
   - Returns: Updated item details

## Project Management Notes

**Deprecation Warning**: GitHub has announced that Projects (classic) is being deprecated in favor of the new Projects experience. Tools 27-39 work with the classic version of Projects, which may be removed in the future. For the new GitHub Projects experience, use tools 40-46 instead.

## Search Query Syntax

### Code Search
- `language:javascript`: Search by programming language
- `repo:owner/name`: Search in specific repository
- `path:app/src`: Search in specific path
- `extension:js`: Search by file extension
- Example: `q: "import express" language:typescript path:src/`

### Issues Search
- `is:issue` or `is:pr`: Filter by type
- `is:open` or `is:closed`: Filter by state
- `label:bug`: Search by label
- `author:username`: Search by author
- Example: `q: "memory leak" is:issue is:open label:bug`

### Users Search
- `type:user` or `type:org`: Filter by account type
- `followers:>1000`: Filter by followers
- `location:London`: Search by location
- Example: `q: "fullstack developer" location:London followers:>100`

For detailed search syntax, see [GitHub's searching documentation](https://docs.github.com/en/search-github/searching-on-github).

## Setup

### Personal Access Token
[Create a GitHub Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) with appropriate permissions:
   - Go to [Personal access tokens](https://github.com/settings/tokens) (in GitHub Settings > Developer settings)
   - Select which repositories you'd like this token to have access to (Public, All, or Select)
   - Create a token with the `repo` scope ("Full control of private repositories")
     - Alternatively, if working only with public repositories, select only the `public_repo` scope
     - For using the Projects V2 tools, make sure to include the `project` scope as well
   - Copy the generated token

### Usage with Claude Desktop
To use this with Claude Desktop, add the following to your `claude_desktop_config.json`:

#### Docker
```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/tuanle96/mcp-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

### NPX

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@earnbasejs/mcp-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
      }
    }
  }
}
```

## Build

Docker build:

```bash
docker build -t mcp/github -f src/github/Dockerfile .
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
