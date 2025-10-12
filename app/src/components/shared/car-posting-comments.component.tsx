import Modal, { type ModalState } from '@/components/custom/modal.component';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateComment, useGetCommentPaginated, useUpdateComment } from '@rest/api';
import type { CarPosting, Comment } from '@rest/models';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
  Pencil,
  Send,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function CarPostingCommentModal({
  controller,
}: {
  controller: ModalState<CarPosting>;
}) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [collapsedThreads, setCollapsedThreads] = useState<Set<number>>(new Set());
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const {
    data: comments,
    isLoading: isLoadingComments,
    refetch,
  } = useGetCommentPaginated(
    {
      car_posting_id: controller.data?.id ?? 0,
    },
    {
      query: {
        enabled: !!controller.data?.id,
      },
    }
  );

  // Collapse all threads by default when comments load
  useEffect(() => {
    if (comments?.data?.data) {
      const allCommentIds = new Set<number>();
      comments.data.data.forEach((comment: Comment) => {
        if (comment.replies && comment.replies.length > 0) {
          allCommentIds.add(comment.id!);
        }
      });
      setCollapsedThreads(allCommentIds);
    }
  }, [comments?.data?.data]);

  const { mutateAsync: createComment, isPending: isCreatingComment } = useCreateComment();
  const { mutateAsync: updateComment, isPending: isUpdatingComment } = useUpdateComment();

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !controller.data?.id) return;

    try {
      await createComment({
        data: {
          comment: newComment,
          car_posting_id: controller.data.id!,
          parent_comment_id: null,
        } as Comment,
      });
      setNewComment('');
      refetch();
    } catch (error) {
      toast.error('Failed to post comment');
      console.error('Failed to post comment', error);
    }
  };

  const handleSubmitReply = async (rootCommentId: number) => {
    if (!replyText.trim() || !controller.data?.id) return;

    try {
      await createComment({
        data: {
          comment: replyText,
          car_posting_id: controller.data.id,
          parent_comment_id: rootCommentId,
        } as Comment,
      });
      setReplyText('');
      setReplyingTo(null);
      refetch();
    } catch (error) {
      toast.error('Failed to post reply');
      console.error('Failed to post reply', error);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id!);
    setEditText(comment.comment || '');
  };

  const handleSaveEdit = async (comment: Comment) => {
    if (!editText.trim()) return;

    try {
      await updateComment({
        id: comment.id!,
        data: {
          ...comment,
          comment: editText,
        } as Comment,
      });
      setEditingCommentId(null);
      setEditText('');
      refetch();
      toast.success('Comment updated successfully');
    } catch (error) {
      toast.error('Failed to update comment');
      console.error('Failed to update comment', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const toggleThreadCollapse = (commentId: number) => {
    setCollapsedThreads((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const renderComment = (comment: Comment, isReply = false, rootCommentId?: number) => {
    const currentRootId = rootCommentId ?? comment.id!;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isCollapsed = collapsedThreads.has(comment.id!);
    const isEditing = editingCommentId === comment.id;

    return (
      <div key={comment.id} className={`${isReply ? 'ml-10 mt-2' : 'mt-3'}`}>
        <div className="flex gap-2">
          <Avatar className="w-8 h-8 flex-shrink-0">
            {comment.user?.profile_picture ? (
              <AvatarImage src={comment.user.profile_picture} alt={comment.user.name || 'User'} />
            ) : null}
            <AvatarFallback className="bg-blue-500 text-white text-xs">
              {comment.user?.name
                ? comment.user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : `U${comment.user_id}`}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            {isEditing ? (
              <div className="flex gap-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="min-h-[60px] text-sm rounded-2xl resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (editText.trim()) {
                        handleSaveEdit(comment);
                      }
                    }
                    if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                />
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    onClick={() => handleSaveEdit(comment)}
                    disabled={isUpdatingComment || !editText.trim()}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-muted rounded-2xl px-3 py-2">
                  <p className="text-sm font-semibold">
                    {comment.user?.name || `User ${comment.user_id}`}
                  </p>
                  <p className="text-sm mt-0.5">{comment.comment}</p>
                </div>
                <div className="flex items-center gap-4 mt-1 ml-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-semibold text-muted-foreground hover:underline h-auto p-0"
                    onClick={() => setReplyingTo(comment.id!)}
                  >
                    Reply
                  </Button>
                  {comment.is_current_user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs font-semibold text-muted-foreground hover:underline flex items-center gap-1 h-auto p-0"
                      onClick={() => handleEditComment(comment)}
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </Button>
                  )}
                  {hasReplies && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs font-semibold text-muted-foreground hover:underline flex items-center gap-1 h-auto p-0"
                      onClick={() => toggleThreadCollapse(comment.id!)}
                    >
                      {isCollapsed ? (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          Show {comment.replies!.length}{' '}
                          {comment.replies!.length === 1 ? 'reply' : 'replies'}
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          Hide {comment.replies!.length}{' '}
                          {comment.replies!.length === 1 ? 'reply' : 'replies'}
                        </>
                      )}
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at!).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}

            {/* Render replies */}
            {hasReplies && !isCollapsed && (
              <div className="mt-2">
                {comment.replies!.map((reply: Comment) =>
                  renderComment(reply, true, currentRootId)
                )}
              </div>
            )}

            {replyingTo === comment.id && (
              <div className="flex gap-2 mt-2">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-blue-500 text-white text-xs">You</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[60px] text-sm rounded-2xl resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (replyText.trim()) {
                          handleSubmitReply(currentRootId);
                        }
                      }
                    }}
                  />
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(currentRootId)}
                      disabled={isCreatingComment || !replyText.trim()}
                      className="h-8 w-8 p-0"
                    >
                      <Send className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const topLevelComments = comments?.data?.data?.filter(
    (comment: Comment) => !comment.parent_comment_id
  );
  const hasComments = topLevelComments && topLevelComments.length > 0;

  return (
    <Modal title="Comments" controller={controller} closable={true}>
      <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Comments List */}
        {isLoadingComments ? (
          <div className="flex flex-col justify-center items-center h-48 pb-4 border-b">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Loading comments...</p>
          </div>
        ) : !hasComments ? (
          <div className="flex flex-col justify-center items-center h-48 pb-4 border-b">
            <div className="rounded-full bg-muted p-4 mb-3">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No comments yet</p>
            <p className="text-xs text-muted-foreground">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="flex flex-col pb-4 border-b">
            {topLevelComments.map((comment: Comment) => renderComment(comment))}
          </div>
        )}

        {/* New Comment Input */}
        <div className="flex gap-2 pt-4">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-blue-500 text-white text-xs">You</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[40px] rounded-full px-4 py-2 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (newComment.trim()) {
                    handleSubmitComment();
                  }
                }
              }}
            />
            <Button
              onClick={handleSubmitComment}
              disabled={isCreatingComment || !newComment.trim()}
              className="self-end rounded-full h-10 w-10 p-0"
            >
              {isCreatingComment ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
