import create from "zustand";

type QuotasEnded = {
  like: boolean;
  comment: boolean;
  follow: boolean;
};

type State = {
  userToFollow: any;
  followableUsers: number;
  ordinemUsers: any[];
  indexOfUser: number;
  quotasEnded: QuotasEnded;
  tweet_id: string;
};

interface StateWithMutation extends State {
  setUserToFollow: (payload: any) => void;
  setFollowableUserCount: (payload: number) => void;
  setOrdinemUsers: (payload: any[]) => void;
  setEndedQuotas: (payload: Partial<QuotasEnded>) => void;
  setTweet: (payload: string) => void;
}

export const useQuests = create<StateWithMutation>((set) => ({
  userToFollow: {},
  followableUsers: 0,
  ordinemUsers: [],
  indexOfUser: 0,
  tweet_id: "",
  quotasEnded: {
    like: false,
    comment: false,
    follow: false,
  },
  setUserToFollow: (payload) => {
    set((state) => ({ ...state, userToFollow: payload }));
  },
  setFollowableUserCount: (payload) => {
    set((state) => ({ ...state, followableUsers: payload }));
  },
  setOrdinemUsers: (payload) => {
    set((state) => ({ ...state, ordinemUsers: payload }));
  },
  setTweet: (payload) => {
    set((state) => ({ ...state, tweet_id: payload }));
  },
  setEndedQuotas: (payload) => {
    set((state) => ({ ...state, ...payload }));
  },
}));
