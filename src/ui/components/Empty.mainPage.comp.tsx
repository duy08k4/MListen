// Import libraries
import React from "react"

// Import images
import LearningImg from "../../assets/LearningImg.png"

const Empty: React.FC = () => {
    return (
        <div className="h-full w-full flex justify-center items-center grayscale-50">
            <img src={LearningImg} alt="Learning img" className="h-[60%] w-auto" />
        </div>
    )
}

export default Empty