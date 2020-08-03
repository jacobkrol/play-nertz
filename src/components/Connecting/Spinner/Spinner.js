import React from 'react';
import './Spinner.css';
import { AiOutlineLoading3Quarters, AiOutlineLoading } from 'react-icons/ai';

export default function Spinner(props) {
    return (
        <div className="spinner-container">
            <AiOutlineLoading3Quarters size={props.size} style={{left: Math.floor((5/12)*props.size)}} title="loading icon 1" />
            <AiOutlineLoading size={Math.floor(props.size*(2/3))} style={{left: Math.floor((-5/12)*props.size)}} title="loading icon 2" />
        </div>
    )
}
