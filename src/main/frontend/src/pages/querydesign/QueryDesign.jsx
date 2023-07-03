/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/reactjs.jsx to edit this template
 */
import React, { useState } from 'react';
import { Tabs, Tab } from "react-bootstrap";
import useMessage from "../../context/MessageContext";
import {INFO, WARN, ERROR} from "../../utils/helper";
import { Splitter, SplitterPanel } from 'primereact/splitter';
const QueryDesign = () => {
    return (
            <div className="card">
                <Splitter style={{height: '300px'}} className="mb-5">
                    <SplitterPanel className="flex align-items-center justify-content-center">
                        Panel 1
                    </SplitterPanel>
                    <SplitterPanel className="flex align-items-center justify-content-center">
                        Panel 2
                    </SplitterPanel>
                </Splitter>
            </div>);

};

export default QueryDesign;
