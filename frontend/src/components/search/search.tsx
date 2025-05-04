import React, { useRef } from "react";
import { useState } from "react";
import { Icon } from "../icon/icon";

interface SearchProps {
    title: string;
    icon?: string;
    size: string;
    inputValue: string;
    setInputValue: (val: string) => void;
    onSearchClick: (data: { value: string }) => void;
}

export const Search: React.FC<SearchProps> = (props) => {

    const {
        title,
        inputValue,
        setInputValue,
        icon="search",
        size="16",
        onSearchClick,
    } = props;

    return (
        <div className="flex justify-between items-center pl-4 pr-8 pt-2">
            <input
                className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                type="textbox"
                placeholder={title}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{
                    fontSize: "14px",
                    maxWidth: "90%",
                    minWidth: "90%"
                }}
            />
            <Icon
                icon={icon}
                size={size}
                className=""
                disabled={false}
                onClick={() => {
                    onSearchClick({ value: inputValue })
                }}
            />
        </div>
    )
};