import { z } from 'zod';
import { githubRequest } from '../common/utils.js';
import { GitHubError } from '../common/errors.js';

// Schema định nghĩa cho tạo Project
export const CreateProjectSchema = z.object({
    owner: z.string().describe("Repository owner (username or organization)"),
    repo: z.string().describe("Repository name"),
    name: z.string().describe("Name of the project"),
    body: z.string().optional().describe("Description of the project"),
});

// Schema định nghĩa cho lấy thông tin Project
export const GetProjectSchema = z.object({
    owner: z.string().describe("Repository owner (username or organization)"),
    repo: z.string().describe("Repository name"),
    project_number: z.number().describe("The project number"),
});

// Schema định nghĩa cho cập nhật Project
export const UpdateProjectSchema = z.object({
    project_id: z.number().describe("The unique identifier of the project"),
    name: z.string().optional().describe("New name of the project"),
    body: z.string().optional().describe("New description of the project"),
    state: z.enum(["open", "closed"]).optional().describe("State of the project"),
});

// Schema định nghĩa cho liệt kê các Project
export const ListProjectsSchema = z.object({
    owner: z.string().describe("Repository owner (username or organization)"),
    repo: z.string().describe("Repository name"),
    state: z.enum(["open", "closed", "all"]).optional().describe("Filter projects by state"),
    page: z.number().optional().describe("Page number for pagination (starts at 1)"),
    per_page: z.number().optional().describe("Number of results per page (max 100)"),
});

// Schema định nghĩa cho tạo cột Project
export const CreateProjectColumnSchema = z.object({
    owner: z.string().describe("Repository owner (username or organization)"),
    repo: z.string().describe("Repository name"),
    project_number: z.number().describe("The project number"),
    name: z.string().describe("Name of the column"),
});

// Schema định nghĩa cho liệt kê cột Project
export const ListProjectColumnsSchema = z.object({
    project_id: z.number().describe("The unique identifier of the project"),
    page: z.number().optional().describe("Page number for pagination (starts at 1)"),
    per_page: z.number().optional().describe("Number of results per page (max 100)"),
});

// Schema định nghĩa cho cập nhật cột Project
export const UpdateProjectColumnSchema = z.object({
    column_id: z.number().describe("The unique identifier of the column"),
    name: z.string().describe("New name of the column"),
});

// Schema định nghĩa cho xóa cột Project
export const DeleteProjectColumnSchema = z.object({
    column_id: z.number().describe("The unique identifier of the column"),
});

// Schema định nghĩa cho thêm card vào cột
export const AddCardToColumnSchema = z.object({
    owner: z.string().describe("Repository owner (username or organization)"),
    repo: z.string().describe("Repository name"),
    column_id: z.string().describe("The ID of the column to add card to"),
    content_type: z.enum(["Issue", "PullRequest", "Note"]).describe("Type of content for the card"),
    content_id: z.number().optional().describe("ID of the issue or pull request (required if content_type is Issue or PullRequest)"),
    note: z.string().optional().describe("The note content for the card (required if content_type is Note)"),
});

// Schema định nghĩa cho liệt kê thẻ trong cột
export const ListColumnCardsSchema = z.object({
    column_id: z.number().describe("The unique identifier of the column"),
    archived_state: z.enum(["all", "archived", "not_archived"]).optional().describe("Filter by card archived state"),
    page: z.number().optional().describe("Page number for pagination (starts at 1)"),
    per_page: z.number().optional().describe("Number of results per page (max 100)"),
});

// Schema định nghĩa cho di chuyển thẻ
export const MoveCardSchema = z.object({
    card_id: z.number().describe("The unique identifier of the card"),
    position: z.enum(["top", "bottom"]).or(z.string().regex(/^after:\d+$/)).describe("The position of the card (top, bottom, or after:<card_id>)"),
    column_id: z.number().optional().describe("The column ID to move the card to"),
});

// Schema định nghĩa cho xóa thẻ
export const DeleteCardSchema = z.object({
    card_id: z.number().describe("The unique identifier of the card"),
});

// Hàm tạo Project mới
export async function createProject(owner: string, repo: string, name: string, body?: string) {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/projects`;

        const response = await githubRequest(url, {
            method: 'POST',
            body: {
                name,
                body: body || '',
            }
        });

        return response;
    } catch (error) {
        if (error instanceof GitHubError) {
            throw error;
        }

        throw new GitHubError(`Failed to create project: ${(error as Error).message}`, 500, { error: (error as Error).message });
    }
}

// Hàm cập nhật Project
export async function updateProject(projectId: number, name?: string, body?: string, state?: string) {
    try {
        const url = `https://api.github.com/projects/${projectId}`;

        const updateData: Record<string, any> = {};

        if (name !== undefined) {
            updateData.name = name;
        }

        if (body !== undefined) {
            updateData.body = body;
        }

        if (state !== undefined) {
            updateData.state = state;
        }

        const response = await githubRequest(url, {
            method: 'PATCH',
            body: updateData,
            headers: {
                'Accept': 'application/vnd.github.inertia-preview+json'
            }
        });

        return response;
    } catch (error) {
        if (error instanceof GitHubError) {
            throw error;
        }

        throw new GitHubError(`Failed to update project: ${(error as Error).message}`, 500, { error: (error as Error).message });
    }
}

// Hàm lấy thông tin Project
export async function getProject(owner: string, repo: string, projectNumber: number) {
    try {
        const url = `https://api.github.com/repos/${owner}/${repo}/projects`;

        const projects = await githubRequest(url) as any[];

        // Tìm project theo number
        const project = projects.find((p: any) => p.number === projectNumber);

        if (!project) {
            throw new GitHubError(`Project with number ${projectNumber} not found`, 404, { message: `Project ${projectNumber} not found` });
        }

        return project;
    } catch (error) {
        if (error instanceof GitHubError) {
            throw error;
        }

        throw new GitHubError(`Failed to get project: ${(error as Error).message}`, 500, { error: (error as Error).message });
    }
}

// Hàm liệt kê các Project
export async function listProjects(owner: string, repo: string, state?: string, page?: number, perPage?: number) {
    try {
        const params: Record<string, string | number | undefined> = {};

        if (state) {
            params.state = state;
        }

        if (page) {
            params.page = page;
        }

        if (perPage) {
            params.per_page = perPage;
        }

        const url = `https://api.github.com/repos/${owner}/${repo}/projects`;

        return await githubRequest(url, {
            headers: {
                'Accept': 'application/vnd.github.inertia-preview+json'
            }
        });
    } catch (error) {
        if (error instanceof GitHubError) {
            throw error;
        }

        throw new GitHubError(`Failed to list projects: ${(error as Error).message}`, 500, { error: (error as Error).message });
    }
}

// Hàm liệt kê cột của Project
export async function listProjectColumns(projectId: number, page?: number, perPage?: number) {
    try {
        const params: Record<string, string | number | undefined> = {};

        if (page) {
            params.page = page;
        }

        if (perPage) {
            params.per_page = perPage;
        }

        let url = `https://api.github.com/projects/${projectId}/columns`;

        // Thêm query params nếu có
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryString.append(key, String(value));
                }
            });
            url += `?${queryString.toString()}`;
        }

        return await githubRequest(url, {
            headers: {
                'Accept': 'application/vnd.github.inertia-preview+json'
            }
        });
    } catch (error) {
        if (error instanceof GitHubError) {
            throw error;
        }

        throw new GitHubError(`Failed to list project columns: ${(error as Error).message}`, 500, { error: (error as Error).message });
    }
}

// Hàm tạo cột Project
export async function createProjectColumn(owner: string, repo: string, projectNumber: number, name: string) {
    try {
        // Trước tiên cần lấy project_id từ project_number
        const project = await getProject(owner, repo, projectNumber);

        // Tạo cột với project_id
        const url = `https://api.github.com/projects/${project.id}/columns`;

        const response = await githubRequest(url, {
            method: 'POST',
            body: {
                name: name,
            },
            headers: {
                'Accept': 'application/vnd.github.inertia-preview+json'
            }
        });

        return response;
    } catch (error) {
        if (error instanceof GitHubError) {
            throw error;
        }

        throw new GitHubError(`Failed to create project column: ${(error as Error).message}`, 500, { error: (error as Error).message });
    }
}

// Hàm cập nhật cột Project
export async function updateProjectColumn(columnId: number, name: string) {
    try {
        const url = `https://api.github.com/projects/columns/${columnId}`;

        const response = await githubRequest(url, {
            method: 'PATCH',
            body: {
                name: name
            },
            headers: {
                'Accept': 'application/vnd.github.inertia-preview+json'
            }
        });

        return response;
    } catch (error) {
        if (error instanceof GitHubError) {
            throw error;
        }

        throw new GitHubError(`Failed to update project column: ${(error as Error).message}`, 500, { error: (error as Error).message });
    }
}

// Hàm xóa cột Project
export async function deleteProjectColumn(columnId: number) {
    try {
        const url = `https://api.github.com/projects/columns/${columnId}`;

        await githubRequest(url, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/vnd.github.inertia-preview+json'
            }
        });

        return { success: true };
    } catch (error) {
        if (error instanceof GitHubError) {
            throw error;
        }

        throw new GitHubError(`Failed to delete project column: ${(error as Error).message}`, 500, { error: (error as Error).message });
    }
}

// Hàm thêm card vào cột
export async function addCardToColumn(
    owner: string,
    repo: string,
    columnId: string,
    contentType: string,
    contentId?: number,
    note?: string
) {
    try {
        const payload: any = {};

        if (contentType === 'Note') {
            if (!note) {
                throw new GitHubError('Note content is required when content_type is Note', 400, { message: 'Missing note content' });
            }
            payload.note = note;
        } else {
            if (!contentId) {
                throw new GitHubError('Content ID is required when content_type is Issue or PullRequest', 400, { message: 'Missing content ID' });
            }

            const actualContentType = contentType.toLowerCase();
            payload.content_id = contentId;
            payload.content_type = actualContentType;
        }

        const url = `https://api.github.com/projects/columns/${columnId}/cards`;

        const response = await githubRequest(url, {
            method: 'POST',
            body: payload,
            headers: {
                'Accept': 'application/vnd.github.inertia-preview+json'
            }
        });

        return response;
    } catch (error) {
        if (error instanceof GitHubError) {
            throw error;
        }

        throw new GitHubError(`Failed to add card to column: ${(error as Error).message}`, 500, { error: (error as Error).message });
    }
}

// Hàm liệt kê thẻ trong cột
export async function listColumnCards(columnId: number, archivedState?: string, page?: number, perPage?: number) {
    try {
        const params: Record<string, string | number | undefined> = {};

        if (archivedState) {
            params.archived_state = archivedState;
        }

        if (page) {
            params.page = page;
        }

        if (perPage) {
            params.per_page = perPage;
        }

        let url = `https://api.github.com/projects/columns/${columnId}/cards`;

        // Thêm query params nếu có
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryString.append(key, String(value));
                }
            });
            url += `?${queryString.toString()}`;
        }

        return await githubRequest(url, {
            headers: {
                'Accept': 'application/vnd.github.inertia-preview+json'
            }
        });
    } catch (error) {
        if (error instanceof GitHubError) {
            throw error;
        }

        throw new GitHubError(`Failed to list column cards: ${(error as Error).message}`, 500, { error: (error as Error).message });
    }
}

// Hàm di chuyển thẻ
export async function moveCard(cardId: number, position: string, columnId?: number) {
    try {
        const url = `https://api.github.com/projects/columns/cards/${cardId}/moves`;

        const payload: Record<string, any> = {
            position: position
        };

        if (columnId) {
            payload.column_id = columnId;
        }

        await githubRequest(url, {
            method: 'POST',
            body: payload,
            headers: {
                'Accept': 'application/vnd.github.inertia-preview+json'
            }
        });

        return { success: true };
    } catch (error) {
        if (error instanceof GitHubError) {
            throw error;
        }

        throw new GitHubError(`Failed to move card: ${(error as Error).message}`, 500, { error: (error as Error).message });
    }
}

// Hàm xóa thẻ
export async function deleteCard(cardId: number) {
    try {
        const url = `https://api.github.com/projects/columns/cards/${cardId}`;

        await githubRequest(url, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/vnd.github.inertia-preview+json'
            }
        });

        return { success: true };
    } catch (error) {
        if (error instanceof GitHubError) {
            throw error;
        }

        throw new GitHubError(`Failed to delete card: ${(error as Error).message}`, 500, { error: (error as Error).message });
    }
}

// Schema định nghĩa cho việc liệt kê projects của một tổ chức
export const ListOrganizationProjectsSchema = z.object({
    org: z.string().describe("Organization name"),
    state: z.enum(["open", "closed", "all"]).optional().describe("Filter projects by state"),
    page: z.number().optional().describe("Page number for pagination"),
    per_page: z.number().optional().describe("Number of results per page (max 100)"),
});

// Hàm liệt kê các Projects ở cấp tổ chức
export async function listOrganizationProjects(org: string, state?: string, page?: number, perPage?: number) {
    try {
        const params: Record<string, string | number | undefined> = {};

        if (state) {
            params.state = state;
        }

        if (page) {
            params.page = page;
        }

        if (perPage) {
            params.per_page = perPage;
        }

        let url = `https://api.github.com/orgs/${org}/projects`;

        // Thêm query params nếu có
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) {
                    queryString.append(key, String(value));
                }
            });
            url += `?${queryString.toString()}`;
        }

        return await githubRequest(url, {
            headers: {
                'Accept': 'application/vnd.github.inertia-preview+json'
            }
        });
    } catch (error) {
        if (error instanceof GitHubError) {
            throw error;
        }

        throw new GitHubError(`Failed to list organization projects: ${(error as Error).message}`, 500, { error: (error as Error).message });
    }
} 