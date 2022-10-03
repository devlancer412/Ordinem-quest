import NextImage from "next/image";
import { useSolanaNfts } from "hooks/useSolanaNfts";
import ModalWrapper from "./ModalWrapper";

const SelectKnightModal = () => {
  const { nfts, selectedNft, setSelected } = useSolanaNfts();

  return (
    <ModalWrapper>
      <div className="px-12 py-7  bg-[url('/select_knight_bg.png')] bg-cover rounded-2xl">
        <div className="flex items-center bg-white bg-opacity-50 font-bold text-black text-lg py-3 px-4 rounded-2xl">
          <p>
            Select The Knight You Wish To Give Quest Experience To
            <span className="align-text-bottom inline-block">
              <img src="/bottle.svg" width={30} height={30} />
            </span>
          </p>
        </div>
        <div className="w-full mt-5">
          {nfts && nfts.length ? (
            <div className="flex gap-4 flex-nowrap overflow-auto">
              {nfts.map((nft, i) => (
                <div
                  key={i}
                  className={`text-black ${
                    i === selectedNft ? "bg-[#222222]" : "bg-transparent"
                  } rounded-[20px] px-3 py-3 flex flex-col justify-between items-center hover:cursor-pointer min-w-[180px] max-w-[280px]`}
                  onClick={() => setSelected(i)}
                >
                  <div className="flex flex-col items-center bg-[#9E162180] rounded-[20px] py-[20px] px-[10px] border-white border">
                    <NextImage
                      className="max-h-72 min-h-[15rem] overflow-hidden rounded-lg h-full object-cover"
                      src={nft.image.toLowerCase()}
                      alt={nft.name}
                      width={400}
                      height={400}
                    />
                    <div className="flex gap-2 items-center mt-2 px-[5px]">
                      <div className="rounded-full min-w-[4rem] w-1/2 h-2 border border-gray-300">
                        <div
                          className={`h-full bg-green-400`}
                          style={{
                            width: `${(nft.XP ? nft.XP : 0) / (nft.level + 1)}%`,
                          }}
                        ></div>
                      </div>
                      <h5 className="text-gray-500 text-[10px]">
                        Level{" "}
                        <strong className="text-white">
                          {nft.level ? nft.level : 0}
                        </strong>
                      </h5>
                    </div>
                  </div>
                  {i === selectedNft ? (
                    <h3 className="text-[12px] font-bold border-[3px] rounded-full bg-[#262121] border-[#E0CECE] py-[0px] text-center uppercase text-white mt-[15px] px-2 py-2">
                      selected
                    </h3>
                  ) : (
                    <></>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
};

export default SelectKnightModal;
