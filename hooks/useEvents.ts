import create from "zustand";

type State = {
  quests: Quest[],
  notifications: Notification[]
};

interface StateWithMutation extends State {
  setQuests: (payload?: Quest[]) => void;
  setNotifications: (payload?: Notification[]) => void;
}

export const useEvents = create<StateWithMutation>((set) => ({
  quests: [],
  notifications:[],
  setQuests: (payload) => {
    set((state) => ({ ...state, quests: payload }));
  },
  setNotifications: (payload) => {
    set((state) => ({...state, notifications: payload}))
  }
}));