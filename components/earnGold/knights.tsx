import NextImage from "next/image";
import { useSolanaNfts } from "hooks/useSolanaNfts";

const Knights = () => {
    const { nfts, selectedNft, setSelected } = useSolanaNfts();

    return <div className="w-full">{
        nfts && nfts.length ? <div className="w-full grid grid-cols-3 gap-2">
            {
                nfts.map((nft, i) => (
                    <div
                        key={i}
                        className={`text-black ${i === selectedNft ? 'bg-[#222222]' : 'bg-transparent'} rounded-[20px] px-5 py-3 flex flex-col justify-between items-center hover:cursor-pointer`}
                        onClick={() => setSelected(i)}
                    >
                        <div className="flex flex-col items-center bg-[#9E162180] rounded-[20px] py-[20px] px-[10px]">
                            <NextImage
                                className="max-h-72 min-h-[15rem] overflow-hidden rounded-lg h-full object-cover"
                                src={nft.image}
                                alt={nft.name}
                                width={400}
                                height={400}
                            />
                            <div className="flex gap-2 items-center mt-2 px-[5px]">
                                <div className="rounded-full min-w-[4rem] w-1/2 h-2 border border-gray-300">
                                    <div className={`h-full bg-green-400`} style={{width: `${(nft.XP ? nft.XP : 0)  / (nft.level + 1)}%`}}></div>
                                </div>
                                <h5 className="text-gray-500 text-[10px]">
                                    Level{" "}
                                    <strong className="text-white">{nft.level ? nft.level : 0}</strong>
                                </h5>
                            </div>
                        </div>
                        {i === selectedNft ? <h3 className="text-[12px] font-bold border-[3px] rounded-full bg-[#262121] border-[#E0CECE] py-[0px] text-center w-1/2 uppercase text-white mt-[15px]">selected</h3> : <></>}
                    </div>
                ))}
        </div> : <div></div>
    }</div>
}

export default Knights;