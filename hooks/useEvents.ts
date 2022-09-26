import create from "zustand";

type State = {
  quests: Quest[]
};

interface StateWithMutation extends State {
  setQuests: (payload?: Quest[]) => void;
}

export const useEvents = create<StateWithMutation>((set) => ({
  quests: [],
  setQuests: (payload) => {
    set((state) => ({ ...state, quests: payload }));
  },
}));