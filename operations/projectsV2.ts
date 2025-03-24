import { z } from 'zod';
import { graphqlRequest } from '../common/graphql.js';
import { GitHubError } from '../common/errors.js';

// Schema cho liệt kê projects V2 của tổ chức
export const ListOrganizationProjectsV2Schema = z.object({
  org: z.string().describe("Organization name"),
  first: z.number().optional().describe("Number of projects to fetch (max 100)"),
  after: z.string().optional().describe("Cursor for pagination"),
  orderBy: z.object({
    field: z.enum(["CREATED_AT", "UPDATED_AT"]),
    direction: z.enum(["ASC", "DESC"])
  }).optional().describe("How to order the projects")
});

// Schema cho lấy thông tin chi tiết của một project V2
export const GetProjectV2Schema = z.object({
  id: z.string().describe("The node ID of the project")
});

// Schema cho tạo project V2 mới
export const CreateProjectV2Schema = z.object({
  ownerId: z.string().describe("The node ID of the organization or user"),
  title: z.string().describe("Title of the project"),
  description: z.string().optional().describe("Description of the project")
});

// Schema cho cập nhật project V2
export const UpdateProjectV2Schema = z.object({
  projectId: z.string().describe("The node ID of the project"),
  title: z.string().optional().describe("New title for the project"),
  description: z.string().optional().describe("New description for the project"),
  closed: z.boolean().optional().describe("Whether to close the project")
});

// Schema cho thêm item vào project V2
export const AddItemToProjectV2Schema = z.object({
  projectId: z.string().describe("The node ID of the project"),
  contentId: z.string().describe("The node ID of the issue or pull request to add")
});

// Schema cho lấy danh sách items của project V2
export const ListProjectV2ItemsSchema = z.object({
  projectId: z.string().describe("The node ID of the project"),
  first: z.number().optional().describe("Number of items to fetch (max 100)"),
  after: z.string().optional().describe("Cursor for pagination")
});

// Schema cho cập nhật field value của project item
export const UpdateProjectV2ItemFieldValueSchema = z.object({
  projectId: z.string().describe("The node ID of the project"),
  itemId: z.string().describe("The node ID of the item"),
  fieldId: z.string().describe("The node ID of the field"),
  value: z.any().describe("The new value for the field")
});

/**
 * Liệt kê projects V2 của một tổ chức
 * @param org - Tên tổ chức
 * @param first - Số lượng projects tối đa để lấy (mặc định: 20)
 * @param after - Cursor để phân trang
 * @param orderBy - Thứ tự sắp xếp
 * @returns Danh sách projects V2 của tổ chức
 */
export async function listOrganizationProjectsV2(
  org: string,
  first: number = 20,
  after?: string,
  orderBy?: { field: string, direction: string }
) {
  try {
    const query = `
      query($org: String!, $first: Int!, $after: String, $orderBy: ProjectV2Order) {
        organization(login: $org) {
          projectsV2(first: $first, after: $after, orderBy: $orderBy) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              id
              title
              shortDescription
              url
              closed
              createdAt
              updatedAt
              number
            }
          }
        }
      }
    `;

    const variables = { org, first, after, orderBy };
    const response = await graphqlRequest(query, variables);

    return response.data.organization.projectsV2;
  } catch (error) {
    if (error instanceof GitHubError) {
      throw error;
    }

    throw new GitHubError(
      `Failed to list organization projects v2: ${(error as Error).message}`,
      500,
      { error: (error as Error).message }
    );
  }
}

/**
 * Lấy thông tin chi tiết của một project V2
 * @param id - Node ID của project
 * @returns Chi tiết project V2
 */
export async function getProjectV2(id: string) {
  try {
    const query = `
      query($id: ID!) {
        node(id: $id) {
          ... on ProjectV2 {
            id
            title
            shortDescription
            url
            closed
            createdAt
            updatedAt
            number
            owner {
              __typename
              ... on Organization {
                login
              }
              ... on User {
                login
              }
            }
            fields(first: 20) {
              nodes {
                ... on ProjectV2Field {
                  id
                  name
                }
                ... on ProjectV2SingleSelectField {
                  id
                  name
                  options {
                    id
                    name
                    color
                  }
                }
              }
            }
            views(first: 20) {
              nodes {
                id
                name
                layout
              }
            }
          }
        }
      }
    `;

    const variables = { id };
    const response = await graphqlRequest(query, variables);

    return response.data.node;
  } catch (error) {
    if (error instanceof GitHubError) {
      throw error;
    }

    throw new GitHubError(
      `Failed to get project v2: ${(error as Error).message}`,
      500,
      { error: (error as Error).message }
    );
  }
}

/**
 * Tạo project V2 mới
 * @param ownerId - Node ID của tổ chức hoặc người dùng
 * @param title - Tiêu đề của project
 * @param description - Mô tả cho project (optional)
 * @returns Project V2 đã tạo
 */
export async function createProjectV2(ownerId: string, title: string, description?: string) {
  try {
    const query = `
      mutation($input: CreateProjectV2Input!) {
        createProjectV2(input: $input) {
          projectV2 {
            id
            title
            shortDescription
            url
            closed
            createdAt
            updatedAt
            number
          }
        }
      }
    `;

    const variables = {
      input: {
        ownerId,
        title,
        description: description || ""
      }
    };

    const response = await graphqlRequest(query, variables);

    return response.data.createProjectV2.projectV2;
  } catch (error) {
    if (error instanceof GitHubError) {
      throw error;
    }

    throw new GitHubError(
      `Failed to create project v2: ${(error as Error).message}`,
      500,
      { error: (error as Error).message }
    );
  }
}

/**
 * Cập nhật project V2
 * @param projectId - Node ID của project cần cập nhật
 * @param title - Tiêu đề mới (optional)
 * @param description - Mô tả mới (optional)
 * @param closed - Đóng project (optional)
 * @returns Project V2 đã cập nhật
 */
export async function updateProjectV2(projectId: string, title?: string, description?: string, closed?: boolean) {
  try {
    const query = `
      mutation($input: UpdateProjectV2Input!) {
        updateProjectV2(input: $input) {
          projectV2 {
            id
            title
            shortDescription
            url
            closed
            createdAt
            updatedAt
            number
          }
        }
      }
    `;

    const input: Record<string, any> = { projectId };

    if (title !== undefined) {
      input.title = title;
    }

    if (description !== undefined) {
      input.shortDescription = description;
    }

    if (closed !== undefined) {
      input.closed = closed;
    }

    const variables = { input };
    const response = await graphqlRequest(query, variables);

    return response.data.updateProjectV2.projectV2;
  } catch (error) {
    if (error instanceof GitHubError) {
      throw error;
    }

    throw new GitHubError(
      `Failed to update project v2: ${(error as Error).message}`,
      500,
      { error: (error as Error).message }
    );
  }
}

/**
 * Thêm item (issue hoặc pull request) vào project V2
 * @param projectId - Node ID của project
 * @param contentId - Node ID của issue hoặc pull request
 * @returns Item đã được thêm
 */
export async function addItemToProjectV2(projectId: string, contentId: string) {
  try {
    const query = `
      mutation($input: AddProjectV2ItemByIdInput!) {
        addProjectV2ItemById(input: $input) {
          item {
            id
            content {
              ... on Issue {
                id
                title
                number
              }
              ... on PullRequest {
                id
                title
                number
              }
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        projectId,
        contentId
      }
    };

    const response = await graphqlRequest(query, variables);

    return response.data.addProjectV2ItemById.item;
  } catch (error) {
    if (error instanceof GitHubError) {
      throw error;
    }

    throw new GitHubError(
      `Failed to add item to project v2: ${(error as Error).message}`,
      500,
      { error: (error as Error).message }
    );
  }
}

/**
 * Lấy danh sách items của project V2
 * @param projectId - Node ID của project
 * @param first - Số lượng items tối đa để lấy (mặc định: 20)
 * @param after - Cursor để phân trang
 * @returns Danh sách items của project
 */
export async function listProjectV2Items(
  projectId: string,
  first: number = 20,
  after?: string
) {
  try {
    const query = `
      query($projectId: ID!, $first: Int!, $after: String) {
        node(id: $projectId) {
          ... on ProjectV2 {
            items(first: $first, after: $after) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                id
                content {
                  ... on Issue {
                    id
                    title
                    number
                    state
                  }
                  ... on PullRequest {
                    id
                    title
                    number
                    state
                  }
                }
                fieldValues(first: 20) {
                  nodes {
                    ... on ProjectV2ItemFieldTextValue {
                      field { ... on ProjectV2FieldCommon { name id } }
                      text
                    }
                    ... on ProjectV2ItemFieldDateValue {
                      field { ... on ProjectV2FieldCommon { name id } }
                      date
                    }
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      field { ... on ProjectV2FieldCommon { name id } }
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const variables = { projectId, first, after };
    const response = await graphqlRequest(query, variables);

    return response.data.node.items;
  } catch (error) {
    if (error instanceof GitHubError) {
      throw error;
    }

    throw new GitHubError(
      `Failed to list project v2 items: ${(error as Error).message}`,
      500,
      { error: (error as Error).message }
    );
  }
}

/**
 * Cập nhật giá trị trường của item trong project V2
 * @param projectId - Node ID của project
 * @param itemId - Node ID của item
 * @param fieldId - Node ID của trường
 * @param value - Giá trị mới cho trường
 * @returns Kết quả cập nhật
 */
export async function updateProjectV2ItemFieldValue(projectId: string, itemId: string, fieldId: string, value: any) {
  try {
    const query = `
      mutation($input: UpdateProjectV2ItemFieldValueInput!) {
        updateProjectV2ItemFieldValue(input: $input) {
          projectV2Item {
            id
          }
        }
      }
    `;

    // Phân tích kiểu giá trị để tạo input phù hợp
    let fieldValue;

    if (typeof value === 'string') {
      // Text field
      fieldValue = { text: value };
    } else if (value instanceof Date) {
      // Date field
      fieldValue = { date: value.toISOString() };
    } else if (typeof value === 'object' && value.optionId) {
      // Single select field
      fieldValue = { singleSelectOptionId: value.optionId };
    } else if (typeof value === 'number') {
      // Number field
      fieldValue = { number: value };
    } else {
      throw new GitHubError(
        `Unsupported field value type`,
        400,
        { error: 'Unsupported field value type' }
      );
    }

    const variables = {
      input: {
        projectId,
        itemId,
        fieldId,
        value: fieldValue
      }
    };

    const response = await graphqlRequest(query, variables);

    return response.data.updateProjectV2ItemFieldValue.projectV2Item;
  } catch (error) {
    if (error instanceof GitHubError) {
      throw error;
    }

    throw new GitHubError(
      `Failed to update project v2 item field value: ${(error as Error).message}`,
      500,
      { error: (error as Error).message }
    );
  }
} 