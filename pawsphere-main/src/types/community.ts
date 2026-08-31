export interface CommunityComment {
  id: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  petName?: string;
  petPhotoUrl?: string;
  imageUrl?: string;
  caption: string;
  likedBy: string[];
  comments: CommunityComment[];
  reported: boolean;
  createdAt: string;
}
