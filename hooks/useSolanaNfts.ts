import create from "zustand";

type State = {
  nfts?: NFT[];
  allNfts?: NFT[];
  tokens: number;
  selectedNft: number;
};

interface StateWithMutation extends State {
  setNfts: (payload: NFT[]) => void;
  addNft: (payload: NFT) => void;
  searchNfts: (search: string) => void;
  setTokens: (amount: number) => void;
  setSelected: (amount: number) => void;
}

export const useSolanaNfts = create<StateWithMutation>((set) => ({
  nfts: undefined,
  allNfts: undefined,
  tokens: 0,
  selectedNft: 0,
  setNfts: (payload) => {
    set((state) => ({ ...state, nfts: payload, allNfts: payload }));
  },
  addNft: (payload) => {
    set((state) => {
      const nfts = state.nfts ? [...state.nfts, payload] : [payload];
      return { ...state, nfts, allNfts: nfts };
    });
  },
  setTokens: (tokens) => {
    set((state) => ({ ...state, tokens }));
  },
  searchNfts: (payload) => {
    // console.log(payload);
    set((state) => ({
      ...state,
      nfts: payload.length
        ? state.allNfts?.filter((nft) =>
          nft.name.toLowerCase().includes(payload)
        )
        : state.allNfts,
    }));
  },
  setSelected: (id) => {
    set((state) => ({ ...state, selectedNft: id }));
  },
}));
