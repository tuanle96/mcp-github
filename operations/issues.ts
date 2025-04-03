import { z } from "zod";
import { githubRequest, buildUrl } from "../common/utils.js";
import { graphqlRequest } from "../common/graphql.js";

export const GetIssueSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issue_number: z.number(),
});

export const IssueCommentSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issue_number: z.number(),
  body: z.string(),
});

export const CreateIssueOptionsSchema = z.object({
  title: z.string(),
  body: z.string().optional(),
  assignees: z.array(z.string()).optional(),
  milestone: z.number().optional(),
  labels: z.array(z.string()).optional(),
});

export const CreateIssueSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  ...CreateIssueOptionsSchema.shape,
});

export const ListIssuesOptionsSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  direction: z.enum(["asc", "desc"]).optional(),
  labels: z.array(z.string()).optional(),
  page: z.number().optional(),
  per_page: z.number().optional(),
  since: z.string().optional(),
  sort: z.enum(["created", "updated", "comments"]).optional(),
  state: z.enum(["open", "closed", "all"]).optional(),
});

export const UpdateIssueOptionsSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issue_number: z.number(),
  title: z.string().optional(),
  body: z.string().optional(),
  assignees: z.array(z.string()).optional(),
  milestone: z.number().optional(),
  labels: z.array(z.string()).optional(),
  state: z.enum(["open", "closed"]).optional(),
});

// Schema cho xóa issue
export const DeleteIssueSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issue_number: z.number(),
});

export async function getIssue(owner: string, repo: string, issue_number: number) {
  return githubRequest(`https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}`);
}

export async function addIssueComment(
  owner: string,
  repo: string,
  issue_number: number,
  body: string
) {
  return githubRequest(`https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}/comments`, {
    method: "POST",
    body: { body },
  });
}

export async function createIssue(
  owner: string,
  repo: string,
  options: z.infer<typeof CreateIssueOptionsSchema>
) {
  return githubRequest(
    `https://api.github.com/repos/${owner}/${repo}/issues`,
    {
      method: "POST",
      body: options,
    }
  );
}

export async function listIssues(
  owner: string,
  repo: string,
  options: Omit<z.infer<typeof ListIssuesOptionsSchema>, "owner" | "repo">
) {
  const urlParams: Record<string, string | undefined> = {
    direction: options.direction,
    labels: options.labels?.join(","),
    page: options.page?.toString(),
    per_page: options.per_page?.toString(),
    since: options.since,
    sort: options.sort,
    state: options.state
  };

  return githubRequest(
    buildUrl(`https://api.github.com/repos/${owner}/${repo}/issues`, urlParams)
  );
}

export async function updateIssue(
  owner: string,
  repo: string,
  issue_number: number,
  options: Omit<z.infer<typeof UpdateIssueOptionsSchema>, "owner" | "repo" | "issue_number">
) {
  return githubRequest(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}`,
    {
      method: "PATCH",
      body: options,
    }
  );
}

/**
 * Xóa issue trong repository bằng GitHub GraphQL API
 * @param owner - Chủ sở hữu repository
 * @param repo - Tên repository
 * @param issue_number - Số hiệu của issue cần xóa
 * @returns Thông tin về thao tác xóa issue
 */
export async function deleteIssue(owner: string, repo: string, issue_number: number) {
  // Bước 1: Lấy node_id (GraphQL ID) của issue
  const issue = await getIssue(owner, repo, issue_number) as { node_id: string };

  if (!issue || !issue.node_id) {
    throw new Error(`Issue #${issue_number} not found or cannot be accessed`);
  }

  // Bước 2: Sử dụng GraphQL API để xóa issue
  const mutation = `
    mutation DeleteIssue($issueId: ID!) {
      deleteIssue(input: { issueId: $issueId }) {
        clientMutationId
        repository {
          id
          name
        }
      }
    }
  `;

  const variables = {
    issueId: issue.node_id
  };

  const result = await graphqlRequest(mutation, variables);

  return {
    success: true,
    issue_number: issue_number,
    repository: `${owner}/${repo}`,
    ...result.data.deleteIssue
  };
}