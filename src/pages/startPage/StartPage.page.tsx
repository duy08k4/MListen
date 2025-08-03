// Import libraries
import React from "react"

// Import image
import AppLogo from "../../assets/LogoApp.png"

const StartPage: React.FC = () => {
    return (
        <div className="StartPage h-full w-full flex flex-col items-center justify-center gap-10">
            <div className="">
                <img src={AppLogo} alt="App Logo" />
            </div>

            <div className="h-fit w-fit flex flex-col items-center">
                <p className="text-green text-largeSize font-bold tracking-wider">MListen</p>
                <p className="text-grayy font-medium text-mediumSize">One small step each day, and no one can stop you from reaching the top</p>
            </div>

            <div className="h-fit w-fit flex justify-center items-center">
                <a href="/main" className="h-[50px] !w-[400px] text-mediumSize font-medium text-white bg-green flex items-center justify-center gap-2.5 rounded-[10px] hover:brightness-90">
                    Take the first step

                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 stroke-white flex justify-center items-center">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                    </svg>
                </a>
            </div>
        </div>
    )
}

export default StartPage