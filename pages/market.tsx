import { NextPage } from "next";

const Market: NextPage = () => {
    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-1/2 bg-gray-500 rounded-[50px] py-7 px-auto">
                <h1 className="bg-[#454545B2] py-[10px] rounded-full font-bold text-white text-[20px] leading-[150%] text-center w-[195px] mx-auto">
                    Promote Tweet
                </h1>
            </div>
            <div className="w-full grid gird-cols-3 gap-5">
                <div className=""></div>
            </div>
        </div>
    )
}

export default Market;