import { useSolanaNfts } from "hooks/useSolanaNfts";
import { useModal } from "hooks/useModal";
import SelectKnightModal from "components/modal/SelectKnightModal";

const Knights = () => {
  const { nfts, selectedNft, setSelected } = useSolanaNfts();
  const { showModal, setModal } = useModal();

  return <SelectKnightModal />;
};

export default Knights;
