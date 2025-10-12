export const ReactionEnum = Object.freeze({
  LIKE: 'like',
  DISLIKE: 'dislike',
  LOVE: 'love',
  HAHA: 'haha',
  WOW: 'wow',
  SAD: 'sad',
});

export type Reaction = (typeof ReactionEnum)[keyof typeof ReactionEnum];
