/** AUTO-GENERATED from openapi — do not edit. */
export const CONTRACT_OPERATIONS = [
  {
    "operationId": "auth_signup",
    "method": "POST",
    "path": "/auth/signup",
    "secured": false,
    "successStatuses": [
      201
    ],
    "storyIds": [
      "STORY-001"
    ],
    "query": []
  },
  {
    "operationId": "auth_login",
    "method": "POST",
    "path": "/auth/login",
    "secured": false,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-002"
    ],
    "query": []
  },
  {
    "operationId": "auth_logout",
    "method": "POST",
    "path": "/auth/logout",
    "secured": true,
    "successStatuses": [
      204
    ],
    "storyIds": [
      "STORY-002"
    ],
    "query": []
  },
  {
    "operationId": "posts_list",
    "method": "GET",
    "path": "/posts",
    "secured": false,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-006"
    ],
    "query": []
  },
  {
    "operationId": "posts_create",
    "method": "POST",
    "path": "/posts",
    "secured": true,
    "successStatuses": [
      201
    ],
    "storyIds": [
      "STORY-003"
    ],
    "query": []
  },
  {
    "operationId": "posts_get",
    "method": "GET",
    "path": "/posts/{id}",
    "secured": false,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-007"
    ],
    "query": []
  },
  {
    "operationId": "posts_update",
    "method": "PUT",
    "path": "/posts/{id}",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-004"
    ],
    "query": []
  },
  {
    "operationId": "posts_delete",
    "method": "DELETE",
    "path": "/posts/{id}",
    "secured": true,
    "successStatuses": [
      204
    ],
    "storyIds": [
      "STORY-005"
    ],
    "query": []
  },
  {
    "operationId": "admin_posts_list",
    "method": "GET",
    "path": "/admin/posts",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-004",
      "STORY-005"
    ],
    "query": []
  },
  {
    "operationId": "post_ratings_list",
    "method": "GET",
    "path": "/posts/{id}/ratings",
    "secured": false,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-007"
    ],
    "query": []
  },
  {
    "operationId": "ratings_upsert",
    "method": "POST",
    "path": "/ratings",
    "secured": true,
    "successStatuses": [
      200,
      201
    ],
    "storyIds": [
      "STORY-008"
    ],
    "query": []
  },
  {
    "operationId": "ratings_update",
    "method": "PUT",
    "path": "/ratings/{id}",
    "secured": true,
    "successStatuses": [
      200
    ],
    "storyIds": [
      "STORY-009"
    ],
    "query": []
  },
  {
    "operationId": "ratings_delete",
    "method": "DELETE",
    "path": "/ratings/{id}",
    "secured": true,
    "successStatuses": [
      204
    ],
    "storyIds": [
      "STORY-009",
      "STORY-010"
    ],
    "query": []
  }
] as const;

export type ContractOperationId = "auth_signup" | "auth_login" | "auth_logout" | "posts_list" | "posts_create" | "posts_get" | "posts_update" | "posts_delete" | "admin_posts_list" | "post_ratings_list" | "ratings_upsert" | "ratings_update" | "ratings_delete";
