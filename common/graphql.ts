import { GitHubError, GitHubValidationError, GitHubResourceNotFoundError, GitHubAuthenticationError, GitHubPermissionError, GitHubRateLimitError } from './errors.js';

/**
 * Thực hiện truy vấn GraphQL đến GitHub API
 * @param query - Chuỗi GraphQL query
 * @param variables - Các biến cho query (optional)
 * @returns Kết quả từ GraphQL API của GitHub
 */
export async function graphqlRequest(query: string, variables?: Record<string, any>) {
    const url = 'https://api.github.com/graphql';
    const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

    if (!token) {
        throw new GitHubAuthenticationError('Missing GitHub personal access token. Set the GITHUB_PERSONAL_ACCESS_TOKEN environment variable.');
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({ query, variables }),
        });

        const data = await response.json();

        // Kiểm tra lỗi GraphQL API
        if (data.errors && data.errors.length > 0) {
            const error = data.errors[0];

            // Xử lý các loại lỗi phổ biến
            if (error.type === 'NOT_FOUND') {
                throw new GitHubResourceNotFoundError(error.message);
            } else if (error.type === 'FORBIDDEN') {
                throw new GitHubPermissionError(error.message);
            } else if (error.type === 'UNPROCESSABLE') {
                throw new GitHubValidationError(
                    `GraphQL Error: ${error.message}`,
                    422,
                    { errors: data.errors }
                );
            } else {
                throw new GitHubError(
                    `GraphQL Error: ${error.message}`,
                    500,
                    { errors: data.errors }
                );
            }
        }

        return data;
    } catch (error) {
        if (error instanceof GitHubError) {
            throw error;
        }

        throw new GitHubError(
            `Failed to execute GraphQL query: ${(error as Error).message}`,
            500,
            { error: (error as Error).message }
        );
    }
}

/**
 * Tạo fragment cho pagination trong GraphQL query
 * @returns Chuỗi fragment GraphQL cho pagination
 */
export function createPaginationFragment() {
    return `
    pageInfo {
      hasNextPage
      endCursor
      hasPreviousPage
      startCursor
    }
    totalCount
  `;
} 