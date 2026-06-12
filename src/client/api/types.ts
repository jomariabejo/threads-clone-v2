// DTOs mirroring backend-v2's REST API (com.connectly.backend).
// See docs/openapi.yaml on the backend-v2 side for the source of truth.

export type Visibility = 'PUBLIC' | 'PRIVATE';
export type FileType = 'IMAGE' | 'VIDEO';
export type UserRole = 'USER' | 'ADMIN';
export type ActivityType = 'LIKE' | 'COMMENT';
export type PostStatus = 'DRAFT' | 'PUBLISHED';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED';

// Spring Data `Page<T>` shape.
export interface Page<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface UserSummaryDto {
  id: number;
  username: string;
  name: string;
  profileImageUrl: string | null;
}

export interface PostFileResponseDto {
  id: number;
  url: string;
  fileType: FileType;
  fileSize: number;
}

export interface PostResponseDto {
  id: number;
  title: string | null;
  content: string;
  author: UserSummaryDto;
  visibility: Visibility;
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  liked: boolean;
  files: PostFileResponseDto[];
}

export interface CommentResponseDto {
  id: number;
  text: string;
  author: UserSummaryDto;
  postId: number;
  createdAt: string;
}

export interface LikeToggleResponseDto {
  liked: boolean;
  likesCount: number;
}

export interface CurrentUserResponseDto {
  id: number;
  username: string;
  email: string;
  name: string;
  bio: string | null;
  profileImageUrl: string | null;
  role: UserRole;
}

export interface ProfileResponseDto {
  bio: string | null;
  profileImageUrl: string | null;
}

export interface PublicProfileResponseDto {
  id: number;
  username: string;
  email: string;
  bio: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  postsCount: number;
  posts: Page<PostResponseDto>;
}

export interface SearchResponseDto {
  posts: PostResponseDto[];
  users: UserSummaryDto[];
}

export interface ActivityItemDto {
  type: ActivityType;
  actor: UserSummaryDto;
  postId: number;
  postPreview: string;
  createdAt: string;
  commentText?: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export interface CreatePostRequest {
  title?: string;
  content: string;
  visibility?: Visibility;
  status?: PostStatus;
  images?: File[];
  videos?: File[];
}

export interface UpdatePostRequest {
  title?: string;
  content: string;
  visibility?: Visibility;
  status?: PostStatus;
}

export interface UpdateProfileRequest {
  bio?: string;
  avatar?: File;
}

export interface AdminUserDto {
  id: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  profileImagePath: string | null;
  createdAt: string;
  updatedAt: string;
}

// Custom paginated response shape returned by /api/admin/users.
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export type AdminUserSortField = 'id' | 'name' | 'username' | 'email' | 'userRole' | 'accountStatus' | 'createdAt' | 'updatedAt';

export type SortDirection = 'asc' | 'desc';

export interface AdminUserSort {
  field: AdminUserSortField;
  direction: SortDirection;
}

export interface AdminUserListParams {
  page: number;
  size: number;
  search?: string;
  role?: UserRole;
  accountStatus?: AccountStatus;
  createdFrom?: string;
  createdTo?: string;
  updatedFrom?: string;
  updatedTo?: string;
  sort: AdminUserSort[];
}

export type AdminPostSortField = 'id' | 'title' | 'visibility' | 'status' | 'createdAt';

export interface AdminPostSort {
  field: AdminPostSortField;
  direction: SortDirection;
}

export interface AdminPostListParams {
  page: number;
  size: number;
  search?: string;
  authorId?: number;
  visibility?: Visibility;
  status?: PostStatus;
  createdFrom?: string;
  createdTo?: string;
  sort: AdminPostSort[];
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface UpdateAccountStatusRequest {
  accountStatus: AccountStatus;
}

export interface ResetPasswordResponseDto {
  temporaryPassword: string;
}

export interface AdminStatsDto {
  totalUsers: number;
  totalAdmins: number;
  suspendedUsers: number;
  totalPosts: number;
}
