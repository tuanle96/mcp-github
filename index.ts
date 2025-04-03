#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import * as repository from './operations/repository.js';
import * as files from './operations/files.js';
import * as issues from './operations/issues.js';
import * as pulls from './operations/pulls.js';
import * as branches from './operations/branches.js';
import * as search from './operations/search.js';
import * as commits from './operations/commits.js';
import * as projects from './operations/projects.js';
import * as projectsV2 from './operations/projectsV2.js';
import {
  GitHubError,
  GitHubValidationError,
  GitHubResourceNotFoundError,
  GitHubAuthenticationError,
  GitHubPermissionError,
  GitHubRateLimitError,
  GitHubConflictError,
  isGitHubError,
} from './common/errors.js';
import { VERSION } from "./common/version.js";

const server = new Server(
  {
    name: "github-mcp-server",
    version: VERSION,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

function formatGitHubError(error: GitHubError): string {
  let message = `GitHub API Error: ${error.message}`;

  if (error instanceof GitHubValidationError) {
    message = `Validation Error: ${error.message}`;
    if (error.response) {
      message += `\nDetails: ${JSON.stringify(error.response)}`;
    }
  } else if (error instanceof GitHubResourceNotFoundError) {
    message = `Not Found: ${error.message}`;
  } else if (error instanceof GitHubAuthenticationError) {
    message = `Authentication Failed: ${error.message}`;
  } else if (error instanceof GitHubPermissionError) {
    message = `Permission Denied: ${error.message}`;
  } else if (error instanceof GitHubRateLimitError) {
    message = `Rate Limit Exceeded: ${error.message}\nResets at: ${error.resetAt.toISOString()}`;
  } else if (error instanceof GitHubConflictError) {
    message = `Conflict: ${error.message}`;
  }

  return message;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_or_update_file",
        description: "Create or update a single file in a GitHub repository",
        inputSchema: zodToJsonSchema(files.CreateOrUpdateFileSchema),
      },
      {
        name: "search_repositories",
        description: "Search for GitHub repositories",
        inputSchema: zodToJsonSchema(repository.SearchRepositoriesSchema),
      },
      {
        name: "create_repository",
        description: "Create a new GitHub repository in your account",
        inputSchema: zodToJsonSchema(repository.CreateRepositoryOptionsSchema),
      },
      {
        name: "get_file_contents",
        description: "Get the contents of a file or directory from a GitHub repository",
        inputSchema: zodToJsonSchema(files.GetFileContentsSchema),
      },
      {
        name: "push_files",
        description: "Push multiple files to a GitHub repository in a single commit",
        inputSchema: zodToJsonSchema(files.PushFilesSchema),
      },
      {
        name: "create_issue",
        description: "Create a new issue in a GitHub repository",
        inputSchema: zodToJsonSchema(issues.CreateIssueSchema),
      },
      {
        name: "create_pull_request",
        description: "Create a new pull request in a GitHub repository",
        inputSchema: zodToJsonSchema(pulls.CreatePullRequestSchema),
      },
      {
        name: "fork_repository",
        description: "Fork a GitHub repository to your account or specified organization",
        inputSchema: zodToJsonSchema(repository.ForkRepositorySchema),
      },
      {
        name: "create_branch",
        description: "Create a new branch in a GitHub repository",
        inputSchema: zodToJsonSchema(branches.CreateBranchSchema),
      },
      {
        name: "list_commits",
        description: "Get list of commits of a branch in a GitHub repository",
        inputSchema: zodToJsonSchema(commits.ListCommitsSchema)
      },
      {
        name: "list_issues",
        description: "List issues in a GitHub repository with filtering options",
        inputSchema: zodToJsonSchema(issues.ListIssuesOptionsSchema)
      },
      {
        name: "update_issue",
        description: "Update an existing issue in a GitHub repository",
        inputSchema: zodToJsonSchema(issues.UpdateIssueOptionsSchema)
      },
      {
        name: "add_issue_comment",
        description: "Add a comment to an existing issue",
        inputSchema: zodToJsonSchema(issues.IssueCommentSchema)
      },
      {
        name: "search_code",
        description: "Search for code across GitHub repositories",
        inputSchema: zodToJsonSchema(search.SearchCodeSchema),
      },
      {
        name: "search_issues",
        description: "Search for issues and pull requests across GitHub repositories",
        inputSchema: zodToJsonSchema(search.SearchIssuesSchema),
      },
      {
        name: "search_users",
        description: "Search for users on GitHub",
        inputSchema: zodToJsonSchema(search.SearchUsersSchema),
      },
      {
        name: "get_issue",
        description: "Get details of a specific issue in a GitHub repository.",
        inputSchema: zodToJsonSchema(issues.GetIssueSchema)
      },
      {
        name: "get_pull_request",
        description: "Get details of a specific pull request",
        inputSchema: zodToJsonSchema(pulls.GetPullRequestSchema)
      },
      {
        name: "list_pull_requests",
        description: "List and filter repository pull requests",
        inputSchema: zodToJsonSchema(pulls.ListPullRequestsSchema)
      },
      {
        name: "create_pull_request_review",
        description: "Create a review on a pull request",
        inputSchema: zodToJsonSchema(pulls.CreatePullRequestReviewSchema)
      },
      {
        name: "merge_pull_request",
        description: "Merge a pull request",
        inputSchema: zodToJsonSchema(pulls.MergePullRequestSchema)
      },
      {
        name: "get_pull_request_files",
        description: "Get the list of files changed in a pull request",
        inputSchema: zodToJsonSchema(pulls.GetPullRequestFilesSchema)
      },
      {
        name: "get_pull_request_status",
        description: "Get the combined status of all status checks for a pull request",
        inputSchema: zodToJsonSchema(pulls.GetPullRequestStatusSchema)
      },
      {
        name: "update_pull_request_branch",
        description: "Update a pull request branch with the latest changes from the base branch",
        inputSchema: zodToJsonSchema(pulls.UpdatePullRequestBranchSchema)
      },
      {
        name: "get_pull_request_comments",
        description: "Get the review comments on a pull request",
        inputSchema: zodToJsonSchema(pulls.GetPullRequestCommentsSchema)
      },
      {
        name: "get_pull_request_reviews",
        description: "Get the reviews on a pull request",
        inputSchema: zodToJsonSchema(pulls.GetPullRequestReviewsSchema)
      },
      {
        name: "create_project",
        description: "Create a new project in a GitHub repository",
        inputSchema: zodToJsonSchema(projects.CreateProjectSchema),
      },
      {
        name: "get_project",
        description: "Get details about a specific project",
        inputSchema: zodToJsonSchema(projects.GetProjectSchema),
      },
      {
        name: "delete_issue",
        description: "Delete an issue from a GitHub repository using GraphQL API",
        inputSchema: zodToJsonSchema(issues.DeleteIssueSchema),
      },
      {
        name: "update_project",
        description: "Update an existing project's details",
        inputSchema: zodToJsonSchema(projects.UpdateProjectSchema),
      },
      {
        name: "list_projects",
        description: "List all projects in a GitHub repository",
        inputSchema: zodToJsonSchema(projects.ListProjectsSchema),
      },
      {
        name: "create_project_column",
        description: "Create a new column in a project",
        inputSchema: zodToJsonSchema(projects.CreateProjectColumnSchema),
      },
      {
        name: "list_project_columns",
        description: "List all columns in a project",
        inputSchema: zodToJsonSchema(projects.ListProjectColumnsSchema),
      },
      {
        name: "update_project_column",
        description: "Update an existing project column",
        inputSchema: zodToJsonSchema(projects.UpdateProjectColumnSchema),
      },
      {
        name: "delete_project_column",
        description: "Delete a project column",
        inputSchema: zodToJsonSchema(projects.DeleteProjectColumnSchema),
      },
      {
        name: "add_card_to_column",
        description: "Add a new card to a project column",
        inputSchema: zodToJsonSchema(projects.AddCardToColumnSchema),
      },
      {
        name: "list_column_cards",
        description: "List all cards in a project column",
        inputSchema: zodToJsonSchema(projects.ListColumnCardsSchema),
      },
      {
        name: "move_card",
        description: "Move a card to a different position or column",
        inputSchema: zodToJsonSchema(projects.MoveCardSchema),
      },
      {
        name: "delete_card",
        description: "Delete a card from a project",
        inputSchema: zodToJsonSchema(projects.DeleteCardSchema),
      },
      {
        name: "list_organization_projects",
        description: "List all projects in a GitHub organization (at organization level, not repository level)",
        inputSchema: zodToJsonSchema(projects.ListOrganizationProjectsSchema),
      },
      {
        name: "list_organization_projects_v2",
        description: "List projects V2 in a GitHub organization using GraphQL API",
        inputSchema: zodToJsonSchema(projectsV2.ListOrganizationProjectsV2Schema),
      },
      {
        name: "get_project_v2",
        description: "Get details of a GitHub project V2 using GraphQL API",
        inputSchema: zodToJsonSchema(projectsV2.GetProjectV2Schema),
      },
      {
        name: "create_project_v2",
        description: "Create a new GitHub project V2 using GraphQL API",
        inputSchema: zodToJsonSchema(projectsV2.CreateProjectV2Schema),
      },
      {
        name: "update_project_v2",
        description: "Update a GitHub project V2 using GraphQL API",
        inputSchema: zodToJsonSchema(projectsV2.UpdateProjectV2Schema),
      },
      {
        name: "add_item_to_project_v2",
        description: "Add an issue or pull request to a GitHub project V2 using GraphQL API",
        inputSchema: zodToJsonSchema(projectsV2.AddItemToProjectV2Schema),
      },
      {
        name: "list_project_v2_items",
        description: "List items in a GitHub project V2 using GraphQL API",
        inputSchema: zodToJsonSchema(projectsV2.ListProjectV2ItemsSchema),
      },
      {
        name: "update_project_v2_item_field",
        description: "Update a field value for an item in a GitHub project V2 using GraphQL API",
        inputSchema: zodToJsonSchema(projectsV2.UpdateProjectV2ItemFieldValueSchema),
      }
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (!request.params.arguments) {
      throw new Error("Arguments are required");
    }

    switch (request.params.name) {
      case "fork_repository": {
        const args = repository.ForkRepositorySchema.parse(request.params.arguments);
        const fork = await repository.forkRepository(args.owner, args.repo, args.organization);
        return {
          content: [{ type: "text", text: JSON.stringify(fork, null, 2) }],
        };
      }

      case "create_branch": {
        const args = branches.CreateBranchSchema.parse(request.params.arguments);
        const branch = await branches.createBranchFromRef(
          args.owner,
          args.repo,
          args.branch,
          args.from_branch
        );
        return {
          content: [{ type: "text", text: JSON.stringify(branch, null, 2) }],
        };
      }

      case "search_repositories": {
        const args = repository.SearchRepositoriesSchema.parse(request.params.arguments);
        const results = await repository.searchRepositories(
          args.query,
          args.page,
          args.perPage
        );
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      case "create_repository": {
        const args = repository.CreateRepositoryOptionsSchema.parse(request.params.arguments);
        const result = await repository.createRepository(args);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_file_contents": {
        const args = files.GetFileContentsSchema.parse(request.params.arguments);
        const contents = await files.getFileContents(
          args.owner,
          args.repo,
          args.path,
          args.branch
        );
        return {
          content: [{ type: "text", text: JSON.stringify(contents, null, 2) }],
        };
      }

      case "create_or_update_file": {
        const args = files.CreateOrUpdateFileSchema.parse(request.params.arguments);
        const result = await files.createOrUpdateFile(
          args.owner,
          args.repo,
          args.path,
          args.content,
          args.message,
          args.branch,
          args.sha
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "push_files": {
        const args = files.PushFilesSchema.parse(request.params.arguments);
        const result = await files.pushFiles(
          args.owner,
          args.repo,
          args.branch,
          args.files,
          args.message
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "create_issue": {
        const args = issues.CreateIssueSchema.parse(request.params.arguments);
        const { owner, repo, ...options } = args;
        const issue = await issues.createIssue(owner, repo, options);
        return {
          content: [{ type: "text", text: JSON.stringify(issue, null, 2) }],
        };
      }

      case "create_pull_request": {
        const args = pulls.CreatePullRequestSchema.parse(request.params.arguments);
        const pullRequest = await pulls.createPullRequest(args);
        return {
          content: [{ type: "text", text: JSON.stringify(pullRequest, null, 2) }],
        };
      }

      case "search_code": {
        const args = search.SearchCodeSchema.parse(request.params.arguments);
        const results = await search.searchCode(args);
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      case "search_issues": {
        const args = search.SearchIssuesSchema.parse(request.params.arguments);
        const results = await search.searchIssues(args);
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      case "search_users": {
        const args = search.SearchUsersSchema.parse(request.params.arguments);
        const results = await search.searchUsers(args);
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      case "list_issues": {
        const args = issues.ListIssuesOptionsSchema.parse(request.params.arguments);
        const { owner, repo, ...options } = args;
        const result = await issues.listIssues(owner, repo, options);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "update_issue": {
        const args = issues.UpdateIssueOptionsSchema.parse(request.params.arguments);
        const { owner, repo, issue_number, ...options } = args;
        const result = await issues.updateIssue(owner, repo, issue_number, options);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "add_issue_comment": {
        const args = issues.IssueCommentSchema.parse(request.params.arguments);
        const { owner, repo, issue_number, body } = args;
        const result = await issues.addIssueComment(owner, repo, issue_number, body);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "list_commits": {
        const args = commits.ListCommitsSchema.parse(request.params.arguments);
        const results = await commits.listCommits(
          args.owner,
          args.repo,
          args.page,
          args.perPage,
          args.sha
        );
        return {
          content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
      }

      case "get_issue": {
        const args = issues.GetIssueSchema.parse(request.params.arguments);
        const issue = await issues.getIssue(args.owner, args.repo, args.issue_number);
        return {
          content: [{ type: "text", text: JSON.stringify(issue, null, 2) }],
        };
      }

      case "delete_issue": {
        const args = issues.DeleteIssueSchema.parse(request.params.arguments);
        const result = await issues.deleteIssue(args.owner, args.repo, args.issue_number);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_pull_request": {
        const args = pulls.GetPullRequestSchema.parse(request.params.arguments);
        const pullRequest = await pulls.getPullRequest(args.owner, args.repo, args.pull_number);
        return {
          content: [{ type: "text", text: JSON.stringify(pullRequest, null, 2) }],
        };
      }

      case "list_pull_requests": {
        const args = pulls.ListPullRequestsSchema.parse(request.params.arguments);
        const { owner, repo, ...options } = args;
        const pullRequests = await pulls.listPullRequests(owner, repo, options);
        return {
          content: [{ type: "text", text: JSON.stringify(pullRequests, null, 2) }],
        };
      }

      case "create_pull_request_review": {
        const args = pulls.CreatePullRequestReviewSchema.parse(request.params.arguments);
        const { owner, repo, pull_number, ...options } = args;
        const review = await pulls.createPullRequestReview(owner, repo, pull_number, options);
        return {
          content: [{ type: "text", text: JSON.stringify(review, null, 2) }],
        };
      }

      case "merge_pull_request": {
        const args = pulls.MergePullRequestSchema.parse(request.params.arguments);
        const { owner, repo, pull_number, ...options } = args;
        const result = await pulls.mergePullRequest(owner, repo, pull_number, options);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_pull_request_files": {
        const args = pulls.GetPullRequestFilesSchema.parse(request.params.arguments);
        const files = await pulls.getPullRequestFiles(args.owner, args.repo, args.pull_number);
        return {
          content: [{ type: "text", text: JSON.stringify(files, null, 2) }],
        };
      }

      case "get_pull_request_status": {
        const args = pulls.GetPullRequestStatusSchema.parse(request.params.arguments);
        const status = await pulls.getPullRequestStatus(args.owner, args.repo, args.pull_number);
        return {
          content: [{ type: "text", text: JSON.stringify(status, null, 2) }],
        };
      }

      case "update_pull_request_branch": {
        const args = pulls.UpdatePullRequestBranchSchema.parse(request.params.arguments);
        const { owner, repo, pull_number, expected_head_sha } = args;
        await pulls.updatePullRequestBranch(owner, repo, pull_number, expected_head_sha);
        return {
          content: [{ type: "text", text: JSON.stringify({ success: true }, null, 2) }],
        };
      }

      case "get_pull_request_comments": {
        const args = pulls.GetPullRequestCommentsSchema.parse(request.params.arguments);
        const comments = await pulls.getPullRequestComments(args.owner, args.repo, args.pull_number);
        return {
          content: [{ type: "text", text: JSON.stringify(comments, null, 2) }],
        };
      }

      case "get_pull_request_reviews": {
        const args = pulls.GetPullRequestReviewsSchema.parse(request.params.arguments);
        const reviews = await pulls.getPullRequestReviews(
          args.owner,
          args.repo,
          args.pull_number
        );
        return {
          content: [{ type: "text", text: JSON.stringify(reviews, null, 2) }],
        };
      }

      case "create_project": {
        const args = projects.CreateProjectSchema.parse(request.params.arguments);
        const result = await projects.createProject(
          args.owner,
          args.repo,
          args.name,
          args.body
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_project": {
        const args = projects.GetProjectSchema.parse(request.params.arguments);
        const result = await projects.getProject(
          args.owner,
          args.repo,
          args.project_number
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "update_project": {
        const args = projects.UpdateProjectSchema.parse(request.params.arguments);
        const result = await projects.updateProject(
          args.project_id,
          args.name,
          args.body,
          args.state
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "list_projects": {
        const args = projects.ListProjectsSchema.parse(request.params.arguments);
        const result = await projects.listProjects(
          args.owner,
          args.repo,
          args.state,
          args.page,
          args.per_page
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "create_project_column": {
        const args = projects.CreateProjectColumnSchema.parse(request.params.arguments);
        const result = await projects.createProjectColumn(
          args.owner,
          args.repo,
          args.project_number,
          args.name
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "list_project_columns": {
        const args = projects.ListProjectColumnsSchema.parse(request.params.arguments);
        const result = await projects.listProjectColumns(
          args.project_id,
          args.page,
          args.per_page
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "update_project_column": {
        const args = projects.UpdateProjectColumnSchema.parse(request.params.arguments);
        const result = await projects.updateProjectColumn(
          args.column_id,
          args.name
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "delete_project_column": {
        const args = projects.DeleteProjectColumnSchema.parse(request.params.arguments);
        const result = await projects.deleteProjectColumn(args.column_id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "add_card_to_column": {
        const args = projects.AddCardToColumnSchema.parse(request.params.arguments);
        const result = await projects.addCardToColumn(
          args.owner,
          args.repo,
          args.column_id,
          args.content_type,
          args.content_id,
          args.note
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "list_column_cards": {
        const args = projects.ListColumnCardsSchema.parse(request.params.arguments);
        const result = await projects.listColumnCards(
          args.column_id,
          args.archived_state,
          args.page,
          args.per_page
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "move_card": {
        const args = projects.MoveCardSchema.parse(request.params.arguments);
        const result = await projects.moveCard(
          args.card_id,
          args.position,
          args.column_id
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "delete_card": {
        const args = projects.DeleteCardSchema.parse(request.params.arguments);
        const result = await projects.deleteCard(args.card_id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "list_organization_projects": {
        const args = projects.ListOrganizationProjectsSchema.parse(request.params.arguments);
        const result = await projects.listOrganizationProjects(
          args.org,
          args.state,
          args.page,
          args.per_page
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "list_organization_projects_v2": {
        const args = projectsV2.ListOrganizationProjectsV2Schema.parse(request.params.arguments);
        const result = await projectsV2.listOrganizationProjectsV2(
          args.org,
          args.first,
          args.after,
          args.orderBy
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "get_project_v2": {
        const args = projectsV2.GetProjectV2Schema.parse(request.params.arguments);
        const result = await projectsV2.getProjectV2(args.id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "create_project_v2": {
        const args = projectsV2.CreateProjectV2Schema.parse(request.params.arguments);
        const result = await projectsV2.createProjectV2(
          args.ownerId,
          args.title,
          args.description
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "update_project_v2": {
        const args = projectsV2.UpdateProjectV2Schema.parse(request.params.arguments);
        const result = await projectsV2.updateProjectV2(
          args.projectId,
          args.title,
          args.description,
          args.closed
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "add_item_to_project_v2": {
        const args = projectsV2.AddItemToProjectV2Schema.parse(request.params.arguments);
        const result = await projectsV2.addItemToProjectV2(
          args.projectId,
          args.contentId
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "list_project_v2_items": {
        const args = projectsV2.ListProjectV2ItemsSchema.parse(request.params.arguments);
        const result = await projectsV2.listProjectV2Items(
          args.projectId,
          args.first,
          args.after
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      case "update_project_v2_item_field": {
        const args = projectsV2.UpdateProjectV2ItemFieldValueSchema.parse(request.params.arguments);
        const result = await projectsV2.updateProjectV2ItemFieldValue(
          args.projectId,
          args.itemId,
          args.fieldId,
          args.value
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
    }
    if (isGitHubError(error)) {
      throw new Error(formatGitHubError(error));
    }
    throw error;
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GitHub MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});