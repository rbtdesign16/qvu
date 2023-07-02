/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import SplitPane, { Pane } from 'split-pane-react';
import { Tabs, Tab } from "react-bootstrap";
import useMessage from "../../context/MessageContext";
import {INFO, WARN, ERROR} from "../../utils/helper";
import 'split-pane-react/esm/themes/default.css';

const QueryDesign = () => {
    const [sizes, setSizes] = useState([100, 'auto']);

    const layoutCSS = {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    return (
            <div style={{height: 500}}>
                <SplitPane
                    split='vertical'
                    sizes={sizes}
                    onChange={setSizes}
                    >
                    <Pane minSize={25} maxSize='50%'>
                        <div style={{...layoutCSS, background: '#ddd'}}>
                            pane1
                        </div>
                    </Pane>
                    <div style={{...layoutCSS, background: '#d5d7d9'}}>
                        pane2
                    </div>
                </SplitPane>
            </div>
            );
};

export default QueryDesign;
